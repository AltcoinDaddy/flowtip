import React from 'react';
import { Card, CardContent, CardFooter, CardHeader } from '../ui/card';
import { Avatar } from '../ui/avatar';
import Link from 'next/link';
import { Button } from '../ui/button';
import { Creator } from '@/lib/flow/scripts';
import { Coins, Heart, User } from 'lucide-react';
import { formatAmount } from '@/utils';
import Image from 'next/image';

interface CreatorCardProps {
  creator: Creator;
}

const CreatorCard: React.FC<CreatorCardProps> = ({ creator }) => {

  return (
    <Card className="group relative overflow-hidden bg-white border text-black shadow-lg :shadow-2xl transition-all duration-500 :-translate-y-2 backdrop-blur-sm">
      {/* Animated background gradient */}
      {/* <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" /> */}
      
      {/* Header */}
      <CardHeader className="relative p-6 pb-4">
        <div className="flex items-start space-x-4">
          <div className="relative">
            <Avatar className="h-16 w-16 ring-4 ring-white shadow-lg transition-transform duration-300 group-hover:scale-110">
              <Image
                src={creator.imageURL || `https://api.dicebear.com/9.x/adventurer/svg?seed=${creator.name}`} 
                alt={creator.name}
                className="object-cover"
                onError={(e) => {
                  e.currentTarget.src = `https://api.dicebear.com/9.x/adventurer/svg?seed=${creator.name}`;
                }}
              />
            </Avatar>
            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full border-2 border-white shadow-sm flex items-center justify-center">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
            </div>
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-xl text-black mb-1 truncate group-:text-blue-600 transition-colors duration-300">
              {creator.name}
            </h3>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <User className="w-3 h-3" />
              <span className=" bg-gray-100 px-2 py-1 rounded-md text-xs">
                {creator.address.slice(0, 6)}...{creator.address.slice(-4)}
              </span>
            </div>
          </div>
        </div>
      </CardHeader>

      {/* Content */}
      <CardContent className="relative px-6 pb-4">
        <p className="text-black line-clamp-3 text-sm leading-relaxed mb-6">
          {creator.description}
        </p>
        
        {/* Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 border border-gray-100 shadow-sm :shadow-md transition-shadow duration-300">
            <div className="flex items-center space-x-2 mb-1">
              <Heart className="w-4 h-4 text-black" />
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Tips</span>
            </div>
            <span className="text-2xl font-bold text-black">{creator.tipCount || 0}</span>
          </div>
          
          <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 border border-gray-100 shadow-sm :shadow-md transition-shadow duration-300">
            <div className="flex items-center space-x-2 mb-1">
              <Coins className="w-4 h-4 text-black" />
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">FLOW</span>
            </div>
            <span className="text-2xl font-bold text-black">
              {formatAmount(creator.totalTipped)}
            </span>
          </div>
        </div>
      </CardContent>

      {/* Footer */}
      <CardFooter className="relative p-6 pt-2">
        <Link href={`/creators/${creator.address}`} className="w-full">
          <Button 
            variant="default" 
            className="w-full bg-gradient-to-r bg-green-600  text-white shadow-lg :shadow-xl transition-all duration-300 transform :scale-[1.02] font-semibold py-3 border-0"
          >
            View Profile
            <div className="absolute inset-0 bg-white/20 rounded-md opacity-0 group-:opacity-100 transition-opacity duration-300" />
          </Button>
        </Link>
      </CardFooter>

      {/* Subtle border glow effect */}
      <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 opacity-0 group-:opacity-20 transition-opacity duration-500 -z-10 blur-xl" />
    </Card>
  );
};

export default CreatorCard;