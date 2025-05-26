import FlowTip from "FlowTip"

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