"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/auth-context";
import CreatorCard from "@/components/creator/creator-card";
import { Button } from "@/components/ui/button"; // Keep for clear button if needed
import { Card, CardContent } from "@/components/ui/card";
import { 
  Search, 
  User, 
  DollarSign, 
  TrendingUp, 
  Loader2,
  Zap,      // For new hero
  Sparkles, // For new hero
  Users,    // For new filter buttons
  Star      // For new filter buttons (if we add featured)
} from "lucide-react";

// Removed unused fcl import

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
      // Optionally, if search is empty, revert to 'all' view or keep current view
      // For now, let's assume it loads all creators if search is cleared by submitting empty
      loadCreators(); 
      return;
    }

    try {
      setIsSearching(true);
      setView("search"); // Set view to search to indicate results are from a search
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

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const clearSearchAndLoadAll = () => {
    setSearchTerm("");
    loadCreators(); // Revert to showing all creators
  };

  const formatAmount = (amount: number | string): string => {
    try {
      const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
      if (isNaN(numAmount)) {
        return '0.00';
      }
      return numAmount.toFixed(2);
    } catch (error) {
      return '0.00';
    }
  };

  // displayCreators logic remains the same, but now it's simpler as blockchain search handles filtering
   const displayCreators = creators; // Data is already filtered by load/search functions

  const filterButtons = [
    { id: 'all', label: 'All Creators', icon: Users, action: loadCreators },
    { id: 'top', label: 'Top Creators', icon: TrendingUp, action: loadTopCreators },
    // { id: 'featured', label: 'Featured', icon: Star } // Add if you implement featured logic
  ];


  return (
    <div> {/* Removed max-w-6xl and mx-auto from here, it's in the new hero section */}
      {/* New Hero and Search Section */}
      <div className="relative">
        {/* Enhanced geometric background */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full opacity-10">
            {Array.from({ length: 20 }).map((_, i) => (
              <div
                key={i}
                className="absolute bg-emerald-400 rounded-full animate-pulse"
                style={{
                  width: Math.random() * 8 + 4 + 'px',
                  height: Math.random() * 8 + 4 + 'px',
                  top: Math.random() * 100 + '%',
                  left: Math.random() * 100 + '%',
                  animationDelay: Math.random() * 3 + 's',
                  animationDuration: (Math.random() * 2 + 2) + 's'
                }}
              />
            ))}
          </div>
          <div className="absolute top-1/4 -left-20 w-80 h-80 bg-gradient-to-br from-emerald-400/5 to-emerald-500/10 rounded-full blur-3xl animate-float"></div>
          <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-gradient-to-br from-emerald-500/5 to-emerald-400/10 rounded-full blur-3xl" style={{ animationDelay: '3s' }}></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 md:mb-16">
            <div className="inline-flex items-center bg-gradient-to-r from-emerald-400/10 to-emerald-500/10 backdrop-blur-sm px-6 py-3 rounded-full mb-6 md:mb-8 border border-emerald-400/20 group hover:from-emerald-400/20 hover:to-emerald-500/20 transition-all duration-300">
              <div className="relative mr-3">
                <Zap className="w-5 h-5 text-emerald-400" />
                <div className="absolute -inset-1 bg-emerald-400 rounded-full blur opacity-30 animate-pulse"></div>
              </div>
              <span className="text-emerald-400 font-semibold text-sm tracking-wide">The Biggest Tipping Platform on Flow</span>
              <Sparkles className="w-4 h-4 text-emerald-300 ml-2 animate-pulse" />
            </div>
            
            <div className="relative mb-6 md:mb-8">
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-white mb-4 leading-tight tracking-tighter">
                Discover &
                <br />
                <span className="relative inline-block">
                  <span className="bg-gradient-to-r from-emerald-400 via-emerald-300 to-emerald-500 bg-clip-text text-transparent">
                    Support
                  </span>
                  <div className="absolute -inset-2 bg-gradient-to-r from-emerald-400 to-emerald-500 blur-2xl opacity-20 animate-pulse"></div>
                </span>
                <br />
                Amazing <span className="text-emerald-400">Creators</span>
              </h1>
            </div>
            
            <p className="text-lg md:text-xl text-slate-300 max-w-3xl md:max-w-4xl mx-auto leading-relaxed font-light">
              Connect with talented creators, support their work with Flow tokens, and become part of the next-generation creator economy built on blockchain technology.
            </p>
          </div>

          <div className="max-w-3xl md:max-w-4xl mx-auto mb-12 md:mb-16">
            <div className="relative group">
              <div className="absolute -inset-1.5 sm:-inset-2 bg-gradient-to-r from-emerald-400 via-emerald-500 to-emerald-400 rounded-3xl blur-lg opacity-0 group-hover:opacity-30 transition-opacity duration-1000"></div>
              <div className="relative bg-slate-900/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-emerald-400/20 p-1.5 sm:p-2">
                <div className="flex items-center">
                  <div className="flex-1 relative">
                    <div className="absolute left-4 sm:left-6 md:left-8 top-1/2 transform -translate-y-1/2 pointer-events-none">
                      <Search className="text-slate-400 w-5 h-5 sm:w-6 sm:h-6" />
                    </div>
                    <input
                      type="text"
                      placeholder="Search creators by name, skills, or interests..."
                      className="w-full pl-12 sm:pl-16 md:pl-20 pr-4 sm:pr-8 py-4 sm:py-5 md:py-6 rounded-3xl border-0 focus:ring-0 focus:outline-none text-base sm:text-lg placeholder-slate-400 bg-transparent text-white font-medium"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      onKeyPress={handleKeyPress}
                    />
                  </div>
                  <button 
                    onClick={handleSearch}
                    disabled={isSearching}
                    className="relative bg-gradient-to-r from-emerald-400 to-emerald-500 text-slate-900 p-3 sm:p-4 md:p-5 rounded-2xl hover:from-emerald-300 hover:to-emerald-400 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 font-bold disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {isSearching ? <Loader2 className="w-5 h-5 sm:w-6 sm:h-6 animate-spin" /> : <Search className="w-5 h-5 sm:w-6 sm:h-6" />}
                    <div className="absolute -inset-1 bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-2xl blur opacity-0 hover:opacity-50 transition-opacity duration-300 -z-10"></div>
                  </button>
                </div>
              </div>
            </div>
             {searchTerm && (
              <div className="text-center mt-4">
                <Button onClick={clearSearchAndLoadAll} variant="ghost" size="sm" className="text-emerald-400 hover:text-emerald-300">
                  Clear Search & View All
                </Button>
              </div>
            )}
          </div>

          <div className="flex flex-wrap justify-center items-center gap-3 sm:gap-4 md:gap-6 mb-8">
            {filterButtons.map(({ id, label, icon: Icon, action }) => (
              <button
                key={id}
                onClick={action}
                disabled={isLoading && view === id} // Disable if currently loading this view
                className={`group relative px-4 py-2.5 sm:px-6 sm:py-3 md:px-8 md:py-4 rounded-2xl font-semibold transition-all duration-300 text-sm sm:text-base
                  ${ view === id && !isLoading // Active and not loading
                    ? 'bg-gradient-to-r from-emerald-400 to-emerald-500 text-slate-900 shadow-xl scale-105'
                    : isLoading && view === id // Active and loading
                    ? 'bg-gradient-to-r from-emerald-600 to-emerald-700 text-slate-300 shadow-lg cursor-wait'
                    : 'bg-slate-800/60 backdrop-blur-sm text-slate-300 hover:bg-slate-700/60 border border-emerald-400/20 hover:text-white hover:border-emerald-400/40'
                  }
                  disabled:opacity-70 disabled:cursor-not-allowed
                `}
              >
                <div className="flex items-center space-x-2 sm:space-x-3">
                  {isLoading && view === id ? <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" /> : <Icon className="w-4 h-4 sm:w-5 sm:h-5" />}
                  <span>{label}</span>
                </div>
                {view === id && !isLoading && (
                  <div className="absolute -inset-1 bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-2xl blur opacity-40 -z-10"></div>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content Area (Stats, Grid, etc.) - Add some top margin */}
      <div className="max-w-6xl mx-auto px-4 py-8 sm:py-12">
        {/* Creator Stats */}
        {!isLoading && creators.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
            <Card className="bg-slate-800/70 backdrop-blur-md border border-emerald-400/20 text-white">
              <CardContent className="p-6 text-center">
                <Users className="w-8 h-8 mx-auto mb-2 text-emerald-400" />
                <p className="text-3xl font-bold">{creators.length}</p>
                <p className="text-slate-300">
                  {view === "top"
                    ? "Top Creators"
                    : view === "search"
                    ? "Search Results"
                    : "Total Creators"}
                </p>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/70 backdrop-blur-md border border-emerald-400/20 text-white">
              <CardContent className="p-6 text-center">
                <DollarSign className="w-8 h-8 mx-auto mb-2 text-emerald-400" />
                <p className="text-3xl font-bold">
                  {formatAmount(
                    creators.reduce((sum, c) => sum + Number(c.totalTipped || 0), 0)
                  )}{" "}
                  <span className="text-emerald-400">FLOW</span>
                </p>
                <p className="text-slate-300">Total Earned</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Loading State */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="flex flex-col items-center justify-center mb-4">
              <Loader2 className="w-10 h-10 animate-spin text-emerald-400 mb-4" />
              <p className="text-slate-300 text-lg">
                {view === "top"
                  ? "Summoning Top Creators..."
                  : view === "search"
                  ? "Searching the Digital Realm..."
                  : "Fetching Creators from the Flowverse..."}
              </p>
            </div>
          </div>
        ) : displayCreators.length > 0 ? (
          /* Creators Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {displayCreators.map((creator) => (
              <CreatorCard key={creator.id || creator.address} creator={creator} />
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="text-center py-12 bg-slate-800/50 backdrop-blur-md rounded-xl border border-emerald-400/10 p-8">
            <Users className="w-16 h-16 mx-auto mb-6 text-emerald-400/50" />
            <h3 className="text-2xl font-semibold text-white mb-3">
              {view === "search" && searchTerm
                ? "No Creators Matched Your Quest"
                : "The Creator Space is Quiet"}
            </h3>
            <p className="text-slate-300 mb-6 max-w-md mx-auto">
              {view === "search" && searchTerm
                ? "Try refining your search terms or explore all creators."
                : "No creators found for the current view. Why not explore or check back soon?"}
            </p>
            <div className="flex gap-3 sm:gap-4 justify-center">
              <Button onClick={clearSearchAndLoadAll} variant="outline" className="border-emerald-400/50 text-emerald-400 hover:bg-emerald-400/10 hover:text-emerald-300">
                View All Creators
              </Button>
              {view !== 'top' && (
                <Button onClick={loadTopCreators} variant="outline" className="border-emerald-400/50 text-emerald-400 hover:bg-emerald-400/10 hover:text-emerald-300">
                  View Top Creators
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Blockchain Status */}
        <div className="mt-16 text-center">
          <div className="flex flex-wrap items-center justify-center space-x-4 sm:space-x-6 text-xs text-slate-400">
            <span className="flex items-center mb-2 sm:mb-0">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-1.5 animate-pulse"></div>
              Live from Flow Blockchain
            </span>
            <span className="flex items-center mb-2 sm:mb-0">
              <div className="w-2 h-2 bg-sky-500 rounded-full mr-1.5 animate-pulse" style={{animationDelay: '0.2s'}}></div>
              Decentralized Data
            </span>
            <span className="flex items-center">
              <div className="w-2 h-2 bg-purple-500 rounded-full mr-1.5 animate-pulse" style={{animationDelay: '0.4s'}}></div>
              Web3 Native
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}