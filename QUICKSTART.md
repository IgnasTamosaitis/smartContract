# 🎮 Quick Start - Ganache Version

## Prerequisites
- ✅ Ganache installed
- ✅ MetaMask installed
- ✅ Node.js & npm

## 1-Minute Setup

```bash
# 1. Start Ganache (GUI or CLI)
ganache --port 7545 --chainId 1337

# 2. Deploy contract
npm run deploy:ganache

# 3. Copy contract address from output, update:
#    - src/app.js (line 6)
#    - src/test.html (line 9)

# 4. Start frontend
npm run serve

# 5. Open browser
# http://localhost:8000/index.html
```

## MetaMask Setup (One-Time)

**Add Ganache Network:**
- Network Name: `Ganache`
- RPC URL: `http://127.0.0.1:7545`
- Chain ID: `1337`
- Currency: `ETH`

**Import Account:**
- Copy any private key from Ganache
- MetaMask → Import Account
- Paste key → **100 ETH ready!**

## Testing the Game

1. Connect MetaMask to Ganache network
2. Click "Join Round (Spin)" (costs 0.001 ETH)
3. Join again with same or different account
4. Winner selected **instantly**! 🎉
5. Check balance - winner gets ~0.0019 ETH

## Commands

| Command | Description |
|---------|-------------|
| `npm run compile` | Compile contracts |
| `npm run deploy:ganache` | Deploy to Ganache |
| `npm run deploy:localhost` | Deploy to Hardhat node |
| `npm run serve` | Start frontend server |
| `npm run ganache` | Start Ganache CLI |

## Troubleshooting

**"Could not detect network"**
→ Start Ganache on port 7545

**"Nonce too high"**
→ MetaMask → Settings → Advanced → Clear activity data

**"Transaction fails"**
→ Check MetaMask is on Ganache network (Chain ID 1337)
→ Verify contract address in app.js

## File Structure

```
contracts/
  PredictionPool.sol          ← Simplified (no VRF)
  PredictionPool.sol.backup   ← Original Chainlink version
scripts/
  deploy.js                   ← No subscription needed
src/
  index.html                  ← Main UI
  app.js                      ← Update CONTRACT_ADDRESS here!
  test.html                   ← Simple test page
hardhat.config.js             ← Ganache network added
```

## What's Different?

### Before (Chainlink VRF):
- 🐌 Waits 1-3 minutes for winner
- 💰 Needs LINK tokens
- 🔗 Requires VRF subscription
- ⏱️ 15 sec per transaction on Sepolia

### After (Ganache):
- ⚡ Instant winner selection
- 💸 No LINK needed
- 🚀 No subscription needed
- ⏱️ Instant transactions

## Next Steps

Read full documentation:
- `GANACHE_SETUP.md` - Detailed setup guide
- `CONVERSION_SUMMARY.md` - What changed
- `README.md` - Original project docs

Happy testing! 🎰
