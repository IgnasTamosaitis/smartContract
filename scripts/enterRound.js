const hre = require("hardhat");

async function main() {
  const contractAddress = "0xE93f4c8d5ff9855276F4183A2620A2062d1D6d34";
  const PredictionPool = await hre.ethers.getContractAt("PredictionPool", contractAddress);
  
  const [signer] = await hre.ethers.getSigners();
  console.log("Wallet:", signer.address);
  
  const balance = await hre.ethers.provider.getBalance(signer.address);
  console.log("Balance:", hre.ethers.formatEther(balance), "ETH\n");
  
  // Get current state with latest block
  const roundInfo = await PredictionPool.getCurrentRoundInfo({ blockTag: 'latest' });
  console.log("Before entry:");
  console.log("- Round ID:", roundInfo[0].toString());
  console.log("- Is Open:", roundInfo[1]);
  console.log("- Players:", roundInfo[2].toString());
  console.log("- Pool:", hre.ethers.formatEther(roundInfo[3]), "ETH");
  
  // Also check round directly
  const currentRoundId = await PredictionPool.currentRoundId();
  console.log("- Current Round ID from storage:", currentRoundId.toString() + "\n");
  
  // Try to enter
  console.log("Attempting to enter round...");
  const entryFee = await PredictionPool.entryFee();
  
  try {
    const tx = await PredictionPool.connect(signer).enterRound({ value: entryFee });
    console.log("Transaction sent:", tx.hash);
    const receipt = await tx.wait();
    console.log("✅ Transaction confirmed in block:", receipt.blockNumber);
    
    // Get new state
    const newRoundInfo = await PredictionPool.getCurrentRoundInfo();
    console.log("\nAfter entry:");
    console.log("- Round ID:", newRoundInfo[0].toString());
    console.log("- Is Open:", newRoundInfo[1]);
    console.log("- Players:", newRoundInfo[2].toString());
    console.log("- Pool:", hre.ethers.formatEther(newRoundInfo[3]), "ETH");
  } catch (error) {
    console.log("❌ Entry failed:", error.message);
    
    // Try to get revert reason
    if (error.data) {
      console.log("Error data:", error.data);
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
