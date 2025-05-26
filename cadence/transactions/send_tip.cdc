import FlowToken from 0x1654653399040a61
import FungibleToken from 0xf233dcee88fe0abe
import FlowTip from "FlowTip"

transaction(recipient: Address, amount: UFix64, message: String) {
    let payment: @FungibleToken.Vault
    let recipientCreator: &FlowTip.Creator
    let recipientVault: &{FungibleToken.Receiver}
    let signerAddress: Address

    prepare(signer: auth(Storage) &Account) {
        // Store signer address for later use
        self.signerAddress = signer.address
        
        // Get a reference to the signer's FlowToken vault
        let vaultRef = signer.storage.borrow<&FlowToken.Vault>(from: /storage/flowTokenVault)
            ?? panic("Could not borrow reference to the sender's vault")
        
        // Withdraw tokens from the sender's vault
        self.payment <- vaultRef.withdraw(amount: amount)
        
        // Get a reference to the recipient's Creator resource
        self.recipientCreator = getAccount(recipient)
            .capabilities.get<&FlowTip.Creator>(FlowTip.CreatorPublicPath)
            .borrow()
            ?? panic("Could not borrow a reference to the Creator")
        
        // Get a reference to the recipient's Flow token vault
        self.recipientVault = getAccount(recipient)
            .capabilities.get<&{FungibleToken.Receiver}>(/public/flowTokenReceiver)
            .borrow()
            ?? panic("Could not borrow a reference to the recipient's vault")
    }

    execute {
        // Deposit the withdrawn tokens into the recipient's vault
        self.recipientVault.deposit(from: <-self.payment)
        
        // Record tip information in the creator's resource
        self.recipientCreator.receiveTip(amount: amount, from: self.signerAddress, message: message)
        
        // Note: We don't emit the event here since it's in the imported contract
        // The event will be emitted automatically by the contract when receiveTip is called
    }
}