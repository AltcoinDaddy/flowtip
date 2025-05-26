import React from 'react';
import { Creator, Tip } from '../../lib/flow/scripts';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { useAuth } from '@/context/auth-context';
import { registerCreator } from '../../lib/flow/transactions';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { AlertCircle, CheckCircle } from 'lucide-react';
import * as fcl from "@onflow/fcl";
import * as t from "@onflow/types";

// Helper function to check if user is registered as creator
const checkIsCreator = async (address: string): Promise<boolean> => {
  try {
    const result = await fcl.query({
      cadence: `
        import FlowTip from 0x6c1b12e35dca8863
        
        access(all) fun main(address: Address): Bool {
          let account = getAccount(address)
          return account.capabilities.check<&FlowTip.Creator>(FlowTip.CreatorPublicPath)
        }
      `,
      args: (arg: any, t: any) => [arg(address, t.Address)],
    });
    
    return result;
  } catch (error) {
    console.error("Error checking creator status:", error);
    return false;
  }
};

interface CreatorDashboardProps {
  creator: Creator | null;
  tips: Tip[];
  onCreatorRegistered: () => Promise<void>;
}

const CreatorDashboard: React.FC<CreatorDashboardProps> = ({ 
  creator, 
  tips, 
  onCreatorRegistered 
}) => {
  const { user } = useAuth();
  const [isRegistering, setIsRegistering] = React.useState(false);
  const [isUpdating, setIsUpdating] = React.useState(false);
  const [name, setName] = React.useState(creator?.name || '');
  const [description, setDescription] = React.useState(creator?.description || '');
  const [imageURL, setImageURL] = React.useState(creator?.imageURL || '');
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);
  const [transactionId, setTransactionId] = React.useState<string | null>(null);
  
  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString();
  };
  
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user?.addr) {
      setError('Please connect your wallet first');
      return;
    }
    
    // Clear previous messages
    setError(null);
    setSuccess(null);
    setTransactionId(null);
    
    try {
      setIsRegistering(true);
      console.log("Starting registration with:", { name, description, imageURL });
      
      // Call the registerCreator function
      const transactionId = await registerCreator(name, description, imageURL);
      
      if (transactionId) {
        console.log("✅ Registration successful!");
        setSuccess('Successfully registered as a creator!');
        setTransactionId(transactionId.blockId);
        
        // Wait a moment for the blockchain to update
        setTimeout(async () => {
          // Check if user is now a creator
          if (user.addr) {
            const isCreatorNow = await checkIsCreator(user.addr);
            if (isCreatorNow) {
              // Refresh the page data
              await onCreatorRegistered();
            }
          }
        }, 2000);
      }
      
    } catch (error: any) {
      console.error("Registration error:", error);
      setError(error.message || 'Failed to register as creator. Please try again.');
    } finally {
      setIsRegistering(false);
    }
  };
  
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user?.addr) {
      setError('Please connect your wallet first');
      return;
    }
    
    // Clear previous messages
    setError(null);
    setSuccess(null);
    setTransactionId(null);
    
    try {
      setIsUpdating(true);
      console.log("Updating profile with:", { name, description, imageURL });
      
      // The same transaction handles both create and update
      const transactionId = await registerCreator(name, description, imageURL);
      
      if (transactionId) {
        console.log("✅ Update successful!");
        setSuccess('Successfully updated your profile!');
        setTransactionId(transactionId.blockId);
        
        // Refresh the page data
        setTimeout(async () => {
          await onCreatorRegistered();
        }, 2000);
      }
      
    } catch (error: any) {
      console.error("Update error:", error);
      setError(error.message || 'Failed to update profile. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Error/Success Messages */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative flex items-center">
          <AlertCircle className="mr-2 h-4 w-4" />
          <span>{error}</span>
        </div>
      )}
      
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded relative">
          <div className="flex items-center">
            <CheckCircle className="mr-2 h-4 w-4" />
            <span>{success}</span>
          </div>
          {transactionId && (
            <p className="text-sm mt-1">
              Transaction ID: 
              <a 
                href={`https://flowscan.org/transaction/${transactionId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-1 underline"
              >
                {transactionId.slice(0, 8)}...{transactionId.slice(-6)}
              </a>
            </p>
          )}
        </div>
      )}

      {!creator ? (
        <Card>
          <CardHeader>
            <CardTitle>Become a Creator</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Display Name
                </label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your creator name"
                  required
                  disabled={isRegistering}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Tell supporters about yourself and your content"
                  rows={4}
                  required
                  disabled={isRegistering}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Profile Image URL
                </label>
                <Input
                  value={imageURL}
                  onChange={(e) => setImageURL(e.target.value)}
                  placeholder="https://example.com/your-image.jpg"
                  disabled={isRegistering}
                />
              </div>
              
              <Button 
                type="submit" 
                disabled={isRegistering || !user?.addr}
                className="w-full"
              >
                {isRegistering ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Registering...
                  </span>
                ) : (
                  'Register as Creator'
                )}
              </Button>
              
              {!user?.addr && (
                <p className="text-sm text-gray-500 text-center">
                  Please connect your wallet to register
                </p>
              )}
            </form>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Total Tips</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{creator.tipCount}</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Total FLOW Received</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{creator.totalTipped.toFixed(2)} FLOW</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Average Tip</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">
                  {creator.tipCount > 0 
                    ? (creator.totalTipped / creator.tipCount).toFixed(2) 
                    : "0.00"} FLOW
                </p>
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Your Profile</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUpdate} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Display Name
                  </label>
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your creator name"
                    required
                    disabled={isUpdating}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <Textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Tell supporters about yourself and your content"
                    rows={4}
                    required
                    disabled={isUpdating}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Profile Image URL
                  </label>
                  <Input
                    value={imageURL}
                    onChange={(e) => setImageURL(e.target.value)}
                    placeholder="https://example.com/your-image.jpg"
                    disabled={isUpdating}
                  />
                </div>
                
                <Button 
                  type="submit" 
                  disabled={isUpdating}
                  className="w-full"
                >
                  {isUpdating ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Updating...
                    </span>
                  ) : (
                    'Update Profile'
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Recent Tips</CardTitle>
            </CardHeader>
            <CardContent>
              {tips.length === 0 ? (
                <p className="text-gray-600 text-center py-4">No tips received yet</p>
              ) : (
                <div className="space-y-4">
                  {tips.map((tip) => (
                    <div 
                      key={tip.id}
                      className="border-b border-gray-200 pb-4 last:border-0 last:pb-0"
                    >
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
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default CreatorDashboard;