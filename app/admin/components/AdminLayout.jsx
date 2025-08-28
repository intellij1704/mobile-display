
import Sidebar from './Sidebar';
import AdminHeader from './Header';
import { useAuth } from '@/context/AuthContext';
import { useAdmin } from "@/lib/firestore/admins/read";
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { CircularProgress } from '@mui/material';


function AdminLayout({ children }) {
    const { user } = useAuth()
    const { data: admin, error, isLoading } = useAdmin({ email: user?.email })

    if (isLoading) {
        return (
            <div className="h-screen w-full flex flex-col justify-center items-center bg-gray-100">
                <CircularProgress size={50} thickness={4} color="primary" />
                <p className="mt-4 text-gray-600 font-medium">Please Wait...</p>
            </div>
        );
    }


    if (!admin) {
        return (
            <div className="h-screen w-screen flex flex-col gap-2 justify-center items-center">
                <h1 className="font-bold">You are not admin!</h1>
                <h1 className="text-gray-600 text-sm">{user?.email}</h1>
                <button
                    onClick={async () => {
                        await signOut(auth);
                    }}
                >
                    Logout
                </button>
            </div>
        );
    }
    if (error) {
        return <div className='h-screen w-screen flex justify-center items-center'>
            <p className='text-lg font-bold text-red-500'>{error.message}</p>
        </div>
    }

    return (
        <div className="flex h-screen bg-gray-100">
            {/* Sidebar */}
            <Sidebar />
            <div className="flex-1 flex flex-col overflow-hidden">
                <AdminHeader />
                <main className="md:p-6 p-0 overflow-auto flex-1">
                    {children}
                </main>
            </div>
        </div>
    );
}

export default AdminLayout;
