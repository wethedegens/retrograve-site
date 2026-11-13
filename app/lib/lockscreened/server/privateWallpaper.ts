import sharp from "sharp";
import { finishedArtworkLayout } from "../finishedArtworkLayout";
import { cleanForegroundLogo } from "../foregroundLogo";

const pixelLimit=16_777_216;
type WallpaperArgs={layers:Array<{bytes:Buffer;background:boolean}>;background?:Buffer;decoration?:Buffer;width:number;height:number;placement?:{scale?:number;x?:string;y?:string};logo?:unknown;showLogo?:boolean};
async function prepareArtwork(args:WallpaperArgs){
  if(!Number.isInteger(args.width)||!Number.isInteger(args.height)||args.width<1||args.height<1||args.width*args.height>6_000_000)throw new Error("Invalid output dimensions.");
  if(!args.layers.length||args.layers.length>32)throw new Error("This NFT needs between 1 and 32 matched layers.");
  if(args.layers.reduce((sum,item)=>sum+item.bytes.length,0)>20*1024*1024)throw new Error("This NFT's layers exceed the rendering limit.");
  const decoded=[];
  for(const item of args.layers){
    const image=sharp(item.bytes,{limitInputPixels:pixelLimit,animated:false});
    const meta=await image.metadata();
    if(!["png","webp"].includes(meta.format||"")||!meta.width||!meta.height||(meta.pages||1)>1)throw new Error("Only still PNG/WebP source layers can be rendered.");
    // Composite inputs do not apply their embedded ICC profiles. Normalize
    // each layer before blending so original artwork colors survive export.
    const bytes=await sharp(item.bytes,{limitInputPixels:pixelLimit,animated:false}).toColourspace("srgb").png().toBuffer();
    decoded.push({...item,bytes,width:meta.width,height:meta.height});
  }
  if(decoded.reduce((sum,item)=>sum+item.width*item.height,0)>67_108_864)throw new Error("The layers exceed the decoded image limit.");
  const first=decoded[0];
  if(decoded.some(image=>image.width!==first.width||image.height!==first.height))throw new Error("The source layer dimensions do not match.");
  let canvas=sharp({create:{width:args.width,height:args.height,channels:4,background:"#111111"}});
  const backgrounds=args.background?[args.background]:decoded.filter(item=>item.background).map(item=>item.bytes);
  for(const background of backgrounds){
    if(background.length>8*1024*1024)throw new Error("Background exceeds the rendering limit.");
    const meta=await sharp(background,{limitInputPixels:pixelLimit,animated:false}).metadata();
    if(!["png","webp","jpeg"].includes(meta.format||"")||(meta.pages||1)>1)throw new Error("Only still raster backgrounds can be rendered.");
    const fitted=await sharp(background,{limitInputPixels:pixelLimit,animated:false}).resize(args.width,args.height,{fit:"cover",kernel:"nearest"}).png().toBuffer();
    canvas=sharp(await canvas.composite([{input:fitted}]).png().toBuffer());
  }
  const foreground=decoded.filter(item=>!item.background);
  if(!foreground.length)throw new Error("No foreground artwork matched this NFT.");
  const flat=await sharp({create:{width:first.width,height:first.height,channels:4,background:{r:0,g:0,b:0,alpha:0}}}).composite(foreground.map(item=>({input:item.bytes}))).png().toBuffer();
  return {canvas,flat,first};
}

async function addLogo(canvas:ReturnType<typeof sharp>,args:WallpaperArgs){
  if(args.logo&&(args.showLogo??(args.logo as any)?.defaultVisible)!==false){
    const logo=cleanForegroundLogo(args.logo);
    if(logo){
      const bytes=Buffer.from(logo.dataUrl.slice(22),"base64");
      const image=sharp(bytes,{limitInputPixels:pixelLimit});const meta=await image.metadata();
      if(!meta.width||!meta.height)throw new Error("Invalid foreground logo.");
      const scale=Math.min(args.width*logo.width/meta.width,args.height*.25/meta.height);
      const lw=Math.max(1,Math.round(meta.width*scale)),lh=Math.max(1,Math.round(meta.height*scale)),margin=Math.round(Math.min(args.width,args.height)*.04);
      const lx=logo.x==="left"?margin:logo.x==="right"?args.width-lw-margin:Math.round((args.width-lw)/2);
      const ly=logo.y==="top"?margin:logo.y==="bottom"?args.height-lh-margin:Math.round((args.height-lh)/2);
      canvas=sharp(await canvas.composite([{input:await image.resize(lw,lh).png().toBuffer(),left:lx,top:ly}]).png().toBuffer());
    }
  }
  return canvas;
}

async function decorationImage(args:WallpaperArgs){
  if(!args.decoration)return null;
  if(args.decoration.length>512*1024)throw new Error("Overlay exceeds the file limit.");
  const image=sharp(args.decoration,{limitInputPixels:4_194_304,animated:false}),meta=await image.metadata();
  if(meta.format!=="png"||!meta.hasAlpha||(meta.pages||1)!==1)throw new Error("Use a still transparent PNG overlay.");
  return image.resize(args.width,args.height,{fit:"cover"}).png().toBuffer();
}

export async function composePrivateWallpaper(args:WallpaperArgs){
  let {canvas,flat,first}=await prepareArtwork(args);
  const rect=finishedArtworkLayout(first.width,first.height,args.width,args.height,args.placement);
  const w=Math.max(1,Math.round(rect.drawW)),h=Math.max(1,Math.round(rect.drawH));
  const x=Math.round(rect.dx),y=Math.round(rect.dy),left=Math.max(0,x),top=Math.max(0,y);
  const clipped=await sharp(flat,{limitInputPixels:pixelLimit}).resize(w,h,{fit:"fill",kernel:"nearest"}).extract({left:Math.max(0,-x),top:Math.max(0,-y),width:Math.min(w,args.width-left),height:Math.min(h,args.height-top)}).png().toBuffer();
  canvas=sharp(await canvas.composite([{input:clipped,left,top}]).png().toBuffer());
  const decoration=await decorationImage(args);
  if(decoration)canvas=sharp(await canvas.composite([{input:decoration}]).png().toBuffer());
  canvas=await addLogo(canvas,args);
  // Return only the opaque finished wallpaper, never a source/foreground URL.
  return canvas.flatten({background:"#111111"}).png().toBuffer();
}

// Only small, merged raster derivatives reach the browser for interactive movement.
// Never return original files, per-trait images, paths or signed source URLs.
export async function composePrivatePreview(args:WallpaperArgs){
  if(![[360,800],[320,427],[640,360]].some(([w,h])=>args.width===w&&args.height===h))throw new Error("Preview dimensions are not allowed.");
  const {canvas,flat,first}=await prepareArtwork(args);
  const foreground=await sharp(flat).resize({width:512,height:512,fit:"inside",withoutEnlargement:true,kernel:"nearest"}).png().toBuffer();
  const background=await canvas.flatten({background:"#111111"}).png().toBuffer();
  const overlay=args.logo?await (await addLogo(sharp({create:{width:args.width,height:args.height,channels:4,background:{r:0,g:0,b:0,alpha:0}}}),{...args,showLogo:true})).png().toBuffer():null;
  const encoded=(bytes:Buffer)=>"data:image/png;base64,"+bytes.toString("base64");
  const decoration=await decorationImage(args);
  return {width:args.width,height:args.height,sourceWidth:first.width,sourceHeight:first.height,foreground:encoded(foreground),background:encoded(background),overlay:overlay?encoded(overlay):null,decoration:decoration?encoded(decoration):null};
}
