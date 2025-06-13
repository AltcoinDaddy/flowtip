import * as fcl from "@onflow/fcl";
import * as t from "@onflow/types";

// 🔍 STEP 1: Comprehensive Debug Function
export const debugEverything = async () => {
  console.log("🔍 === COMPREHENSIVE FCL DEBUGGING ===");
  
  try {
    // Check FCL Configuration
    console.log("⚙️ FCL Configuration:");
    console.log("- Access Node:", fcl.config.get("accessNode.api"));
    console.log("- Discovery Wallet:", fcl.config.get("discovery.wallet"));
    console.log("- App Details:", fcl.config.get("app.detail"));
    console.log("- Network:", fcl.config.get("flow.network"));
    
    // Check Current User
    const user = await fcl.currentUser.snapshot();
    console.log("\n👤 User Status:");
    console.log("- Logged In:", user.loggedIn);
    console.log("- Address:", user.addr);
    console.log("- Services:", user.services);
    console.log("- Full User Object:", user);
    
    // Test Basic Query
    console.log("\n📦 Testing Basic Query...");
    const blockHeight = await fcl.query({
      cadence: `access(all) fun main(): UInt64 { return getCurrentBlock().height }`
    });
    console.log("✅ Block Height:", blockHeight);
    
    // Test Flow Token Balance
    console.log("\n💰 Testing Balance Query...");
    if (user.addr) {
      const balanceScript = `
        import FlowToken from 0x1654653399040a61
        import FungibleToken from 0xf233dcee88fe0abe
        
        access(all) fun main(address: Address): UFix64 {
          let account = getAccount(address)
          let vaultRef = account.capabilities.get<&{FungibleToken.Balance}>(/public/flowTokenBalance)
            .borrow()
            ?? panic("Could not borrow Balance reference to the Vault")
          return vaultRef.balance
        }
      `;
      
      const balance = await fcl.query({
        cadence: balanceScript,
        args: (arg: any, t: any) => [arg(user.addr, t.Address)],
      });
      console.log("✅ FLOW Balance:", balance);
    }
    
    return {
      configured: true,
      userLoggedIn: user.loggedIn,
      canQuery: true,
      network: fcl.config.get("accessNode.api")
    };
    
  } catch (error: any) {
    console.error("❌ Debug Error:", error);
    return { configured: false, error: error.message };
  }
};

// 🔧 STEP 2: Alternative Transaction Patterns
export const sendTipAlternative1 = async (
  recipientAddress: string,
  amount: number,
  message: string
) => {
  try {
    console.log("🚀 Alternative Method 1: Different Authorization Pattern");
    
    const user = await fcl.currentUser.snapshot();
    if (!user.loggedIn) throw new Error("Not logged in");
    
    // Try with different authorization pattern
    const transactionId = await fcl.mutate({
      cadence: `
        import FlowToken from 0x1654653399040a61
        import FungibleToken from 0xf233dcee88fe0abe

        transaction(recipient: Address, amount: UFix64) {
          prepare(signer: auth(Storage) &Account) {
            log("🚀 Alternative transaction started")
            
            let vaultRef = signer.storage.borrow<auth(FungibleToken.Withdraw) &FlowToken.Vault>(from: /storage/flowTokenVault)
              ?? panic("Could not borrow vault")
            
            let payment <- vaultRef.withdraw(amount: amount)
            
            let recipientVault = getAccount(recipient)
              .capabilities.get<&{FungibleToken.Receiver}>(/public/flowTokenReceiver)
              .borrow()
              ?? panic("Could not borrow recipient vault")
            
            recipientVault.deposit(from: <-payment)
            log("✅ Alternative transaction completed")
          }
        }
      `,
      args: (arg: any, t: any) => [
        arg(recipientAddress, t.Address),
        arg(amount.toFixed(8), t.UFix64),
      ],
      // 🔧 Try different authorization approach
      authorizations: [fcl.authz],
      payer: fcl.authz,
      proposer: fcl.authz,
      limit: 200,
    });
    
    console.log("✅ Alternative transaction submitted:", transactionId);
    const result = await fcl.tx(transactionId).onceSealed();
    console.log("✅ Alternative transaction sealed:", result);
    
    return result;
  } catch (error) {
    console.error("❌ Alternative Method 1 failed:", error);
    throw error;
  }
};

// 🔧 STEP 3: Even Simpler Transaction
export const sendTipAlternative2 = async (
  recipientAddress: string,
  amount: number
) => {
  try {
    console.log("🚀 Alternative Method 2: Minimal Transaction");
    
    // Force re-authentication first
    console.log("🔑 Re-authenticating...");
    await fcl.authenticate();
    
    const user = await fcl.currentUser.snapshot();
    console.log("👤 User after re-auth:", user);
    
    if (!user.loggedIn) throw new Error("Re-authentication failed");
    
    console.log("📝 Submitting minimal transaction...");
    
    const transactionId = await fcl.send([
      fcl.transaction`
        import FlowToken from 0x1654653399040a61
        import FungibleToken from 0xf233dcee88fe0abe

        transaction(recipient: Address, amount: UFix64) {
          prepare(signer: auth(Storage) &Account) {
            let vault = signer.storage.borrow<auth(FungibleToken.Withdraw) &FlowToken.Vault>(from: /storage/flowTokenVault)!
            let payment <- vault.withdraw(amount: amount)
            let recipientVault = getAccount(recipient).capabilities.get<&{FungibleToken.Receiver}>(/public/flowTokenReceiver).borrow()!
            recipientVault.deposit(from: <-payment)
          }
        }
      `,
      fcl.args([
        fcl.arg(recipientAddress, t.Address),
        fcl.arg(amount.toFixed(8), t.UFix64),
      ]),
      fcl.proposer(fcl.authz),
      fcl.payer(fcl.authz),
      fcl.authorizations([fcl.authz]),
      fcl.limit(200),
    ]);
    
    console.log("✅ Minimal transaction submitted:", transactionId);
    const result = await fcl.tx(transactionId).onceSealed();
    console.log("✅ Minimal transaction sealed:", result);
    
    return result;
  } catch (error) {
    console.error("❌ Alternative Method 2 failed:", error);
    throw error;
  }
};

// 🔧 STEP 4: Test Wallet Responsiveness
export const testWalletResponsiveness = async () => {
  try {
    console.log("🧪 Testing wallet responsiveness...");
    
    // Test 1: Logout and login
    console.log("🔓 Logging out...");
    await fcl.unauthenticate();
    
    console.log("🔑 Logging back in...");
    await fcl.authenticate();
    
    const user = await fcl.currentUser.snapshot();
    console.log("✅ Login test passed:", user.loggedIn);
    
    // Test 2: Simple transaction
    console.log("📝 Testing simplest possible transaction...");
    const txId = await fcl.mutate({
      cadence: `
        transaction() {
          prepare(signer: auth(Storage) &Account) {
            log("Hello from test transaction")
          }
        }
      `,
      proposer: fcl.currentUser,
      payer: fcl.currentUser,
      authorizations: [fcl.currentUser],
      limit: 50,
    });
    
    console.log("✅ Test transaction submitted:", txId);
    const result = await fcl.tx(txId).onceSealed();
    console.log("✅ Test transaction result:", result);
    
    return { walletResponsive: true, canSubmitTransactions: true };
    
  } catch (error: any) {
    console.error("❌ Wallet responsiveness test failed:", error);
    return { walletResponsive: false, error: error.message };
  }
};

// 🔧 STEP 5: Check Network Status
export const checkNetworkStatus = async () => {
  try {
    console.log("🌐 Checking network status...");
    
    // Get network info
    const accessNode = fcl.config.get("accessNode.api");
    console.log("📡 Access Node:", accessNode);
    
    // Test connectivity with multiple calls
    const promises = [];
    for (let i = 0; i < 3; i++) {
      promises.push(
        fcl.query({
          cadence: `access(all) fun main(): UInt64 { return getCurrentBlock().height }`
        })
      );
    }
    
    const results = await Promise.all(promises);
    console.log("📦 Block heights:", results);
    
    // Check if results are consistent
    const allSame = results.every(height => height === results[0]);
    console.log("✅ Network consistency:", allSame);
    
    return { networkHealthy: true, blockHeight: results[0] };
    
  } catch (error: any) {
    console.error("❌ Network check failed:", error);
    return { networkHealthy: false, error: error.message };
  }
};

// 🚀 MAIN DEBUGGING FUNCTION
export const runFullDiagnostics = async () => {
  console.log("🔍 === STARTING FULL DIAGNOSTICS ===\n");
  
  const results = {
    debug: await debugEverything(),
    network: await checkNetworkStatus(),
    wallet: await testWalletResponsiveness(),
  };
  
  console.log("\n📊 === DIAGNOSTIC RESULTS ===");
  console.log("Configuration:", results.debug.configured);
  console.log("Network Health:", results.network.networkHealthy);
  console.log("Wallet Responsive:", results.wallet.walletResponsive);
  
  return results;
};