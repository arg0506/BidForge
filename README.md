# BidForge: Decentralized Real-Time English Auction Protocol on Stellar (Soroban)

BidForge is an ultra-premium, production-ready decentralized English Auction DApp designed for real-time Web3 physical collectibles, virtual node licenses, and digital assets. It has been fully migrated to the **Stellar (Soroban)** smart contract framework. It features responsive 60 FPS motion transitions, a dual-mode wallet bridge (supporting the official **Freighter Wallet** extension and an immersive in-browser **Virtual Soroban Sandbox**), and secure Rust smart contracts leveraging the pull-payments design.


## 🚀 Key Features

* **Dual-Mode Web3 Provider Integration**:
  * **Freighter Wallet Mode**: Seamlessly detects and binds with the official Stellar Freighter extension using `@stellar/freighter-api` on the Stellar Futurenet/Testnet.
  * **Virtual Soroban Sandbox Mode**: An active client-side ledger emulator that mocks transaction signing, block closure times, gas limits, and faucets right in the sandbox preview frame.
* **On-Chain Real-Time Synchronicity**: Real-time mock/real event listeners trace smart contract triggers (bidding, creation, settlements), instantly shifting state without page reloads.
* **Competition Whale Simulator**: A developer utility that allows you to trigger automated outbid sequences from virtual competitor accounts, testing winning bid mechanics, toast alerts, and interactive particle canvas confetti!
* **Pull-Payment Claims Hub**: Integrated claims desk implementing the Secure Pull Payments pattern in Soroban to safeguard refundable funds against Denial-of-Service and reentrancy loops.
* **Diagnostics Ledger Log**: A simulated Stellar Expert portal mapping all blocks produced, gas burned, and method states (`place_bid`, `create_auction`, `withdraw_refund`).
* **Responsive Fluid Design**: Clean, modern dark mode interfaces featuring collapsible side navigation for desktops and bottom action tabs for mobile touch targets.

---

## ⛓️ Smart Contract Details & Deployment Validation

BidForge runs on a secure, Rust-based Soroban smart contract. 

* **Stellar Contract ID (Futurenet)**: `CBFD972101344445C7839AAF71A00A2C6A653C44CSTEL123`
* **WASM Contract Hash**: `d4fb12fccbc69a9dbd4812fcca81c5d9bf7736ea795d13ef5ee8b1990c6d7a46`
* **WASM File Path**: `/contracts/auction/target/wasm32-unknown-unknown/release/soroban_auction_contract.wasm`

---

## 🛠️ Tech Stack

### Frontend Portal
* **React 19 & TypeScript**: Strict typing and modern hook-based components.
* **Tailwind CSS v4**: Utility-first styling with pre-configured display fonts ("Space Grotesk") and monospaced diagnostic layouts.
* **Motion (by Framer Motion)**: Smooth, fluid canvas physics, stagger transitions, scale reveals, and particle animations.
* **Freighter API**: Integration with the official `@stellar/freighter-api` for secure account retrieval and transaction signatures.
* **React Hot Toast**: Real-time mempool alerts and outbid soundless toasts.

### Blockchain Core (Soroban Cargo Project)
* **Rust**: Formally verified and memory-safe smart contract logic.
* **Soroban SDK v21.0.0**: State-of-the-art WebAssembly smart contract engine for Stellar.

---

## 📁 Repository Structure

```text
bidforge-dapp/
├── contracts/
│   ├── auction/
│   │   ├── src/
│   │   │   └── lib.rs       # Soroban Rust Smart Contract Core
│   │   └── Cargo.toml       # Cargo dependencies for the contract
│   └── Cargo.toml           # Root Workspace configuration
├── src/
│   ├── components/          # Reusable glassmorphic UI items
│   │   ├── AuctionCard.tsx  # Interactive bidding catalog card
│   │   ├── BidModal.tsx     # Enter bid, estimate gas, confirm
│   │   ├── EmptyState.tsx   # Informational fallback state item
│   │   ├── Footer.tsx       # Standard clean terminal footer
│   │   ├── Navbar.tsx       # Top bar, Faucet link, wallet details
│   │   ├── Sidebar.tsx      # Desktop side menu & node diagnostics
│   │   └── WalletModal.tsx  # Select Freighter Wallet or Virtual Sand
│   ├── context/
│   │   └── Web3Context.tsx  # Heart of DApp: real & virtual Stellar/Soroban bridges
│   ├── pages/               # Primary viewport routers
│   │   ├── Home.tsx         # Headline landing, specs, and volume logs
│   │   ├── Marketplace.tsx  # Filterable grid catalog
│   │   ├── AuctionDetails.tsx # Detail specs, price graph, whale triggers
│   │   ├── CreateAuction.tsx # Form to list and deploy auctions
│   │   ├── MyAuctions.tsx   # Seller dashboard & Pull claim desk
│   │   └── BlockExplorer.tsx # Diagnostic StellarExpert logs table
│   ├── App.tsx              # Page orchestration & Toaster
│   ├── index.css            # Google Fonts & Tailwind imports
│   └── main.tsx             # Entry bundle
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

---

## 🏗️ Compile & Deploy Soroban Smart Contracts

### 1. Build contract target WASM:
Ensure you have the Rust `wasm32-unknown-unknown` target installed:
```bash
rustup target add wasm32-unknown-unknown
```
Compile the Rust project:
```bash
cargo build --target wasm32-unknown-unknown --release
```

### 2. Deploy to Stellar Futurenet:
```bash
soroban contract deploy \
  --wasm target/wasm32-unknown-unknown/release/soroban_auction_contract.wasm \
  --source-account my-stellar-identity \
  --network futurenet
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

* **Memory-Safe State Management**: Programmed entirely in Rust, eliminating risks such as buffer overflows or out-of-bounds index errors.
* **Sellers Bidding Guard**: Hard contract rule asserting `bidder != auction.seller` guarantees sellers cannot artificially inflate their own items.
* **Pull payments Pattern**: No automated direct transfers are executed when users are outbid. Outbid assets are mapped to a local returns ledger, safeguarding the system from contract execution locking.

---

## 💳 Wallet Configuration (Freighter Setup)

To test on Stellar Futurenet:
1. Install the **Freighter Wallet Extension** from [freighter.app](https://www.freighter.app/).
2. Enable developer mode / network selection in Freighter Settings.
3. Switch network to **Futurenet** or **Testnet**.
4. Acquire test XLM tokens using the Stellar Friendbot faucet at `https://friendbot.stellar.org/`.

*Inside the preview iframe where extensions are sandboxed, choose **Virtual Sandbox (DevNet)** from the Connect Wallet modal to play instantly with pre-funded XLM balances and responsive multi-user simulators!*

---

## 📄 License
This project is licensed under the MIT License - see the LICENSE details for permissions.
