import React from 'react';
import Link from 'next/link';
import { Creator } from '@/lib/flow/scripts'; // Assuming this is your Creator type
import { formatAddress, formatAmount } from '@/utils';
import { 
  Heart, 
  Coins, 
  ExternalLink, 
  Star, 
  // Zap, // Zap was in the example but not used in the final JSX
  TrendingUp, 
  Activity, 
  Users 
} from 'lucide-react';

interface CreatorCardProps {
  creator: Creator;
  verified?: boolean; // Added verified as an optional prop
}

const CreatorCard: React.FC<CreatorCardProps> = ({ 
  creator, 
  verified = true // Default verified to true
}) => {
  const name = creator.name;
  const address = formatAddress(creator.address);
  const description = creator.description;
  const tips = creator.tipCount || 0; // Ensure tips is a number, default to 0
  const flow = formatAmount(creator.totalTipped); // Use formatAmount for flow
  const avatar = creator.imageURL || `https://api.dicebear.com/9.x/adventurer/svg?seed=${creator.name}`;

  // Fallback for avatar image errors
  const handleAvatarError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    e.currentTarget.src = `https://api.dicebear.com/9.x/adventurer/svg?seed=${name}`;
  };

  return (
    <div className="group relative">
      {/* Enhanced glow effect */}
      <div className="absolute -inset-2 bg-gradient-to-br from-green-400 via-green-500 to-green-400 rounded-2xl blur-xl opacity-0 group-hover:opacity-30 transition-opacity duration-1000"></div>
      
      <div className="relative bg-gradient-to-br from-gray-900/95 to-gray-800/95 backdrop-blur-xl rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-500 overflow-hidden border border-green-400/20 transform group-hover:-translate-y-2 group-hover:scale-[1.02]">
        
        {/* Compact header */}
        <div className="relative h-20 bg-gradient-to-br from-green-400 via-green-500 to-green-400 overflow-hidden">
          {/* Animated geometric background */}
          <div className="absolute inset-0">
            <div className="absolute top-1 right-3 w-8 h-8 border border-white/20 rounded-full animate-spin opacity-30" style={{animationDuration: '3s'}}></div>
            <div className="absolute bottom-1 left-4 w-6 h-6 bg-white/10 rounded-full animate-pulse"></div>
            <div className="absolute top-1/2 left-1/2 w-10 h-10 border-2 border-white/10 rounded-full animate-ping"></div>
          </div>
          
          {/* Status indicators */}
          <div className="absolute top-2 right-2 flex items-center space-x-1">
            {tips > 5 && ( // Example condition for "HOT" badge
              <div className="bg-white/20 backdrop-blur-sm px-2 py-1 rounded-full border border-white/30 animate-pulse">
                <div className="flex items-center space-x-1">
                  <Activity className="w-2 h-2 text-white" />
                  <span className="text-xs text-white font-bold">HOT</span>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Compact avatar section */}
        <div className="relative px-4 -mt-10">
          <div className="relative inline-block">
            <div className="relative">
              <div className="w-20 h-20 rounded-2xl shadow-2xl border-3 border-gray-700 overflow-hidden group-hover:scale-110 transition-transform duration-300 ring-2 ring-green-400/20">
                <img
                  src={avatar}
                  alt={name}
                  className="w-full h-full object-cover object-center"
                  onError={handleAvatarError}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-green-400/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
              
              {verified && (
                <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-br from-green-400 to-green-500 rounded-full flex items-center justify-center shadow-xl border-2 border-gray-700 animate-bounce">
                  <Star className="w-3 h-3 text-gray-900 fill-current" />
                </div>
              )}
              
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-gradient-to-br from-green-400 to-green-500 rounded-full border-2 border-gray-700 flex items-center justify-center shadow-lg animate-pulse">
                <div className="w-2 h-2 bg-gray-900 rounded-full animate-ping"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Compact content section */}
        <div className="p-4 pt-3">
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-black text-white group-hover:text-green-400 transition-colors duration-300 truncate">
                {name}
              </h3>
              {tips > 10 && ( // Example condition for TrendingUp badge
                <div className="bg-gradient-to-r from-green-400/20 to-green-500/20 text-green-400 px-2 py-1 rounded-full text-xs font-bold border border-green-400/30 backdrop-blur-sm animate-pulse">
                  <TrendingUp className="w-3 h-3 inline-block" /> {/* Adjusted size */}
                </div>
              )}
            </div>
            
            <div className="bg-gray-800/60 backdrop-blur-sm px-2 py-1 rounded-lg inline-flex items-center border border-green-400/20 group-hover:border-green-400/40 transition-colors duration-300">
              <div className="w-1.5 h-1.5 bg-green-400 rounded-full mr-1.5 animate-pulse"></div> {/* Adjusted margin */}
              <span className="text-xs text-gray-300 font-mono font-medium truncate max-w-[150px] sm:max-w-[200px]">{address}</span>
            </div>
          </div>

          <p className="text-gray-300 text-xs mb-4 line-clamp-2 leading-relaxed font-medium">
            {description}
          </p>

          <div className="grid grid-cols-2 gap-2 mb-4">
            <div className="relative group/stat">
              <div className="bg-gradient-to-br from-red-500/10 via-pink-500/10 to-red-400/10 rounded-lg p-3 border border-red-400/20 backdrop-blur-sm hover:from-red-500/20 hover:via-pink-500/20 hover:to-red-400/20 transition-all duration-300 hover:scale-105">
                <div className="flex flex-col items-center">
                  <div className="flex items-center mb-1">
                    <Heart className="w-3 h-3 text-red-400 mr-1 animate-pulse" />
                    <span className="text-xs text-gray-400 font-bold tracking-wide">TIPS</span>
                  </div>
                  <div className="text-xl font-black text-white">{tips}</div>
                </div>
              </div>
            </div>
            
            <div className="relative group/stat">
              <div className="bg-gradient-to-br from-green-500/10 via-green-400/10 to-green-500/10 rounded-lg p-3 border border-green-400/20 backdrop-blur-sm hover:from-green-500/20 hover:via-green-400/20 hover:to-green-500/20 transition-all duration-300 hover:scale-105">
                <div className="flex flex-col items-center">
                  <div className="flex items-center mb-1">
                    <Coins className="w-3 h-3 text-green-400 mr-1" style={{animation: 'spin 2s linear infinite'}} /> {/* Custom spin */}
                    <span className="text-xs text-gray-400 font-bold tracking-wide">FLOW</span>
                  </div>
                  <div className="text-xl font-black text-white">{flow}</div>
                </div>
              </div>
            </div>
          </div>
          
          <Link href={`/creators/${creator.address}`} className="block w-full">
            <button className="group/btn relative w-full bg-gradient-to-r from-green-400 to-green-500 text-gray-900 py-3 rounded-lg font-bold hover:from-green-300 hover:to-green-400 transition-all duration-300 overflow-hidden shadow-lg hover:shadow-xl transform hover:scale-[1.02] hover:-translate-y-1">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-1000"></div>
              <div className="relative flex items-center justify-center space-x-2">
                <Users className="w-4 h-4 group-hover/btn:scale-110 transition-transform duration-300" />
                <span className="text-sm">View Profile</span>
                <ExternalLink className="w-4 h-4 group-hover/btn:rotate-12 transition-transform duration-300" />
              </div>
              <div className="absolute -inset-1 bg-gradient-to-r from-green-400 to-green-500 rounded-lg blur opacity-0 group-hover/btn:opacity-50 transition-opacity duration-300 -z-10"></div>
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CreatorCard;