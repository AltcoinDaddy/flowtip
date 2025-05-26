import FlowTip from "FlowTip"

transaction(name: String, description: String, imageURL: String) {
    prepare(acct: auth(Storage, Capabilities) &Account) {
        // Check if the user is already registered as a creator
        if acct.storage.borrow<&FlowTip.Creator>(from: FlowTip.CreatorStoragePath) != nil {
            // Already registered, update profile instead
            let creator = acct.storage.borrow<&FlowTip.Creator>(from: FlowTip.CreatorStoragePath)
                ?? panic("Could not borrow creator")
            creator.updateProfile(name: name, description: description, imageURL: imageURL)
        } else {
            // Register as a new creator and get the ID
            let creatorID = FlowTip.registerCreator(name: name, description: description, imageURL: imageURL)
            
            // Create the Creator resource
            let creator <- FlowTip.createCreator(id: creatorID, name: name, description: description, imageURL: imageURL)
            
            // Save the Creator resource to storage
            acct.storage.save(<-creator, to: FlowTip.CreatorStoragePath)
            
            // Create and publish the capability
            let creatorCap = acct.capabilities.storage.issue<&FlowTip.Creator>(FlowTip.CreatorStoragePath)
            acct.capabilities.publish(creatorCap, at: FlowTip.CreatorPublicPath)
        }
    }
}