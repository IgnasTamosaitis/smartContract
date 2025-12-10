const hre = require("hardhat");

async function main() {
  const contractAddress = "0x78bAa058f01f8731F24f8827f6714b5C8757216a";
  const PredictionPool = await hre.ethers.getContractAt("PredictionPool", contractAddress);
  
  const [signer] = await hre.ethers.getSigners();
  console.log("Owner:", signer.address);
  
  console.log("Opening new round...");
  const tx = await PredictionPool.connect(signer).openNewRound();
  console.log("Transaction sent:", tx.hash);
  
  const receipt = await tx.wait();
  console.log("✅ Transaction confirmed in block:", receipt.blockNumber);
  
  const currentRoundId = await PredictionPool.currentRoundId();
  console.log("\nNew Round ID:", currentRoundId.toString());
  
  const roundInfo = await PredictionPool.getCurrentRoundInfo();
  console.log("- Is Open:", roundInfo[1]);
  console.log("- Players:", roundInfo[2].toString());
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
