import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Creator } from '../../lib/flow/scripts';
import { sendTip } from '../../lib/flow/transactions';

interface TipModalProps {
  creator: Creator;
  onClose: () => void;
}

const TipModal: React.FC<TipModalProps> = ({ creator, onClose }) => {
  const [amount, setAmount] = useState<string>('1.0');
  const [message, setMessage] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);

  const handleTip = async () => {
    try {
      setError(null);
      setIsProcessing(true);

      if (!amount || parseFloat(amount) <= 0) {
        throw new Error('Please enter a valid amount');
      }

      await sendTip(
        creator.address, 
        parseFloat(amount), 
        message
      );

      setSuccess(true);
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (err: any) {
      console.error('Error sending tip:', err);
      setError(err.message || 'Failed to send tip. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Send a Tip to {creator.name}</DialogTitle>
        </DialogHeader>
        
        {success ? (
          <div className="py-6 text-center">
            <div className="text-green-500 text-2xl mb-2">✓</div>
            <p className="text-xl font-medium">Tip Sent Successfully!</p>
            <p className="text-gray-600 mt-2">
              You sent {amount} FLOW to {creator.name}
            </p>
          </div>
        ) : (
          <>
            <div className="space-y-4 py-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Amount (FLOW)
                </label>
                <div className="relative">
                  <Input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    min="0.1"
                    step="0.1"
                    className="pr-12"
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <span className="text-gray-500">FLOW</span>
                  </div>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Message (Optional)
                </label>
                <Textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Add a message with your tip..."
                  rows={3}
                />
              </div>
              
              {error && (
                <div className="text-red-500 text-sm p-2 bg-red-50 rounded">
                  {error}
                </div>
              )}
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={onClose} disabled={isProcessing}>
                Cancel
              </Button>
              <Button onClick={handleTip} disabled={isProcessing}>
                {isProcessing ? 'Processing...' : `Send ${amount} FLOW`}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default TipModal;