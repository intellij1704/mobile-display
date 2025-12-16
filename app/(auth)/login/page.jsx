'use client';

import { useAuth } from '@/context/AuthContext';
import { auth } from '@/lib/firebase';
import { useAdmin } from '@/lib/firestore/admins/read';
import { createUser } from '@/lib/firestore/user/write';
import { CircularProgress } from '@mui/material';
import { Button } from '@nextui-org/react';
import {
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  signInWithPopup,
} from "firebase/auth"; import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { FcGoogle } from 'react-icons/fc';


export default function Login() {
  const { user } = useAuth()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)



  useEffect(() => {
    if (user) {
      router.push("/")
    }
  }, [user])
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const handleLogin = async (data) => {
    setIsLoading(true)
    try {
      await signInWithEmailAndPassword(auth, data?.email, data?.password)
      toast.success("Logged In Successfully")
    } catch (error) {
      if (error.code === 'auth/invalid-credential') {
        toast.error("Invalid email or password. Please try again.");
      } else {
        toast.error("Something went wrong. Please try again.");
      }
      console.log("Login error:", error);
    }
    setIsLoading(false)
  };

  return (
    <div className="flex md:min-h-screen bg-gray-100 ">


      {/* Left side - Login Form */}
      <div className="w-full md:w-1/2 flex justify-center items-center p-6">
        <div className="w-full  max-w-md py-12 bg-white p-12 rounded-lg shadow-sm border border-[#000000] border-opacity-10 ">
          <h2 className="text-3xl font-semibold text-black mb-6 text-center">Login</h2>
          <form onSubmit={handleSubmit(handleLogin)} className="space-y-5">


            {/* Sign in with Google */}
            <SignInWithGoogleComponents signInButtonText="Sign in with Google" />
            {/* Divider */}
            <div className="flex items-center my-4">
              <div className="flex-grow border-t border-gray-300"></div>
              <span className="px-4 text-gray-500">OR</span>
              <div className="flex-grow border-t border-gray-300"></div>
            </div>
            {/* Email Field */}
            <div>
              <label className="block text-sm font-medium text-black">Email</label>
              <input
                type="email"
                {...register('email', { required: 'Email is required' })}
                className="w-full mt-1 p-2 border rounded-md shadow-sm focus:outline-none focus:ring focus:ring-gray-100"
              />
              {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-sm font-medium text-black">Password</label>
              <input
                type="password"
                {...register('password', { required: 'Password is required' })}
                className="w-full mt-1 p-2 border rounded-md shadow-sm focus:outline-none focus:ring focus:ring-gray-100"
              />
              {errors.password && <p className="text-red-500 text-sm">{errors.password.message}</p>}
            </div>

            {/* Forgot Password & Sign Up Links */}
            <div className="flex justify-between text-sm text-black">
              <Link href="/forget-password" className="hover:underline">Forgot Password?</Link>
              <Link href="/signup" className="hover:underline">Don't have an account? Sign Up</Link>
            </div>

            <Button
              type="submit"
              className={`w-full bg-[#FF0D0D] text-white py-6 rounded-md hover:bg-red-500 transition shadow-md  ${isLoading ? "bg-gray-400 cursor-not-allowed" : ""}`}
              isDisabled={isLoading}
            >
              Login
              {isLoading && <CircularProgress size={20} thickness={7} color="primary" />}

            </Button>

          </form>
        </div>
      </div>

      {/* Right side for desktop - Improved version */}
      <div
        className="hidden md:flex w-1/2 bg-cover bg-center justify-center items-center relative"
        style={{
          backgroundImage: 'linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url(login-bg.png)'
        }}
      >
        <div className="text-center px-8">
          <h1 className="text-5xl font-bold text-white mb-4 drop-shadow-2xl">
            Welcome Back!
          </h1>
          <p className="text-xl text-white opacity-90 drop-shadow-2xl">
            We're so excited to see you again!
          </p>
        </div>
      </div>

    </div>
  );
}


export function SignInWithGoogleComponents({ signInButtonText = "Sign in with Google" }) {
  const [loading, setIsLoading] = useState(false)
  const handleLogin = async () => {
    setIsLoading(true);
    try {
      const credential = await signInWithPopup(auth, new GoogleAuthProvider());
      const user = credential.user;
      console.log("credential", credential)
      console.log(user)
      await createUser({
        uid: user?.uid,
        displayName: user?.displayName ?? "",
        mobileNo: user?.phoneNumber ?? "",
        email: user?.email ?? "",
        gender: user?.gender ?? "",
        country: user?.country ?? "",
        photoURL: user?.photoURL ?? "",
      });
      toast.success("Logged In Successfully");
    } catch (error) {
      if (error.code === 'auth/popup-closed-by-user') {
        toast.error("Sign-in process was cancelled.");
      } else if (error.code === 'auth/account-exists-with-different-credential') {
        toast.error("An account already exists with the same email address but different sign-in credentials.");
      }
      else {
        toast.error("Something went wrong during Google sign-in. Please try again.");
      }
      console.error("Google sign-in error:", error);
    }
    setIsLoading(false);
  };

  return (<Button
    type="button"
    className={`w-full flex items-center justify-center border  py-5 rounded-lg font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-all  ${loading ? "bg-gray-200 cursor-not-allowed" : ""}`}
    onClick={handleLogin}
    isDisabled={loading}

  >

    <FcGoogle className="text-2xl mr-2" /> {signInButtonText}
    {loading && <CircularProgress size={20} thickness={7} color="primary" />
    }

  </Button>)
}