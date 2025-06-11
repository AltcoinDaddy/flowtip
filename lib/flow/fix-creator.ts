import * as fcl from "@onflow/fcl";
import * as t from "@onflow/types";

export type Creator = {
  id: number;
  address: string;
  name: string;
  description: string;
  imageURL: string;
  tipCount: number;
  totalTipped: number;
};

export type Tip = {
  id: number;
  amount: number;
  from: string;
  message: string;
  timestamp: number;
};

export type TransactionResult = {
  status: number;
  statusString: string;
  blockId: string;
  transactionId: string;
  events: any[];
  errorMessage?: string;
};

export const CADENCE_SCRIPTS = {
  // 🔧 FIXED: Updated to new Cadence syntax
  FIX_EXISTING_CREATOR: `
    import FlowTip from 0x6c1b12e35dca8863

    transaction() {
      prepare(account: auth(Storage) &Account) {
        log("🔧 Checking if current user needs registry fix...")
        
        // Check if user has a Creator resource but isn't registered
        let hasResource = account.storage.borrow<&FlowTip.Creator>(from: FlowTip.CreatorStoragePath) != nil
        let isRegistered = FlowTip.isCreatorRegistered(address: account.address)
        
        log("Has Creator resource: ".concat(hasResource.toString()))
        log("Is registered in contract: ".concat(isRegistered.toString()))
        
        if hasResource && !isRegistered {
          log("🚨 FOUND ISSUE: User has resource but not registered!")
          log("🔧 Fixing registration...")
          
          // Register the user in the contract
          let creatorID = FlowTip.registerCreator(address: account.address)
          log("✅ Added to registry with ID: ".concat(creatorID.toString()))
          
          // Update the resource ID to match
          if let creatorRef = account.storage.borrow<&FlowTip.Creator>(from: FlowTip.CreatorStoragePath) {
            // Note: Can't change the ID as it's immutable, but that's okay
            log("📋 Existing resource ID: ".concat(creatorRef.id.toString()))
            log("📋 New registry ID: ".concat(creatorID.toString()))
            log("ℹ️ ID mismatch is okay - the important thing is being in the registry")
          }
          
          log("🎉 Registry fix completed!")
        } else if hasResource && isRegistered {
          log("✅ User is properly set up - no fix needed")
        } else if !hasResource && isRegistered {
          log("⚠️ User is registered but has no resource - needs full registration")
        } else {
          log("ℹ️ User is not a creator yet")
        }
      }
      
      execute {
        log("Fix transaction executed successfully")
      }
    }
  `,
};

// 🔧 FIXED: Better error handling and updated syntax
export const fixExistingCreator = async (): Promise<TransactionResult> => {
  try {
    console.log("🔧 Running fix for existing creator...");

    const currentUser = await fcl.currentUser.snapshot();
    console.log("👤 Current user snapshot:", currentUser);

    if (!currentUser.loggedIn || !currentUser.addr) {
      throw new Error("User not logged in");
    }

    console.log("📝 Submitting fix transaction...");

    const transactionId = await fcl.mutate({
      cadence: CADENCE_SCRIPTS.FIX_EXISTING_CREATOR,
      proposer: fcl.currentUser,
      payer: fcl.currentUser,
      authorizations: [fcl.currentUser],
      limit: 50000,
    });

    console.log("✅ Fix transaction submitted:", transactionId);
    console.log("⏳ Waiting for transaction to be sealed...");

    const result = await fcl.tx(transactionId).onceSealed();
    console.log("🎉 Fix transaction sealed:", result);

    if (result.status === 4) {
      console.error("❌ Fix transaction failed:", result);
      throw new Error(
        `Fix transaction failed: ${result.errorMessage || "Unknown error"}`
      );
    }

    if (result.status === 0) {
      console.log("✅ Transaction completed successfully");
    } else {
      console.warn("⚠️ Transaction completed with status:", result.status);
    }

    return {
      status: result.status,
      statusString: result.statusString,
      blockId: result.blockId,
      transactionId: transactionId,
      events: result.events || [],
      errorMessage: result.errorMessage,
    } as TransactionResult;
  } catch (error) {
    console.error("❌ Error fixing existing creator:", error);

    // Enhanced error logging
    if (error instanceof Error) {
      console.error("Error name:", error.name);
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
    }

    throw new Error(
      error instanceof Error
        ? error.message
        : "Unknown error occurred during fix"
    );
  }
};
