import React from 'react';
import { useAuth } from '@/context/auth-context';
import { Button } from '../ui/button';

const WalletConnector: React.FC = () => {
  const { user, logIn, logOut } = useAuth();

  return (
    <div className="flex flex-col items-center space-y-4">
      {user?.loggedIn ? (
        <>
          <div className="bg-gray-100 rounded-lg p-4 text-center">
            <p className="text-sm text-gray-600">Connected Wallet</p>
            <p className="font-medium text-gray-800">{user.addr?.slice(0, 6)}...{user.addr?.slice(-4)}</p>
          </div>
          <Button variant="outline" onClick={logOut}>Disconnect Wallet</Button>
        </>
      ) : (
        <div className="text-center">
          <p className="mb-4 text-gray-600">Connect your Flow wallet to get started</p>
          <Button onClick={logIn} className="w-full">Connect Wallet</Button>
          <div className="mt-4 text-xs text-gray-500">
            Supports Blocto and Dapper wallets
          </div>
        </div>
      )}
    </div>
  );
};

export default WalletConnector;