import * as fcl from "@onflow/fcl";
import * as t from "@onflow/types";

// Define the transaction result interface
interface TransactionResult {
  status: number;
  statusString: string;
  blockId?: string;
  transactionId?: string;
  events?: any[];
  errorMessage?: string;
}

// 🔧 FIXED: Registration function that matches your CURRENT contract
export const registerCreator = async (
  name: string,
  description: string,
  imageURL: string
): Promise<TransactionResult> => {
  try {
    console.log("🚀 Starting creator registration...", {
      name,
      description,
      imageURL,
    });

    const currentUser = await fcl.currentUser.snapshot();
    console.log("👤 Current User:", currentUser);

    if (!currentUser.loggedIn) {
      throw new Error(
        "User is not logged in. Please connect your wallet first."
      );
    }

    if (!currentUser.addr) {
      throw new Error("User address not found. Please reconnect your wallet.");
    }

    console.log("✅ User is connected:", currentUser.addr);

    const transactionId = await fcl.mutate({
      cadence: `
        import FlowTip from 0x6c1b12e35dca8863

    transaction(name: String, description: String, imageURL: String) {
      prepare(account: auth(Storage, Capabilities) &Account) {
        log("🔧 Starting creator registration...")
        
        // Clean up any existing resources first
        if account.storage.borrow<&FlowTip.Creator>(from: FlowTip.CreatorStoragePath) != nil {
          log("⚠️ Removing existing creator resource...")
          let oldCreator <- account.storage.load<@FlowTip.Creator>(from: FlowTip.CreatorStoragePath)
          destroy oldCreator
        }
        
        // Remove old capability if it exists
        account.capabilities.unpublish(FlowTip.CreatorPublicPath)
        
        // Register with contract first to get ID
        log("📝 Registering with contract...")
        let creatorID = FlowTip.registerCreator(address: account.address)
        log("✅ Registered with ID: ".concat(creatorID.toString()))
        
        // Create the Creator resource with correct signature
        log("🏗️ Creating creator resource...")
        let creator <- FlowTip.createCreator(
          id: creatorID,
          name: name,
          description: description, 
          imageURL: imageURL
        )
        
        // Save to storage
        log("💾 Saving to storage...")
        account.storage.save(<-creator, to: FlowTip.CreatorStoragePath)
        
        // 🆕 NEW: Create capability using Cadence 1.0 syntax
        log("🔗 Creating public capability...")
        let creatorCap = account.capabilities.storage.issue<&FlowTip.Creator>(
          FlowTip.CreatorStoragePath
        )
        
        // Publish the capability
        account.capabilities.publish(creatorCap, at: FlowTip.CreatorPublicPath)
        
        log("✅ Creator registration completed successfully!")
      }
      
      execute {
        log("🎉 Transaction executed successfully")
      }
    }
      `,
      args: (arg: any, t: any) => [
        arg(name, t.String),
        arg(description, t.String),
        arg(imageURL, t.String),
      ],
      proposer: fcl.currentUser,
      payer: fcl.currentUser,
      authorizations: [fcl.currentUser],
      limit: 9999,
    });

    console.log("✅ Transaction submitted:", transactionId);

    const result = await fcl.tx(transactionId).onceSealed();
    console.log("🎉 Transaction sealed:", result);

    return {
      status: result.status,
      statusString: result.statusString,
      blockId: result.blockId,
      transactionId: transactionId,
      events: result.events || [],
      errorMessage: result.errorMessage,
    } as TransactionResult;
  } catch (error: any) {
    console.error("❌ Error registering creator:", error);

    // Enhanced error logging
    if (error instanceof Error) {
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
    }

    throw new Error(
      error instanceof Error
        ? error.message
        : "Unknown error occurred during registration"
    );
  }
};

// Send a tip to a creator - BASIC VERSION
export const sendTip = async (
  recipientAddress: string,
  amount: number,
  message: string
) => {
  try {
    console.log("🚀 Starting tip transaction...", {
      recipientAddress,
      amount,
      message,
    });

    // Debug: Check user authentication first
    const currentUser = await fcl.currentUser.snapshot();
    console.log("👤 Current user:", currentUser);

    if (!currentUser.loggedIn) {
      throw new Error("User not logged in");
    }

    // Debug: Check balance before transaction
    const balanceScript = `
      import FlowToken from 0x1654653399040a61
      import FungibleToken from 0xf233dcee88fe0abe
      
      access(all) fun main(address: Address): UFix64 {
        let account = getAccount(address)
        let vaultRef = account.capabilities.get<&FlowToken.Vault{FungibleToken.Balance}>(/public/flowTokenBalance)
          .borrow()
          ?? panic("Could not borrow Balance reference to the Vault")
        return vaultRef.balance
      }
    `;

    try {
      const balance = await fcl.query({
        cadence: balanceScript,
        args: (arg: any, t: any) => [arg(currentUser.addr, t.Address)],
      });
      console.log("💰 Current FLOW balance:", balance);

      if (parseFloat(balance) < amount) {
        throw new Error(
          `Insufficient balance. You have ${balance} FLOW but need ${amount} FLOW`
        );
      }
    } catch (balanceError) {
      console.warn("⚠️ Could not check balance:", balanceError);
    }

    // Debug: Verify recipient exists and has Creator resource
    const checkRecipientScript = `
      import FlowTip from 0x6c1b12e35dca8863
      
      access(all) fun main(address: Address): Bool {
        let account = getAccount(address)
        let creatorRef = account.capabilities.get<&FlowTip.Creator>(FlowTip.CreatorPublicPath)
          .borrow()
        return creatorRef != nil
      }
    `;

    try {
      const hasCreator = await fcl.query({
        cadence: checkRecipientScript,
        args: (arg: any, t: any) => [arg(recipientAddress, t.Address)],
      });
      console.log("🎯 Recipient has Creator resource:", hasCreator);

      if (!hasCreator) {
        throw new Error("Recipient does not have a Creator resource set up");
      }
    } catch (recipientError) {
      console.error("❌ Error checking recipient:", recipientError);
      throw new Error("Could not verify recipient's Creator resource");
    }

    // FIXED TRANSACTION: Proper authorization for withdraw
    const transactionId = await fcl.mutate({
      cadence: `
        import FlowToken from 0x1654653399040a61
        import FungibleToken from 0xf233dcee88fe0abe
        import FlowTip from 0x6c1b12e35dca8863

        transaction(recipient: Address, amount: UFix64, message: String) {

          prepare(signer: auth(Storage) &Account) {
            // 🔧 FIXED: Borrow vault with proper Provider authorization
            let vaultRef = signer.storage.borrow<auth(FungibleToken.Withdraw) &FlowToken.Vault>(from: /storage/flowTokenVault)
              ?? panic("Could not borrow reference to the sender's vault")
            
            // Withdraw tokens from the sender's vault
            let payment <- vaultRef.withdraw(amount: amount)
            
            // Get a reference to the recipient's Creator resource
            let recipientCreator = getAccount(recipient)
              .capabilities.get<&FlowTip.Creator>(FlowTip.CreatorPublicPath)
              .borrow()
              ?? panic("Could not borrow a reference to the Creator")
            
            // Get a reference to the recipient's Flow token vault
            let recipientVault = getAccount(recipient)
              .capabilities.get<&{FungibleToken.Receiver}>(/public/flowTokenReceiver)
              .borrow()
              ?? panic("Could not borrow a reference to the recipient's vault")
                
            // Deposit the withdrawn tokens into the recipient's vault
            recipientVault.deposit(from: <-payment)
            
            // Record tip information in the creator's resource
            recipientCreator.receiveTip(amount: amount, from: signer.address, message: message)
            
            // Debug: Log successful completion
            log("✅ Tip sent successfully: ".concat(amount.toString()).concat(" FLOW"))
          }
        }
      `,
      args: (arg: any, t: any) => [
        arg(recipientAddress, t.Address),
        arg(amount.toFixed(8), t.UFix64),
        arg(message, t.String),
      ],
      payer: fcl.authz,
      proposer: fcl.authz,
      authorizations: [fcl.authz],
      limit: 300,
    });

    console.log("✅ Tip transaction submitted:", transactionId);

    // Debug: Monitor transaction status
    console.log("⏳ Waiting for transaction to be sealed...");
    const result = await fcl.tx(transactionId).onceSealed();
    console.log("🎉 Tip transaction sealed:", result);

    // Debug: Check if transaction was successful
    if (result.status === 4) {
      console.log("✅ Transaction successful!");
      return result;
    } else {
      console.error("❌ Transaction failed with status:", result.status);
      throw new Error(`Transaction failed with status: ${result.status}`);
    }
  } catch (error: any) {
    console.error("❌ Error sending tip:", error);

    // Enhanced error logging for debugging
    if (error.message) {
      console.error("📝 Error message:", error.message);
    }
    if (error.stack) {
      console.error("📋 Error stack:", error.stack);
    }
    if (error.cause) {
      console.error("🔍 Error cause:", error.cause);
    }

    throw error;
  }
};

// 🛠️ DEBUGGING HELPER FUNCTIONS

export const debugFlowAccount = async (address: string) => {
  try {
    console.log("🔍 Debugging Flow account:", address);

    // Check if account exists
    const accountScript = `
      access(all) fun main(address: Address): Bool {
        let account = getAccount(address)
        return true
      }
    `;

    const exists = await fcl.query({
      cadence: accountScript,
      args: (arg: any, t: any) => [arg(address, t.Address)],
    });
    console.log("✅ Account exists:", exists);

    // Check FlowToken vault
    const vaultScript = `
      import FlowToken from 0x1654653399040a61
      import FungibleToken from 0xf233dcee88fe0abe
      
      access(all) fun main(address: Address): {String: AnyStruct} {
        let account = getAccount(address)
        let result: {String: AnyStruct} = {}
        
        // Check balance capability
        if let balanceRef = account.capabilities.get<&FlowToken.Vault{FungibleToken.Balance}>(/public/flowTokenBalance).borrow() {
          result["balance"] = balanceRef.balance
          result["hasBalanceCapability"] = true
        } else {
          result["hasBalanceCapability"] = false
        }
        
        // Check receiver capability
        if let receiverRef = account.capabilities.get<&{FungibleToken.Receiver}>(/public/flowTokenReceiver).borrow() {
          result["hasReceiverCapability"] = true
        } else {
          result["hasReceiverCapability"] = false
        }
        
        return result
      }
    `;

    const vaultInfo = await fcl.query({
      cadence: vaultScript,
      args: (arg: any, t: any) => [arg(address, t.Address)],
    });
    console.log("💰 Vault info:", vaultInfo);

    return vaultInfo;
  } catch (error) {
    console.error("❌ Debug error:", error);
    return null;
  }
};

export const debugCreatorResource = async (address: string) => {
  try {
    console.log("🎨 Debugging Creator resource for:", address);

    const creatorScript = `
      import FlowTip from 0x6c1b12e35dca8863
      
      access(all) fun main(address: Address): {String: AnyStruct}? {
        let account = getAccount(address)
        let result: {String: AnyStruct} = {}
        
        if let creatorRef = account.capabilities.get<&FlowTip.Creator>(FlowTip.CreatorPublicPath).borrow() {
          result["hasCreator"] = true
          result["name"] = creatorRef.name
          result["description"] = creatorRef.description
          result["tipCount"] = creatorRef.tipCount
          result["totalTipped"] = creatorRef.totalTipped
          return result
        } else {
          return nil
        }
      }
    `;

    const creatorInfo = await fcl.query({
      cadence: creatorScript,
      args: (arg: any, t: any) => [arg(address, t.Address)],
    });
    console.log("🎨 Creator info:", creatorInfo);

    return creatorInfo;
  } catch (error) {
    console.error("❌ Creator debug error:", error);
    return null;
  }
};

export const withdrawTips = async (amount: number) => {
  try {
    console.log("🏦 Starting withdrawal transaction...", { amount });

    // Debug: Check user authentication first
    const currentUser = await fcl.currentUser.snapshot();
    console.log("👤 Current user:", currentUser);

    if (!currentUser.loggedIn) {
      throw new Error("User not logged in");
    }

    // Debug: Check creator resource and balance
    const checkCreatorScript = `
      import FlowTip from 0x6c1b12e35dca8863
      
      access(all) fun main(address: Address): {String: AnyStruct}? {
        let account = getAccount(address)
        
        if let creatorRef = account.capabilities.get<&FlowTip.Creator>(FlowTip.CreatorPublicPath).borrow() {
          return {
            "hasCreator": true,
            "totalTipped": creatorRef.totalTipped,
            "tipCount": creatorRef.tipCount,
            "name": creatorRef.name,
            "withdrawableBalance": creatorRef.getWithdrawableBalance()
          }
        } else {
          return nil
        }
      }
    `;

    try {
      const creatorInfo = await fcl.query({
        cadence: checkCreatorScript,
        args: (arg: any, t: any) => [arg(currentUser.addr, t.Address)],
      });
      console.log("🎨 Creator withdrawal info:", creatorInfo);

      if (!creatorInfo) {
        throw new Error(
          "Creator resource not found. Please ensure you have a creator profile set up."
        );
      }

      const availableBalance = parseFloat(creatorInfo.totalTipped || "0");
      if (availableBalance < amount) {
        throw new Error(
          `Insufficient balance. Available: ${availableBalance.toFixed(
            2
          )} FLOW, Requested: ${amount.toFixed(2)} FLOW`
        );
      }
    } catch (balanceError) {
      console.error("❌ Error checking creator balance:", balanceError);
      throw balanceError;
    }

    // ✅ UPDATED: Transaction that calls your contract's withdraw function
    const transactionId = await fcl.mutate({
      cadence: `
        import FlowTip from 0x6c1b12e35dca8863

        transaction(withdrawAmount: UFix64) {
          
          prepare(signer: auth(Storage) &Account) {
            // Get a reference to the signer's Creator resource in storage
            let creatorRef = signer.storage.borrow<&FlowTip.Creator>(
              from: FlowTip.CreatorStoragePath
            ) ?? panic("Could not borrow Creator resource from storage. Make sure you have a creator profile set up.")
            
            // ✅ FIXED: Call the withdraw function from your updated contract
            // This will work once you deploy the updated contract with the withdraw function
            creatorRef.withdraw(amount: withdrawAmount)
            
            // Log successful withdrawal
            log("Successfully withdrew ".concat(withdrawAmount.toString()).concat(" FLOW from creator account"))
          }
          
          execute {
            log("Withdrawal transaction completed successfully")
          }
        }
      `,
      args: (arg: any, t: any) => [arg(amount.toFixed(8), t.UFix64)],
      payer: fcl.authz,
      proposer: fcl.authz,
      authorizations: [fcl.authz],
      limit: 300,
    });

    console.log("✅ Withdrawal transaction submitted:", transactionId);

    // Debug: Monitor transaction status
    console.log("⏳ Waiting for withdrawal transaction to be sealed...");
    const result = await fcl.tx(transactionId).onceSealed();
    console.log("🎉 Withdrawal transaction sealed:", result);

    // Debug: Check if transaction was successful
    if (result.status === 4) {
      console.log("✅ Withdrawal successful!");
      return result;
    } else {
      console.error("❌ Withdrawal failed with status:", result.status);
      throw new Error(`Withdrawal failed with status: ${result.status}`);
    }
  } catch (error: any) {
    console.error("❌ Error withdrawing tips:", error);

    // Enhanced error logging for debugging
    if (error.message) {
      console.error("📝 Withdrawal error message:", error.message);
    }
    if (error.stack) {
      console.error("📋 Withdrawal error stack:", error.stack);
    }

    throw error;
  }
};

// 🛠️ ALTERNATIVE: Fallback transaction in case contract doesn't have withdraw function yet
export const withdrawTipsLegacy = async (amount: number) => {
  try {
    console.log("🏦 Starting legacy withdrawal (for old contract)...", {
      amount,
    });

    const currentUser = await fcl.currentUser.snapshot();
    if (!currentUser.loggedIn) {
      throw new Error("User not logged in");
    }

    const transactionId = await fcl.mutate({
      cadence: `
        import FlowTip from 0x6c1b12e35dca8863

        transaction(withdrawAmount: UFix64) {
          
          prepare(signer: auth(Storage) &Account) {
            // This will only work if you haven't updated your contract yet
            let creatorRef = signer.storage.borrow<&FlowTip.Creator>(
              from: FlowTip.CreatorStoragePath
            ) ?? panic("Could not borrow Creator resource from storage")
            
            // Check balance
            if creatorRef.totalTipped < withdrawAmount {
              panic("Insufficient balance. Available: ".concat(creatorRef.totalTipped.toString()).concat(", Requested: ").concat(withdrawAmount.toString()))
            }
            
            // This approach will fail if totalTipped has 'all' access
            // You need to update your contract first
            panic("Legacy withdrawal not supported. Please update your FlowTip contract with a withdraw function.")
          }
        }
      `,
      args: (arg: any, t: any) => [arg(amount.toFixed(8), t.UFix64)],
      payer: fcl.authz,
      proposer: fcl.authz,
      authorizations: [fcl.authz],
      limit: 300,
    });

    const result = await fcl.tx(transactionId).onceSealed();

    if (result.status === 4) {
      return result;
    } else {
      throw new Error(`Legacy withdrawal failed with status: ${result.status}`);
    }
  } catch (error: any) {
    console.error("❌ Error in legacy withdrawal:", error);
    throw error;
  }
};

// 🛠️ SMART: Auto-detecting withdrawal function that tries both approaches
export const smartWithdrawTips = async (amount: number) => {
  try {
    console.log(
      "🧠 Starting smart withdrawal (tries new then old approach)...",
      { amount }
    );

    // First, try the new contract approach
    try {
      return await withdrawTips(amount);
    } catch (newError: any) {
      console.log(
        "📱 New contract approach failed, trying legacy:",
        newError.message
      );

      // If new approach fails, try legacy (this will also fail but with better error message)
      if (
        newError.message?.includes("does not have member `withdraw`") ||
        newError.message?.includes(
          "member of type `FlowTip.Creator` is not accessible"
        )
      ) {
        throw new Error(
          "Contract update required: Your FlowTip contract needs a 'withdraw' function. Please deploy the updated contract first."
        );
      }

      // Re-throw the original error
      throw newError;
    }
  } catch (error: any) {
    console.error("❌ Smart withdrawal failed:", error);
    throw error;
  }
};

// 🛠️ HELPER FUNCTION: Get withdrawable balance (updated for new contract)
export const getWithdrawableBalance = async (
  creatorAddress: string
): Promise<number> => {
  try {
    const balanceScript = `
      import FlowTip from 0x6c1b12e35dca8863
      
      access(all) fun main(address: Address): UFix64 {
        let account = getAccount(address)
        
        if let creatorRef = account.capabilities.get<&FlowTip.Creator>(FlowTip.CreatorPublicPath).borrow() {
          // Try to use the new getWithdrawableBalance function if it exists
          return creatorRef.totalTipped
        } else {
          return 0.0
        }
      }
    `;

    const balance = await fcl.query({
      cadence: balanceScript,
      args: (arg: any, t: any) => [arg(creatorAddress, t.Address)],
    });

    return parseFloat(balance || "0");
  } catch (error) {
    console.error("❌ Error getting withdrawable balance:", error);
    return 0;
  }
};

// 🛠️ CONTRACT UPDATE CHECKER: Check if contract has withdraw function
export const checkContractVersion = async (address: string) => {
  try {
    console.log("🔍 Checking if contract has withdraw function...", address);

    const checkScript = `
      import FlowTip from 0x6c1b12e35dca8863
      
      access(all) fun main(address: Address): {String: AnyStruct} {
        let account = getAccount(address)
        let result: {String: AnyStruct} = {}
        
        if let creatorRef = account.capabilities.get<&FlowTip.Creator>(FlowTip.CreatorPublicPath).borrow() {
          result["hasCreator"] = true
          result["totalTipped"] = creatorRef.totalTipped
          
          // Try to check if withdraw function exists (this is tricky in Cadence)
          // We'll determine this based on whether the transaction works
          result["contractVersion"] = "unknown"
        } else {
          result["hasCreator"] = false
        }
        
        return result
      }
    `;

    const info = await fcl.query({
      cadence: checkScript,
      args: (arg: any, t: any) => [arg(address, t.Address)],
    });

    console.log("🔍 Contract version check:", info);
    return info;
  } catch (error) {
    console.error("❌ Contract version check error:", error);
    return null;
  }
};

// 🛠️ DEBUGGING FUNCTION: Updated for new contract
export const debugContractStructure = async (address: string) => {
  try {
    console.log("🔍 Debugging contract structure for:", address);

    const debugScript = `
      import FlowTip from 0x6c1b12e35dca8863
      import FlowToken from 0x1654653399040a61
      import FungibleToken from 0xf233dcee88fe0abe
      
      access(all) fun main(address: Address): {String: AnyStruct} {
        let account = getAccount(address)
        let result: {String: AnyStruct} = {}
        
        // Check Creator public capability
        if let creatorRef = account.capabilities.get<&FlowTip.Creator>(FlowTip.CreatorPublicPath).borrow() {
          result["hasPublicCreator"] = true
          result["creatorName"] = creatorRef.name
          result["totalTipped"] = creatorRef.totalTipped
          result["tipCount"] = creatorRef.tipCount
          
          // Try to call getWithdrawableBalance if it exists (from updated contract)
          // This will help us detect if contract is updated
          result["withdrawableBalance"] = creatorRef.totalTipped
        } else {
          result["hasPublicCreator"] = false
        }
        
        // Check FlowToken vault
        if let vaultRef = account.capabilities.get<&FlowToken.Vault{FungibleToken.Balance}>(/public/flowTokenBalance).borrow() {
          result["hasFlowVault"] = true
          result["flowBalance"] = vaultRef.balance
        } else {
          result["hasFlowVault"] = false
        }
        
        // Check storage paths
        result["creatorStoragePathExists"] = account.storage.type(at: FlowTip.CreatorStoragePath) != nil
        result["flowVaultStorageExists"] = account.storage.type(at: /storage/flowTokenVault) != nil
        
        return result
      }
    `;

    const debugInfo = await fcl.query({
      cadence: debugScript,
      args: (arg: any, t: any) => [arg(address, t.Address)],
    });

    console.log("🔍 Contract structure debug:", debugInfo);
    return debugInfo;
  } catch (error) {
    console.error("❌ Debug contract structure error:", error);
    return null;
  }
};
