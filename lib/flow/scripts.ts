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
        
        // Check if any creators are registered
        if registeredCreators.keys.length == 0 {
            log("⚠️ No creators registered in contract")
            return creators
        }
        
        // Process each registered address
        for address in registeredCreators.keys {
            log("🔍 Processing address: ".concat(address.toString()))
            
            // Get the account
            let account = getAccount(address)
            
            // Get the capability
            let creatorCap = account.capabilities.get<&FlowTip.Creator>(FlowTip.CreatorPublicPath)
            
            // Check if capability is valid
            if !creatorCap.check() {
                log("❌ Invalid capability for address: ".concat(address.toString()))
                continue
            }
            
            // Try to borrow the capability
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
  `
};


// Get all creators - FIXED MAINNET VERSION
export const getCreators = async (): Promise<Creator[]> => {
  try {
    console.log("🔍 Fetching creators...");
    
    const result = await fcl.query({
      cadence: CADENCE_SCRIPTS.GET_CREATORS,
    });

    console.log("✅ Raw query result:", result);
    console.log("📊 Number of creators found:", result?.length || 0);
    
    // Convert the result to match your Creator interface
    const creators: Creator[] = (result || []).map((creator: any) => ({
      id: creator.id.toString(),
      name: creator.name,
      description: creator.description,
      imageURL: creator.imageURL,
      address: creator.address,
      totalTipped: creator.totalTipped.toString(),
      tipCount: parseInt(creator.tipCount.toString())
    }));

    console.log("🎯 Processed creators:", creators);
    return creators;
    
  } catch (error) {
    console.error("❌ Error fetching creators:", error);
    return [];
  }
};



// Get creator by address - FIXED MAINNET VERSION
export const getCreatorByAddress = async (address: string): Promise<Creator | null> => {
  try {
    return await fcl.query({
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
          let creatorRef = getAccount(address)
            .capabilities.get<&FlowTip.Creator>(FlowTip.CreatorPublicPath)
            .borrow()
          
          if creatorRef != nil {
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
          
          return nil
        }
      `,
      args: (arg: any, t: any) => [arg(address, t.Address)],
    });
  } catch (error) {
    console.error("Error fetching creator:", error);
    return null;
  }
};

// Get tips received by a creator - FIXED MAINNET VERSION
export const getCreatorTips = async (address: string): Promise<Tip[]> => {
  try {
    return await fcl.query({
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
          let creatorRef = getAccount(address)
            .capabilities.get<&FlowTip.Creator>(FlowTip.CreatorPublicPath)
            .borrow()
          
          if creatorRef == nil {
            return []
          }
          
          let tipHistory = creatorRef!.getTipHistory()
          let tips: [TipInfo] = []
          
          for tip in tipHistory {
            tips.append(TipInfo(
              id: tip.id,
              amount: tip.amount,
              from: tip.from,
              message: tip.message,
              timestamp: tip.timestamp
            ))
          }
          
          return tips
        }
      `,
      args: (arg: any, t: any) => [arg(address, t.Address)],
    });
  } catch (error) {
    console.error("Error fetching tips:", error);
    return [];
  }
};


// Debug script to check creator storage issues
export const debugCreatorStorage = async () => {
  try {
    console.log('🔍 Debugging creator storage...\n');
    
    // 1. Check total registered creators
    const registeredCreators = await fcl.query({
      cadence: `
        import FlowTip from 0x6c1b12e35dca8863
        
        access(all) fun main(): {Address: UInt64} {
          return FlowTip.getRegisteredCreators()
        }
      `,
    });
    
    console.log('📋 Registered creators in contract:', Object.keys(registeredCreators).length);
    console.log('Registry:', registeredCreators);
    
    // 2. Check each creator's actual storage
    for (const [address, id] of Object.entries(registeredCreators)) {
      console.log(`\n👤 Checking creator ${address} (ID: ${id})`);
      
      try {
        // Check if they have the Creator resource
        const hasResource = await fcl.query({
          cadence: `
            import FlowTip from 0x6c1b12e35dca8863
            
            access(all) fun main(address: Address): Bool {
              let account = getAccount(address)
              let creatorCap = account.capabilities.get<&FlowTip.Creator>(FlowTip.CreatorPublicPath)
              return creatorCap.check()
            }
          `,
          args: (arg, t) => [arg(address, t.Address)]
        });
        
        console.log(`  📦 Has Creator resource: ${hasResource}`);
        
        if (hasResource) {
          // Try to get their info
          const creatorInfo = await fcl.query({
            cadence: `
              import FlowTip from 0x6c1b12e35dca8863
              
              access(all) fun main(address: Address): FlowTip.CreatorInfo? {
                return FlowTip.getCreatorInfo(address: address)
              }
            `,
            args: (arg, t) => [arg(address, t.Address)]
          });
          
          if (creatorInfo) {
            console.log(`  ✅ Creator data: ${creatorInfo.name} (Tips: ${creatorInfo.tipCount})`);
          } else {
            console.log(`  ❌ Creator resource exists but getCreatorInfo() failed`);
          }
        } else {
          console.log(`  ❌ Missing Creator resource in account storage`);
        }
        
      } catch (error: any) {
        console.log(`  ❌ Error checking creator: ${error?.message}`);
      }
    }
    
  } catch (error) {
    console.error('❌ Debug failed:', error);
  }
};

// Run the debug
debugCreatorStorage();