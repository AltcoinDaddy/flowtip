import * as fcl from "@onflow/fcl";
import * as t from "@onflow/types";

// Register as a creator - ENHANCED DEBUG VERSION
export const registerCreator = async (name: string, description: string, imageURL: string) => {
  try {
    console.log("🚀 Starting creator registration...", { name, description, imageURL });
    
    // Check FCL configuration
    console.log("📋 FCL Config:", {
      accessNode: await fcl.config.get("accessNode.api"),
      contractAddress: await fcl.config.get("0xFlowTip"),
      discovery: await fcl.config.get("discovery.wallet")
    });
    
    // Check current user
    const currentUser = await fcl.currentUser.snapshot();
    console.log("👤 Current User:", currentUser);
    
    if (!currentUser.loggedIn) {
      throw new Error("User is not logged in. Please connect your wallet first.");
    }
    
    if (!currentUser.addr) {
      throw new Error("User address not found. Please reconnect your wallet.");
    }
    
    console.log("✅ User is connected:", currentUser.addr);
    
    console.log("📝 Preparing transaction...");
    
    const transactionId = await fcl.mutate({
      cadence: `
        import FlowTip from 0x6c1b12e35dca8863

        transaction(name: String, description: String, imageURL: String) {
          prepare(acct: auth(Storage, Capabilities) &Account) {
            log("Starting transaction for account: ".concat(acct.address.toString()))
            
            // Check if the user is already registered as a creator
            if acct.storage.borrow<&FlowTip.Creator>(from: FlowTip.CreatorStoragePath) != nil {
              log("User already registered, updating profile...")
              // Already registered, update profile instead
              let creator = acct.storage.borrow<&FlowTip.Creator>(from: FlowTip.CreatorStoragePath)
                ?? panic("Could not borrow creator")
              creator.updateProfile(name: name, description: description, imageURL: imageURL)
              log("Profile updated successfully")
            } else {
              log("Registering new creator...")
              // Register as a new creator and get the ID
              let creatorID = FlowTip.registerCreator(name: name, description: description, imageURL: imageURL)
              log("Creator ID assigned: ".concat(creatorID.toString()))
              
              // Create the Creator resource
              let creator <- FlowTip.createCreator(id: creatorID, name: name, description: description, imageURL: imageURL)
              log("Creator resource created")
              
              // Save the Creator resource to storage
              acct.storage.save(<-creator, to: FlowTip.CreatorStoragePath)
              log("Creator saved to storage")
              
              // Create and publish the capability
              let creatorCap = acct.capabilities.storage.issue<&FlowTip.Creator>(FlowTip.CreatorStoragePath)
              acct.capabilities.publish(creatorCap, at: FlowTip.CreatorPublicPath)
              log("Capability published")
            }
            
            log("Transaction completed successfully")
          }
        }
      `,
      args: (arg: any, t: any) => [
        arg(name, t.String),
        arg(description, t.String),
        arg(imageURL, t.String),
      ],
      payer: fcl.authz,
      proposer: fcl.authz,
      authorizations: [fcl.authz],
      limit: 300, // Increased gas limit
    });

    console.log("✅ Transaction submitted:", transactionId);
    
    // Subscribe to transaction status
    const unsub = fcl.tx(transactionId).subscribe((res: any) => {
      console.log("📊 Transaction status:", res);
    });
    
    const result = await fcl.tx(transactionId).onceSealed();
    console.log("🎉 Transaction sealed:", result);
    
    // Clean up subscription
    unsub();
    
    return result;
  } catch (error) {
    console.error("❌ Error registering creator:", error);
    
    // More detailed error logging
    if (error instanceof Error) {
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
    }
    
    // Log FCL error details if available
    if (error && typeof error === 'object' && 'message' in error) {
      console.error("FCL Error details:", error);
    }
    
    throw error;
  }
};

// Send a tip to a creator - BASIC VERSION
export const sendTip = async (recipientAddress: string, amount: number, message: string) => {
  try {
    console.log("🚀 Starting tip transaction...", { recipientAddress, amount, message });
    
    const transactionId = await fcl.mutate({
      cadence: `
        import FlowToken from 0x1654653399040a61
        import FungibleToken from 0xf233dcee88fe0abe
        import FlowTip from 0x6c1b12e35dca8863

        transaction(recipient: Address, amount: UFix64, message: String) {

          prepare(signer: auth(Storage) &Account) {
            // Get a reference to the signer's FlowToken vault
            let vaultRef = signer.storage.borrow<&FlowToken.Vault>(from: /storage/flowTokenVault)
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
    
    const result = await fcl.tx(transactionId).onceSealed();
    console.log("🎉 Tip transaction sealed:", result);
    
    return result;
  } catch (error) {
    console.error("❌ Error sending tip:", error);
    throw error;
  }
};