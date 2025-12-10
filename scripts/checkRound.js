const hre = require("hardhat");

async function main() {
  const contractAddress = "0x78bAa058f01f8731F24f8827f6714b5C8757216a";
  
  const PredictionPool = await hre.ethers.getContractAt("PredictionPool", contractAddress);
  
  const currentRoundId = await PredictionPool.currentRoundId();
  console.log("Current Round ID:", currentRoundId.toString());
  
  const roundInfo = await PredictionPool.getCurrentRoundInfo();
  console.log("\nRound Info:");
  console.log("- Round ID:", roundInfo[0].toString());
  console.log("- Is Open:", roundInfo[1]);
  console.log("- Players Count:", roundInfo[2].toString());
  console.log("- Pool (ETH):", hre.ethers.formatEther(roundInfo[3]));
  
  const entryFee = await PredictionPool.entryFee();
  console.log("\nEntry Fee:", hre.ethers.formatEther(entryFee), "ETH");
  
  const maxPlayers = await PredictionPool.maxPlayers();
  console.log("Max Players:", maxPlayers.toString());
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
