import {cleanForegroundLogo} from "./foregroundLogo";

export type OverlayOption={id:string;name:string;images:{phone:string;ipad?:string;desktop?:string};thumbnail?:string};
export type OverlayLibrary={items:OverlayOption[];defaultId:string};
export const validDecorationId=(id:string)=>/^[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i.test(id);
export function cleanOverlayLibrary(value:any):OverlayLibrary {
  if(!value||!Array.isArray(value.items)||value.items.length>10)throw new Error("Keep up to 10 overlays in this gallery.");
  let bytes=0;
  const ids=new Set<string>();
  const image=(dataUrl:any)=>{
    const logo=cleanForegroundLogo({dataUrl});
    if(!logo)throw new Error("Choose a transparent PNG overlay.");
    bytes+=Math.ceil(logo.dataUrl.slice(22).length*3/4);
    if(bytes>4*1024*1024)throw new Error("Overlay gallery images must total no more than 4 MB. Use smaller PNGs or fewer device variants.");
    return logo.dataUrl;
  };
  const items=value.items.map((item:any)=>{
    const id=String(item?.id||""),name=String(item?.name||"").trim().slice(0,60);
    if(!validDecorationId(id)||ids.has(id)||!name)throw new Error("Every overlay needs a unique ID and a name.");
    ids.add(id);
    const images:{phone:string;ipad?:string;desktop?:string}={phone:image(item.images?.phone)};
    for(const device of ["ipad","desktop"] as const)if(item.images?.[device])images[device]=image(item.images[device]);
    let thumbnail:string|undefined;
    if(item.thumbnail){if(String(item.thumbnail).length>45000)throw new Error("Overlay thumbnail is too large.");thumbnail=image(item.thumbnail);}
    return {id,name,images,thumbnail};
  });
  const defaultId=String(value.defaultId||"none");
  if(defaultId!=="none"&&!ids.has(defaultId))throw new Error("Choose an available default overlay.");
  return {items,defaultId};
}

export function chooseOverlay(library:unknown,id:string,device:"phone"|"ipad"|"desktop") {
  if(id==="none")return null;
  const clean=cleanOverlayLibrary(library),item=clean.items.find(item=>item.id===id);
  if(!item)throw new Error("That overlay is not offered by this project.");
  return item.images[device]||item.images.phone;
}
