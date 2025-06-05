"use client";

import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import * as fcl from "@onflow/fcl";
import "../lib/flow/config";
import { supabase } from "@/utils/supabase/client";
import toast from "react-hot-toast";

type User = {
  addr: string | null;
  loggedIn: boolean | null;
};

type AuthContextType = {
  user: User;
  logIn: () => Promise<void>;
  logOut: () => Promise<void>;
  isCreator: boolean;
  checkIsCreator: (address?: string) => Promise<boolean>;
  isLoading: boolean;
  isCheckingCreator: boolean;
  creator: BlockchainCreator | null;
  refreshCreatorData: () => Promise<void>;
  uploadFile: (file: File, fileType: 'avatar' | 'banner') => Promise<{ success: boolean; url?: string; error?: string }>;
};

interface BlockchainCreator {
  address: string;
  name: string;
  description?: string;
  imageURL?: string;
  createdAt: string;
  totalTipped?: string; // Add totalTipped
  tipCount?: number;    // Add tipCount
}

interface CreatorRegistrationData {
  name: string;
  description: string;
  imageURL: string;
}

const initialUser = { addr: null, loggedIn: null };

const AuthContext = createContext<AuthContextType>({
  user: initialUser,
  logIn: async () => {},
  logOut: async () => {},
  isCreator: false,
  checkIsCreator: async () => false,
  isLoading: true,
  isCheckingCreator: false,
  creator: null,
  refreshCreatorData: async () => {},
  uploadFile: async () => ({ success: false, error: 'Not implemented' }),
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User>(initialUser);
  const [isCreator, setIsCreator] = useState<boolean>(false);
  const [creator, setCreator] = useState<BlockchainCreator | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isCheckingCreator, setIsCheckingCreator] = useState<boolean>(false);

  useEffect(() => {
    const unsubscribe = fcl.currentUser.subscribe((user: User) => {
      console.log("🔄 Flow user state changed:", user);
      setUser(user);
      setIsLoading(false);

      if (user.loggedIn && user.addr) {
        storeUserInSupabase(user.addr);
        checkIsCreator(user.addr);
      } else {
        setIsCreator(false);
        setCreator(null);
      }
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  // Store user in Supabase for analytics
  const storeUserInSupabase = async (address: string) => {
    try {
      console.log('🔗 Storing user analytics in Supabase...', address);
      const result = await supabase.rpc('connect_wallet', {
        wallet_addr: address
      });
      console.log('✅ User analytics stored in Supabase:', result);
    } catch (error) {
      console.error("❌ Error storing user analytics:", error);
    }
  };

  const logIn = async () => {
    try {
      console.log('🔑 Initiating Flow wallet login...');
      setIsLoading(true);
      await fcl.authenticate();
      toast.success("🔗 Wallet connected successfully!");
    } catch (error) {
      console.error("❌ Error during authentication:", error);
      toast.error('Failed to connect wallet');
      setIsLoading(false);
      throw error;
    }
  };

  const logOut = async () => {
    try {
      console.log('👋 Logging out...');
      setIsLoading(true);
      await fcl.unauthenticate();
      setUser(initialUser);
      setIsCreator(false);
      setCreator(null);
      toast.success('👋 Wallet disconnected');
    } catch (error) {
      console.error("❌ Error during logout:", error);
      toast.error('Failed to disconnect wallet');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

const checkIsCreator = useCallback(async (address?: string): Promise<boolean> => {
  const targetAddress = address || user.addr;
  
  if (!targetAddress) {
    setIsCreator(false);
    return false;
  }

  try {
    const result = await fcl.query({
      cadence: `
        access(all) fun main(userAddress: Address): Bool {
          let account = getAccount(userAddress)
          return account.storage.type(at: /storage/FlowTipCreator) != nil
        }
      `,
      args: (arg: any, t: any) => [arg(targetAddress, t.Address)],
    });

    setIsCreator(result);
    return result;
  } catch (error) {
    console.error("Error checking creator:", error);
    setIsCreator(false);
    return false;
  }
}, [user.addr]);

  // Refresh creator data
  const refreshCreatorData = async () => {
    if (user.addr) {
      await checkIsCreator(user.addr);
    }
  };

  // Cloudinary upload function
  const uploadFile = async (
    file: File,
    fileType: 'avatar' | 'banner'
  ): Promise<{ success: boolean; url?: string; error?: string }> => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'creator-uploads');
      
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
        { method: 'POST', body: formData }
      );

      if (!response.ok) throw new Error('Upload failed');

      const data = await response.json();
      toast.success(`📷 ${fileType === 'avatar' ? 'Profile picture' : 'Banner'} uploaded!`);
      
      return { success: true, url: data.secure_url };
      
    } catch (error) {
      console.error('❌ Error uploading to Cloudinary:', error);
      const errorMessage = error instanceof Error ? error.message : 'Upload failed';
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  return (
    <AuthContext.Provider
      value={{ 
        user, 
        logIn, 
        logOut, 
        isCreator, 
        checkIsCreator, 
        isLoading,
        isCheckingCreator,
        creator,
        refreshCreatorData,
        uploadFile
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// Auth Guard Component
interface AuthGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  requireCreator?: boolean;
  fallback?: React.ReactNode;
}

export function AuthGuard({
  children,
  requireAuth = false,
  requireCreator = false,
  fallback,
}: AuthGuardProps) {
  const { user, isCreator, isLoading, isCheckingCreator } = useAuth();

  // Show loading state
  if (isLoading || isCheckingCreator) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="h-12 w-12 rounded-full border-4 border-t-green-600 border-gray-300 animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">
            {isCheckingCreator ? "Checking creator status..." : "Connecting to Flow..."}
          </p>
        </div>
      </div>
    );
  }

  // Check authentication requirements
  if (requireAuth && !user.loggedIn) {
    return (
      fallback || (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center max-w-md mx-auto p-8">
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h2 className="text-2xl font-bold mb-4">Authentication Required</h2>
              <p className="text-gray-600 mb-4">
                Please connect your wallet to access this page.
              </p>
              <button
                onClick={() => window.location.reload()}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
              >
                Refresh Page
              </button>
            </div>
          </div>
        </div>
      )
    );
  }

  // Check creator requirements
  if (requireCreator && !isCreator) {
    return (
      fallback || (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center max-w-md mx-auto p-8">
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h2 className="text-2xl font-bold mb-4">Creator Access Required</h2>
              <p className="text-gray-600 mb-4">
                You need to be a registered creator to access this page.
              </p>
              <button
                onClick={() => window.location.href = '/dashboard'}
                className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
              >
                Become a Creator
              </button>
            </div>
          </div>
        </div>
      )
    );
  }

  return <>{children}</>;
}