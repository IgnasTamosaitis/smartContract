# Užduoties Vykdymo Instrukcija - Žingsnis po Žingsnio

## ✅ Jau Padaryta

- ✅ Pasirinktas verslo modelis: **Decentralizuota Loterijos Sistema**
- ✅ Sukurta išmanioji sutartis `PredictionPool.sol`
- ✅ Sukurtas frontend `src/index.html`, `src/app.js`
- ✅ Įdiegti visi dependencies (`npm install`)

## 📋 Ką Dar Reikia Padaryti

### 1. Aprašymas GitHub ✍️

**Statusas**: Padaryta! Peržiūrėkite `README.md`

README.md jau turi:

- ✅ Verslo modelio aprašymą
- ✅ Pagrindinius veikėjus
- ✅ Sequence diagramas (3 scenarijai)
- ✅ Tech stack aprašymą
- ✅ Setup instrukcijas

**Galite papildyti**:

- Pridėti vizualią sequence diagramą (naudokite https://mermaid.live/ arba draw.io)
- Pridėti screenshot'ų iš frontend'o

### 2. Gauti Test Credentials 🔑

**Reikia gauti**:

#### a) Sepolia RPC URL

1. Eikite į https://www.alchemy.com/
2. Sign Up / Log In
3. Create New App:
   - Network: Ethereum
   - Chain: Sepolia
4. Nukopijuokite HTTPS URL
5. Įdėkite į `.env` kaip `SEPOLIA_RPC_URL`

#### b) Private Key iš MetaMask

1. Atidarykite MetaMask
2. Pasirinkite test account (NIEKADA naudokite mainnet wallet!)
3. Menu (3 dots) → Account Details → Show Private Key
4. Įveskite password ir copy
5. Įdėkite į `.env` kaip `PRIVATE_KEY=0x...`

#### c) Sepolia Test ETH

1. Eikite į https://www.alchemy.com/faucets/ethereum-sepolia
2. Prisijunkite su Alchemy account
3. Įveskite savo wallet address
4. Gaukite 0.5 Sepolia ETH

**Patikrinimas**: Atidarykite MetaMask ir patikrinkite balansą Sepolia network.

#### d) Chainlink VRF Subscription

1. Eikite į https://vrf.chain.link/
2. Prisijunkite su MetaMask (switch to Sepolia!)
3. Create Subscription
4. Eikite į https://faucets.chain.link/sepolia
5. Gaukite 10 LINK tokens
6. Fund subscription su 5 LINK
7. Nukopijuokite Subscription ID
8. Įdėkite į `.env` kaip `VRF_SUBSCRIPTION_ID`

### 3. Sukurti .env failą 📄

```bash
# PowerShell
Copy-Item .env.example .env
```

Atidaryti `.env` ir užpildyti:

```
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_KEY_HERE
PRIVATE_KEY=0xYOUR_PRIVATE_KEY_HERE
VRF_SUBSCRIPTION_ID=12345
```

### 4. Compile Smart Contract 🔨

```bash
npx hardhat compile
```

**Tikimasi output**:

```
Compiled 1 Solidity file successfully
```

### 5. Deploy į Sepolia Testnet 🚀

```bash
npm run deploy
```

**SVARBU**: Išsaugokite contract address! Bus panašus į:

```
PredictionPool deployed to: 0x1234567890abcdef1234567890abcdef12345678
```

### 6. Pridėti Contract kaip VRF Consumer ➕

1. Grįžti į https://vrf.chain.link/
2. Atidaryti savo subscription
3. Tabs → Consumers
4. Add Consumer
5. Paste contract address iš 5-to žingsnio
6. Confirm transaction MetaMask'e

### 7. Atnaujinti Frontend ⚙️

Atidaryti `src/app.js` ir pakeisti eilutę ~6:

```javascript
const CONTRACT_ADDRESS = "0x1234..."; // Įdėti tikrą address
```

### 8. Testuoti Lokaliame Tinkle (Optional) 🧪

**Pastaba**: Chainlink VRF neveiks lokaliame tinkle!

Terminal 1:

```bash
npx hardhat node
```

Terminal 2:

```bash
npx hardhat run scripts/deploy.js --network localhost
```

### 9. Testuoti Sepolia Tinkle ✅

1. Atidarykite `src/index.html` naršyklėje
2. Spauskite "Connect Wallet"
3. MetaMask: Pasirinkite Sepolia network
4. Spauskite "Enter Current Round"
5. MetaMask: Confirm transaction
6. Laukite ~15 sek
7. Refresh ir matysite updated round info

**Testuoti su draugais**:

- Pasidalinkite contract address
- Jie gali naudoti tą patį frontend
- Kai 20 žmonių prisijungs, automatiškai bus išrinktas laimėtojas

### 10. Peržiūrėti Etherscan Logs 📊

#### Po kiekvienos transakcijos:

1. Eikite į: `https://sepolia.etherscan.io/address/JUSU_CONTRACT_ADDRESS`
2. Tabs:
   - **Transactions**: Visos transakcijos
   - **Events**: Emitted events (RoundEntered, WinnerSelected)
   - **Contract**: Source code (po verification)

#### Peržiūrėti konkretų transaction:

1. Spauskite ant transaction hash
2. Matysite:
   - From/To addresses
   - Value (ETH amount)
   - Gas used
   - Logs tab → event details

#### Screenshot'ai užduočiai:

Padarykite screenshot'us:

- ✅ Transaction details
- ✅ Logs/Events
- ✅ Contract code (po verification)
- ✅ Internal transactions (prize distribution)

### 11. Verify Contract Etherscan'e (Rekomenduojama) ✓

```bash
npx hardhat verify --network sepolia YOUR_CONTRACT_ADDRESS "YOUR_SUBSCRIPTION_ID"
```

Po verification galėsite:

- Matyti source code Etherscan'e
- Naudoti "Read Contract" functions
- Naudoti "Write Contract" functions be frontend'o

### 12. Pagerintas Frontend (Papildomam Balui) ⭐

**Minimalus papildymas** (+0.5 balo):

- Responsive design (mobile friendly)
- Loading indicators
- Error messages
- Better styling su CSS

**Maksimalus papildymas** (+1 balas):

- Dashboard su statistika (Chart.js)
- Player leaderboard
- Transaction history table
- Real-time updates
- Animations
- Multi-language (LT/EN)

**Įdiekite Chart.js** (jei norite):

```html
<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
```

## 📸 Ką Reikia Įkelti į GitHub

1. **README.md** - ✅ Jau turite
2. **Contracts/** - ✅ Jau turite
3. **Scripts/** - ✅ Jau turite
4. **Frontend (src/)** - ✅ Jau turite
5. **Screenshots/** (sukurkite naują folderį):

   - Contract Etherscan view
   - Transaction logs
   - Events/Logs
   - Frontend screenshots
   - MetaMask transactions

6. **.env.example** - ✅ Jau turite (NIEKADA ne .env!)

## 🎯 Checklist Prieš Pateikiant

- [ ] README.md su verslo modelio aprašymu
- [ ] Sequence diagrams README.md
- [ ] Smart contract sukompiliuotas
- [ ] Smart contract deployed į Sepolia
- [ ] Contract address įrašytas frontend'e
- [ ] Frontend veikia ir connected su MetaMask
- [ ] Išbandytas full flow (enter round → winner selection)
- [ ] Etherscan screenshot'ai
- [ ] Transaction logs peržiūrėti
- [ ] Events/Logs dokumentuoti
- [ ] Git commit'ai su clear messages
- [ ] .env NĖRA commit'intas

## 🏆 Vertinimo Kriterijai

| Kriterijus                           | Balai      | Jūsų Statusas       |
| ------------------------------------ | ---------- | ------------------- |
| Kitas (ne pavyzdinis) verslo modelis | iki 3      | ✅ Turite           |
| Kokybiškas aprašymas                 | +0.5       | ✅ Turite           |
| Smart contract veikia                | 3          | 🔄 Reikia deploy    |
| Testas lokaliame tinkle              | 1          | 🔄 Optional         |
| Testas Sepolia tinkle                | 1          | 🔄 Reikia padaryti  |
| Etherscan logs peržiūra              | 0.5        | 🔄 Po deploy        |
| Frontend aplikacija                  | 2          | ✅ Turite           |
| Išplėstas funkcionalumas             | +1         | 🔄 Galite pagerinti |
| **MAXIMUM**                          | **8-11.5** | **Target: 10+**     |

## ⚡ Quick Start (Jei Turite Credentials)

```bash
# 1. Sukurti .env
Copy-Item .env.example .env
# Užpildyti .env su credentials

# 2. Compile
npx hardhat compile

# 3. Deploy
npm run deploy
# Išsaugoti contract address!

# 4. Pridėti VRF consumer
# Eiti į vrf.chain.link → Add Consumer → Paste address

# 5. Update frontend
# Redaguoti src/app.js → CONTRACT_ADDRESS

# 6. Test
# Atidaryti src/index.html naršyklėje
```

## 🆘 Pagalba

Jei kyla problemų:

1. Patikrinkite, ar turite Sepolia ETH
2. Patikrinkite, ar MetaMask Sepolia network
3. Patikrinkite console errors (F12)
4. Patikrinkite Etherscan transaction status
5. Perskaitykite README.md Troubleshooting sekciją

## 📞 Kontaktai ir Šaltiniai

- Ethereum Sepolia Faucet: https://www.alchemy.com/faucets/ethereum-sepolia
- Chainlink VRF: https://vrf.chain.link/
- Chainlink LINK Faucet: https://faucets.chain.link/sepolia
- Sepolia Etherscan: https://sepolia.etherscan.io/
- Hardhat Docs: https://hardhat.org/docs
- Solidity Docs: https://docs.soliditylang.org/

---

**Sėkmės! 🚀**
