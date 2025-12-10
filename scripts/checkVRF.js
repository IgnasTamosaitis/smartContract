const hre = require("hardhat");

async function main() {
  const contractAddress = "0xE93f4c8d5ff9855276F4183A2620A2062d1D6d34";
  const PredictionPool = await hre.ethers.getContractAt("PredictionPool", contractAddress);
  
  const subscriptionId = await PredictionPool.subscriptionId();
  console.log("Contract Subscription ID:", subscriptionId.toString());
  console.log("\nExpected: 472739888928358636209079756662543599282584589242030312477525883955590952465");
  console.log("Match:", subscriptionId.toString() === "472739888928358636209079756662543599282584589242030312477525883955590952465");
  
  // Check VRF v2.5 coordinator
  const coordinatorAddress = "0x9DdfaCa8183c41ad55329BdeeD9F6A8d53168B1B";
  console.log("\nVRF v2.5 Coordinator:", coordinatorAddress);
  
  // Get subscription info from coordinator
  const coordinatorAbi = [
    "function getSubscription(uint256 subId) external view returns (uint96 balance, uint96 reqCount, address owner, address[] memory consumers)"
  ];
  
  const coordinator = await hre.ethers.getContractAt(coordinatorAbi, coordinatorAddress);
  
  try {
    const subInfo = await coordinator.getSubscription(subscriptionId);
    console.log("\nSubscription Info:");
    console.log("- Balance:", hre.ethers.formatEther(subInfo[0]), "LINK");
    console.log("- Request Count:", subInfo[1].toString());
    console.log("- Owner:", subInfo[2]);
    console.log("- Consumers:", subInfo[3].length);
    
    const isConsumer = subInfo[3].includes(contractAddress);
    console.log("- Contract is consumer:", isConsumer);
    
    if (!isConsumer) {
      console.log("\n❌ CONTRACT NOT ADDED AS CONSUMER!");
    }
  } catch (error) {
    console.log("\n❌ Failed to get subscription info:", error.message);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
