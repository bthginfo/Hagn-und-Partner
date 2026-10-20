import type { Metadata } from 'next';
import '../../styles/admin.css';
import '../../styles/blog-admin.css';
import '../../styles/canvas-editor.css';
import '../../styles/admin-refinements.css';
import '../../styles/guided-tour.css';
export const metadata:Metadata={title:'Website-Verwaltung · Hagn & Partner',robots:{index:false,follow:false}};
export const dynamic='force-dynamic';
export default function AdminLayout({children}:{children:React.ReactNode}){return children;}
