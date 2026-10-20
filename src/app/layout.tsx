import type { Metadata, Viewport } from 'next';
import './globals.css';
export const metadata:Metadata={title:{default:'Hagn & Partner · Rechtsanwälte in Ingolstadt',template:'%s'},description:'Rechtsanwälte und Fachanwälte in Ingolstadt. Hagn, Deckert, Stemmer & Partner. Persönliche Beratung und konsequente Vertretung Ihrer Interessen.',icons:{icon:'/icon.svg'},robots:{index:true,follow:true},referrer:'strict-origin-when-cross-origin'};
export const viewport:Viewport={width:'device-width',initialScale:1,themeColor:'#142b27'};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="de"><body>{children}</body></html>;}
