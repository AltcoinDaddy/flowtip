import FlowTip from "FlowTip"
import FungibleToken from "FungibleToken"

transaction(recipient: Address, amount: UFix64, message: String) {
    let sentVault: @FungibleToken.Vault
    
    prepare(signer: AuthAccount) {
        // Get a reference to the signer's stored vault
        let vaultRef = signer.borrow<&FlowTip.Vault{FungibleToken.Provider}>(
            from: /storage/flowTokenVault
        ) ?? panic("Could not borrow reference to the owner's Vault!")
        
        // Withdraw tokens from the signer's stored vault
        self.sentVault <- vaultRef.withdraw(amount: amount)
    }
    
    execute {
        // Get the recipient's public account object
        let recipientAccount = getAccount(recipient)
        
        // Get a reference to the recipient's Receiver
        let receiverRef = recipientAccount.getCapability(/public/flowTokenReceiver)
            .borrow<&{FungibleToken.Receiver}>()
            ?? panic("Could not borrow receiver reference to the recipient's Vault!")
        
        // Deposit the withdrawn tokens in the recipient's receiver
        receiverRef.deposit(from: <-self.sentVault)
        
        // Log the tip (you might want to emit an event here)
        log("Sent tip of ".concat(amount.toString()).concat(" FLOW with message: ").concat(message))
    }
}