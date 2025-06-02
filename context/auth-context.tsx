"use client";

import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import * as fcl from "@onflow/fcl";
import "../lib/flow/config";

type User = {
  addr: string | null;
  loggedIn: boolean | null;
};

type AuthContextType = {
  user: User;
  logIn: () => Promise<void>;
  logOut: () => Promise<void>;
  isCreator: boolean;
  checkIsCreator: () => Promise<boolean>;
  isLoading: boolean;
};

const initialUser = { addr: null, loggedIn: null };

const AuthContext = createContext<AuthContextType>({
  user: initialUser,
  logIn: async () => {},
  logOut: async () => {},
  isCreator: false,
  checkIsCreator: async () => false,
  isLoading: true,
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
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    // Subscribe to FCL user changes
    const unsubscribe = fcl.currentUser.subscribe((user: User) => {
      setUser(user);
      setIsLoading(false);

      // Check if user is a creator when they log in
      if (user.loggedIn && user.addr) {
        checkIsCreator();
      } else {
        setIsCreator(false);
      }
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  const logIn = async () => {
    try {
      setIsLoading(true);
      await fcl.authenticate();
    } catch (error) {
      console.error("Error during authentication:", error);
      setIsLoading(false);
      throw error;
    }
  };

  const logOut = async () => {
    try {
      setIsLoading(true);
      await fcl.unauthenticate();
      setIsCreator(false);
    } catch (error) {
      console.error("Error during logout:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

// Quick fix - check if any creator profile belongs to your address
const checkIsCreator = useCallback(async (address?: string): Promise<boolean> => {
  const targetAddress = address || user.addr;
  
  if (!targetAddress) {
    setIsCreator(false);
    return false;
  }

  try {
    console.log("Quick fix: Checking creator status for:", targetAddress);
    
    // Get all creators and check if any have your address
    const allCreators = await fcl.query({
      cadence: `
        import FlowTip from 0x6c1b12e35dca8863
        
        access(all) fun main(userAddress: Address): Bool {
          let allCreators = FlowTip.getAllCreators()
          
          for creator in allCreators {
            // Check if this creator was created by your address
            // This is a workaround for the address mismatch issue
            if (creator.address == userAddress) {
              return true
            }
          }
          
          // Also check the registration map
          let registeredCreators = FlowTip.getRegisteredCreators()
          return registeredCreators.containsKey(userAddress)
        }
      `,
      args: (arg: any, t: any) => [arg(targetAddress, t.Address)],
    });

    console.log("Quick fix result:", allCreators);
    setIsCreator(allCreators);
    return allCreators;

  } catch (error) {
    console.error("Quick fix error:", error);
    setIsCreator(false);
    return false;
  }
}, [user.addr]);

  return (
    <AuthContext.Provider
      value={{ user, logIn, logOut, isCreator, checkIsCreator, isLoading }}
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
  const { user, isCreator, isLoading } = useAuth();

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="h-12 w-12 rounded-full border-4 border-t-purple-600 border-gray-300 animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Check authentication requirements
  if (requireAuth && !user.loggedIn) {
    return (
      fallback || (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Authentication Required</h2>
            <p className="text-gray-600 mb-4">
              Please connect your wallet to access this page.
            </p>
          </div>
        </div>
      )
    );
  }

  // Check creator requirements
  if (requireCreator && !isCreator) {
    return (
      fallback || (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Creator Access Required</h2>
            <p className="text-gray-600 mb-4">
              You need to be a registered creator to access this page.
            </p>
          </div>
        </div>
      )
    );
  }

  return <>{children}</>;
}
