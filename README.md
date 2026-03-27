# Ticketeria CDMX

Bilingual README (Español + English) aligned with the current implementation.

---

## Español

### Qué es
Ticketeria CDMX es una dApp de ticketing cultural en Web3 para museos y recintos de Ciudad de Mexico, montada sobre Monad.

Modelo actual:
- Boletos NFT ERC1155 gratis (asistencia).
- Boletos NFT premium de pago en USDC.
- Precio local/internacional usando flujo CURP.

### Lo que ya está implementado
- Login/conexion con **Privy** desde el header (`Connect`).
- Flujo de passport en homepage:
  - Al conectar: muestra nombre mockeado **Donovan**.
  - Muestra total de NFTs en wallet.
  - Boton para mintear nuevos NFTs desde popup.
- Coleccion demo de **21 NFTs gratis** (7 museos x 3 tokenIds, IDs `101..121`).
- Popup de mint con:
  - Museos del carrusel.
  - Estado por museo (`x/3`) y estado por token (`Mint gratis`, `Ya en wallet`).
- Metadata demo para wallet con imagenes de museos en:
  - `packages/react-app/public/metadata`
  - Script generador: `packages/react-app/scripts/generate_museum_metadata.js`
- Onboarding CURP por wallet con persistencia local (`localStorage`).
- Página `/tickets` para flujo free + paid (`mintFree`, `mintPaid`, `approve` USDC).
- Página `/payments` demo (Stripe test + cripto demo) con UI tipo flip-card.
- Theme toggle y landing animada (escena con iPhone/perifericos + carousel de museos/blog).

### Contratos y red (testnet)
- Contrato principal: `TicketNFT1155` (ERC1155).
- Script Foundry (layout `contracts/`):  
  `contracts/script/DeployTicketNFT.s.sol`  
  Configura los 21 tokenIds gratis de demo.
- Script Hardhat para testnet (stack activo del repo):  
  `packages/hardhat/scripts/deployTicketNFT1155Testnet.js`
  - Despliega contrato o usa uno existente (`TICKETS_CONTRACT_ADDRESS`).
  - Configura los 21 tokens gratis (`101..121`).

### Variables de entorno clave

Frontend (`packages/react-app/.sample.env`):
- `REACT_APP_PRIVY_APP_ID`
- `REACT_APP_PROVIDER` (Monad testnet RPC)
- `REACT_APP_TICKETS_CONTRACT_ADDRESS`
- `REACT_APP_STRIPE_PUBLISHABLE_KEY`
- `REACT_APP_STRIPE_PRICE_IDS_MX`
- `REACT_APP_STRIPE_PRICE_IDS_INTL`
- `REACT_APP_CRYPTO_RECEIVER`

Deploy (`packages/hardhat/example.env`):
- `MONAD_RPC_URL=https://testnet-rpc.monad.xyz`
- `DEPLOYER_PRIVATE_KEY=`
- `USDC_ADDRESS=`
- `TICKETS_CONTRACT_ADDRESS=` (opcional, para reusar contrato)
- `BASE_URI=https://api.ticketeria.xyz/metadata/{id}.json`

### Comandos útiles

Instalar:
```bash
yarn install
```

Levantar app:
```bash
yarn dev
```

Build frontend:
```bash
cd packages/react-app
npm run build
```

Compilar contratos Hardhat:
```bash
cd packages/hardhat
npm run compile
```

Deploy/Setup 21 NFTs en Monad testnet (Hardhat):
```bash
cd packages/hardhat
npm run deploy:monad:testnet
```

Deploy con Foundry (si usas el workspace `contracts/`):
```bash
cd contracts
forge script script/DeployTicketNFT.s.sol:DeployTicketNFT \
  --rpc-url $MONAD_RPC_URL \
  --broadcast -vvvv
```

Generar metadata de museos:
```bash
cd packages/react-app
node scripts/generate_museum_metadata.js
```

### Estructura principal
- `packages/react-app/src/views/Home.jsx` -> landing + passport + popup mint.
- `packages/react-app/src/views/Tickets.jsx` -> tickets free/pago on-chain.
- `packages/react-app/src/views/Payments.jsx` -> demo de pagos.
- `packages/react-app/src/components/CurpOnboardingModal.jsx` -> CURP onboarding.
- `packages/react-app/src/hooks/useTicketContract.js` -> contratos tickets/USDC.
- `contracts/src/TicketNFT1155.sol` -> contrato Foundry.
- `contracts/script/DeployTicketNFT.s.sol` -> deploy/config 21 NFTs (Foundry).
- `packages/hardhat/contracts/TicketNFT1155.sol` -> contrato en stack Hardhat.
- `packages/hardhat/scripts/deployTicketNFT1155Testnet.js` -> deploy testnet + setup.

### Notas
- Stripe está en modo demo/test (no productivo).
- CURP valida formato (regex), no consulta RENAPO.
- Opciones de social login de Privy dependen de la configuracion del dashboard de tu app.
- No expongas secretos backend en frontend (por ejemplo Privy App Secret).

---

## English

### What it is
Ticketeria CDMX is a Web3 cultural ticketing dApp for museums and venues in Mexico City, running on Monad.

Current model:
- Free ERC1155 NFT tickets (attendance proof).
- Paid premium NFT tickets in USDC.
- Local vs international pricing through CURP flow.

### What is already implemented
- **Privy** login/connect from header (`Connect`).
- Homepage passport flow:
  - After connect: shows mock user name **Donovan**.
  - Shows total NFTs in wallet.
  - Lets user mint new NFTs from a popup.
- Demo collection of **21 free NFTs** (7 museums x 3 tokenIds, IDs `101..121`).
- Mint popup with:
  - Carousel museums.
  - Per-museum ownership (`x/3`) and per-token state.
- Demo wallet metadata/images in:
  - `packages/react-app/public/metadata`
  - generator script: `packages/react-app/scripts/generate_museum_metadata.js`
- Wallet-level CURP onboarding with local storage persistence.
- `/tickets` page for free + paid flows (`mintFree`, `mintPaid`, USDC `approve`).
- `/payments` demo page (Stripe test + demo crypto) with flip-card UI.
- Theme toggle and animated landing (iPhone/peripherals scene + museum carousel/blog).

### Contracts and network (testnet)
- Main contract: `TicketNFT1155` (ERC1155).
- Foundry script (in `contracts/` layout):  
  `contracts/script/DeployTicketNFT.s.sol`  
  Configures all 21 free demo tokenIds.
- Hardhat script for testnet (active stack in this repo):  
  `packages/hardhat/scripts/deployTicketNFT1155Testnet.js`
  - Deploys new contract or attaches existing one (`TICKETS_CONTRACT_ADDRESS`).
  - Configures the 21 free tokenIds (`101..121`).

### Key environment variables

Frontend (`packages/react-app/.sample.env`):
- `REACT_APP_PRIVY_APP_ID`
- `REACT_APP_PROVIDER` (Monad testnet RPC)
- `REACT_APP_TICKETS_CONTRACT_ADDRESS`
- `REACT_APP_STRIPE_PUBLISHABLE_KEY`
- `REACT_APP_STRIPE_PRICE_IDS_MX`
- `REACT_APP_STRIPE_PRICE_IDS_INTL`
- `REACT_APP_CRYPTO_RECEIVER`

Deploy (`packages/hardhat/example.env`):
- `MONAD_RPC_URL=https://testnet-rpc.monad.xyz`
- `DEPLOYER_PRIVATE_KEY=`
- `USDC_ADDRESS=`
- `TICKETS_CONTRACT_ADDRESS=` (optional, reuse contract)
- `BASE_URI=https://api.ticketeria.xyz/metadata/{id}.json`

### Useful commands

Install:
```bash
yarn install
```

Run app:
```bash
yarn dev
```

Frontend build:
```bash
cd packages/react-app
npm run build
```

Hardhat compile:
```bash
cd packages/hardhat
npm run compile
```

Deploy/setup 21 NFTs on Monad testnet (Hardhat):
```bash
cd packages/hardhat
npm run deploy:monad:testnet
```

Deploy with Foundry (if you use the `contracts/` workspace):
```bash
cd contracts
forge script script/DeployTicketNFT.s.sol:DeployTicketNFT \
  --rpc-url $MONAD_RPC_URL \
  --broadcast -vvvv
```

Generate museum metadata:
```bash
cd packages/react-app
node scripts/generate_museum_metadata.js
```

### Main structure
- `packages/react-app/src/views/Home.jsx` -> landing + passport + mint popup.
- `packages/react-app/src/views/Tickets.jsx` -> on-chain free/paid ticket minting.
- `packages/react-app/src/views/Payments.jsx` -> payments demo.
- `packages/react-app/src/components/CurpOnboardingModal.jsx` -> CURP onboarding.
- `packages/react-app/src/hooks/useTicketContract.js` -> ticket/USDC contract hooks.
- `contracts/src/TicketNFT1155.sol` -> Foundry contract.
- `contracts/script/DeployTicketNFT.s.sol` -> Foundry deploy/setup 21 NFTs.
- `packages/hardhat/contracts/TicketNFT1155.sol` -> Hardhat contract.
- `packages/hardhat/scripts/deployTicketNFT1155Testnet.js` -> testnet deploy/setup.

### Notes
- Stripe is demo/test mode only.
- CURP check is format-only (regex), not official RENAPO verification.
- Privy social login options depend on your app settings in Privy dashboard.
- Never expose backend secrets in frontend env files (e.g. Privy App Secret).
