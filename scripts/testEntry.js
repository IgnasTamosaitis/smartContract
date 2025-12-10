const hre = require("hardhat");

async function main() {
  const contractAddress = "0x78bAa058f01f8731F24f8827f6714b5C8757216a";
  
  const PredictionPool = await hre.ethers.getContractAt("PredictionPool", contractAddress);
  
  // Check round 1
  const round1 = await PredictionPool.rounds(1);
  console.log("Round 1:");
  console.log("- Is Open:", round1.isOpen);
  console.log("- Players:", round1.players.length);
  console.log("- Pool:", hre.ethers.formatEther(round1.pool), "ETH");
  console.log("- Fulfilled:", round1.fulfilled);
  
  // Try to call enterRound simulation
  try {
    const [signer] = await hre.ethers.getSigners();
    await PredictionPool.connect(signer).enterRound.staticCall({ value: hre.ethers.parseEther("0.001") });
    console.log("\n✅ enterRound() would succeed");
  } catch (error) {
    console.log("\n❌ enterRound() would fail:", error.message);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
