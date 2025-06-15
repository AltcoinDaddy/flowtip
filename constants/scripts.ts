
const CadenceScripts = {
    hasResourceScript: `
          import FlowTip from 0x6c1b12e35dca8863
          
          access(all) fun main(address: Address): Bool {
            let account = getAccount(address)
            let creatorCap = account.capabilities.get<&FlowTip.Creator>(FlowTip.CreatorPublicPath)
            return creatorCap.check()
          }
        `,
}


export default CadenceScripts;

