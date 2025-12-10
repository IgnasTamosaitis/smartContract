# Prediction Pool Roulette - Decentralizuota Loterijos Aplikacija

## Verslo Modelio Aprašymas

### Pagrindiniai Veikėjai

1. **Žaidėjai (Players)** - asmenys, norintys dalyvauti loterijoje ir laimėti prizą
2. **Platformos Valdytojas (Platform Owner)** - išmaniosios sutarties savininkas, gaunantis platformos mokestį
3. **Chainlink VRF Oracle** - decentralizuotas atsitiktinių skaičių generatorius, užtikrinantis sąžiningą laimėtojo pasirinkimą

### Verslo Logika

Tai decentralizuota loterijos sistema, kur:

- Žaidėjai sumoka fiksuotą įnašą (0.01 ETH) norėdami dalyvauti raunde
- Kai pasiekiamas maksimalus žaidėjų skaičius (20), raundas uždaromas
- Chainlink VRF v2 Sepolia tinkle generuoja patikrintą atsitiktinį skaičių
- Išmanioji sutartis pasirenka vieną laimėtoją ir automatingai perveda jam prizą
- Platformos valdytojas gauna 5% mokestį
- Naujas raundas automatiškai prasideda

### Privalumai prieš tradicinę loteriją

- **Skaidrumas**: visi sandoriai matomi blockchain'e
- **Saugumas**: niekas negali manipuliuoti rezultatų
- **Automatizacija**: laimėjimai išmokami automatingai
- **Decentralizacija**: nereikia pasitikėti trečiąja šalimi

## Sequence Diagram - Tipiniai Scenarijai

### Scenarijus 1: Žaidėjas prisijungia prie raundo

```
Žaidėjas → MetaMask: Prisijungti prie tinklo
MetaMask → Ethereum: Patvirtinti paskyrą
Žaidėjas → Frontend: Spausti "Enter Round"
Frontend → Smart Contract: enterRound() + 0.01 ETH
Smart Contract → Smart Contract: Patikrinti, ar raundas atidarytas
Smart Contract → Smart Contract: Patikrinti mokėjimo sumą
Smart Contract → Smart Contract: Pridėti žaidėją į sąrašą
Smart Contract → Frontend: Įvykis RoundEntered
Frontend → Žaidėjas: Patvirtinimas ekrane
```

### Scenarijus 2: Raundas užpildomas ir laimėtojas pasirenkamas

```
Paskutinis Žaidėjas → Smart Contract: enterRound() (20-tas žaidėjas)
Smart Contract → Smart Contract: Patikrinti, ar pasiektas maxPlayers
Smart Contract → Smart Contract: Uždaryti raundą
Smart Contract → Chainlink VRF: requestRandomWords()
Chainlink VRF → Blockchain: Generuoti atsitiktinį skaičių
Chainlink VRF → Smart Contract: fulfillRandomWords(randomNumber)
Smart Contract → Smart Contract: Apskaičiuoti laimėtoją (randomNumber % playerCount)
Smart Contract → Smart Contract: Apskaičiuoti prizą (pool - platformFee)
Smart Contract → Laimėtojas: Transfer prizas
Smart Contract → Platformos Valdytojas: Transfer mokestis
Smart Contract → Frontend: Įvykis WinnerSelected
Smart Contract → Smart Contract: Atidaryti naują raundą
Frontend → Visi Žaidėjai: Rodyti laimėtoją
```

### Scenarijus 3: Žaidėjas peržiūri savo istoriją

```
Žaidėjas → Frontend: Peržiūrėti istoriją
Frontend → Smart Contract: getPlayerRounds(address)
Smart Contract → Frontend: Grąžinti raundų sąrašą
Frontend → Smart Contract: getRoundInfo(roundId) kiekvienam raundui
Smart Contract → Frontend: Raundo informacija
Frontend → Žaidėjas: Rodyti istorijos lentelę
```

## Tech Stack

- **Smart Contract**: Solidity 0.8.20
- **Blockchain**: Ethereum Sepolia Testnet
- **Oracle**: Chainlink VRF v2 (Sepolia)
- **Development Framework**: Hardhat
- **Frontend**: HTML/CSS/JavaScript
- **Web3 Library**: ethers.js v6
- **Wallet**: MetaMask

## Projekto Struktūra

```
smartContract/
├── contracts/          # Išmaniosios sutartys
│   └── PredictionPool.sol
├── scripts/           # Deployment scriptai
│   └── deploy.js
├── src/              # Frontend failai
│   ├── index.html
│   ├── app.js
│   └── style.css
├── .env.example      # Aplinkos kintamųjų pavyzdys
├── hardhat.config.js # Hardhat konfigūracija
└── package.json      # Node.js priklausomybės
```

## Setup ir Diegimas

### 1. Įdiekite priklausomybes

```bash
npm install
```

### 2. Sukurkite .env failą

Nukopijuokite `.env.example` į `.env` ir užpildykite reikšmes:

```bash
cp .env.example .env
```

Reikalingi parametrai:

- **SEPOLIA_RPC_URL**: Gaukite iš https://www.alchemy.com/ arba https://infura.io/
- **PRIVATE_KEY**: Jūsų MetaMask wallet private key (pradeda 0x)
- **VRF_SUBSCRIPTION_ID**: Chainlink VRF subscription ID iš https://vrf.chain.link/

### 3. Gaukite Sepolia Test ETH

Naudokite vieną iš šių faucet'ų:

- https://www.alchemy.com/faucets/ethereum-sepolia (rekomenduojama)
- https://cloud.google.com/application/web3/faucet/ethereum/sepolia
- https://faucet.quicknode.com/ethereum/sepolia

### 4. Sukurkite Chainlink VRF Subscription

1. Eikite į https://vrf.chain.link/
2. Prisijunkite su MetaMask (Sepolia network)
3. Spauskite "Create Subscription"
4. Gaukite LINK tokens: https://faucets.chain.link/sepolia
5. Fund subscription su LINK (minimum 2-5 LINK)
6. Nukopijuokite Subscription ID į `.env` failą

### 5. Kompiliuokite Smart Contract

```bash
npx hardhat compile
```

### 6. Deploy į Sepolia Testnet

```bash
npm run deploy
```

Išsaugokite contract address, kurį pamatysite console!

### 7. Pridėkite Contract kaip VRF Consumer

1. Grįžkite į https://vrf.chain.link/
2. Atidarykite savo subscription
3. Spauskite "Add Consumer"
4. Įveskite deployed contract address

### 8. Atnaujinkite Frontend

Atidarykite `src/app.js` ir pakeiskite:

```javascript
const CONTRACT_ADDRESS = "YOUR_DEPLOYED_CONTRACT_ADDRESS";
```

Į tikrą address, kurį gavote deploying.

### 9. Paleiskite Frontend

Paprasčiausiai atidarykite `src/index.html` naršyklėje arba naudokite live server:

```bash
# Įdiekite live-server globaliai (jei neturite)
npm install -g live-server

# Paleiskite iš src katalogo
cd src
live-server
```

## Testavimas

### Lokaliame Tinkle (Ganache alternative)

```bash
# Paleiskite local Ethereum node
npx hardhat node

# Kitame terminale deploy į local network
npx hardhat run scripts/deploy.js --network localhost
```

**Pastaba**: Chainlink VRF neveiks lokaliame tinkle. Reikia sukurti mock contract arba naudoti Sepolia.

### Sepolia Testnet (Rekomenduojama)

1. Įsitikinkite, kad turite Sepolia ETH
2. Deploy su `npm run deploy`
3. Pridėkite contract kaip VRF consumer
4. Atidarykite frontend ir testuokite

## Etherscan Verification ir Logs

### 1. Peržiūrėkite Contract Etherscan'e

Po deployment eikite į:

```
https://sepolia.etherscan.io/address/YOUR_CONTRACT_ADDRESS
```

### 2. Peržiūrėkite Transactions

- Spauskite "Transactions" tab
- Matysite visus `enterRound()` ir kitus kvietimus

### 3. Peržiūrėkite Events/Logs

- Spauskite ant bet kurios transakcijos
- Spauskite "Logs" tab
- Matysite emitted events (RoundEntered, WinnerSelected, etc.)

### 4. Verify Contract (Optional bet rekomenduojama)

```bash
npx hardhat verify --network sepolia YOUR_CONTRACT_ADDRESS "VRF_SUBSCRIPTION_ID"
```

Po verification galėsite:

- Skaityti contract code Etherscan'e
- Naudoti "Read Contract" ir "Write Contract" funkcijas
- Matyti dekompiliuotą kodą

## Frontend Funkcionalumas

### Pagrindinės Funkcijos

1. **Connect Wallet** - Prisijungti su MetaMask
2. **Enter Round** - Prisijungti prie aktyvaus raundo
3. **View Current Round** - Matyti aktyvų raundą, žaidėjų skaičių, pool dydį
4. **View History** - Matyti savo dalyvavimo istoriją
5. **View Past Winners** - Matyti praėjusių raundų laimėtojus

### Išplėstas Funkcionalumas (Papildomam Balui)

Galite pridėti:

- 📊 **Statistics Dashboard** - grafikai su apyvartos statistika
- 🎨 **Improved Design** - modernus UI/UX su animacijomis
- 📱 **Mobile Responsive** - pritaikytas mobiliems įrenginiams
- 🔔 **Notifications** - real-time pranešimai apie naujus raundus/laimėtojus
- 👤 **Player Profiles** - žaidėjo statistika (total played, won, etc.)
- 🏆 **Leaderboard** - daugiausiai laimėjusių žaidėjų sąrašas
- 💬 **Chat/Comments** - žaidėjų bendravimas
- 🌐 **Multi-language** - lietuvių/anglų kalbos

## Kaip Gauti Papildomus Balus

✅ **Verslo Modelio Aprašymas (iki +0.5 balo)**:

- ✓ Aiškiai aprašyti veikėjai
- ✓ Sequence diagramos
- ✓ Verslo logikos paaiškinimas

✅ **Išplėstas Frontend (iki +1 balo)**:

- Modernūs dizainas su CSS framework (Bootstrap/Tailwind)
- Real-time updates su WebSocket arba polling
- Grafikai ir statistika (Chart.js)
- Responsive design
- Animacijos ir transitions
- Error handling ir loading states

## Saugumas

⚠️ **SVARBU**:

- **NIEKADA** nedarykite commit `.env` failo į Git
- **NIEKADA** nesidalinkite savo PRIVATE_KEY
- Naudokite test wallet su tik test ETH
- `.env` jau pridėtas į `.gitignore`

## Troubleshooting

### Contract nepriima enterRound()

- Patikrinkite, ar raundas atidarytas
- Patikrinkite, ar siunčiate teisingą sumą (0.01 ETH)
- Patikrinkite, ar neviršijate maxPlayers

### VRF neveikia

- Įsitikinkite, kad subscription funded su LINK
- Įsitikinkite, kad contract pridėtas kaip consumer
- Palaukite 2-3 blokus po requestRandomWords()

### MetaMask nepatvirtina transakcijų

- Patikrinkite, ar esate Sepolia network
- Patikrinkite, ar turite pakankamai Sepolia ETH gas'ui
- Pabandykite reset MetaMask account (Settings > Advanced > Reset Account)

## Papildoma Informacija

### Gas Costs (Sepolia)

- Deploy: ~2-3M gas
- enterRound(): ~50-70k gas
- requestRandomWords(): ~200k gas
- fulfillRandomWords(): ~100-150k gas

### Blockchain Explorers

- Sepolia Etherscan: https://sepolia.etherscan.io/
- Chainlink VRF Dashboard: https://vrf.chain.link/

## Licencija

MIT

## Autorius

Sukurta kaip Blockchain kurso projektas
