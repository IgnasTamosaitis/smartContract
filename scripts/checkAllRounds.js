const hre = require("hardhat");

async function main() {
  const contractAddress = "0x78bAa058f01f8731F24f8827f6714b5C8757216a";
  const PredictionPool = await hre.ethers.getContractAt("PredictionPool", contractAddress);
  
  const currentRoundId = await PredictionPool.currentRoundId();
  console.log("Current Round ID:", currentRoundId.toString());
  
  // Check multiple rounds
  for (let i = 1; i <= Number(currentRoundId); i++) {
    const info = await PredictionPool.getRoundInfo(i);
    console.log(`\nRound ${i}:`);
    console.log("- Is Open:", info[0]);
    console.log("- Fulfilled:", info[1]);
    console.log("- Players:", info[2].toString());
    console.log("- Pool:", hre.ethers.formatEther(info[3]), "ETH");
    if (info[4] !== "0x0000000000000000000000000000000000000000") {
      console.log("- Winner:", info[4]);
      console.log("- Prize:", hre.ethers.formatEther(info[5]), "ETH");
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
