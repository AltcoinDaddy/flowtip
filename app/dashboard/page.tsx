"use client";

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
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { testBasicTransaction } from "@/lib/flow/test";

export default function DashboardPage() {
  const { user, isCreator, checkIsCreator } = useAuth();
  const router = useRouter();
  const [creator, setCreator] = useState<Creator | null>(null);
  const [tips, setTips] = useState<Tip[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    // Redirect to home if not logged in
    if (user.loggedIn === false) {
      router.push("/");
    }
  }, [user.loggedIn, router]);

  useEffect(() => {
    async function fetchCreatorData() {
      if (!user.addr) return;

      try {
        setIsLoading(true);

        if (isCreator) {
          const creatorData = await getCreatorByAddress(user.addr);
          setCreator(creatorData);

          const tipsData = await getCreatorTips(user.addr);
          setTips(tipsData);
        }
      } catch (error) {
        console.error("Error fetching creator data:", error);
      } finally {
        setIsLoading(false);
      }
    }

    if (user.addr) {
      fetchCreatorData();
    }
  }, [user.addr, isCreator]);

  const handleCreatorRegistered = async () => {
    if (!user.addr) return;

    await checkIsCreator();
    const creatorData = await getCreatorByAddress(user.addr);
    setCreator(creatorData);
  };

  if (user.loggedIn === null) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  if (user.loggedIn === false) {
    return null; // Will redirect to home
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Creator Dashboard</h1>
        <p className="text-xl text-gray-600">
          {isCreator
            ? "Manage your creator profile and view your tips"
            : "Register as a creator to start receiving tips"}
        </p>
      </div>
      {/* <Button onClick={testBasicTransaction}>Test Basic Transaction</Button> */}
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
