import React from "react";

interface WalletOption {
  name: string;
  icon: string;
  description: string;
  id: string;
}

interface WalletOptionsProps {
  onConnect: (walletId: string) => void;
  isConnecting?: boolean;
}

const WalletOptions: React.FC<WalletOptionsProps> = ({ onConnect, isConnecting = false }) => {
  const wallets: WalletOption[] = [
    {
      id: "blocto",
      name: "Blocto",
      icon: "🔷",
      description: "Easy-to-use Flow wallet",
    },
    {
      id: "dapper",
      name: "Dapper",
      icon: "💎",
      description: "Premium Flow wallet experience",
    },
    {
      id: "lilico",
      name: "Lilico",
      icon: "🌸",
      description: "Browser extension wallet",
    },
    {
      id: "flow-wallet",
      name: "Flow Wallet",
      icon: "🌊",
      description: "Official Flow wallet",
    },
  ];

  return (
    <div className="space-y-4 w-full max-w-md">
      {wallets.map((wallet) => (
        <button
          key={wallet.id}
          className="w-full flex items-center p-4 bg-gray-50 hover:bg-gray-100 disabled:bg-gray-100 disabled:opacity-50 rounded-lg border border-gray-200 transition-colors"
          onClick={() => onConnect(wallet.id)}
          disabled={isConnecting}
        >
          <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 text-xl">
            {wallet.icon}
          </div>
          <div className="ml-4 text-left">
            <h3 className="text-gray-900 font-medium">{wallet.name}</h3>
            <p className="text-sm text-gray-600">{wallet.description}</p>
          </div>
          {isConnecting && (
            <div className="ml-auto">
              <div className="h-4 w-4 rounded-full border-2 border-t-purple-600 border-gray-300 animate-spin"></div>
            </div>
          )}
        </button>
      ))}

      <div className="pt-4">
        <p className="text-center text-sm text-gray-600">
          New to Flow wallets?{" "}
          <a
            href="https://docs.onflow.org/flow-token/wallets/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-purple-600 hover:text-purple-700 underline"
          >
            Learn more about Flow wallets
          </a>
        </p>
      </div>
    </div>
  );
};

export default WalletOptions;