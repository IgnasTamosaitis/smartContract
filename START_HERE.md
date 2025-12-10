# 🚀 GREITOJI INSTRUKCIJA - START HERE!

## 📍 Jūsų Situacija Dabar

✅ **TURITE**:
- Smart contract (PredictionPool.sol) ✓
- Frontend (HTML/CSS/JS) ✓  
- Documentation (README, guides, diagrams) ✓
- All dependencies installed ✓
- Everything committed to GitHub ✓

❌ **TRŪKSTA**:
- Credentials (RPC URL, Private Key, VRF)
- Deployed contract
- Tested on Sepolia
- Etherscan screenshots

## ⚡ 4 ŽINGSNIAI IKI PABAIGOS

### ŽINGSNIS 1: Gauti Credentials (30 min)

```
┌─────────────────────────────────────────────────────────┐
│ 1. ALCHEMY (RPC URL)                                    │
│    → https://www.alchemy.com/                           │
│    → Sign Up → Create App → Ethereum Sepolia           │
│    → Copy HTTPS URL                                     │
│                                                         │
│ 2. METAMASK (Private Key)                              │
│    → Open MetaMask → 3 dots → Account Details          │
│    → Show Private Key → Enter password → Copy          │
│    ⚠️  Use TEST wallet only!                            │
│                                                         │
│ 3. SEPOLIA ETH (Test tokens)                           │
│    → https://www.alchemy.com/faucets/ethereum-sepolia  │
│    → Sign in → Enter address → Get 0.5 ETH            │
│                                                         │
│ 4. CHAINLINK VRF (Random number)                       │
│    → https://vrf.chain.link/                           │
│    → Connect MetaMask (Sepolia) → Create Subscription  │
│    → Copy Subscription ID                              │
│                                                         │
│ 5. LINK TOKENS (For VRF)                               │
│    → https://faucets.chain.link/sepolia                │
│    → Get 10 LINK → Fund subscription with 5 LINK      │
└─────────────────────────────────────────────────────────┘
```

**Sukurti .env failą**:
```bash
Copy-Item .env.example .env
```

**Užpildyti** (notepad .env):
```
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_KEY
PRIVATE_KEY=0xYOUR_KEY
VRF_SUBSCRIPTION_ID=12345
```

---

### ŽINGSNIS 2: Deploy Contract (10 min)

```powershell
# Compile
npx hardhat compile

# Deploy to Sepolia
npm run deploy

# ⚠️  SVARBU: Išsaugokite contract address!
# Bus panašus į: 0x1234567890abcdef1234567890abcdef12345678
```

**Add VRF Consumer**:
1. → https://vrf.chain.link/
2. → Your Subscription → Add Consumer
3. → Paste contract address
4. → Confirm in MetaMask

---

### ŽINGSNIS 3: Update & Test (10 min)

**Update Frontend**:
```javascript
// Atidaryti: src/app.js (line ~6)
const CONTRACT_ADDRESS = "0xYOUR_REAL_ADDRESS_HERE";
```

**Test**:
1. Double-click `src/index.html`
2. Click "Connect Wallet"
3. MetaMask → Select Sepolia network
4. Click "Enter Current Round"
5. Confirm transaction
6. Wait ~15 seconds → refresh page

**Full Test** (reikia 20 žmonių):
- Share contract address su draugais
- Visi naudoja tą patį frontend
- Kai 20 entered → laimėtojas automatically selected!

---

### ŽINGSNIS 4: Screenshots & Docs (10 min)

**Etherscan**:
```
https://sepolia.etherscan.io/address/JUSU_CONTRACT_ADDRESS
```

**Padarykite screenshots** (Win+Shift+S):
1. Contract overview page
2. Transactions tab (rodantis enterRound calls)
3. Specific transaction → Logs tab
4. Events (RoundEntered, WinnerSelected)
5. Internal transactions (jei winner selected)

**Optional - Verify Contract**:
```bash
npx hardhat verify --network sepolia YOUR_ADDRESS "YOUR_SUBSCRIPTION_ID"
```

---

## 📊 Failai Kuriuos Turite

| Failas | Paskirtis | Statusas |
|--------|-----------|----------|
| `README.md` | Verslo aprašymas, setup | ✅ Pilnas |
| `SUMMARY.md` | Visa info viename faile | ✅ Done |
| `UZDUOTIES_VYKDYMAS.md` | Žingsnis po žingsnio | ✅ Done |
| `SEQUENCE_DIAGRAMS.md` | 4 diagramos | ✅ Done |
| `contracts/PredictionPool.sol` | Smart contract | ✅ Parašytas |
| `src/index.html` | Frontend UI | ✅ Parašytas |
| `src/app.js` | Web3 logika | 🟡 Reikia address |
| `.env` | Jūsų credentials | ❌ Reikia sukurti |

---

## 🎯 Jūsų Tikslas

```
┌──────────────────────────────────────────────────────┐
│  MINIMUM (8 balai):                                  │
│  ✓ Deploy į Sepolia                                  │
│  ✓ Test su bent 1 transaction                       │
│  ✓ Etherscan screenshots (3)                        │
│  ✓ Documentation (jau turite!)                      │
│                                                      │
│  TARGET (10+ balai):                                 │
│  ✓ Pilnas round cycle tested (20 players)          │
│  ✓ Multiple screenshots                            │
│  ✓ Contract verified                               │
│  ✓ Frontend improvements                           │
└──────────────────────────────────────────────────────┘
```

---

## ⏰ Laiko Planas

```
NOW          +30min        +45min      +1h         DONE
 │              │             │          │           │
 │              │             │          │           │
 ▼              ▼             ▼          ▼           ▼
Get          Deploy      Update &    Screenshots  Submit
Credentials  Contract    Test        & Verify     Project
            
Priorities:  ⚡⚡⚡       ⚡⚡⚡      ⚡⚡        ⚡
```

---

## 🆘 Problemos?

| Klaida | Sprendimas |
|--------|------------|
| "Insufficient funds" | Gauti daugiau ETH iš faucet |
| "Round is closed" | Laukti naujo raundo/testuoti su daugiau users |
| "Transaction failed" | Check Etherscan for error message |
| VRF neveikia | Patikrinti ar contract added as consumer |
| MetaMask nerodo | Patikrinti ar Sepolia network |

---

## 📞 Links (BOOKMARK THESE!)

**Must Have**:
- 🔑 Alchemy: https://www.alchemy.com/
- 💧 ETH Faucet: https://www.alchemy.com/faucets/ethereum-sepolia
- 🔗 VRF Dashboard: https://vrf.chain.link/
- 💎 LINK Faucet: https://faucets.chain.link/sepolia
- 🔍 Etherscan: https://sepolia.etherscan.io/

**Reference**:
- 📚 Your Docs: README.md, UZDUOTIES_VYKDYMAS.md
- 🎨 Diagrams: SEQUENCE_DIAGRAMS.md
- 📝 Summary: SUMMARY.md (this file extended)

---

## ✅ Final Checklist

```
DEPLOYMENT:
[ ] .env created and filled
[ ] Contract compiled successfully  
[ ] Contract deployed to Sepolia
[ ] Contract address saved
[ ] VRF consumer added

FRONTEND:
[ ] CONTRACT_ADDRESS updated in app.js
[ ] Frontend connects to MetaMask
[ ] Can enter round successfully
[ ] UI updates after transaction

DOCUMENTATION:
[ ] Etherscan screenshots taken (3-5)
[ ] Transaction logs reviewed
[ ] README.md complete (already ✓)
[ ] All files committed to GitHub

SUBMISSION:
[ ] GitHub repo updated
[ ] Screenshots included
[ ] Working demo (at least 1 round)
[ ] Ready to submit!
```

---

## 🎉 READY TO START?

```powershell
# 1. Sukurti .env
Copy-Item .env.example .env
notepad .env

# 2. Po užpildymo:
npx hardhat compile
npm run deploy

# That's it to start! Follow steps above ↑
```

---

## 💡 Pro Tips

1. **Test su draugais**: Pasidalink contract address, jie gali prisijungti su savo MetaMask
2. **Multiple rounds**: Kuo daugiau test raundų = geresnės screenshots
3. **Verify contract**: `npx hardhat verify` - duoda bonus points
4. **Video demo**: 30 sec screen recording = impressive
5. **GitHub Pages**: Deploy frontend → live demo URL!

---

## 🏆 Jūs Tai Padarysit!

Jūsų projektas **YRA GOTOV 70%**! 

Lieka:
- ⏱️ 1 valanda darbo
- ⏱️ 30 min credentials
- ⏱️ 30 min deploy & test

= **10+ balų garantuota!** 🎯✨

---

**Pradėkite nuo ŽINGSNIS 1 aukščiau! ⬆️**

Good luck! 🚀
