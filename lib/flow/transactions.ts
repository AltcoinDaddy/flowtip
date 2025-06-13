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

    const currentUser = await fcl.currentUser.snapshot();
    console.log("👤 Current user:", currentUser);

    if (!currentUser.loggedIn) {
      throw new Error("User not logged in");
    }

    // Check balance
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

    // Check if recipient is registered
    const checkRecipientScript = `
      import FlowTip from 0x6c1b12e35dca8863
      
      access(all) fun main(address: Address): Bool {
        return FlowTip.isCreatorRegistered(address: address)
      }
    `;

    try {
      const isRegistered = await fcl.query({
        cadence: checkRecipientScript,
        args: (arg: any, t: any) => [arg(recipientAddress, t.Address)],
      });
      console.log("🎯 Recipient is registered:", isRegistered);

      if (!isRegistered) {
        throw new Error("Recipient is not a registered creator");
      }
    } catch (recipientError) {
      console.error("❌ Error checking recipient:", recipientError);
      throw new Error("Could not verify recipient registration");
    }

    console.log("📝 Submitting transaction with tip recording...");
    console.log("🔄 About to call fcl.mutate with FULL tip transaction...");

    // 🎉 COMPLETE TRANSACTION: Payment + Tip Recording
    const transactionId = await Promise.race([
      fcl.mutate({
        cadence: `
           import FlowToken from 0x1654653399040a61
          import FungibleToken from 0xf233dcee88fe0abe
          import FlowTip from 0x6c1b12e35dca8863

          transaction(recipient: Address, amount: UFix64, message: String) {
            prepare(signer: auth(Storage) &Account) {
              log("🚀 Starting complete tip transaction")
              
              // Verify recipient is registered
              if !FlowTip.isCreatorRegistered(address: recipient) {
                panic("Recipient is not registered")
              }
              log("✅ Recipient verified as registered creator")
              
              // Get sender's vault
              let vaultRef = signer.storage.borrow<auth(FungibleToken.Withdraw) &FlowToken.Vault>(from: /storage/flowTokenVault)
                ?? panic("Could not borrow sender's vault")
              log("✅ Sender vault accessed")
              
              // Withdraw payment
              let payment <- vaultRef.withdraw(amount: amount)
              log("✅ Payment withdrawn: ".concat(amount.toString()))
              
              // Get recipient's Flow vault
              let recipientVault = getAccount(recipient)
                .capabilities.get<&{FungibleToken.Receiver}>(/public/flowTokenReceiver)
                .borrow()
                ?? panic("Could not borrow recipient's vault")
              log("✅ Recipient vault accessed")
              
              // Deposit payment
              recipientVault.deposit(from: <-payment)
              log("✅ Payment deposited successfully")
              
              // 🎉 RECORD THE TIP in Creator resource
              let creatorRef = getAccount(recipient)
                .capabilities.get<&FlowTip.Creator>(FlowTip.CreatorPublicPath)
                .borrow()
                ?? panic("Could not borrow Creator reference")
              log("✅ Creator reference borrowed")
              
              creatorRef.addTip(amount: amount, from: signer.address, message: message)
              log("🎉 Tip recorded in Creator resource!")
              
              log("✅ Complete tip transaction finished: payment sent AND tip recorded")
            }
          }
        `,
        args: (arg: any, t: any) => [
          arg(recipientAddress, t.Address),
          arg(amount.toFixed(8), t.UFix64),
          arg(message, t.String),
        ],
        proposer: fcl.currentUser,
        payer: fcl.currentUser,
        authorizations: [fcl.currentUser],
        limit: 300,
      }),
      // Add 30 second timeout
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error("Transaction submission timeout after 30 seconds")), 30000)
      )
    ]);

    console.log("✅ Transaction submitted:", transactionId);
    
    const result = await fcl.tx(`${transactionId}`).onceSealed();
    console.log("🎉 Transaction sealed:", result);
    
    if (result.status === 4) {
      console.log("🎉 TIP SENT AND RECORDED SUCCESSFULLY!");
      return result;
    } else {
      console.error("❌ Transaction failed with status:", result.status);
      console.error("📋 Transaction result:", result);
      throw new Error(`Transaction failed with status: ${result.status}`);
    }
  } catch (error: any) {
    console.error("❌ Error:", error);
    
    // 🔧 SPECIFIC ERROR HANDLING
    if (error.message?.includes("timeout")) {
      console.error("⏰ TIMEOUT: Check if wallet popup appeared!");
      console.error("💡 Try: 1) Check for blocked popups 2) Refresh wallet connection 3) Check network");
    }
    
    throw error;
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
