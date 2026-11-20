import type {ReactNode} from "react";
export default function RetroGraveLayout({children}:{children:ReactNode}){return <><style>{`body:has(.home-wrap){--page-bg-image:url("/bg-retrograve.png")}.home-wrap{min-height:100vh;background-image:url("/bg-retrograve.png");background-size:cover;background-position:bottom center;background-attachment:fixed}`}</style>{children}</>;}
