import FlowTip from "FlowTip"

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