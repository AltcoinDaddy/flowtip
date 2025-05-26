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

// Get all creators - FIXED MAINNET VERSION
export const getCreators = async (): Promise<Creator[]> => {
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

        access(all) fun main(): [CreatorInfo] {
          let creators: [CreatorInfo] = []
          let registeredCreators = FlowTip.getRegisteredCreators()
          
          for address in registeredCreators.keys {
            let creatorRef = getAccount(address)
              .capabilities.get<&FlowTip.Creator>(FlowTip.CreatorPublicPath)
              .borrow()
            
            if creatorRef != nil {
              let creator = CreatorInfo(
                id: creatorRef!.id,
                address: address,
                name: creatorRef!.name,
                description: creatorRef!.description,
                imageURL: creatorRef!.imageURL,
                tipCount: creatorRef!.tipCount,
                totalTipped: creatorRef!.totalTipped
              )
              creators.append(creator)
            }
          }
          
          return creators
        }
      `,
    });
  } catch (error) {
    console.error("Error fetching creators:", error);
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