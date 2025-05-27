import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Creator } from '../../lib/flow/scripts';
import { withdrawTips, debugContractStructure } from '../../lib/flow/transactions';
import { Coins, Wallet, CheckCircle2, AlertCircle, Loader2, DollarSign, TrendingDown, X, ArrowDown, Bug } from 'lucide-react';
import toast from 'react-hot-toast';

interface WithdrawalModalProps {
  creator: Creator;
  onClose: () => void;
  onSuccess?: () => void;
}

const WithdrawalModal: React.FC<WithdrawalModalProps> = ({ creator, onClose, onSuccess }) => {
  const [amount, setAmount] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [success, setSuccess] = useState<boolean>(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isDebugging, setIsDebugging] = useState<boolean>(false);
  const [debugInfo, setDebugInfo] = useState<any>(null);

  const availableBalance = parseFloat(`${creator.totalTipped || '0'}`);
  const quickAmounts = ['25%', '50%', '75%', '100%'];

  // Debug function
  const handleDebug = async () => {
    setIsDebugging(true);
    try {
      const info = await debugContractStructure(creator.address);
      setDebugInfo(info);
      console.log("🔍 Debug info:", info);
      toast.success("Debug info logged to console", {
        duration: 3000,
        position: 'top-center',
      });
    } catch (error) {
      console.error("Debug error:", error);
      toast.error("Debug failed - check console", {
        duration: 3000,
        position: 'top-center',
      });
    } finally {
      setIsDebugging(false);
    }
  };

  // Real-time validation
  useEffect(() => {
    if (amount) {
      const numAmount = parseFloat(amount);
      if (isNaN(numAmount)) {
        setValidationError('Please enter a valid number');
      } else if (numAmount <= 0) {
        setValidationError('Amount must be greater than 0');
      } else if (numAmount < 0.1) {
        setValidationError('Minimum withdrawal amount is 0.1 FLOW');
      } else if (numAmount > availableBalance) {
        setValidationError(`Insufficient balance. Available: ${availableBalance.toFixed(2)} FLOW`);
      } else {
        setValidationError(null);
      }
    } else {
      setValidationError('Amount is required');
    }
  }, [amount, availableBalance]);

  const handleAmountChange = (value: string) => {
    // Allow only numbers and one decimal point
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setAmount(value);
    }
  };

  const handleQuickAmount = (percentage: string) => {
    const percent = parseInt(percentage.replace('%', '')) / 100;
    const calculatedAmount = (availableBalance * percent).toFixed(2);
    setAmount(calculatedAmount);
  };

  const formatAmount = (amount: any): string => {
    if (amount === null || amount === undefined) return '0.00';
    const num = typeof amount === 'number' ? amount : parseFloat(amount);
    return isNaN(num) ? '0.00' : num.toFixed(2);
  };

  const handleWithdraw = async () => {
    try {
      setIsProcessing(true);

      if (validationError) {
        toast.error(validationError, {
          duration: 4000,
          position: 'top-center',
        });
        return;
      }

      const numAmount = parseFloat(amount);
      if (!amount || numAmount <= 0) {
        toast.error('Please enter a valid amount', {
          duration: 4000,
          position: 'top-center',
        });
        return;
      }

      // Show loading toast
      const loadingToast = toast.loading('Processing withdrawal...', {
        position: 'top-center',
      });

      await withdrawTips(numAmount);

      // Dismiss loading toast and show success
      toast.dismiss(loadingToast);
      toast.success(`Successfully withdrew ${amount} FLOW to your wallet!`, {
        duration: 5000,
        position: 'top-center',
        icon: '💰',
      });

      setSuccess(true);
      
      // Call success callback to refresh creator data
      if (onSuccess) {
        onSuccess();
      }
      
      // Auto-close after 3 seconds
      setTimeout(() => {
        onClose();
      }, 3000);
    } catch (err: any) {
      console.error('Error withdrawing tips:', err);
      
      let errorMessage = 'Failed to withdraw. Please try again.';
      
      // Handle specific Flow errors
      if (err.message?.includes('Withdraw') && err.message?.includes('unauthorized')) {
        errorMessage = 'Withdrawal authorization failed. Please check your wallet connection.';
      } else if (err.message?.includes('insufficient')) {
        errorMessage = 'Insufficient balance for withdrawal.';
      } else if (err.message?.includes('1101')) {
        errorMessage = 'Transaction authorization failed. Please check your wallet and try again.';
      } else if (err.message?.includes('Could not borrow')) {
        errorMessage = 'Creator resource not found. Please ensure your creator profile is properly set up.';
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      // Show error toast
      toast.error(errorMessage, {
        duration: 8000,
        position: 'top-center',
        icon: '❌',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const isValid = !validationError && amount && parseFloat(amount) > 0;
  const afterWithdrawalBalance = availableBalance - parseFloat(amount || '0');

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] bg-white/95 backdrop-blur-xl border-0 shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <DialogHeader className="text-center pb-2 flex-shrink-0">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
            <Wallet className="w-8 h-8 text-white" />
          </div>
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
            Withdraw Your Tips
          </DialogTitle>
          <p className="text-gray-600 mt-2">Transfer your earned FLOW tokens to your wallet</p>
        </DialogHeader>
        
        {success ? (
          <div className="flex-1 overflow-y-auto">
            <div className="py-8 text-center space-y-4">
              <div className="mx-auto w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center shadow-lg animate-bounce">
                <CheckCircle2 className="w-10 h-10 text-white" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-bold text-gray-900">Withdrawal Successful!</h3>
                <p className="text-gray-600">
                  You withdrew <span className="font-semibold text-green-600">{amount} FLOW</span> to your wallet
                </p>
                <div className="bg-green-50 rounded-xl p-4 mt-4 border border-green-200">
                  <div className="flex items-center justify-center space-x-2 text-green-700">
                    <Coins className="w-5 h-5" />
                    <span className="font-medium">Remaining balance: {formatAmount(afterWithdrawalBalance)} FLOW</span>
                  </div>
                </div>
              </div>
              <div className="flex justify-center pt-4">
                <Button 
                  onClick={onClose}
                  className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-8 py-2 rounded-xl font-semibold shadow-lg"
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Scrollable Content Area */}
            <div className="flex-1 overflow-y-auto px-1">
              <div className="space-y-6 py-4">
                {/* Balance Overview */}
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6">
                  <div className="text-center">
                    <p className="text-sm text-gray-600 mb-2">Available Balance</p>
                    <p className="text-4xl font-bold text-green-600 mb-2">{formatAmount(availableBalance)} FLOW</p>
                    <p className="text-xs text-gray-500">≈ ${(availableBalance * 1.5).toFixed(2)} USD</p>
                  </div>
                </div>

                {/* Amount Input Section */}
                <div className="space-y-4">
                  <label className="block text-sm font-semibold text-gray-700 flex items-center space-x-2">
                    <TrendingDown className="w-4 h-4 text-green-500" />
                    <span>Withdrawal Amount</span>
                  </label>
                  
                  {/* Quick Amount Buttons */}
                  <div className="grid grid-cols-4 gap-2">
                    {quickAmounts.map((percentage) => (
                      <Button
                        key={percentage}
                        variant="outline"
                        onClick={() => handleQuickAmount(percentage)}
                        className="py-2 text-sm font-medium transition-all duration-200 hover:bg-green-50 hover:border-green-300"
                        disabled={isProcessing || availableBalance <= 0}
                      >
                        {percentage}
                      </Button>
                    ))}
                  </div>
                  
                  {/* Custom Amount Input */}
                  <div className="relative">
                    <Input
                      type="text"
                      value={amount}
                      onChange={(e) => handleAmountChange(e.target.value)}
                      placeholder="Enter withdrawal amount"
                      className={`pl-4 pr-16 py-3 text-lg font-medium border-2 rounded-xl transition-all duration-200 ${
                        validationError 
                          ? 'border-red-300 focus:border-red-500 bg-red-50' 
                          : 'border-gray-200 focus:border-green-500 bg-white'
                      }`}
                      disabled={isProcessing || availableBalance <= 0}
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                      <div className="flex items-center space-x-1 text-gray-500">
                        <Coins className="w-4 h-4" />
                        <span className="font-medium">FLOW</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Validation Error */}
                  {validationError && (
                    <div className="flex items-center space-x-2 text-red-600 text-sm bg-red-50 p-3 rounded-lg border border-red-200">
                      <AlertCircle className="w-4 h-4 flex-shrink-0" />
                      <span>{validationError}</span>
                    </div>
                  )}
                  
                  {/* Withdrawal Preview */}
                  {isValid && (
                    <div className="bg-gradient-to-r from-blue-50 to-green-50 border border-blue-200 rounded-xl p-4">
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Withdrawal Amount:</span>
                          <span className="font-semibold text-gray-900">{amount} FLOW</span>
                        </div>
                        <div className="flex items-center justify-center">
                          <ArrowDown className="w-4 h-4 text-gray-400" />
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Remaining Balance:</span>
                          <span className="font-semibold text-green-600">{formatAmount(afterWithdrawalBalance)} FLOW</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* No Balance Warning */}
                {availableBalance <= 0 && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                    <div className="flex items-center space-x-2 text-yellow-700">
                      <AlertCircle className="w-5 h-5" />
                      <span className="font-medium">No balance available for withdrawal</span>
                    </div>
                    <p className="text-sm text-yellow-600 mt-2">You need to receive tips before you can withdraw funds.</p>
                  </div>
                )}

                {/* Debug Section */}
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Troubleshooting</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleDebug}
                      disabled={isDebugging}
                      className="text-xs"
                    >
                      {isDebugging ? (
                        <Loader2 className="w-3 h-3 animate-spin mr-1" />
                      ) : (
                        <Bug className="w-3 h-3 mr-1" />
                      )}
                      Debug Contract
                    </Button>
                  </div>
                  
                  {debugInfo && (
                    <div className="text-xs space-y-1 text-gray-600 bg-white p-2 rounded border">
                      <div>✅ Creator Resource: {debugInfo.hasPublicCreator ? 'Found' : 'Missing'}</div>
                      <div>✅ Flow Vault: {debugInfo.hasFlowVault ? 'Found' : 'Missing'}</div>
                      <div>✅ Storage Path: {debugInfo.creatorStoragePathExists ? 'Found' : 'Missing'}</div>
                      {debugInfo.totalTipped && <div>💰 Available: {debugInfo.totalTipped} FLOW</div>}
                    </div>
                  )}
                  
                  <p className="text-xs text-gray-500 mt-2">
                    If withdrawal fails, click "Debug Contract" and check the console for detailed error information.
                  </p>
                </div>
              </div>
            </div>
            
            {/* Fixed Footer */}
            <DialogFooter className="gap-3 pt-6 flex-shrink-0 border-t border-gray-100 bg-white/80 backdrop-blur-sm">
              <Button 
                variant="outline" 
                onClick={onClose} 
                disabled={isProcessing}
                className="flex-1 py-3 border-2 border-gray-200 hover:border-gray-300 rounded-xl font-semibold transition-all duration-200"
              >
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
              <Button 
                onClick={handleWithdraw} 
                disabled={isProcessing || !isValid || availableBalance <= 0}
                className="flex-1 py-3 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white rounded-xl font-semibold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Wallet className="w-4 h-4 mr-2" />
                    Withdraw {amount || '0'} FLOW
                  </>
                )}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default WithdrawalModal;