import React from 'react';
import { Card, CardContent, CardFooter, CardHeader } from '../ui/card';
import { Avatar } from '../ui/avatar';
import Link from 'next/link';
import { Button } from '../ui/button';
import { Creator } from '@/lib/flow/scripts';

interface CreatorCardProps {
  creator: Creator;
}

const CreatorCard: React.FC<CreatorCardProps> = ({ creator }) => {
  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      <CardHeader className="p-4 flex flex-row items-center space-x-4 pb-2">
        <Avatar className="h-12 w-12">
          <img 
            src={creator.imageURL || "https://via.placeholder.com/100"} 
            alt={creator.name}
            onError={(e) => {
              e.currentTarget.src = "https://via.placeholder.com/100";
            }}
          />
        </Avatar>
        <div>
          <h3 className="font-semibold text-lg">{creator.name}</h3>
          <p className="text-sm text-gray-500">
            {creator.address.slice(0, 6)}...{creator.address.slice(-4)}
          </p>
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-2">
        <p className="text-gray-700 line-clamp-3">{creator.description}</p>
        <div className="mt-4 flex justify-between text-sm text-gray-600">
          <div>
            <span className="font-medium">{creator.tipCount}</span> tips
          </div>
          <div>
            <span className="font-medium">{creator.totalTipped.toFixed(2)}</span> FLOW
          </div>
        </div>
      </CardContent>
      <CardFooter className="p-4 bg-gray-50">
        <Link href={`/creators/${creator.address}`} className="w-full">
          <Button variant="default" className="w-full">View Profile</Button>
        </Link>
      </CardFooter>
    </Card>
  );
};

export default CreatorCard;