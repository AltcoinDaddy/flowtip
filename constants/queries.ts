const CadenceQueries = {
  isRegisteredQuery: `
          import FlowTip from 0x6c1b12e35dca8863

          access(all) fun main(userAddress: Address): Bool {
            return FlowTip.isCreatorRegistered(address: userAddress)
          }
        `,
  isNowRegisteredQuery: `
          import FlowTip from 0x6c1b12e35dca8863

          access(all) fun main(userAddress: Address): Bool {
            return FlowTip.isCreatorRegistered(address: userAddress)
          }
     `,
};

export default CadenceQueries;
