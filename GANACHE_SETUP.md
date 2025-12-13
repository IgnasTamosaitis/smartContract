# Ganache Setup Guide

## What Changed

The project has been simplified to work with **Ganache** (local blockchain) instead of Chainlink VRF on Sepolia testnet.

**Key changes:**
- ❌ Removed Chainlink VRF dependencies
- ✅ Added instant pseudo-random winner selection (using block data)
- ✅ No LINK tokens needed
- ✅ No VRF subscription needed
- ✅ Winner is selected immediately when round closes

## Setup Steps

### 1. Install Ganache

**Option A: Ganache GUI (Recommended)**
- Download from: https://trufflesuite.com/ganache/
- Install and launch
- Creates local blockchain at `http://127.0.0.1:7545`

**Option B: Ganache CLI**
```bash
npm install -g ganache
ganache --port 7545
```

### 2. Deploy Contract to Ganache

```bash
# Make sure Ganache is running on port 7545
npx hardhat run scripts/deploy.js --network ganache
```

The contract will deploy instantly (no waiting for testnet blocks)!

### 3. Update Frontend

After deployment, copy the contract address and update:
- `src/app.js` → Change `CONTRACT_ADDRESS`
- `src/test.html` → Change `CONTRACT_ADDRESS`

### 4. Connect MetaMask to Ganache

1. Open MetaMask
2. Click network dropdown → **Add Network** → **Add a network manually**
3. Fill in:
   - **Network Name**: Ganache
   - **RPC URL**: `http://127.0.0.1:7545`
   - **Chain ID**: `1337`
   - **Currency Symbol**: `ETH`
4. Click **Save**

5. Import Ganache account:
   - Copy private key from Ganache (click key icon next to any account)
   - MetaMask → Account menu → **Import Account**
   - Paste private key
   - Now you have 100 ETH for testing!

### 5. Test the Game

1. Start local server:
   ```bash
   cd src
   python -m http.server 8000
   ```

2. Open http://localhost:8000/index.html

3. Connect MetaMask (select Ganache network)

4. Play:
   - Click "Join Round (Spin)" - costs 0.001 ETH
   - After 2 players join, **winner is selected instantly!**
   - Check your balance - winner gets ~0.0019 ETH back!

## Advantages of Ganache

✅ **Instant transactions** - no waiting 15 seconds per block  
✅ **Free ETH** - each account starts with 100 ETH  
✅ **No faucets needed** - unlimited test funds  
✅ **Deterministic** - can reset blockchain anytime  
✅ **Fast testing** - perfect for development  

## Deploy to Other Networks

### Localhost (Hardhat node)
```bash
# Terminal 1
npx hardhat node

# Terminal 2
npx hardhat run scripts/deploy.js --network localhost
```

### Sepolia (requires real testnet ETH)
```bash
npx hardhat run scripts/deploy.js --network sepolia
```

## Troubleshooting

**"Error: could not detect network"**
- Make sure Ganache is running on port 7545
- Check Ganache shows "LISTENING ON 127.0.0.1:7545"

**"Nonce too high"**
- In MetaMask → Settings → Advanced → **Clear activity tab data**
- Or reset Ganache and redeploy

**Transaction fails with no reason**
- Check MetaMask is connected to Ganache network (Chain ID 1337)
- Verify contract address is correct in `app.js`

## Randomness Note

⚠️ The pseudo-random winner selection uses `block.prevrandao`, `block.timestamp`, and `block.number`. This is **NOT SECURE** for production but perfect for local testing on Ganache!

For production, use the original Chainlink VRF version (backed up as `contracts/PredictionPool.sol.backup`).
