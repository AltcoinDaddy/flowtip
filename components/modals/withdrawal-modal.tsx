import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Creator } from '../../lib/flow/scripts';
import { withdrawTips } from '../../lib/flow/transactions';
import { Wallet, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
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

  const availableBalance = parseFloat(`${creator.totalTipped || '0'}`);
  const quickAmounts = ['25%', '50%', '75%', '100%'];

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
        toast.error(validationError);
        return;
      }

      const numAmount = parseFloat(amount);
      if (!amount || numAmount <= 0) {
        toast.error('Please enter a valid amount');
        return;
      }

      const loadingToast = toast.loading('Processing withdrawal...');

      await withdrawTips(numAmount);

      toast.dismiss(loadingToast);
      toast.success(`Successfully withdrew ${amount} FLOW to your wallet!`);

      setSuccess(true);
      
      if (onSuccess) {
        onSuccess();
      }
      
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (err: any) {
      console.error('Error withdrawing tips:', err);
      
      let errorMessage = 'Failed to withdraw. Please try again.';
      
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
      
      toast.error(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  const isValid = !validationError && amount && parseFloat(amount) > 0;

  if (success) {
    return (
      <Dialog open={true} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md overflow-hidden">
          <div className="text-center py-6">
            <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Withdrawal Successful!</h3>
            <p className="text-gray-600 mb-4">
              You withdrew <span className="font-medium">{amount} FLOW</span> to your wallet
            </p>
            <Button onClick={onClose} className="w-full hover:bg-primary hover:shadow-none">
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md !bg-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wallet className="w-5 h-5" />
            Withdraw Tips
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Available Balance */}
          <div className="bg-gray-50 rounded-lg p-4 text-center">
            <p className="text-sm text-gray-600 mb-1">Available Balance</p>
            <p className="text-2xl font-bold text-gray-900">{formatAmount(availableBalance)} FLOW</p>
          </div>

          {/* Quick Amount Buttons */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Quick Select
            </label>
            <div className="grid grid-cols-4 gap-2">
              {quickAmounts.map((percentage) => (
                <Button
                  key={percentage}
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickAmount(percentage)}
                  disabled={isProcessing || availableBalance <= 0}
                  className="hover:bg-transparent hover:border-gray-200"
                >
                  {percentage}
                </Button>
              ))}
            </div>
          </div>
          
          {/* Amount Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Withdrawal Amount
            </label>
            <div className="relative">
              <Input
                type="text"
                value={amount}
                onChange={(e) => handleAmountChange(e.target.value)}
                placeholder="Enter amount"
                className={`text-black ${validationError ? 'border-red-300' : ''}`}
                disabled={isProcessing || availableBalance <= 0}
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <span className="text-gray-500 text-sm">FLOW</span>
              </div>
            </div>
            
            {validationError && (
              <div className="flex items-center gap-2 text-red-600 text-sm mt-2">
                <AlertCircle className="w-4 h-4" />
                <span>{validationError}</span>
              </div>
            )}
          </div>

          {/* No Balance Warning */}
          {availableBalance <= 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <div className="flex items-center gap-2 text-yellow-700">
                <AlertCircle className="w-4 h-4" />
                <span className="text-sm">No balance available for withdrawal</span>
              </div>
            </div>
          )}
        </div>
        
        <DialogFooter className="gap-2">
          <Button 
            variant="outline" 
            onClick={onClose} 
            disabled={isProcessing}
            className="flex-1 hover:bg-transparent hover:border-gray-200"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleWithdraw} 
            disabled={isProcessing || !isValid || availableBalance <= 0}
            className="flex-1 hover:bg-primary hover:shadow-none"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              `Withdraw ${amount || '0'} FLOW`
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default WithdrawalModal;