const hre = require("hardhat");

async function main() {
  const contractAddress = "0xE93f4c8d5ff9855276F4183A2620A2062d1D6d34";
  const PredictionPool = await hre.ethers.getContractAt("PredictionPool", contractAddress);
  
  const [signer] = await hre.ethers.getSigners();
  const entryFee = await PredictionPool.entryFee();
  
  console.log("Attempting entry with high gas limit...");
  
  try {
    const tx = await PredictionPool.connect(signer).enterRound({ 
      value: entryFee,
      gasLimit: 500000  // Much higher
    });
    console.log("Transaction sent:", tx.hash);
    const receipt = await tx.wait();
    console.log("✅ Success! Block:", receipt.blockNumber);
    
    // Check if round closed
    const roundInfo = await PredictionPool.getCurrentRoundInfo();
    console.log("\nAfter entry:");
    console.log("- Round ID:", roundInfo[0].toString());
    console.log("- Is Open:", roundInfo[1]);
    console.log("- Players:", roundInfo[2].toString());
    
    if (!roundInfo[1]) {
      console.log("\n🎉 Round closed! Waiting for VRF callback...");
      console.log("Check back in ~60 seconds for winner");
    }
  } catch (error) {
    console.log("❌ Failed:", error.message);
    
    // Try to estimate gas to see what fails
    try {
      const gasEstimate = await PredictionPool.connect(signer).enterRound.estimateGas({ value: entryFee });
      console.log("Gas estimate would be:", gasEstimate.toString());
    } catch (estError) {
      console.log("Gas estimation also failed:", estError.message);
      if (estError.data) {
        console.log("Error data:", estError.data);
      }
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
