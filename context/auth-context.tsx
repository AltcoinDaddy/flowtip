"use client";

import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import * as fcl from "@onflow/fcl";
import "../lib/flow/config";
import { supabase } from "@/utils/supabase/client";
import toast from "react-hot-toast";
// 🆕 Import the fix function
import { fixExistingCreator } from "@/lib/flow/fix-creator"; // Update this path

type User = {
  addr: string | null;
  loggedIn: boolean | null;
};

// Creator info from contract (public view)
interface PublicCreatorInfo {
  id: number;
  address: string;
  name: string;
  description: string;
  imageURL: string;
  tipCount: number;
  totalTipped: number;
}

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
  
  // Public creator queries
  getAllCreators: () => Promise<PublicCreatorInfo[]>;
  getTopCreators: (limit: number) => Promise<PublicCreatorInfo[]>;
  searchCreators: (query: string) => Promise<PublicCreatorInfo[]>;

  // 🆕 Manual fix functionality
  needsRegistrationFix: boolean;
  runManualFix: () => Promise<void>;
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
  
  // Public creator query defaults
  getAllCreators: async () => [],
  getTopCreators: async () => [],
  searchCreators: async () => [],

  // Manual fix defaults
  needsRegistrationFix: false,
  runManualFix: async () => {},
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
  // 🆕 ADD: Missing state variable
  const [needsRegistrationFix, setNeedsRegistrationFix] = useState<boolean>(false);

  useEffect(() => {
    const unsubscribe = fcl.currentUser.subscribe((user: User) => {
      console.log("🔄 Flow user state changed:", user);
      setUser(user);
      setIsLoading(false);

      if (user.loggedIn && user.addr) {
        storeUserInSupabase(user.addr);
        checkIsCreatorWithAutoFix(user.addr); // 🆕 Use new function with auto-fix
      } else {
        setIsCreator(false);
        setCreator(null);
        setNeedsRegistrationFix(false); // Reset fix flag on logout
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
      setNeedsRegistrationFix(false); // Reset fix flag
      toast.success('👋 Wallet disconnected');
    } catch (error) {
      console.error("❌ Error during logout:", error);
      toast.error('Failed to disconnect wallet');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // 🆕 NEW: Check if user has creator resource but isn't registered
  const checkCreatorResourceExists = async (address: string): Promise<boolean> => {
    try {
      const hasResource = await fcl.query({
        cadence: `
          import FlowTip from 0x6c1b12e35dca8863
          
          access(all) fun main(address: Address): Bool {
            let account = getAccount(address)
            let creatorCap = account.capabilities.get<&FlowTip.Creator>(FlowTip.CreatorPublicPath)
            return creatorCap.check()
          }
        `,
        args: (arg: any, t: any) => [arg(address, t.Address)],
      });

      return hasResource;
    } catch (error) {
      console.error("❌ Error checking creator resource:", error);
      return false;
    }
  };

  // 🆕 NEW: Auto-fix function that runs when user logs in
  const checkIsCreatorWithAutoFix = async (address: string) => {
    try {
      setIsCheckingCreator(true);
      console.log("🔍 Checking creator status for:", address);

      // 1. Check if registered in contract
      const isRegistered = await fcl.query({
        cadence: `
          import FlowTip from 0x6c1b12e35dca8863

          access(all) fun main(userAddress: Address): Bool {
            return FlowTip.isCreatorRegistered(address: userAddress)
          }
        `,
        args: (arg: any, t: any) => [arg(address, t.Address)],
      });

      if (isRegistered) {
        console.log("✅ User is registered as creator");
        setIsCreator(true);
        setNeedsRegistrationFix(false);
        return;
      }

      // 2. Check if they have creator resources but aren't registered
      console.log("🔍 Not registered - checking for creator resources...");
      const hasResource = await checkCreatorResourceExists(address);

      if (hasResource) {
        console.log("🚨 FOUND ISSUE: User has creator resource but not registered!");
        
        // 🆕 CHANGED: Don't auto-fix, just notify user and set flag
        setNeedsRegistrationFix(true);
        toast.error(
          "⚠️ Your creator account needs to be fixed. Please use the fix button that will appear.", 
          { 
            id: 'creator-needs-fix',
            duration: 15000
          }
        );
        
        setIsCreator(false); // Set to false until manually fixed
        
      } else {
        console.log("ℹ️ User is not a creator");
        setNeedsRegistrationFix(false);
        setIsCreator(false);
      }

    } catch (error: any) {
      console.error("❌ Error checking creator status:", error);
      setIsCreator(false);
      setNeedsRegistrationFix(false);
    } finally {
      setIsCheckingCreator(false);
    }
  };

  // 🆕 FIXED: Manual fix function
  const runManualFix = async () => {
    if (!user.addr) {
      toast.error("❌ No user logged in");
      return;
    }

    try {
      setIsCheckingCreator(true);
      toast.loading("🔧 Fixing your creator registration...", { id: 'manual-fix' });
      
      console.log("🔧 Starting manual fix for:", user.addr);
      
      // Run the fix with better timeout
      const fixResult = await Promise.race([
        fixExistingCreator(),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Transaction timeout - please try again and approve the wallet popup')), 60000)
        )
      ]) as any;
      
      console.log("✅ Manual fix completed:", fixResult);
      
      // Wait for blockchain to update
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Re-check registration
      const isNowRegistered = await fcl.query({
        cadence: `
          import FlowTip from 0x6c1b12e35dca8863

          access(all) fun main(userAddress: Address): Bool {
            return FlowTip.isCreatorRegistered(address: userAddress)
          }
        `,
        args: (arg: any, t: any) => [arg(user.addr, t.Address)],
      });

      if (isNowRegistered) {
        console.log("🎉 Creator registration fixed successfully!");
        toast.success("🎉 Creator registration fixed! Refreshing...", { id: 'manual-fix' });
        setIsCreator(true);
        setNeedsRegistrationFix(false);
        
        // Refresh the page to show all creators
        setTimeout(() => {
          window.location.reload();
        }, 2000);
        
      } else {
        console.error("❌ Fix attempt failed - still not registered");
        toast.error("❌ Failed to fix registration - please try again", { id: 'manual-fix' });
      }
      
    } catch (error: any) {
      console.error("❌ Error during manual fix:", error);
      
      if (error.message?.includes('User rejected') || error.message?.includes('cancelled')) {
        toast.error("❌ Transaction was cancelled - try again when ready", { id: 'manual-fix' });
      } else if (error.message?.includes('timeout')) {
        toast.error("❌ Transaction timed out - please approve the wallet popup faster", { id: 'manual-fix' });
      } else {
        toast.error(`❌ Fix failed: ${error.message}`, { id: 'manual-fix' });
      }
      
    } finally {
      setIsCheckingCreator(false);
    }
  };

  // Original checkIsCreator function (for manual checks)
  const checkIsCreator = useCallback(async (address?: string): Promise<boolean> => {
    const targetAddress = address || user.addr;
    
    if (!targetAddress) {
      setIsCreator(false);
      return false;
    }

    try {
      const result = await fcl.query({
        cadence: `
          import FlowTip from 0x6c1b12e35dca8863

          access(all) fun main(userAddress: Address): Bool {
            return FlowTip.isCreatorRegistered(address: userAddress)
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
      await checkIsCreatorWithAutoFix(user.addr); // 🆕 Use auto-fix version
    }
  };

  // Get all creators from the contract
  const getAllCreators = async (): Promise<PublicCreatorInfo[]> => {
    try {
      console.log('📋 Fetching all creators from blockchain...');
      
      const creators = await fcl.query({
        cadence: `
          import FlowTip from 0x6c1b12e35dca8863

          access(all) fun main(): [FlowTip.CreatorInfo] {
            return FlowTip.getAllCreators()
          }
        `,
      });

      console.log('✅ Fetched creators from blockchain:', creators.length);
      return creators || [];
    } catch (error) {
      console.error('❌ Error fetching all creators:', error);
      return [];
    }
  };

  // Get top creators by tip amount
  const getTopCreators = async (limit: number = 10): Promise<PublicCreatorInfo[]> => {
    try {
      console.log('🏆 Fetching top creators from blockchain...');
      
      const creators = await fcl.query({
        cadence: `
          import FlowTip from 0x6c1b12e35dca8863

          access(all) fun main(limit: UInt64): [FlowTip.CreatorInfo] {
            return FlowTip.getTopCreators(limit: limit)
          }
        `,
        args: (arg: any, t: any) => [arg(limit, t.UInt64)]
      });

      console.log('✅ Fetched top creators:', creators.length);
      return creators || [];
    } catch (error) {
      console.error('❌ Error fetching top creators:', error);
      return [];
    }
  };

  // Search creators by name/description
  const searchCreators = async (query: string): Promise<PublicCreatorInfo[]> => {
    try {
      console.log('🔍 Searching creators:', query);
      
      const creators = await fcl.query({
        cadence: `
          import FlowTip from 0x6c1b12e35dca8863

          access(all) fun main(query: String): [FlowTip.CreatorInfo] {
            return FlowTip.searchCreators(query: query)
          }
        `,
        args: (arg: any, t: any) => [arg(query, t.String)]
      });

      console.log('✅ Search results:', creators.length);
      return creators || [];
    } catch (error) {
      console.error('❌ Error searching creators:', error);
      return [];
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
        uploadFile,
        
        // Public creator queries
        getAllCreators,
        getTopCreators,
        searchCreators,
        
        // 🆕 FIXED: Add the missing provider values
        needsRegistrationFix,
        runManualFix,
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