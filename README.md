# BidForge: Decentralized Real-Time English Auction Protocol

BidForge is an ultra-premium, production-ready decentralized English Auction DApp designed for real-time Web3 physical collectibles, virtual node licenses, and digital assets. It features responsive 60 FPS motion transitions, a dual-mode wallet bridge (supporting real extensions and an immersive in-browser Virtual EVM Sandbox), and secure Solidity smart contracts leveraging the pull-payments design.

---

## 🚀 Key Features

* **Dual-Mode Web3 Provider Integration**:
  * **Real Wallet Mode**: Seamlessly detects and binds with MetaMask, Rabby, and Coinbase Wallet using `ethers.js` v6 on the Sepolia testnet.
  * **Virtual DevNet Sandbox Mode**: An active client-side blockchain client that mocks transaction signing, blocks generation, gas limits, and faucets right in the sandbox preview frame.
* **On-Chain Real-Time Synchronicity**: Real-time event listeners trace smart contract triggers (bidding, creation, settlements), instantly shifting state without page reloads.
* **Competition Whale Simulator**: A developer utility that allows you to trigger automated outbid sequences from virtual competitor accounts, testing winning bid mechanics, toast alerts, and interactive particle canvas confetti!
* **Pull-Payment Claims Hub**: Integrated claims desk implementing the Secure Pull Payments pattern to safeguard refundable funds against Denial-of-Service and reentrancy loops.
* **Diagnostics Ledger Log**: A simulated Etherscan portal mapping all blocks produced, gas burned, and method states (`placeBid`, `createAuction`, `withdraw`).
* **Responsive Fluid Design**: Clean, modern dark mode interfaces featuring collapsible side navigation for desktops and bottom action tabs for mobile touch targets.

---

## 🛠️ Tech Stack

### Frontend Portal
* **React 19 & TypeScript**: Strict typing and modern hook-based components.
* **Tailwind CSS v4**: Utility-first styling with pre-configured display fonts ("Space Grotesk") and monospaced diagnostic layouts.
* **Motion (by Framer Motion)**: Smooth, fluid canvas physics, stagger transitions, scale reveals, and particle animations.
* **Ethers.js v6**: Decentralized JSON-RPC contract connections.
* **React Hot Toast**: Real-time mempool alerts and outbid soundless toasts.

### Blockchain Core (Hardhat Project)
* **Solidity v0.8.20**: Fully checked, reentrancy-guarded smart contract code.
* **Hardhat**: Compile, test, and deploy automation.
* **Chai / Mocha**: High-coverage smart contract unit testing.

---

## 📁 Repository Structure

```text
bidforge-dapp/
├── contracts/
│   └── Auction.sol          # Solidity Smart Contract
├── scripts/
│   └── deploy.js            # Hardhat deployment automation script
├── test/
│   └── Auction.test.js      # Smart contract Mocha/Chai unit tests
├── src/
│   ├── components/          # Reusable glassmorphic UI items
│   │   ├── AuctionCard.tsx  # Interactive bidding catalog card
│   │   ├── BidModal.tsx     # Enter bid, estimate gas, confirm
│   │   ├── EmptyState.tsx   # Informational fallback state item
│   │   ├── Footer.tsx       # Standard clean terminal footer
│   │   ├── Navbar.tsx       # Top bar, Faucet link, wallet details
│   │   ├── Sidebar.tsx      # Desktop side menu & node diagnostics
│   │   └── WalletModal.tsx  # Select Metamask, Rabby, or Virtual Sand
│   ├── context/
│   │   └── Web3Context.tsx  # Heart of DApp: real & virtual Web3 bridges
│   ├── pages/               # Primary viewport routers
│   │   ├── Home.tsx         # Headline landing, specs, and volume logs
│   │   ├── Marketplace.tsx  # Filterable grid catalog
│   │   ├── AuctionDetails.tsx # Detail specs, price graph, whale triggers
│   │   ├── CreateAuction.tsx # Form to list and deploy auctions
│   │   ├── MyAuctions.tsx   # Seller dashboard & Pull claim desk
│   │   └── BlockExplorer.tsx # Diagnostic Etherscan logs table
│   ├── App.tsx              # Page orchestration & Toaster
│   ├── index.css            # Google Fonts & Tailwind imports
│   └── main.tsx             # Entry bundle
├── hardhat.config.cjs       # Solidity compile and network directives
├── metadata.json            # AI Studio app manifest
├── tsconfig.json            # Strict TypeScript settings
├── vite.config.ts           # Bundler optimizations
└── README.md                # General documentation
```

---

## ⚙️ Setup and Installation

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Create a `.env` file based on `.env.example`:
```bash
cp .env.example .env
```

---

## 🏗️ Compile, Test, & Deploy Smart Contracts

### Compile solidity code:
```bash
npx hardhat compile
```

### Run contract tests:
```bash
npx hardhat test
```

### Deploy to Sepolia Testnet:
Ensure you configure `RPC_URL` and `PRIVATE_KEY` in your `.env`.
```bash
npx hardhat run scripts/deploy.js --network sepolia
```

---

## 🖥️ Running the Application

### Launch Dev Server:
```bash
npm run dev
```
The application will launch on `http://localhost:3000`.

### Build for Production:
```bash
npm run build
```

---

## 🔐 Security Engineering Details

* **Reentrancy Protection**: Integrated a secure standard `ReentrancyGuard` blocking double-entry loops on both bidding (`placeBid`) and payout retrievals (`withdraw`).
* **Sellers Bidding Guard**: Hard contract rule `require(msg.sender != auction.seller)` guarantees sellers cannot artificially inflate their own items.
* **Pull payments Pattern**: No automated direct transfers are executed when users are outbid. Outbid assets are mapped to a local returns ledger, safeguarding the system from contract execution locking.

---

## 💳 Wallet Configuration (MetaMask Setup)

To test on Sepolia Testnet:
1. Open your **MetaMask Extension**.
2. Navigate to **Settings** > **Advanced** > Toggle **Show test networks** to **ON**.
3. Select **Sepolia Testnet** from the network selector dropdown.
4. Acquire Sepolia ETH from standard faucets (e.g., Google Cloud Sepolia Faucet or Infura Faucet) to cover gas and bids.

*Inside the preview iframe where extensions are sandboxed, choose **Virtual Sandbox (DevNet)** from the Connect Wallet modal to play instantly with 5,000 pre-funded ETH and responsive multi-user simulators!*

---

## 📄 License
This project is licensed under the MIT License - see the LICENSE details for permissions.
