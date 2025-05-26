import * as fcl from "@onflow/fcl"
// Test basic FCL transaction capability
export const testBasicTransaction = async () => {
  try {
    console.log("🧪 Testing basic transaction...");
    
    const txId = await fcl.mutate({
      cadence: `
        transaction() {
          prepare(signer: auth(Storage) &Account) {
            log("Test transaction from: ".concat(signer.address.toString()))
          }
        }
      `,
      payer: fcl.authz,
      proposer: fcl.authz,
      authorizations: [fcl.authz],
      limit: 50,
    });
    
    console.log("✅ Basic transaction submitted:", txId);
    
    const transaction = await fcl.tx(txId).onceSealed();
    console.log("✅ Basic transaction sealed:", transaction);
    
  } catch (error) {
    console.error("❌ Basic transaction failed:", error);
  }
};

