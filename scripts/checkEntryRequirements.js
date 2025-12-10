const hre = require("hardhat");

async function main() {
  const contractAddress = "0xE93f4c8d5ff9855276F4183A2620A2062d1D6d34";
  const PredictionPool = await hre.ethers.getContractAt("PredictionPool", contractAddress);
  
  const entryFee = await PredictionPool.entryFee();
  console.log("Entry Fee from contract:", hre.ethers.formatEther(entryFee), "ETH");
  console.log("Entry Fee wei:", entryFee.toString());
  console.log("Sending wei:", hre.ethers.parseEther("0.001").toString());
  console.log("Match:", entryFee.toString() === hre.ethers.parseEther("0.001").toString());
  
  const maxPlayers = await PredictionPool.maxPlayers();
  console.log("\nMax Players:", maxPlayers.toString());
  
  const roundInfo = await PredictionPool.getCurrentRoundInfo();
  console.log("\nCurrent Round:", roundInfo[0].toString());
  console.log("Is Open:", roundInfo[1]);
  console.log("Players:", roundInfo[2].toString());
  console.log("Can accept more:", roundInfo[2] < maxPlayers);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
