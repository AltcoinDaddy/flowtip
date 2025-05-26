import React from 'react';
import { Creator, Tip } from '../../lib/flow/scripts';
import { Avatar } from '../ui/avatar';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import TipModal from '../modals/tip-modal';
import { useAuth } from '@/context/auth-context';

interface CreatorProfileProps {
  creator: Creator;
  tips: Tip[];
}

const CreatorProfile: React.FC<CreatorProfileProps> = ({ creator, tips }) => {
  const [showTipModal, setShowTipModal] = React.useState(false);
  const { user } = useAuth();
  
  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString();
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-purple-500 to-blue-500 h-32"></div>
        
        <div className="px-6 pb-6">
          <div className="flex flex-col md:flex-row items-start md:items-center">
            <Avatar className="h-24 w-24 -mt-12 border-4 border-white">
              <img 
                src={creator.imageURL || "https://via.placeholder.com/100"} 
                alt={creator.name}
                onError={(e) => {
                  e.currentTarget.src = "https://via.placeholder.com/100";
                }}
              />
            </Avatar>
            
            <div className="mt-4 md:mt-0 md:ml-6 flex-1">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                <div>
                  <h1 className="text-2xl font-bold">{creator.name}</h1>
                  <p className="text-gray-600">
                    {creator.address.slice(0, 6)}...{creator.address.slice(-4)}
                  </p>
                </div>
                
                {user?.addr !== creator.address && user?.loggedIn && (
                  <Button 
                    className="mt-4 md:mt-0" 
                    onClick={() => setShowTipModal(true)}
                  >
                    Send Tip
                  </Button>
                )}
              </div>
            </div>
          </div>
          
          <div className="mt-6">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-gray-50 p-4 rounded-lg text-center">
                <p className="text-gray-600 text-sm">Total Tips</p>
                <p className="font-bold text-xl">{creator.tipCount}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg text-center">
                <p className="text-gray-600 text-sm">Total Received</p>
                <p className="font-bold text-xl">{creator.totalTipped.toFixed(2)} FLOW</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg text-center md:block hidden">
                <p className="text-gray-600 text-sm">Avg. Tip Amount</p>
                <p className="font-bold text-xl">
                  {creator.tipCount > 0 
                    ? (creator.totalTipped / creator.tipCount).toFixed(2) 
                    : "0.00"} FLOW
                </p>
              </div>
            </div>
            
            <div>
              <h2 className="text-xl font-semibold mb-4">About</h2>
              <p className="text-gray-700 whitespace-pre-line">{creator.description}</p>
            </div>
            
            {tips.length > 0 && (
              <div className="mt-8">
                <h2 className="text-xl font-semibold mb-4">Recent Tips</h2>
                <div className="space-y-4">
                  {tips.slice(0, 5).map((tip) => (
                    <Card key={tip.id}>
                      <CardContent className="p-4">
                        <div className="flex justify-between">
                          <div>
                            <p className="font-medium">
                              {tip.from.slice(0, 6)}...{tip.from.slice(-4)}
                            </p>
                            <p className="text-gray-600 text-sm">{formatDate(tip.timestamp)}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium text-purple-600">{tip.amount.toFixed(2)} FLOW</p>
                          </div>
                        </div>
                        {tip.message && (
                          <p className="text-gray-700 mt-2 italic">"{tip.message}"</p>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {showTipModal && (
        <TipModal
          creator={creator}
          onClose={() => setShowTipModal(false)}
        />
      )}
    </div>
  );
};

export default CreatorProfile;