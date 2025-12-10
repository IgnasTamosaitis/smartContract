let web3;
let predictionPool;
let userAccount;

// Deployed PredictionPool address on Sepolia
const CONTRACT_ADDRESS = "0x504e2d0BF8e542Deaac302f7FDb255b79C7dAD52";

// Simplified ABI - only what we need
const predictionPoolAbi = [
  {
    inputs: [],
    name: "enterRound",
    outputs: [],
    stateMutability: "payable",
    type: "function"
  },
  {
    inputs: [],
    name: "getCurrentRoundInfo",
    outputs: [
      { internalType: "uint256", name: "roundId", type: "uint256" },
      { internalType: "bool", name: "isOpen", type: "bool" },
      { internalType: "uint256", name: "playerCount", type: "uint256" },
      { internalType: "uint256", name: "pool", type: "uint256" }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [],
    name: "entryFee",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [],
    name: "currentRoundId",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [],
    name: "maxPlayers",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function"
  }
];

let totalSpinDistance = 0;
let maxPlayers = 20;

// ---------- Init & MetaMask ----------

async function init() {
  if (typeof window.ethereum === "undefined") {
    alert("Please install MetaMask and connect to the Sepolia network.");
    return;
  }

  web3 = new Web3(window.ethereum);

  try {
    // Request accounts
    await ethereum.request({ method: "eth_requestAccounts" });
    const accounts = await web3.eth.getAccounts();
    userAccount = accounts[0];

    // Check network
    const chainId = await web3.eth.getChainId();
    if (chainId !== 11155111) {
      alert("Please switch to Sepolia network in MetaMask!");
      return;
    }

    // Initialize contract
    predictionPool = new web3.eth.Contract(predictionPoolAbi, CONTRACT_ADDRESS);

    // Get max players
    try {
      maxPlayers = await predictionPool.methods.maxPlayers().call();
    } catch (e) {
      maxPlayers = 20; // default
    }

    await updateUserInfo();
    await updateEntryFee();
    await updateRoundInfo();

    setupWheelSegments();
    setupEventListeners();

    document.getElementById("spin-button").disabled = false;

    console.log("✅ Connected:", userAccount);
    console.log("✅ Network: Sepolia");
    console.log("✅ Contract:", CONTRACT_ADDRESS);
  } catch (err) {
    console.error("Connection error:", err);
    alert("Could not connect to MetaMask. Error: " + err.message);
  }
}

async function updateUserInfo() {
  if (!userAccount || !web3) return;

  const balanceWei = await web3.eth.getBalance(userAccount);
  const balanceEth = parseFloat(web3.utils.fromWei(balanceWei, "ether")).toFixed(4);

  const short = `${userAccount.slice(0, 6)}...${userAccount.slice(-4)}`;

  document.getElementById("user-info").textContent = `User: ${short}`;
  document.getElementById("user-balance").textContent = `User Balance: ${balanceEth} ETH`;
}

async function updateEntryFee() {
  try {
    const feeWei = await predictionPool.methods.entryFee().call();
    const feeEth = parseFloat(web3.utils.fromWei(feeWei, "ether")).toFixed(4);
    document.getElementById("entry-fee").textContent = `${feeEth} ETH`;
  } catch (error) {
    console.error("Error getting entry fee:", error);
    document.getElementById("entry-fee").textContent = "0.01 ETH";
  }
}

async function updateRoundInfo() {
  try {
    const info = await predictionPool.methods.getCurrentRoundInfo().call();
    const poolEth = parseFloat(web3.utils.fromWei(info.pool, "ether")).toFixed(4);

    document.getElementById("round-id").textContent = `#${info.roundId}`;
    document.getElementById("round-players").textContent = `${info.playerCount} / ${maxPlayers}`;
    document.getElementById("round-pool").textContent = `${poolEth} ETH`;

    const statusEl = document.getElementById("status");
    if (info.isOpen) {
      statusEl.textContent = "Round is open. Press Spin to join!";
      statusEl.style.color = "#4caf50";
    } else {
      statusEl.textContent = "Round is closed. Waiting for Chainlink VRF to pick a winner...";
      statusEl.style.color = "#ff9800";
    }
  } catch (error) {
    console.error("Error getting round info:", error);
    document.getElementById("status").textContent = "Error loading round info. Check console.";
  }
}

// ---------- Wheel / Animation ----------

function setupWheelSegments() {
  const spinner = document.getElementById("spinner");
  spinner.innerHTML = "";

  const segments = [];
  for (let i = 0; i < 15; i++) {
    if (i === 0) {
      segments.push({ name: "0", className: "green" });
    } else {
      segments.push({ name: String(i), className: i % 2 === 0 ? "red" : "black" });
    }
  }

  segments.forEach((segment) => {
    const div = document.createElement("div");
    div.className = `segment ${segment.className}`;
    div.textContent = segment.name;
    spinner.appendChild(div);
  });
}

function spinWheelVisual() {
  return new Promise((resolve) => {
    const spinner = document.getElementById("spinner");
    const segments = Array.from(document.querySelectorAll(".segment"));
    const segmentWidth = 150;

    // Random visual spin
    const randomNumber = Math.floor(Math.random() * segments.length);
    const randomOffset = Math.floor(Math.random() * segmentWidth);
    const spinDistance = segmentWidth * 14 + segmentWidth * randomNumber + randomOffset;

    totalSpinDistance += spinDistance;
    spinner.style.transition = "transform 4s ease-in-out";
    spinner.style.transform = `translateX(-${totalSpinDistance}px)`;

    setTimeout(() => {
      resolve();
    }, 4000);
  });
}

// ---------- Enter Round ----------

async function enterRound() {
  if (!predictionPool || !userAccount) {
    alert("Please connect MetaMask first.");
    return;
  }

  try {
    document.getElementById("status").textContent = "Preparing transaction...";
    document.getElementById("spin-button").disabled = true;

    // Get entry fee
    const feeWei = await predictionPool.methods.entryFee().call();
    
    // Start visual spin
    spinWheelVisual();
    document.getElementById("status").textContent = "Sending transaction to blockchain...";

    // Send transaction
    const tx = await predictionPool.methods.enterRound().send({
      from: userAccount,
      value: feeWei,
      gas: 200000
    });

    console.log("✅ Transaction successful:", tx.transactionHash);
    
    document.getElementById("status").innerHTML = `
      ✅ Success! 
      <a href="https://sepolia.etherscan.io/tx/${tx.transactionHash}" target="_blank" style="color: #4caf50;">
        View on Etherscan
      </a>
    `;

    // Wait a bit then refresh info
    setTimeout(async () => {
      await updateUserInfo();
      await updateRoundInfo();
      document.getElementById("spin-button").disabled = false;
    }, 3000);

  } catch (error) {
    console.error("Transaction error:", error);
    
    let errorMsg = "Transaction failed. ";
    if (error.message.includes("user rejected")) {
      errorMsg += "You rejected the transaction.";
    } else if (error.message.includes("Round closed")) {
      errorMsg += "Round is closed. Please wait for new round.";
    } else if (error.message.includes("Invalid entry fee")) {
      errorMsg += "Invalid entry fee amount.";
    } else {
      errorMsg += error.message;
    }
    
    document.getElementById("status").textContent = "❌ " + errorMsg;
    document.getElementById("status").style.color = "#f44336";
    document.getElementById("spin-button").disabled = false;
  }
}

// ---------- Event Listeners ----------

function setupEventListeners() {
  const spinButton = document.getElementById("spin-button");
  spinButton.addEventListener("click", enterRound);

  // Auto-refresh every 10 seconds
  setInterval(async () => {
    if (userAccount && predictionPool) {
      await updateRoundInfo();
    }
  }, 10000);
}

// ---------- Page Load ----------

window.addEventListener("load", init);
