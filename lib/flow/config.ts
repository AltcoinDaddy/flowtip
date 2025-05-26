import { config } from "@onflow/fcl";

// 🎉 MAINNET CONFIGURATION with WalletConnect
config({
  "app.detail.title": "FlowTip",
  "app.detail.icon": "https://your-app-icon.com/icon.png",
  "accessNode.api": "https://rest-mainnet.onflow.org", // Mainnet
  "discovery.wallet": "https://fcl-discovery.onflow.org/authn", // Mainnet wallets
  
  // WalletConnect Configuration (fixes the warning)
  "walletconnect.projectId": "c1e023cedfba7685938ff5b9d298cfb9", // Replace with your actual WalletConnect project ID
  
  // 🚀 Your deployed contract address
  "0xFlowTip": "0x6c1b12e35dca8863",
  
  // Mainnet standard contracts
  "0xFlowToken": "0x1654653399040a61",
  "0xFungibleToken": "0xf233dcee88fe0abe",
});

export default config;