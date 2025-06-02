import React from 'react';
import { Creator, Tip } from '../../lib/flow/scripts';
import { Avatar } from '../ui/avatar';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import TipModal from '../modals/tip-modal';
import WithdrawalModal from '../modals/withdrawal-modal';
import { useAuth } from '@/context/auth-context';
import { Coins, Heart, TrendingUp, Calendar, MessageCircle, User, Send, Star, Wallet } from 'lucide-react';

interface CreatorProfileProps {
  creator: Creator;
  tips: Tip[];
}

const CreatorProfile: React.FC<CreatorProfileProps> = ({ creator, tips }) => {
  const [showTipModal, setShowTipModal] = React.useState(false);
  const [showWithdrawalModal, setShowWithdrawalModal] = React.useState(false);
  const { user } = useAuth();
  
  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatAmount = (amount: any): string => {
    if (amount === null || amount === undefined) return '0.00';
    const num = typeof amount === 'number' ? amount : parseFloat(amount);
    return isNaN(num) ? '0.00' : num.toFixed(2);
  };

  const avgTipAmount = creator.tipCount > 0 
    ? formatAmount(Number(creator.totalTipped) / creator.tipCount)
    : "0.00";

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-3xl bg-green-600 text-white mt-10 shadow-2xl">
        {/* Animated background patterns */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20">
          <div className="absolute top-0 left-0 w-72 h-72 bg-white/10 rounded-full -translate-x-36 -translate-y-36 animate-pulse" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/5 rounded-full translate-x-48 translate-y-48" />
        </div>
        
        <div className="relative px-8 py-12">
          <div className="flex flex-col lg:flex-row items-start lg:items-center gap-8">
            {/* Avatar with enhanced design */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r  rounded-full blur-xl opacity-75 group-hover:opacity-100 transition-opacity duration-300" />
              <Avatar className="relative h-32 w-32 ring-8 ring-white/20 shadow-2xl transition-transform duration-300 group-hover:scale-105">
                <img 
                  src={creator.imageURL || `https://api.dicebear.com/9.x/adventurer/svg?seed=${creator.name}`} 
                  alt={creator.name}
                  className="object-cover"
                  onError={(e) => {
                    e.currentTarget.src = `https://api.dicebear.com/9.x/adventurer/svg?seed=${creator.name}`;
                  }}
                />
              </Avatar>
              <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full border-4 border-white shadow-lg flex items-center justify-center">
                <Star className="w-5 h-5 text-white fill-white" />
              </div>
            </div>
            
            {/* Creator Info */}
            <div className="flex-1 text-white">
              <h1 className="text-4xl lg:text-5xl font-bold mb-3 bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent">
                {creator.name}
              </h1>
              <div className="flex items-center space-x-3 mb-6">
                <User className="w-5 h-5 text-white/80" />
                <span className="font-mono bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-sm border border-white/30">
                  {creator.address.slice(0, 8)}...{creator.address.slice(-6)}
                </span>
              </div>
              
              {/* Quick Stats */}
              <div className="flex flex-wrap gap-6 text-white/90">
                <div className="flex items-center space-x-2">
                  <Heart className="w-5 h-5 text-pink-300" />
                  <span className="font-semibold">{creator.tipCount || 0} Tips</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Coins className="w-5 h-5 text-yellow-300" />
                  <span className="font-semibold">{formatAmount(creator.totalTipped)} FLOW</span>
                </div>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              {user?.addr === creator.address && user?.loggedIn ? (
                // Withdrawal button for the creator themselves
                <Button 
                  onClick={() => setShowWithdrawalModal(true)}
                  className="bg-white text-black shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 px-8 py-4 text-lg font-semibold rounded-2xl border-0"
                  disabled={!creator.totalTipped || parseFloat(creator.totalTipped.toString()) <= 0}
                >
                  <Wallet className="w-5 h-5 mr-2" />
                  Withdraw Tips
                </Button>
              ) : user?.loggedIn ? (
                // Send tip button for other users
                <Button 
                  onClick={() => setShowTipModal(true)}
                  className="bg-white text-purple-600 hover:bg-gray-100 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 px-8 py-4 text-lg font-semibold rounded-2xl border-0"
                >
                  <Send className="w-5 h-5 mr-2" />
                  Send Tip
                </Button>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        <Card className="bg-gradient-to-br bg-white shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-green-600 rounded-xl shadow-lg">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <TrendingUp className="w-5 h-5 text-green-500" />
            </div>
            <h3 className="text-sm font-medium text-gray-600 uppercase tracking-wide mb-1">Total Tips</h3>
            <p className="text-3xl font-bold text-gray-900">{creator.tipCount || 0}</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-indigo-100 border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-500 rounded-xl shadow-lg">
                <Coins className="w-6 h-6 text-white" />
              </div>
              <div className="flex items-center space-x-1">
                <TrendingUp className="w-5 h-5 text-blue-500" />
                {user?.addr === creator.address && parseFloat(creator.totalTipped.toString() || '0') > 0 && (
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                )}
              </div>
            </div>
            <h3 className="text-sm font-medium text-gray-600 uppercase tracking-wide mb-1">
              {user?.addr === creator.address ? 'Available to Withdraw' : 'Total Received'}
            </h3>
            <p className="text-3xl font-bold text-gray-900">{formatAmount(creator.totalTipped)} <span className="text-lg text-gray-600">FLOW</span></p>
            {user?.addr === creator.address && parseFloat(creator.totalTipped.toString() || '0') > 0 && (
              <p className="text-xs text-green-600 mt-1 font-medium">Ready for withdrawal</p>
            )}
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-emerald-100 border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-green-500 rounded-xl shadow-lg">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <Star className="w-5 h-5 text-green-500" />
            </div>
            <h3 className="text-sm font-medium text-gray-600 uppercase tracking-wide mb-1">Average Tip</h3>
            <p className="text-3xl font-bold text-gray-900">{avgTipAmount} <span className="text-lg text-gray-600">FLOW</span></p>
          </CardContent>
        </Card>
      </div>

      {/* About Section */}
      <Card className="mt-8 bg-white/70 backdrop-blur-sm border-0 shadow-lg">
        <CardContent className="p-8">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-2 bg-gradient-to-r bg-green-600 rounded-lg">
              <User className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">About</h2>
          </div>
          <p className="text-gray-700 leading-relaxed text-lg whitespace-pre-line">
            {creator.description}
          </p>
        </CardContent>
      </Card>

      {/* Recent Tips Section */}
      {tips.length > 0 && (
        <div className="mt-8">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-2 bg-gradient-to-r bg-green-600 rounded-lg">
              <MessageCircle className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Recent Tips</h2>
          </div>
          
          <div className="grid gap-4">
            {tips.slice(0, 5).map((tip, index) => (
              <Card key={tip.id} className="bg-white/80 backdrop-blur-sm border-0 shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5">
                <CardContent className="p-6">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-r bg-green-600 rounded-full flex items-center justify-center text-white font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">
                          {tip.from.slice(0, 8)}...{tip.from.slice(-6)}
                        </p>
                        <div className="flex items-center space-x-2 text-gray-500 text-sm">
                          <Calendar className="w-4 h-4" />
                          <span>{formatDate(tip.timestamp)}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="bg-gradient-to-r bg-green-600 text-white px-4 py-2 rounded-full shadow-lg">
                        <span className="font-bold text-lg">{formatAmount(tip.amount)} FLOW</span>
                      </div>
                    </div>
                  </div>
                  
                  {tip.message && (
                    <div className="mt-4 bg-gray-50 rounded-xl p-4 border-l-4 border-purple-500">
                      <div className="flex items-start space-x-2">
                        <MessageCircle className="w-4 h-4 text-purple-500 mt-0.5 flex-shrink-0" />
                        <p className="text-gray-700 italic">"{tip.message}"</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
      
      {/* Modals */}
      {showTipModal && (
        <TipModal
          creator={creator}
          onClose={() => setShowTipModal(false)}
        />
      )}
      
      {showWithdrawalModal && (
        <WithdrawalModal
          creator={creator}
          onClose={() => setShowWithdrawalModal(false)}
          onSuccess={() => {
            // Refresh the creator data after successful withdrawal
            window.location.reload(); // Simple refresh - you might want to implement a more elegant refresh
          }}
        />
      )}
    </div>
  );
};

export default CreatorProfile;