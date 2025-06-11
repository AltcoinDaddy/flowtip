import FlowTip from "FlowTip"

transaction(name: String, description: String, imageURL: String) {
    prepare(signer: auth(Storage, Capabilities) &Account) {
        // Verify they are registered
        if !FlowTip.isCreatorRegistered(address: signer.address) {
            panic("Creator not registered. Please register first.")
        }
        
        // Check if they already have the resource
        if signer.storage.type(at: FlowTip.CreatorStoragePath) != nil {
            log("Creator resource already exists")
            return
        }
        
        // Get their assigned creator ID
        let registeredCreators = FlowTip.getRegisteredCreators()
        let creatorID = registeredCreators[signer.address] ?? panic("Creator ID not found")
        
        // Create the Creator resource
        let creator <- FlowTip.createCreator(
            id: creatorID,
            name: name,
            description: description,
            imageURL: imageURL
        )
        
        // Store in user's account
        signer.storage.save(<-creator, to: FlowTip.CreatorStoragePath)
        
        // Create public capability
        let creatorCap = signer.capabilities.storage.issue<&FlowTip.Creator>(
            FlowTip.CreatorStoragePath
        )
        signer.capabilities.publish(creatorCap, at: FlowTip.CreatorPublicPath)
        
        log("✅ Creator setup complete for ID: ".concat(creatorID.toString()))
    }
}