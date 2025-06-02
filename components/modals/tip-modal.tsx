import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Creator } from '../../lib/flow/scripts';
import { sendTip } from '../../lib/flow/transactions';
import { Coins, Heart, Send, CheckCircle2, AlertCircle, Loader2, DollarSign, MessageCircle, X } from 'lucide-react';
import toast from 'react-hot-toast';

interface TipModalProps {
  creator: Creator;
  onClose: () => void;
}

const TipModal: React.FC<TipModalProps> = ({ creator, onClose }) => {
  const [amount, setAmount] = useState<string>('1.0');
  const [message, setMessage] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [success, setSuccess] = useState<boolean>(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Predefined tip amounts for quick selection
  const quickAmounts = ['1.0', '5.0', '10.0', '25.0'];

  // Real-time validation
  useEffect(() => {
    if (amount) {
      const numAmount = parseFloat(amount);
      if (isNaN(numAmount)) {
        setValidationError('Please enter a valid number');
      } else if (numAmount <= 0) {
        setValidationError('Amount must be greater than 0');
      } else if (numAmount < 0.1) {
        setValidationError('Minimum tip amount is 0.1 FLOW');
      } else if (numAmount > 1000) {
        setValidationError('Maximum tip amount is 1000 FLOW');
      } else {
        setValidationError(null);
      }
    } else {
      setValidationError('Amount is required');
    }
  }, [amount]);

  const handleAmountChange = (value: string) => {
    // Allow only numbers and one decimal point
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setAmount(value);
    }
  };

  const handleQuickAmount = (quickAmount: string) => {
    setAmount(quickAmount);
  };

  const handleTip = async () => {
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
      const loadingToast = toast.loading('Sending tip...', {
        position: 'top-center',
      });

      await sendTip(
        creator.address, 
        numAmount, 
        message.trim()
      );

      // Dismiss loading toast and show success
      toast.dismiss(loadingToast);
      toast.success(`Successfully sent ${amount} FLOW to ${creator.name}!`, {
        duration: 5000,
        position: 'top-center',
        icon: '🎉',
      });

      setSuccess(true);
      // Auto-close after 3 seconds
      setTimeout(() => {
        onClose();
      }, 3000);
    } catch (err: any) {
      console.error('Error sending tip:', err);
      
      // Show error toast with specific error message
      toast.error(err.message || 'Failed to send tip. Please try again.', {
        duration: 6000,
        position: 'top-center',
        icon: '❌',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const isValid = !validationError && amount && parseFloat(amount) > 0;

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] bg-white/95 backdrop-blur-xl border-0 shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <DialogHeader className="text-center pb-2 flex-shrink-0">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br bg-green-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
            <Heart className="w-8 h-8 text-white" />
          </div>
          <DialogTitle className="text-2xl font-bold text-green-600 bg-clip-text text-transparent">
            Send a Tip to {creator.name}
          </DialogTitle>
          <p className="text-gray-600 mt-2">Show your appreciation with FLOW tokens</p>
        </DialogHeader>
        
        {success ? (
          <div className="flex-1 overflow-y-auto">
            <div className="py-8 text-center space-y-4">
              <div className="mx-auto w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center shadow-lg animate-bounce">
                <CheckCircle2 className="w-10 h-10 text-white" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-bold text-gray-900">Tip Sent Successfully!</h3>
                <p className="text-gray-600">
                  You sent <span className="font-semibold text-green-600">{amount} FLOW</span> to{' '}
                  <span className="font-semibold">{creator.name}</span>
                </p>
                {message && (
                  <div className="bg-gray-50 rounded-xl p-3 mt-4 border-l-4 border-purple-500">
                    <p className="text-sm text-gray-700 italic">"{message}"</p>
                  </div>
                )}
              </div>
              <div className="flex justify-center pt-4">
                <Button 
                  onClick={onClose}
                  className="bg-green-600 text-white px-8 py-2 rounded-xl font-semibold shadow-lg"
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
                {/* Amount Input Section */}
                <div className="space-y-4">
                  <label className=" text-sm font-semibold text-gray-700 flex items-center space-x-2">
                    <DollarSign className="w-4 h-4 text-purple-500" />
                    <span>Tip Amount</span>
                  </label>
                  
                  {/* Quick Amount Buttons */}
                  <div className="grid grid-cols-4 gap-2">
                    {quickAmounts.map((quickAmount) => (
                      <Button
                        key={quickAmount}
                        variant={amount === quickAmount ? "default" : "outline"}
                        onClick={() => handleQuickAmount(quickAmount)}
                        className={`py-2 text-sm font-medium transition-all duration-200 ${
                          amount === quickAmount 
                            ? 'bg-gradient-to-r bg-green-600 text-white shadow-md' 
                            : 'hover:bg-purple-50 hover:border-purple-300'
                        }`}
                        disabled={isProcessing}
                      >
                        {quickAmount}
                      </Button>
                    ))}
                  </div>
                  
                  {/* Custom Amount Input */}
                  <div className="relative">
                    <Input
                      type="text"
                      value={amount}
                      onChange={(e) => handleAmountChange(e.target.value)}
                      placeholder="Enter custom amount"
                      className={`pl-4 pr-16 py-3 text-lg text-black font-medium border-2 rounded-xl transition-all duration-200 ${
                        validationError 
                          ? 'border-red-300 focus:border-red-500 bg-red-50' 
                          : 'border-gray-200 focus:border-green-500 bg-white'
                      }`}
                      disabled={isProcessing}
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
                  
                  {/* Amount Preview */}
                  {isValid && (
                    <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-xl p-4">
                      <div className="text-center">
                        <p className="text-sm text-gray-600 mb-1">You're sending</p>
                        <p className="text-2xl font-bold text-purple-600">{amount} FLOW</p>
                        <p className="text-xs text-gray-500 mt-1">≈ ${(parseFloat(amount) * 1.5).toFixed(2)} USD</p>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Message Section */}
                <div className="space-y-3">
                  <label className="text-sm font-semibold text-gray-700 flex items-center space-x-2">
                    <MessageCircle className="w-4 h-4 text-purple-500" />
                    <span>Message (Optional)</span>
                  </label>
                  <Textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Add a personal message with your tip... 💝"
                    rows={3}
                    maxLength={280}
                    className="border-2 border-gray-200 text-black focus:border-green-600 rounded-xl p-4 resize-none transition-all duration-200"
                    disabled={isProcessing}
                  />
                  <div className="text-right text-xs text-gray-500">
                    {message.length}/280 characters
                  </div>
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
                onClick={handleTip} 
                disabled={isProcessing || !isValid}
                className="flex-1 py-3 bg-green-500 text-white rounded-xl font-semibold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Send {amount} FLOW
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

export default TipModal;