import {finishedArtworkLayout} from "./finishedArtworkLayout";

export type CollectorPreview={width:number;height:number;sourceWidth:number;sourceHeight:number;foreground:HTMLImageElement;background:HTMLImageElement;overlay:HTMLImageElement|null;decoration?:HTMLImageElement|null};
export async function decodeCollectorPreview(data:any):Promise<CollectorPreview>{
  if(![[360,800],[320,427],[640,360]].some(([w,h])=>data?.width===w&&data?.height===h)||![data.sourceWidth,data.sourceHeight].every(n=>Number.isInteger(n)&&n>0&&n<=16777216))throw new Error("Invalid preview dimensions.");
  const decode=(url:unknown)=>new Promise<HTMLImageElement>((resolve,reject)=>{
    if(typeof url!=="string"||url.length>3_000_000||!/^data:image\/png;base64,[A-Za-z0-9+/]+={0,2}$/.test(url)){reject(new Error("Invalid preview image."));return;}
    const image=new Image();image.onload=()=>resolve(image);image.onerror=()=>reject(new Error("Could not open the preview image."));image.src=url;
  });
  const [foreground,background,overlay,decoration]=await Promise.all([decode(data.foreground),decode(data.background),data.overlay?decode(data.overlay):null,data.decoration?decode(data.decoration):null]);
  return {width:data.width,height:data.height,sourceWidth:data.sourceWidth,sourceHeight:data.sourceHeight,foreground,background,overlay,decoration};
}

export function drawCollectorPreview(canvas:HTMLCanvasElement,preview:CollectorPreview,placement:{scale:number;x:string;y:string},showLogo:boolean){
  if(canvas.width!==preview.width)canvas.width=preview.width;
  if(canvas.height!==preview.height)canvas.height=preview.height;
  const ctx=canvas.getContext("2d");if(!ctx)return;
  ctx.imageSmoothingEnabled=false;
  ctx.clearRect(0,0,preview.width,preview.height);
  ctx.drawImage(preview.background,0,0,preview.width,preview.height);
  const rect=finishedArtworkLayout(preview.sourceWidth,preview.sourceHeight,preview.width,preview.height,placement);
  ctx.drawImage(preview.foreground,Math.round(rect.dx),Math.round(rect.dy),Math.max(1,Math.round(rect.drawW)),Math.max(1,Math.round(rect.drawH)));
  if(preview.decoration)ctx.drawImage(preview.decoration,0,0,preview.width,preview.height);
  if(showLogo&&preview.overlay)ctx.drawImage(preview.overlay,0,0,preview.width,preview.height);
}
