import * as fcl from "@onflow/fcl";

// Helper function to check if user is registered as creator
export const checkIsCreator = async (address: string): Promise<boolean> => {
  try {
    const result = await fcl.query({
      cadence: `
        import FlowTip from 0x6c1b12e35dca8863
        
        access(all) fun main(address: Address): Bool {
          let account = getAccount(address)
          return account.capabilities.check<&FlowTip.Creator>(FlowTip.CreatorPublicPath)
        }
      `,
      args: (arg: any, t: any) => [arg(address, t.Address)],
    });

    return result;
  } catch (error) {
    console.error("Error checking creator status:", error);
    return false;
  }
};