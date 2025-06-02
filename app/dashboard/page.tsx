"use client";

import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/auth-context";
import {
  getCreatorByAddress,
  getCreatorTips,
  Creator,
  Tip,
} from "../../lib/flow/scripts";
import CreatorDashboard from "@/components/creator/creator-dashboard";
import WalletConnector from "../../components/auth/wallet-connector";
import { Button } from "@/components/ui/button";
import { testBasicTransaction } from "@/lib/flow/test";

// Replace your useEffect with this approach
export default function DashboardPage() {
  const { user, isCreator, checkIsCreator } = useAuth();
  const router = useRouter();
  const [creator, setCreator] = useState<Creator | null>(null);
  const [tips, setTips] = useState<Tip[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [hasCheckedCreator, setHasCheckedCreator] = useState<boolean>(false);

  // Redirect effect (keep this separate)
  useEffect(() => {
    if (user.loggedIn === false) {
      router.push("/");
    }
  }, [user.loggedIn, router]);

  // Manual fetch function
  const fetchCreatorData = async (force = false) => {
    if (!user.addr || !user.loggedIn) {
      console.log("Cannot fetch: no address or not logged in");
      setIsLoading(false);
      return;
    }

    try {
      console.log("Fetching creator data for:", user.addr);
      setIsLoading(true);

      // Always check creator status first
      const creatorData = await getCreatorByAddress(user.addr);
      console.log("Creator data result:", creatorData);
      
      if (creatorData) {
        setCreator(creatorData);
        
        // Fetch tips
        console.log("Fetching tips...");
        const tipsData = await getCreatorTips(user.addr);
        console.log("Tips result:", tipsData);
        setTips(tipsData || []);
      } else {
        console.log("No creator found");
        setCreator(null);
        setTips([]);
      }
    } catch (error) {
      console.error("Error in fetchCreatorData:", error);
      setCreator(null);
      setTips([]);
    } finally {
      setIsLoading(false);
      setHasCheckedCreator(true);
    }
  };

  // Trigger fetch when user address is available
  useEffect(() => {
    if (user.addr && user.loggedIn && !hasCheckedCreator) {
      console.log("Triggering initial fetch for:", user.addr);
      fetchCreatorData();
    }
  }, [user.addr, user.loggedIn, hasCheckedCreator]);

  // Reset state when user changes
  useEffect(() => {
    if (!user.addr) {
      setCreator(null);
      setTips([]);
      setHasCheckedCreator(false);
      setIsLoading(false);
    }
  }, [user.addr]);

  const handleCreatorRegistered = async () => {
    if (!user.addr) return;
    
    await checkIsCreator();
    setHasCheckedCreator(false); // Reset to trigger refetch
    await fetchCreatorData(true); // Force refetch
  };

  // Add a manual refresh button for debugging
  const handleRefresh = () => {
    setHasCheckedCreator(false);
    fetchCreatorData(true);
  };

  // Rest of your component...
  if (user.loggedIn === null) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  if (user.loggedIn === false) {
    return null;
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Creator Dashboard</h1>
        <p className="text-xl text-gray-600">
          {creator 
            ? "Manage your creator profile and view your tips"
            : "Register as a creator to start receiving tips"}
        </p>
        </div>

      {!user.addr ? (
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <h2 className="text-2xl font-bold mb-4 text-center">
            Connect Your Wallet
          </h2>
          <WalletConnector />
        </div>
      ) : isLoading ? (
        <div className="text-center py-12">
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      ) : (
        <CreatorDashboard
          creator={creator}
          tips={tips}
          onCreatorRegistered={handleCreatorRegistered}
        />
      )}
    </div>
  );
}
