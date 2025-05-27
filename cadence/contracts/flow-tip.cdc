access(all) contract FlowTip {
    // Define the Creator resource that creators will own
    access(all) resource Creator {
        access(all) let id: UInt64
        access(all) var name: String
        access(all) var description: String
        access(all) var imageURL: String
        access(all) var tipCount: UInt64
        access(all) var totalTipped: UFix64
        access(all) var tipHistory: {UInt64: TipRecord}
        access(all) var nextTipID: UInt64

        init(id: UInt64, name: String, description: String, imageURL: String) {
            self.id = id
            self.name = name
            self.description = description
            self.imageURL = imageURL
            self.tipCount = 0
            self.totalTipped = 0.0
            self.tipHistory = {}
            self.nextTipID = 0
        }

        // Receive a tip and record it
        access(all) fun receiveTip(amount: UFix64, from: Address, message: String) {
            let tipRecord = TipRecord(
                id: self.nextTipID,
                amount: amount,
                from: from,
                message: message,
                timestamp: getCurrentBlock().timestamp
            )
            
            self.tipHistory[self.nextTipID] = tipRecord
            self.nextTipID = self.nextTipID + 1
            self.tipCount = self.tipCount + 1
            self.totalTipped = self.totalTipped + amount
        }

        // 🆕 NEW: Withdraw tips function
        access(all) fun withdraw(amount: UFix64) {
            pre {
                amount > 0.0: "Withdrawal amount must be greater than 0"
                amount <= self.totalTipped: "Insufficient balance. Available: ".concat(self.totalTipped.toString()).concat(", Requested: ").concat(amount.toString())
            }
            
            // Reduce the total tipped amount
            self.totalTipped = self.totalTipped - amount
            
            // Emit withdrawal event
            emit CreatorWithdrawal(
                creatorID: self.id, 
                creatorAddress: self.owner?.address, 
                amount: amount,
                remainingBalance: self.totalTipped
            )
        }

        // 🆕 NEW: Alternative withdrawal function name (in case the modal tries this)
        access(all) fun withdrawTips(amount: UFix64) {
            self.withdraw(amount: amount)
        }

        // 🆕 NEW: Get withdrawable balance (helper function)
        access(all) fun getWithdrawableBalance(): UFix64 {
            return self.totalTipped
        }

        // Update profile information
        access(all) fun updateProfile(name: String, description: String, imageURL: String) {
            self.name = name
            self.description = description
            self.imageURL = imageURL
        }

        // Get all tip records
        access(all) fun getTipHistory(): [TipRecord] {
            return self.tipHistory.values
        }
    }

    // Structure to store information about each tip
    access(all) struct TipRecord {
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

    // Resource interface to expose read-only functions
    access(all) resource interface CreatorPublic {
        access(all) let id: UInt64
        access(all) var name: String
        access(all) var description: String
        access(all) var imageURL: String
        access(all) var tipCount: UInt64
        access(all) var totalTipped: UFix64
        access(all) fun receiveTip(amount: UFix64, from: Address, message: String)
        access(all) fun getTipHistory(): [TipRecord]
        // 🆕 NEW: Add withdrawal balance function to public interface
        access(all) fun getWithdrawableBalance(): UFix64
    }

    // Public events
    access(all) event CreatorRegistered(id: UInt64, address: Address)
    access(all) event TipSent(creatorID: UInt64, amount: UFix64, from: Address)
    // 🆕 NEW: Withdrawal event
    access(all) event CreatorWithdrawal(creatorID: UInt64, creatorAddress: Address?, amount: UFix64, remainingBalance: UFix64)

    // Storage paths
    access(all) let CreatorStoragePath: StoragePath
    access(all) let CreatorPublicPath: PublicPath

    // Contract state
    access(all) var nextCreatorID: UInt64
    access(all) var registeredCreators: {Address: UInt64}

    init() {
        self.CreatorStoragePath = /storage/FlowTipCreator
        self.CreatorPublicPath = /public/FlowTipCreator
        self.nextCreatorID = 1
        self.registeredCreators = {}
        
        emit CreatorRegistered(id: 0, address: self.account.address)
    }

    // Register a new creator - simplified version
    access(all) fun registerCreator(name: String, description: String, imageURL: String): UInt64 {
        let creatorID = self.nextCreatorID
        self.registeredCreators[self.account.address] = creatorID
        self.nextCreatorID = self.nextCreatorID + 1
        
        emit CreatorRegistered(id: creatorID, address: self.account.address)
        return creatorID
    }

    // Get a list of all registered creators
    access(all) view fun getRegisteredCreators(): {Address: UInt64} {
        return self.registeredCreators
    }

    // Create a new Creator resource
    access(all) fun createCreator(id: UInt64, name: String, description: String, imageURL: String): @Creator {
        return <- create Creator(id: id, name: name, description: description, imageURL: imageURL)
    }
}