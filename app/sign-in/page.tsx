"use client"

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/context/auth-context';
import WalletOptions from '@/components/wallet-options';

const SignIn = () => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const { user, logIn, isLoading } = useAuth();
  const router = useRouter();
  
  // Redirect if already logged in
  useEffect(() => {
    if (user.loggedIn) {
      router.push('/dashboard');
    }
  }, [user.loggedIn, router]);

  const handleConnect = async (walletId: string) => {
    setIsConnecting(true);
    setConnectionError(null);
    
    try {
      await logIn();
      toast.success('Successfully connected to Flow wallet!');
      // Navigation will be handled by the useEffect above
    } catch (error: any) {
      console.error('Wallet connection error:', error);
      setConnectionError(error.message || 'Failed to connect wallet. Please try again.');
      toast.error('Failed to connect wallet');
    } finally {
      setIsConnecting(false);
    }
  };

  // Show loading state during initial auth check
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="h-12 w-12 rounded-full border-4 border-t-green-600 border-gray-300 animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render sign-in if already logged in (prevents flash)
  if (user.loggedIn) {
    return null;
  }
  
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Top Navigation */}
      <div className="py-6 px-4 sm:px-6 lg:px-8 border-b border-gray-200 bg-white">
        <div className="flex justify-between items-center">
          <Link href="/" className="flex items-center">
            <div className="h-8 w-8 bg-green-600 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-lg">F</span>
            </div>
            <span className="ml-2 text-xl font-bold text-gray-900">FlowTip</span>
          </Link>
          
          <Link href="/" className="text-gray-600 hover:text-gray-900 flex items-center">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to home
          </Link>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="flex-grow flex items-center justify-center px-4 py-12">
        <div className="max-w-3xl w-full">
          {/* Connection Card */}
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200">
            <div className="md:flex">
              {/* Left Side - Visual */}
              <div className="bg-gradient-to-br from-green-600 to-blue-600 p-8 md:w-1/2 text-white">
                <div className="h-full flex flex-col justify-between">
                  <div>
                    <h2 className="text-2xl font-bold mb-4">Welcome to FlowTip</h2>
                    <p className="text-purple-100">
                      Connect your Flow wallet to start supporting creators and receiving tips with cryptocurrency.
                    </p>
                  </div>
                  
                  <div className="mt-8">
                    <div className="bg-white/10 backdrop-blur p-4 rounded-lg border border-white/20">
                      <p className="text-sm text-purple-100 mb-2">Why connect a Flow wallet?</p>
                      <ul className="space-y-2 text-sm">
                        <li className="flex items-start">
                          <span className="mr-2">•</span>
                          <span>Send and receive FLOW token tips</span>
                        </li>
                        <li className="flex items-start">
                          <span className="mr-2">•</span>
                          <span>Create your creator profile</span>
                        </li>
                        <li className="flex items-start">
                          <span className="mr-2">•</span>
                          <span>Track your earnings in real-time</span>
                        </li>
                        <li className="flex items-start">
                          <span className="mr-2">•</span>
                          <span>Low transaction fees on Flow blockchain</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Right Side - Connection */}
              <div className="p-8 md:w-1/2">
                <div className="text-center mb-8">
                  <h1 className="text-2xl font-bold text-gray-900">Connect Your Flow Wallet</h1>
                  <p className="text-gray-600 mt-2">
                    Choose your preferred Flow wallet to get started
                  </p>
                </div>
                
                {isConnecting ? (
                  <div className="flex flex-col items-center justify-center py-8">
                    <div className="h-12 w-12 rounded-full border-4 border-t-green-600 border-gray-300 animate-spin"></div>
                    <p className="mt-4 text-gray-900">Connecting to Flow wallet...</p>
                    <p className="mt-2 text-sm text-gray-600">Please check your wallet for connection request</p>
                  </div>
                ) : (
                  <>
                    {connectionError && (
                      <div className="mb-6 p-3 rounded bg-red-50 border border-red-200 text-red-700 text-sm">
                        {connectionError}
                      </div>
                    )}
                    
                    <WalletOptions onConnect={handleConnect} isConnecting={isConnecting} />
                  </>
                )}
              </div>
            </div>
          </div>
          
          {/* Security Note */}
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-600">
              By connecting, you agree to our{' '}
              <a href="#" className="text-green-600 hover:text-purple-700 underline">
                Terms of Service
              </a>{' '}
              and{' '}
              <a href="#" className="text-green-600 hover:text-purple-700 underline">
                Privacy Policy
              </a>
            </p>
          </div>

          {/* Flow Information */}
          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start">
              <div className="text-blue-600 text-xl mr-3">ℹ️</div>
              <div>
                <h3 className="text-blue-900 font-medium mb-1">About Flow Blockchain</h3>
                <p className="text-blue-700 text-sm">
                  Flow is a fast, decentralized, and developer-friendly blockchain designed for 
                  the next generation of apps, games, and digital assets. It offers low fees 
                  and high throughput for seamless user experiences.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <div className="py-6 px-4 sm:px-6 lg:px-8 border-t border-gray-200 bg-white text-center">
        <p className="text-sm text-gray-600">
          © {new Date().getFullYear()} FlowTip. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default SignIn;