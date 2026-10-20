import {redirect} from 'next/navigation';
import {getSession} from '@/lib/auth';
import {AdminLogin} from '@/components/admin/admin-login';
export default async function LoginPage(){if(await getSession())redirect('/admin');return <AdminLogin/>;}
