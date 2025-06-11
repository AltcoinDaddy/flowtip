"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/auth-context";
import CreatorCard from "@/components/creator/creator-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Search, User, DollarSign, TrendingUp, Loader2 } from "lucide-react";
import * as fcl from "@onflow/fcl";


interface PublicCreatorInfo {
  id: number;
  address: string;
  name: string;
  description: string;
  imageURL: string;
  tipCount: number;
  totalTipped: number;
}

export default function CreatorsPage() {
  const { getAllCreators, getTopCreators, searchCreators } = useAuth();

  const [creators, setCreators] = useState<PublicCreatorInfo[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [view, setView] = useState<"all" | "top" | "search">("all");
  const [isSearching, setIsSearching] = useState<boolean>(false);

  useEffect(() => {
    loadCreators();
  }, []);

  const loadCreators = async () => {
    try {
      setIsLoading(true);
      setView("all");
      const data = await getAllCreators();
      console.log("Loaded creators from blockchain:", data);
      setCreators(data);
    } catch (error) {
      console.error("Error fetching creators:", error);
      setCreators([]);
    } finally {
      setIsLoading(false);
    }
  };

  const loadTopCreators = async () => {
    try {
      setIsLoading(true);
      setView("top");
      const data = await getTopCreators(12); // Load top 12 creators
      console.log("Loaded top creators:", data);
      setCreators(data);
    } catch (error) {
      console.error("Error fetching top creators:", error);
      setCreators([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      loadCreators();
      return;
    }

    try {
      setIsSearching(true);
      setView("search");
      const data = await searchCreators(searchTerm);
      console.log("Search results:", data);
      setCreators(data);
    } catch (error) {
      console.error("Error searching creators:", error);
      setCreators([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const clearSearch = () => {
    setSearchTerm("");
    loadCreators();
  };

 const formatAmount = (amount: number | string): string => {
  try {
    // Convert to number if it's a string (blockchain often returns strings)
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    
    // Check if it's a valid number
    if (isNaN(numAmount)) {
      console.warn('Invalid amount received:', amount);
      return '0.00';
    }
    
    // Format with 2 decimal places
    return numAmount.toFixed(2);
    
  } catch (error) {
    console.error('Error formatting amount:', error, 'Amount:', amount);
    return '0.00';
  }
};


const formatCount = (count: number | string): number => {
  try {
    if (typeof count === 'number') {
      return count;
    }
    
    if (typeof count === 'string') {
      // 🔧 DEBUGGING: Log what we're receiving
      console.log('🔍 formatCount received:', count, 'type:', typeof count);
      
      // Remove leading zeros and convert to number
      const trimmed = count.replace(/^0+/, '') || '0';
      const numCount = parseInt(trimmed, 10);
      
      console.log('🔍 After trimming leading zeros:', trimmed, '-> parsed as:', numCount);
      
      if (isNaN(numCount)) {
        console.warn('Invalid count after parsing:', count);
        return 0;
      }
      
      return numCount;
    }
    
    console.warn('Invalid count type received:', count, typeof count);
    return 0;
    
  } catch (error) {
    console.error('Error formatting count:', error, 'Count:', count);
    return 0;
  }
};

  // Filter creators locally only if not using blockchain search
  const displayCreators =
    view === "search"
      ? creators
      : creators.filter(
          (creator) =>
            creator.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            creator.description.toLowerCase().includes(searchTerm.toLowerCase())
        );

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Discover Creators</h1>
        <p className="text-xl text-gray-600 mb-6">
          Find and support content creators on the Flow blockchain
        </p>

        {/* Search and Filter Controls */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
          <div className="flex gap-2">
            <Input
              placeholder="Search creators..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={handleKeyPress}
              className="w-64 text-black placeholder:text-gray-500"
            />
            <Button
              onClick={handleSearch}
              variant="outline"
              disabled={isSearching}
            >
              {isSearching ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Search className="w-4 h-4" />
              )}
            </Button>
            {searchTerm && (
              <Button onClick={clearSearch} variant="ghost" size="sm">
                Clear
              </Button>
            )}
          </div>

          <div className="flex gap-2">
            <Button
              onClick={loadCreators}
              variant={view === "all" ? "default" : "outline"}
              size="sm"
              disabled={isLoading}
            >
              All Creators
            </Button>
            <Button
              onClick={loadTopCreators}
              variant={view === "top" ? "default" : "outline"}
              size="sm"
              disabled={isLoading}
            >
              🏆 Top Creators
            </Button>
          </div>
        </div>
      </div>

      {/* Creator Stats */}
      {!isLoading && creators.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          <Card className="bg-white text-black">
            <CardContent className="p-6 text-center">
              <User className="w-8 h-8 mx-auto mb-2 text-blue-600" />
              <p className="text-2xl font-bold">{creators.length}</p>
              <p className="text-gray-600">
                {view === "top"
                  ? "Top Creators"
                  : view === "search"
                  ? "Search Results"
                  : "Total Creators"}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white text-black">
            <CardContent className="p-6 text-center">
              <DollarSign className="w-8 h-8 mx-auto mb-2 text-green-600" />
              <p className="text-2xl font-bold">
                {formatAmount(
                  creators.reduce((sum, c) => sum + c.totalTipped, 0)
                )}{" "}
                FLOW
              </p>
              <p className="text-gray-600">Total Earned</p>
            </CardContent>
          </Card>

          {/* <Card className="bg-white text-black">
            <CardContent className="p-6 text-center">
              <TrendingUp className="w-8 h-8 mx-auto mb-2 text-purple-600" />
              <p className="text-2xl font-bold">
                {formatCount(creators.reduce((sum, c) => sum + c.tipCount, 0))}
              </p>
              <p className="text-gray-600">Tips Sent</p>
            </CardContent>
          </Card> */}
        </div>
      )}

      {/* Loading State */}
      {isLoading ? (
        <div className="text-center py-12">
          <div className="flex items-center justify-center mb-4">
            <Loader2 className="w-8 h-8 animate-spin text-green-600 mr-3" />
            <p className="text-gray-600">
              {view === "top"
                ? "Loading top creators..."
                : "Loading creators from blockchain..."}
            </p>
          </div>
        </div>
      ) : displayCreators.length > 0 ? (
        /* Creators Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayCreators.map((creator) => (
            <CreatorCard key={creator.id} creator={creator} />
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="text-center py-12">
          <User className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {view === "search"
              ? "No creators found"
              : searchTerm
              ? "No matching creators"
              : "No creators yet"}
          </h3>
          <p className="text-gray-600 mb-4">
            {view === "search"
              ? "Try a different search term or browse all creators"
              : searchTerm
              ? "Try different search terms or check back later"
              : "Be the first to register as a creator!"}
          </p>
          {(view === "search" || searchTerm) && (
            <div className="flex gap-2 justify-center">
              <Button onClick={clearSearch} variant="outline">
                View All Creators
              </Button>
              <Button onClick={loadTopCreators} variant="outline">
                View Top Creators
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Blockchain Status */}
      <div className="mt-12 text-center">
        <div className="flex items-center justify-center space-x-4 text-xs text-gray-400">
          <span className="flex items-center">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
            Live from Flow Blockchain
          </span>
          <span className="flex items-center">
            <div className="w-2 h-2 bg-blue-500 rounded-full mr-1"></div>
            Decentralized Data
          </span>
          <span className="flex items-center">
            <div className="w-2 h-2 bg-purple-500 rounded-full mr-1"></div>
            Web3 Native
          </span>
        </div>
      </div>
    </div>
  );
}
