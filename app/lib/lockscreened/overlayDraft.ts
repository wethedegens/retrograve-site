import type {OverlayLibrary} from "./overlayLibrary";

export function beginOverlayDraft(library:OverlayLibrary,id:string){
  const empty=library.items.find(item=>!Object.values(item.images).some(Boolean));
  if(empty)return {library,selected:empty.id};
  if(library.items.length>=10)return {library,selected:library.items[0]?.id||""};
  return {library:{...library,items:[...library.items,{id,name:"New overlay",images:{phone:""}}]},selected:id};
}

export function removeOverlayDraft(library:OverlayLibrary,id:string):OverlayLibrary{
  return {...library,items:library.items.filter(item=>item.id!==id),defaultId:library.defaultId===id?"none":library.defaultId};
}
