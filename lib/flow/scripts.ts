import * as fcl from "@onflow/fcl";
import * as t from "@onflow/types";

export type Creator = {
  id: number; // Changed to string for consistency
  address: string;
  name: string;
  description: string;
  imageURL: string;
  tipCount: number;
  totalTipped: number; // Keep as string to avoid precision loss
};

export type Tip = {
  id: number;
  amount: number;
  from: string;
  message: string;
  timestamp: number;
};

export const CADENCE_SCRIPTS = {
  GET_CREATORS: `
    import FlowTip from 0x6c1b12e35dca8863

    access(all) struct CreatorInfo {
        access(all) let id: UInt64
        access(all) let address: Address
        access(all) let name: String
        access(all) let description: String
        access(all) let imageURL: String
        access(all) let tipCount: UInt64
        access(all) let totalTipped: UFix64

        init(id: UInt64, address: Address, name: String, description: String, imageURL: String, tipCount: UInt64, totalTipped: UFix64) {
            self.id = id
            self.address = address
            self.name = name
            self.description = description
            self.imageURL = imageURL
            self.tipCount = tipCount
            self.totalTipped = totalTipped
        }
    }

    access(all) fun main(): [CreatorInfo] {
        log("🔍 Starting getCreators script...")
        
        let creators: [CreatorInfo] = []
        let registeredCreators = FlowTip.getRegisteredCreators()
        
        log("📊 Total registered addresses: ".concat(registeredCreators.keys.length.toString()))
        
        if registeredCreators.keys.length == 0 {
            log("⚠️ No creators registered in contract")
            return creators
        }
        
        for address in registeredCreators.keys {
            log("🔍 Processing address: ".concat(address.toString()))
            
            let account = getAccount(address)
            let creatorCap = account.capabilities.get<&FlowTip.Creator>(FlowTip.CreatorPublicPath)
            
            if !creatorCap.check() {
                log("❌ Invalid capability for address: ".concat(address.toString()))
                continue
            }
            
            if let creatorRef = creatorCap.borrow() {
                log("✅ Successfully borrowed creator: ".concat(creatorRef.name))
                
                let creator = CreatorInfo(
                    id: creatorRef.id,
                    address: address,
                    name: creatorRef.name,
                    description: creatorRef.description,
                    imageURL: creatorRef.imageURL,
                    tipCount: creatorRef.tipCount,
                    totalTipped: creatorRef.totalTipped
                )
                creators.append(creator)
            } else {
                log("❌ Could not borrow creator reference for address: ".concat(address.toString()))
            }
        }
        
        log("✅ Found ".concat(creators.length.toString()).concat(" accessible creators out of ").concat(registeredCreators.keys.length.toString()).concat(" registered"))
        
        return creators
    }
  `,
};

// ✅ Get all creators - Working version
export const getCreators = async (): Promise<Creator[]> => {
  try {
    console.log("🔍 Fetching creators...");

    const result = await fcl.query({
      cadence: CADENCE_SCRIPTS.GET_CREATORS,
    });

    console.log("✅ Raw query result:", result);
    console.log("📊 Number of creators found:", result?.length || 0);

    const creators: Creator[] = (result || []).map((creator: any) => ({
      id: creator.id.toString(),
      name: creator.name,
      description: creator.description,
      imageURL: creator.imageURL,
      address: creator.address,
      totalTipped: creator.totalTipped.toString(),
      tipCount: parseInt(creator.tipCount.toString()),
    }));

    console.log("🎯 Processed creators:", creators);
    return creators;
  } catch (error) {
    console.error("❌ Error fetching creators:", error);
    return [];
  }
};

// ✅ Get creator by address - Fixed version
export const getCreatorByAddress = async (
  address: string
): Promise<Creator | null> => {
  try {
    console.log("🔍 Fetching creator for address:", address);

    const result = await fcl.query({
      cadence: `
        import FlowTip from 0x6c1b12e35dca8863

        access(all) struct CreatorInfo {
          access(all) let id: UInt64
          access(all) let address: Address
          access(all) let name: String
          access(all) let description: String
          access(all) let imageURL: String
          access(all) let tipCount: UInt64
          access(all) let totalTipped: UFix64

          init(id: UInt64, address: Address, name: String, description: String, imageURL: String, tipCount: UInt64, totalTipped: UFix64) {
            self.id = id
            self.address = address
            self.name = name
            self.description = description
            self.imageURL = imageURL
            self.tipCount = tipCount
            self.totalTipped = totalTipped
          }
        }

        access(all) fun main(address: Address): CreatorInfo? {
          log("🔍 Fetching creator info for: ".concat(address.toString()))
          
          let creatorRef = getAccount(address)
            .capabilities.get<&FlowTip.Creator>(FlowTip.CreatorPublicPath)
            .borrow()
          
          if creatorRef != nil {
            log("✅ Creator found: ".concat(creatorRef!.name))
            return CreatorInfo(
              id: creatorRef!.id,
              address: address,
              name: creatorRef!.name,
              description: creatorRef!.description,
              imageURL: creatorRef!.imageURL,
              tipCount: creatorRef!.tipCount,
              totalTipped: creatorRef!.totalTipped
            )
          }
          
          log("❌ Creator not found or not accessible")
          return nil
        }
      `,
      args: (arg: any, t: any) => [arg(address, t.Address)],
    });

    if (!result) {
      console.log("❌ Creator not found");
      return null;
    }

    const creator: Creator = {
      id: result.id.toString(),
      name: result.name,
      description: result.description,
      imageURL: result.imageURL,
      address: result.address,
      totalTipped: result.totalTipped.toString(),
      tipCount: parseInt(result.tipCount.toString()),
    };

    console.log("✅ Creator found:", creator);
    return creator;
  } catch (error) {
    console.error("❌ Error fetching creator:", error);
    return null;
  }
};

// 🔧 FIXED: Get tips received by a creator - Returns actual Tip[] array
export const getCreatorTips = async (address: string): Promise<Tip[]> => {
  try {
    console.log("🔍 Fetching tips for:", address);

    const result = await fcl.query({
      cadence: `
        import FlowTip from 0x6c1b12e35dca8863
        
        access(all) struct TipInfo {
          access(all) let id: UInt64
          access(all) let amount: UFix64
          access(all) let from: Address
          access(all) let message: String
          access(all) let timestamp: UFix64
          
          init(id: UInt64, amount: UFix64, from: Address, message: String, timestamp: UFix64) {
            self.id = id
            self.amount = amount
            self.from = from
            self.message = message
            self.timestamp = timestamp
          }
        }
        
        access(all) fun main(address: Address): [TipInfo] {
          log("🔍 Fetching tips for: ".concat(address.toString()))
          
          // Check if creator is registered
          if !FlowTip.isCreatorRegistered(address: address) {
            log("❌ Creator not registered")
            return []
          }
          
          log("✅ Creator is registered")
          
          // Try to borrow Creator reference
          let creatorRef = getAccount(address)
            .capabilities.get<&FlowTip.Creator>(FlowTip.CreatorPublicPath)
            .borrow()
          
          if creatorRef == nil {
            log("❌ Could not borrow Creator reference")
            return []
          }
          
          log("✅ Successfully borrowed Creator reference")
          log("📊 Creator name: ".concat(creatorRef!.name))
          log("📊 Tip count: ".concat(creatorRef!.tipCount.toString()))
          log("📊 Total tipped: ".concat(creatorRef!.totalTipped.toString()))
          
          // Get tip history
          let tipHistory = creatorRef!.getTipHistory()
          log("📚 Retrieved tip history, length: ".concat(tipHistory.length.toString()))
          
          let tips: [TipInfo] = []
          
          for tip in tipHistory {
            tips.append(TipInfo(
              id: tip.id,
              amount: tip.amount,
              from: tip.from,
              message: tip.message,
              timestamp: tip.timestamp
            ))
            log("➕ Added tip - ID: ".concat(tip.id.toString()).concat(", Amount: ").concat(tip.amount.toString()))
          }
          
          log("🎉 Returning ".concat(tips.length.toString()).concat(" tips"))
          return tips
        }
      `,
      args: (arg: any, t: any) => [arg(address, t.Address)],
    });

    console.log("📊 Raw tips result:", result);
    console.log("📈 Tips count:", result.length);

    // Convert to Tip[] format
    const tips: Tip[] = result.map((tip: any) => ({
      id: parseInt(tip.id.toString()),
      amount: parseFloat(tip.amount.toString()),
      from: tip.from.toString(),
      message: tip.message,
      timestamp: parseInt(tip.timestamp.toString()),
    }));

    console.log("🎯 Processed tips:", tips);
    return tips;
  } catch (error) {
    console.error("❌ Error fetching tips:", error);
    return [];
  }
};

// 🔍 Debug function to check tip recording state
export const debugTipState = async (address: string) => {
  try {
    console.log("🔍 === DEBUGGING TIP STATE ===");

    const result = await fcl.query({
      cadence: `
        import FlowTip from 0x6c1b12e35dca8863
        
        access(all) fun main(address: Address): {String: AnyStruct} {
          let data: {String: AnyStruct} = {}
          
          // Check if creator is registered
          data["isRegistered"] = FlowTip.isCreatorRegistered(address: address)
          
          if !FlowTip.isCreatorRegistered(address: address) {
            data["error"] = "Creator not registered"
            return data
          }
          
          // Get creator info through contract function
          if let creatorInfo = FlowTip.getCreatorInfo(address: address) {
            data["contractTipCount"] = creatorInfo.tipCount
            data["contractTotalTipped"] = creatorInfo.totalTipped
            data["creatorName"] = creatorInfo.name
          }
          
          // Try to access Creator resource directly
          let creatorRef = getAccount(address)
            .capabilities.get<&FlowTip.Creator>(FlowTip.CreatorPublicPath)
            .borrow()
          
          if creatorRef != nil {
            data["canBorrowCreator"] = true
            data["resourceTipCount"] = creatorRef!.tipCount
            data["resourceTotalTipped"] = creatorRef!.totalTipped
            
            let tipHistory = creatorRef!.getTipHistory()
            data["tipHistoryLength"] = tipHistory.length
            
            if tipHistory.length > 0 {
              let tips: [{String: AnyStruct}] = []
              for tip in tipHistory {
                tips.append({
                  "id": tip.id,
                  "amount": tip.amount,
                  "from": tip.from.toString(),
                  "message": tip.message,
                  "timestamp": tip.timestamp
                })
              }
              data["tips"] = tips
            }
          } else {
            data["canBorrowCreator"] = false
            data["error"] = "Cannot borrow Creator resource"
          }
          
          return data
        }
      `,
      args: (arg: any, t: any) => [arg(address, t.Address)],
    });

    console.log("🎯 Debug Result:", result);
    return result;
  } catch (error) {
    console.error("❌ Debug failed:", error);
    return null;
  }
};

// Debug script to check creator storage issues
export const debugCreatorStorage = async () => {
  try {
    console.log("🔍 Debugging creator storage...\n");

    const registeredCreators = await fcl.query({
      cadence: `
        import FlowTip from 0x6c1b12e35dca8863
        
        access(all) fun main(): {Address: UInt64} {
          return FlowTip.getRegisteredCreators()
        }
      `,
    });

    console.log(
      "📋 Registered creators in contract:",
      Object.keys(registeredCreators).length
    );
    console.log("Registry:", registeredCreators);

    for (const [address, id] of Object.entries(registeredCreators)) {
      console.log(`\n👤 Checking creator ${address} (ID: ${id})`);

      try {
        const hasResource = await fcl.query({
          cadence: `
            import FlowTip from 0x6c1b12e35dca8863
            
            access(all) fun main(address: Address): Bool {
              let account = getAccount(address)
              let creatorCap = account.capabilities.get<&FlowTip.Creator>(FlowTip.CreatorPublicPath)
              return creatorCap.check()
            }
          `,
          args: (arg: any, t: any) => [arg(address, t.Address)],
        });

        console.log(`  📦 Has Creator resource: ${hasResource}`);

        if (hasResource) {
          const creatorInfo = await fcl.query({
            cadence: `
              import FlowTip from 0x6c1b12e35dca8863
              
              access(all) fun main(address: Address): FlowTip.CreatorInfo? {
                return FlowTip.getCreatorInfo(address: address)
              }
            `,
            args: (arg: any, t: any) => [arg(address, t.Address)],
          });

          if (creatorInfo) {
            console.log(
              `  ✅ Creator data: ${creatorInfo.name} (Tips: ${creatorInfo.tipCount})`
            );
          } else {
            console.log(
              `  ❌ Creator resource exists but getCreatorInfo() failed`
            );
          }
        } else {
          console.log(`  ❌ Missing Creator resource in account storage`);
        }
      } catch (error: any) {
        console.log(`  ❌ Error checking creator: ${error?.message}`);
      }
    }
  } catch (error) {
    console.error("❌ Debug failed:", error);
  }
};

export const testCurrentCreatorState = async (address: string) => {
  console.log("🔍 === TESTING CURRENT CREATOR STATE ===");
  console.log("📍 Address:", address);

  try {
    const result = await fcl.query({
      cadence: `
        import FlowTip from 0x6c1b12e35dca8863
        
        access(all) fun main(address: Address): {String: AnyStruct} {
          let data: {String: AnyStruct} = {}
          
          // 1. Check if registered in contract
          data["isRegistered"] = FlowTip.isCreatorRegistered(address: address)
          
          // 2. Check if has Creator resource
          let account = getAccount(address)
          let creatorCap = account.capabilities.get<&FlowTip.Creator>(FlowTip.CreatorPublicPath)
          data["hasCreatorResource"] = creatorCap.check()
          
          if creatorCap.check() {
            if let creatorRef = creatorCap.borrow() {
              data["canBorrowCreator"] = true
              data["creatorName"] = creatorRef.name
              data["currentTipCount"] = creatorRef.tipCount
              data["currentTotalTipped"] = creatorRef.totalTipped
              
              // 3. Test if addTip method exists (by checking if we can access the resource)
              data["resourceAccessible"] = true
              
              // 4. Get contract info
              if let contractInfo = FlowTip.getCreatorInfo(address: address) {
                data["contractTipCount"] = contractInfo.tipCount
                data["contractTotalTipped"] = contractInfo.totalTipped
                data["contractName"] = contractInfo.name
                
                // Check if resource and contract data match
                data["dataMatches"] = (creatorRef.tipCount == contractInfo.tipCount) && 
                                    (creatorRef.totalTipped == contractInfo.totalTipped)
              } else {
                data["contractInfoFound"] = false
              }
              
            } else {
              data["canBorrowCreator"] = false
              data["error"] = "Creator resource exists but cannot borrow"
            }
          } else {
            data["error"] = "No Creator resource found"
          }
          
          return data
        }
      `,
      args: (arg: any, t: any) => [arg(address, t.Address)],
    });

    console.log("📊 Current State Results:", result);

    // Analyze the results
    if (!result.isRegistered) {
      console.log("❌ ISSUE: Creator not registered in contract");
      return { needsFix: true, reason: "Not registered", state: result };
    }

    if (!result.hasCreatorResource) {
      console.log("❌ ISSUE: No Creator resource found");
      return { needsFix: true, reason: "No resource", state: result };
    }

    if (!result.canBorrowCreator) {
      console.log(
        "❌ ISSUE: Creator resource exists but cannot borrow (interface broken)"
      );
      return { needsFix: true, reason: "Interface broken", state: result };
    }

    if (!result.dataMatches) {
      console.log("❌ ISSUE: Resource and contract data don't match");
      return { needsFix: true, reason: "Data mismatch", state: result };
    }

    if (result.resourceAccessible && result.dataMatches) {
      console.log("✅ Creator state looks good - tip recording should work!");
      return { needsFix: false, readyForTips: true, state: result };
    }

    return { needsFix: false, state: result };
  } catch (error: any) {
    console.error("❌ Error testing creator state:", error);
    return { needsFix: true, reason: "Test failed", error: error.message };
  }
};

// 🧪 Test sending a minimal tip (0.01 FLOW) to verify recording
export const testMinimalTipRecording = async (recipientAddress: string) => {
  try {
    console.log("🧪 === TESTING MINIMAL TIP RECORDING ===");

    const currentUser = await fcl.currentUser.snapshot();
    if (!currentUser.loggedIn) {
      throw new Error("User not logged in");
    }

    // Get current state BEFORE tip
    const beforeState = await fcl.query({
      cadence: `
        import FlowTip from 0x6c1b12e35dca8863
        access(all) fun main(address: Address): {String: AnyStruct} {
          if let info = FlowTip.getCreatorInfo(address: address) {
            return {
              "tipCount": info.tipCount,
              "totalTipped": info.totalTipped
            }
          }
          return {"error": "Creator not found"}
        }
      `,
      args: (arg: any, t: any) => [arg(recipientAddress, t.Address)],
    });

    console.log("📊 BEFORE tip:", beforeState);

    // Send minimal tip with detailed logging
    const transactionId = await fcl.mutate({
      cadence: `
       import FlowToken from 0x1654653399040a61       
import FungibleToken from 0xf233dcee88fe0abe 
        import FlowTip from 0x6c1b12e35dca8863

        transaction(recipient: Address, amount: UFix64, message: String) {
          prepare(signer: auth(Storage) &Account) {
            log("🧪 MINIMAL TIP RECORDING TEST")
            log("📍 Recipient: ".concat(recipient.toString()))
            log("💰 Amount: ".concat(amount.toString()))
            
            // Verify recipient is registered
            if !FlowTip.isCreatorRegistered(address: recipient) {
              panic("Recipient is not registered")
            }
            log("✅ Recipient is registered")
            
            // Get sender's vault
            let vaultRef = signer.storage.borrow<auth(FungibleToken.Withdraw) &FlowToken.Vault>(from: /storage/flowTokenVault)
              ?? panic("Could not borrow sender's vault")
            log("✅ Sender vault accessed")
            
            // Withdraw payment
            let payment <- vaultRef.withdraw(amount: amount)
            log("✅ Payment withdrawn")
            
            // Get recipient's Flow vault
            let recipientVault = getAccount(recipient)
              .capabilities.get<&{FungibleToken.Receiver}>(/public/flowTokenReceiver)
              .borrow()
              ?? panic("Could not borrow recipient's vault")
            log("✅ Recipient vault accessed")
            
            // Deposit payment
            recipientVault.deposit(from: <-payment)
            log("✅ PAYMENT COMPLETED")
            
            // 🎯 THE CRITICAL TEST: Try to record the tip
            log("🎯 ATTEMPTING TIP RECORDING...")
            
            let creatorRef = getAccount(recipient)
              .capabilities.get<&FlowTip.Creator>(FlowTip.CreatorPublicPath)
              .borrow()
              ?? panic("Could not borrow Creator reference")
            
            log("✅ Creator reference borrowed successfully")
            log("📊 Current tip count: ".concat(creatorRef.tipCount.toString()))
            
            // This is the line that might fail:
            creatorRef.addTip(amount: amount, from: signer.address, message: message)
            log("🎉 addTip() CALLED SUCCESSFULLY!")
            
            log("📊 New tip count: ".concat(creatorRef.tipCount.toString()))
            log("📊 New total: ".concat(creatorRef.totalTipped.toString()))
          }
        }
      `,
      args: (arg: any, t: any) => [
        arg(recipientAddress, t.Address),
        arg("0.01000000", t.UFix64), // Minimal 0.01 FLOW
        arg("Minimal test tip", t.String),
      ],
      proposer: fcl.currentUser,
      payer: fcl.currentUser,
      authorizations: [fcl.currentUser],
      limit: 300,
    });

    console.log("✅ Transaction submitted:", transactionId);

    const result = await fcl.tx(transactionId).onceSealed();
    console.log("📋 Transaction result:", result);

    if (result.status === 4) {
      console.log("✅ TRANSACTION SUCCESSFUL!");

      // Check state AFTER tip
      const afterState = await fcl.query({
        cadence: `
          import FlowTip from 0x6c1b12e35dca8863
          access(all) fun main(address: Address): {String: AnyStruct} {
            if let info = FlowTip.getCreatorInfo(address: address) {
              return {
                "tipCount": info.tipCount,
                "totalTipped": info.totalTipped
              }
            }
            return {"error": "Creator not found"}
          }
        `,
        args: (arg: any, t: any) => [arg(recipientAddress, t.Address)],
      });

      console.log("📊 AFTER tip:", afterState);

      // Check if tip was recorded
      const tipCountIncreased =
        parseInt(afterState.tipCount) > parseInt(beforeState.tipCount);
      const totalIncreased =
        parseFloat(afterState.totalTipped) >
        parseFloat(beforeState.totalTipped);

      if (tipCountIncreased && totalIncreased) {
        console.log("🎉 SUCCESS! TIP RECORDING WORKS!");
        console.log(
          `📈 Tip count: ${beforeState.tipCount} → ${afterState.tipCount}`
        );
        console.log(
          `💰 Total: ${beforeState.totalTipped} → ${afterState.totalTipped}`
        );

        // Test tip fetching
        const tips = await getCreatorTips(recipientAddress);
        console.log("📊 Fetched tips:", tips.length);

        return {
          success: true,
          tipRecordingWorking: true,
          beforeState,
          afterState,
          tipsFound: tips.length,
        };
      } else {
        console.log("❌ TIP RECORDING FAILED!");
        console.log("💰 Payment worked but addTip() didn't record");
        return {
          success: false,
          paymentWorked: true,
          tipRecordingWorked: false,
          beforeState,
          afterState,
        };
      }
    } else {
      console.error("❌ Transaction failed:", result);
      return { success: false, transactionFailed: true, result };
    }
  } catch (error: any) {
    console.error("❌ Minimal tip test failed:", error);

    if (error.message?.includes("Could not borrow Creator reference")) {
      return {
        success: false,
        needsInterfaceFix: true,
        error: "Interface broken - run manual fix",
      };
    }

    return { success: false, error: error.message };
  }
};
