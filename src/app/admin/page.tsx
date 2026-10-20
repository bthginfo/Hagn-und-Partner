import {redirect} from 'next/navigation';
import {getSession} from '@/lib/auth';
import {AdminApp} from '@/components/admin/admin-app';
export default async function AdminPage(){if(!await getSession())redirect('/admin/login');return <AdminApp/>;}
