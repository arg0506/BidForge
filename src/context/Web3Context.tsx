import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { ethers } from 'ethers';
import toast from 'react-hot-toast';
import { Auction, BidHistoryItem, Transaction, VirtualAccount, Web3ContextType, SmartBid } from '../types';
import { AUCTION_MANAGER_ABI, AUCTION_MANAGER_BYTECODE } from '../lib/contractArtifact';

const Web3Context = createContext<Web3ContextType | undefined>(undefined);

// Premium pre-loaded assets for realistic high-fidelity catalog on boot
const DEFAULT_AUCTIONS: Auction[] = [
  {
    id: 1,
    seller: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8", // Vault Master
    title: "Aetherial Obsidian Node Core",
    description: "An incredibly rare decentralized hardware key forged with high-fidelity obsidian titanium casing, embedded with holographic OLED telemetry loops. Allows secure quantum bridging across Layer 2 rollup nodes.",
    imageUri: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?q=80&w=600&auto=format&fit=crop",
    startingPrice: "0.15",
    highestBid: "0.24",
    highestBidder: "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC", // Apex Collector
    endTime: Math.floor(Date.now() / 1000) + 7200, // 2 hours from now
    active: true,
    ended: false,
    createdAt: Math.floor(Date.now() / 1000) - 3600,
  },
  {
    id: 2,
    seller: "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC", // Apex Collector
    title: "Cybernetic Chrono-Horizon Timepiece",
    description: "A custom gravity-defying kinetic wristwatch designed to measure the absolute clock decay of Ethereum proof-of-stake blocks. Complete with physical rubies, micro-lasers, and a magnetic floating pendulum.",
    imageUri: "https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?q=80&w=600&auto=format&fit=crop",
    startingPrice: "0.08",
    highestBid: "0.12",
    highestBidder: "0x90F79bf6EB2c4f870365E785982E1f101E93b906", // Voxel Whale
    endTime: Math.floor(Date.now() / 1000) + 18000, // 5 hours from now
    active: true,
    ended: false,
    createdAt: Math.floor(Date.now() / 1000) - 7200,
  },
  {
    id: 3,
    seller: "0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65", // Digital Nomad
    title: "Neo-Tokyo Sovereign Sky-Map",
    description: "Ultra-high definition volumetric voxel grid representing sovereign high-density airspace in virtual Neo-Tokyo. Grants exclusive interactive traffic control rights and neon-lit billboard ownership.",
    imageUri: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=600&auto=format&fit=crop",
    startingPrice: "0.50",
    highestBid: "0.0",
    highestBidder: "",
    endTime: Math.floor(Date.now() / 1000) + 86400, // 24 hours from now
    active: true,
    ended: false,
    createdAt: Math.floor(Date.now() / 1000) - 1200,
  },
  {
    id: 4,
    seller: "0x90F79bf6EB2c4f870365E785982E1f101E93b906", // Voxel Whale
    title: "Vaporwave Quantum Hologram",
    description: "An animated, self-stabilizing electromagnetic field of liquid gold displaying algorithmic 80s architectural concepts. Includes physical spatial projection grid module and authentic ownership chip.",
    imageUri: "https://images.unsplash.com/photo-1644024541299-cf30e20b336a?q=80&w=600&auto=format&fit=crop",
    startingPrice: "0.05",
    highestBid: "0.095",
    highestBidder: "0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65", // Digital Nomad
    endTime: Math.floor(Date.now() / 1000) - 600, // Ended 10 minutes ago
    active: false,
    ended: true,
    createdAt: Math.floor(Date.now() / 1000) - 20000,
  }
];

const DEFAULT_BID_HISTORY: BidHistoryItem[] = [
  {
    id: "tx-b1",
    auctionId: 1,
    bidder: "0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65",
    amount: "0.18",
    timestamp: Math.floor(Date.now() / 1000) - 3000,
    txHash: "0xa81c5d9bf7736ea795d13ef5ee8b1990c6d7a468d60ef4f8bc69a9dbd4812fcc",
  },
  {
    id: "tx-b2",
    auctionId: 1,
    bidder: "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
    amount: "0.24",
    timestamp: Math.floor(Date.now() / 1000) - 1500,
    txHash: "0xb7b42022b7a9de58f18ac061fcdb432e19a4e32d9e18b846e499dcb69c0d100c",
  },
  {
    id: "tx-b3",
    auctionId: 2,
    bidder: "0x90F79bf6EB2c4f870365E785982E1f101E93b906",
    amount: "0.12",
    timestamp: Math.floor(Date.now() / 1000) - 5000,
    txHash: "0x4fe6d3cfc14be952136e05de66ee0db7725917830f0f15c43dcb67d53066ebcd",
  },
  {
    id: "tx-b4",
    auctionId: 4,
    bidder: "0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65",
    amount: "0.095",
    timestamp: Math.floor(Date.now() / 1000) - 10000,
    txHash: "0xe293bc9d6e499dcb69c0d100cb7b42022b7a9de58f18ac061fcdb432e19a4e32d",
  }
];

const DEFAULT_ACCOUNTS: VirtualAccount[] = [
  {
    address: "0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65",
    privateKey: "0x1111111111111111111111111111111111111111111111111111111111111111",
    name: "Digital Nomad (Demo 1)",
    balance: "12.45"
  },
  {
    address: "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
    privateKey: "0x2222222222222222222222222222222222222222222222222222222222222222",
    name: "Apex Collector (Demo 2)",
    balance: "48.20"
  },
  {
    address: "0x90F79bf6EB2c4f870365E785982E1f101E93b906",
    privateKey: "0x3333333333333333333333333333333333333333333333333333333333333333",
    name: "Voxel Whale (Demo 3)",
    balance: "185.75"
  },
  {
    address: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
    privateKey: "0x4444444444444444444444444444444444444444444444444444444444444444",
    name: "Vault Master (Demo 4)",
    balance: "5.10"
  }
];

export const Web3Provider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Global States
  const [isConnected, setIsConnected] = useState<boolean>(true); // Connect on load for seamless sandbox onboarding
  const [isVirtual, setIsVirtual] = useState<boolean>(true);
  const [account, setAccount] = useState<string | null>("0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65"); // Start with Demo 1
  const [balance, setBalance] = useState<string>("12.45");
  const [networkName, setNetworkName] = useState<string>("Local DevNet (Sandbox)");
  const [chainId, setChainId] = useState<number>(1337);
  
  // Storage State (Hydrated from localStorage if available, else defaults)
  const [auctions, setAuctions] = useState<Auction[]>(() => {
    const cached = localStorage.getItem("bf_auctions");
    return cached ? JSON.parse(cached) : DEFAULT_AUCTIONS;
  });
  
  const [bidHistory, setBidHistory] = useState<BidHistoryItem[]>(() => {
    const cached = localStorage.getItem("bf_bid_history");
    return cached ? JSON.parse(cached) : DEFAULT_BID_HISTORY;
  });
  
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const cached = localStorage.getItem("bf_transactions");
    return cached ? JSON.parse(cached) : [
      {
        hash: "0xa81c5d9bf7736ea795d13ef5ee8b1990c6d7a468d60ef4f8bc69a9dbd4812fcc",
        from: "0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65",
        to: "0xContractAddress",
        value: "0.18",
        method: "placeBid",
        status: "success",
        timestamp: Math.floor(Date.now() / 1000) - 3000,
        blockNumber: 18247118,
        gasUsed: "42190"
      },
      {
        hash: "0xb7b42022b7a9de58f18ac061fcdb432e19a4e32d9e18b846e499dcb69c0d100c",
        from: "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
        to: "0xContractAddress",
        value: "0.24",
        method: "placeBid",
        status: "success",
        timestamp: Math.floor(Date.now() / 1000) - 1500,
        blockNumber: 18247119,
        gasUsed: "44102"
      }
    ];
  });

  const [virtualAccounts, setVirtualAccounts] = useState<VirtualAccount[]>(() => {
    const cached = localStorage.getItem("bf_virtual_accounts");
    return cached ? JSON.parse(cached) : DEFAULT_ACCOUNTS;
  });

  const [refundBalances, setRefundBalances] = useState<Record<string, string>>(() => {
    const cached = localStorage.getItem("bf_refund_balances");
    return cached ? JSON.parse(cached) : {};
  });

  const [blockNumber, setBlockNumber] = useState<number>(() => {
    return 18247120 + Math.floor((Date.now() - 1718000000000) / 15000); // Dynamic block calculation
  });

  const [contractAddress, setContractAddressState] = useState<string>(() => {
    return localStorage.getItem("bf_contract_address") || 
           (import.meta as any).env?.VITE_CONTRACT_ADDRESS || 
           "0xbFd972101344445c7839AAf71A00a2C6A653C44C";
  });

  const [smartBids, setSmartBids] = useState<Record<number, SmartBid>>(() => {
    const cached = localStorage.getItem("bf_smart_bids");
    return cached ? JSON.parse(cached) : {};
  });

  const autoBidsInProgress = useRef<Record<number, boolean>>({});

  const loadOnChainData = useCallback(async (currentContractAddress = contractAddress) => {
    if (typeof window === 'undefined' || !(window as any).ethereum) return;
    try {
      const ethereum = (window as any).ethereum;
      const provider = new ethers.BrowserProvider(ethereum);
      const contract = new ethers.Contract(currentContractAddress, AUCTION_MANAGER_ABI, provider);
      
      const currentBlock = await provider.getBlockNumber();
      setBlockNumber(currentBlock);
      
      const countBig = await contract.getAuctionCount();
      const count = Number(countBig);
      
      const loadedAuctions: Auction[] = [];
      const loadedBids: BidHistoryItem[] = [];
      
      for (let i = 1; i <= count; i++) {
        const result = await contract.auctions(i);
        const auctionId = Number(result[0] || result.auctionId);
        const seller = result[1] || result.seller;
        const title = result[2] || result.title;
        const description = result[3] || result.description;
        const imageUri = result[4] || result.imageUri;
        const startingPrice = ethers.formatEther(result[5] || result.startingPrice);
        const highestBid = ethers.formatEther(result[6] || result.highestBid);
        const highestBidder = result[7] || result.highestBidder;
        const endTime = Number(result[8] || result.endTime);
        const active = result[9] !== undefined ? result[9] : result.active;
        const ended = result[10] !== undefined ? result[10] : result.ended;
        
        loadedAuctions.push({
          id: auctionId,
          seller,
          title,
          description,
          imageUri,
          startingPrice,
          highestBid,
          highestBidder: highestBidder === ethers.ZeroAddress ? "" : highestBidder,
          endTime,
          active,
          ended,
          createdAt: endTime - 3600
        });
        
        if (highestBidder && highestBidder !== ethers.ZeroAddress && parseFloat(highestBid) > 0) {
          loadedBids.push({
            id: `chain-bid-${auctionId}-${highestBid}`,
            auctionId,
            bidder: highestBidder,
            amount: highestBid,
            timestamp: Math.floor(Date.now() / 1000) - 60,
            txHash: "0xContractState"
          });
        }
      }
      
      if (account) {
        const userReturnsBig = await contract.pendingReturns(account);
        const userReturns = ethers.formatEther(userReturnsBig);
        setRefundBalances(prev => ({
          ...prev,
          [account]: userReturns
        }));
      }
      
      if (loadedAuctions.length > 0) {
        setAuctions(loadedAuctions);
      }
      if (loadedBids.length > 0) {
        setBidHistory(prev => {
          const filtered = prev.filter(b => !b.id.startsWith("chain-bid-"));
          return [...loadedBids, ...filtered];
        });
      }
    } catch (err) {
      console.warn("Could not load on-chain auctions from contract:", err);
    }
  }, [account, contractAddress]);

  // Sync state to localstorage for robustness
  useEffect(() => {
    localStorage.setItem("bf_auctions", JSON.stringify(auctions));
  }, [auctions]);

  useEffect(() => {
    localStorage.setItem("bf_bid_history", JSON.stringify(bidHistory));
  }, [bidHistory]);

  useEffect(() => {
    localStorage.setItem("bf_transactions", JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem("bf_virtual_accounts", JSON.stringify(virtualAccounts));
  }, [virtualAccounts]);

  useEffect(() => {
    localStorage.setItem("bf_refund_balances", JSON.stringify(refundBalances));
  }, [refundBalances]);

  useEffect(() => {
    localStorage.setItem("bf_smart_bids", JSON.stringify(smartBids));
  }, [smartBids]);

  // Sync with real-time blocks or simulate mock ticking
  useEffect(() => {
    if (isVirtual) {
      const interval = setInterval(() => {
        setBlockNumber(prev => prev + 1);
      }, 15000);
      return () => clearInterval(interval);
    } else {
      if (typeof window !== 'undefined' && (window as any).ethereum) {
        const ethereum = (window as any).ethereum;
        const provider = new ethers.BrowserProvider(ethereum);
        
        const onBlock = (bNum: number) => {
          setBlockNumber(bNum);
          loadOnChainData();
        };
        provider.on("block", onBlock);
        return () => {
          provider.off("block", onBlock);
        };
      }
    }
  }, [isVirtual, loadOnChainData]);

  // Handle automatic on-chain reloading
  useEffect(() => {
    if (!isVirtual) {
      loadOnChainData();
    }
  }, [isVirtual, account, contractAddress, loadOnChainData]);

  // Update current account's balance from virtual store if in virtual mode
  useEffect(() => {
    if (isVirtual && account) {
      const va = virtualAccounts.find(a => a.address.toLowerCase() === account.toLowerCase());
      if (va) {
        setBalance(va.balance);
      }
    }
  }, [account, virtualAccounts, isVirtual]);

  // Detected Ethers Bridge
  const detectEthersProvider = useCallback(async () => {
    if (typeof window !== 'undefined' && (window as any).ethereum) {
      try {
        const ethereum = (window as any).ethereum;
        const provider = new ethers.BrowserProvider(ethereum);
        const network = await provider.getNetwork();
        const accounts = await provider.send("eth_accounts", []);
        
        if (accounts.length > 0) {
          setIsVirtual(false);
          setAccount(accounts[0]);
          setIsConnected(true);
          const rawBalance = await provider.getBalance(accounts[0]);
          setBalance(parseFloat(ethers.formatEther(rawBalance)).toFixed(4));
          setNetworkName(network.name === "unknown" ? "Sepolia Testnet" : network.name);
          setChainId(Number(network.chainId));
          toast.success("Connected to live Web3 wallet!");
        }
      } catch (err) {
        console.warn("Failed to automatically query injected ethereum provider:", err);
      }
    }
  }, []);

  // Run on mount to auto-detect browser extensions (MetaMask, Rabby, etc.)
  useEffect(() => {
    detectEthersProvider();
  }, [detectEthersProvider]);

  // Handle wallet connecting
  const connectWallet = async (walletType: 'metamask' | 'rabby' | 'coinbase' | 'virtual') => {
    if (walletType === 'virtual') {
      setIsVirtual(true);
      setAccount(virtualAccounts[0].address);
      setBalance(virtualAccounts[0].balance);
      setNetworkName("Local DevNet (Sandbox)");
      setChainId(1337);
      setIsConnected(true);
      toast.success("Booted Virtual Web3 Network! Demo account loaded.");
      return;
    }

    if (typeof window === 'undefined' || !(window as any).ethereum) {
      toast.error(`No Web3 provider found. Instantiating Virtual Sandbox to let you play without MetaMask!`);
      // Fallback to virtual automatically
      connectWallet('virtual');
      return;
    }

    try {
      const ethereum = (window as any).ethereum;
      const provider = new ethers.BrowserProvider(ethereum);
      
      // Request accounts
      const accounts = await provider.send("eth_requestAccounts", []);
      const network = await provider.getNetwork();
      
      setIsVirtual(false);
      setAccount(accounts[0]);
      setIsConnected(true);
      
      const rawBalance = await provider.getBalance(accounts[0]);
      setBalance(parseFloat(ethers.formatEther(rawBalance)).toFixed(4));
      setNetworkName(network.name === "unknown" ? "Sepolia Testnet" : network.name);
      setChainId(Number(network.chainId));
      
      toast.success(`Successfully connected ${walletType.toUpperCase()} wallet!`);
    } catch (err: any) {
      console.error(err);
      if (err.code === 4001) {
        toast.error("User rejected transaction / wallet connection.");
      } else {
        toast.error("Wallet connection failed. Falling back to Sandbox Mode!");
        connectWallet('virtual');
      }
    }
  };

  const disconnectWallet = () => {
    setIsConnected(false);
    setAccount(null);
    setBalance("0.00");
    toast.success("Wallet disconnected.");
  };

  const switchAccount = (addr: string) => {
    if (!isVirtual) {
      toast("To change actual accounts, please switch inside your wallet extension.", { icon: '⚠️' });
      return;
    }
    const va = virtualAccounts.find(a => a.address.toLowerCase() === addr.toLowerCase());
    if (va) {
      setAccount(va.address);
      setBalance(va.balance);
      toast.success(`Switched account to ${va.name}`);
    }
  };

  const requestFaucet = async () => {
    if (!isVirtual) {
      toast.error("The faucet only works on the Virtual Local Network!");
      return;
    }
    if (!account) return;

    // Simulate mining
    const loader = toast.loading("Processing virtual faucet request...");
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setVirtualAccounts(prev => prev.map(a => {
      if (a.address.toLowerCase() === account.toLowerCase()) {
        const nextBal = (parseFloat(a.balance) + 5.0).toFixed(2);
        return { ...a, balance: nextBal };
      }
      return a;
    }));

    // Record Faucet Transaction
    const txHash = "0x" + Math.random().toString(16).substring(2, 66);
    const newTx: Transaction = {
      hash: txHash,
      from: "0x0000000000000000000000000000000000000000",
      to: account,
      value: "5.0",
      method: "faucet",
      status: "success",
      timestamp: Math.floor(Date.now() / 1000),
      blockNumber: blockNumber + 1,
      gasUsed: "21000"
    };

    setTransactions(prev => [newTx, ...prev]);
    setBlockNumber(prev => prev + 1);
    toast.dismiss(loader);
    toast.success("+5.00 ETH mock faucet funds transferred!");
  };

  // Smart Contract Interaction Simulators / Ethers.js proxies
  const createAuction = async (
    title: string,
    description: string,
    imageUri: string,
    startingPrice: string,
    durationSeconds: number
  ): Promise<number> => {
    if (!account) throw new Error("Wallet not connected");

    // Form validation
    if (!title.trim()) throw new Error("Title is required");
    if (parseFloat(startingPrice) <= 0) throw new Error("Starting price must be > 0 ETH");

    if (!isVirtual) {
      const loader = toast.loading("Confirming transaction in wallet to deploy auction...");
      try {
        const ethereum = (window as any).ethereum;
        const provider = new ethers.BrowserProvider(ethereum);
        const signer = await provider.getSigner();
        const contract = new ethers.Contract(contractAddress, AUCTION_MANAGER_ABI, signer);
        
        const startingPriceWei = ethers.parseEther(startingPrice);
        const tx = await contract.createAuction(
          title,
          description,
          imageUri || "",
          startingPriceWei,
          durationSeconds
        );
        
        toast.loading("Deploying auction on-chain (waiting for confirmations)...", { id: loader });
        const receipt = await tx.wait();
        
        let newId = auctions.length + 1;
        if (receipt.logs) {
          for (const log of receipt.logs) {
            try {
              const parsedLog = contract.interface.parseLog(log);
              if (parsedLog && parsedLog.name === "AuctionCreated") {
                newId = Number(parsedLog.args.auctionId);
                break;
              }
            } catch (e) {
              // ignore logs from other contracts or parsing issues
            }
          }
        }
        
        const newTx: Transaction = {
          hash: tx.hash,
          from: account,
          to: contractAddress,
          value: "0.0",
          method: "createAuction",
          status: "success",
          timestamp: Math.floor(Date.now() / 1000),
          blockNumber: receipt.blockNumber,
          gasUsed: receipt.gasUsed.toString()
        };
        
        setTransactions(prev => [newTx, ...prev]);
        toast.dismiss(loader);
        toast.success(`Smart Contract Listing Deployed! ID: #${newId}`);
        
        await loadOnChainData();
        return newId;
      } catch (err: any) {
        toast.dismiss(loader);
        console.error("Smart contract creation error:", err);
        throw new Error(err.reason || err.message || "On-chain transaction failed.");
      }
    }

    const loader = toast.loading("Creating real-time auction listing...");
    await new Promise(resolve => setTimeout(resolve, 1500)); // Mine block

    const newId = auctions.length + 1;
    const calculatedEndTime = Math.floor(Date.now() / 1000) + durationSeconds;

    const newAuction: Auction = {
      id: newId,
      seller: account,
      title,
      description,
      imageUri: imageUri || "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?q=80&w=600&auto=format&fit=crop",
      startingPrice,
      highestBid: "0",
      highestBidder: "",
      endTime: calculatedEndTime,
      active: true,
      ended: false,
      createdAt: Math.floor(Date.now() / 1000)
    };

    const txHash = "0x" + Math.random().toString(16).substring(2, 66);
    const newTx: Transaction = {
      hash: txHash,
      from: account,
      to: contractAddress,
      value: "0.0",
      method: "createAuction",
      status: "success",
      timestamp: Math.floor(Date.now() / 1000),
      blockNumber: blockNumber + 1,
      gasUsed: "124805"
    };

    setAuctions(prev => [newAuction, ...prev]);
    setTransactions(prev => [newTx, ...prev]);
    setBlockNumber(prev => prev + 1);

    toast.dismiss(loader);
    toast.success(`Auction created successfully! ID: #${newId}`);
    return newId;
  };

  const placeBid = async (auctionId: number, amount: string): Promise<string> => {
    if (!account) throw new Error("Wallet not connected");

    const bidAmountFloat = parseFloat(amount);
    if (isNaN(bidAmountFloat) || bidAmountFloat <= 0) {
      throw new Error("Bid amount must be greater than zero");
    }

    if (!isVirtual) {
      const loader = toast.loading("Confirming transaction in wallet to place bid...");
      try {
        const ethereum = (window as any).ethereum;
        const provider = new ethers.BrowserProvider(ethereum);
        const signer = await provider.getSigner();
        const contract = new ethers.Contract(contractAddress, AUCTION_MANAGER_ABI, signer);
        
        const bidAmountWei = ethers.parseEther(amount);
        const tx = await contract.placeBid(auctionId, { value: bidAmountWei });
        
        toast.loading("Submitting bid to blockchain (waiting for confirmations)...", { id: loader });
        const receipt = await tx.wait();
        
        const newTx: Transaction = {
          hash: tx.hash,
          from: account,
          to: contractAddress,
          value: amount,
          method: "placeBid",
          status: "success",
          timestamp: Math.floor(Date.now() / 1000),
          blockNumber: receipt.blockNumber,
          gasUsed: receipt.gasUsed.toString()
        };
        
        setTransactions(prev => [newTx, ...prev]);
        toast.dismiss(loader);
        toast.success(`Bid registered on-chain successfully!`);
        
        await loadOnChainData();
        return tx.hash;
      } catch (err: any) {
        toast.dismiss(loader);
        console.error("Smart contract place bid error:", err);
        throw new Error(err.reason || err.message || "On-chain transaction failed.");
      }
    }

    const userBalanceFloat = parseFloat(balance);
    if (userBalanceFloat < bidAmountFloat) {
      throw new Error("Insufficient virtual ETH funds");
    }

    const targetAuction = auctions.find(a => a.id === auctionId);
    if (!targetAuction) throw new Error("Auction not found");

    if (!targetAuction.active || targetAuction.ended || Math.floor(Date.now() / 1000) >= targetAuction.endTime) {
      throw new Error("This auction has already ended!");
    }

    if (account.toLowerCase() === targetAuction.seller.toLowerCase()) {
      throw new Error("Smart contract security rule: Seller cannot bid on their own auction.");
    }

    const currentHighest = parseFloat(targetAuction.highestBid);
    const minRequired = currentHighest === 0 ? parseFloat(targetAuction.startingPrice) : currentHighest;

    if (currentHighest === 0 && bidAmountFloat < minRequired) {
      throw new Error(`Your bid must be at least the starting price of ${targetAuction.startingPrice} ETH`);
    } else if (currentHighest > 0 && bidAmountFloat <= currentHighest) {
      throw new Error(`Your bid must be strictly higher than current highest bid of ${targetAuction.highestBid} ETH`);
    }

    const loader = toast.loading("Broadcasting bid to mempool...");
    await new Promise(resolve => setTimeout(resolve, 1200));

    const previousBidder = targetAuction.highestBidder;
    const previousBidAmount = targetAuction.highestBid;

    let updatedRefundBalances = { ...refundBalances };
    if (previousBidder && parseFloat(previousBidAmount) > 0) {
      const prevRefund = parseFloat(updatedRefundBalances[previousBidder] || "0");
      updatedRefundBalances[previousBidder] = (prevRefund + parseFloat(previousBidAmount)).toFixed(4);
    }

    setRefundBalances(updatedRefundBalances);

    const updatedAuctions = auctions.map(a => {
      if (a.id === auctionId) {
        return {
          ...a,
          highestBid: amount,
          highestBidder: account
        };
      }
      return a;
    });

    setVirtualAccounts(prev => prev.map(a => {
      if (a.address.toLowerCase() === account.toLowerCase()) {
        const nextBal = (parseFloat(a.balance) - bidAmountFloat).toFixed(4);
        return { ...a, balance: nextBal };
      }
      return a;
    }));

    const txHash = "0x" + Math.random().toString(16).substring(2, 66);
    const newBid: BidHistoryItem = {
      id: "tx-b-" + Math.random().toString(36).substring(2, 10),
      auctionId,
      bidder: account,
      amount,
      timestamp: Math.floor(Date.now() / 1000),
      txHash
    };

    const newTx: Transaction = {
      hash: txHash,
      from: account,
      to: contractAddress,
      value: amount,
      method: "placeBid",
      status: "success",
      timestamp: Math.floor(Date.now() / 1000),
      blockNumber: blockNumber + 1,
      gasUsed: "44218"
    };

    setAuctions(updatedAuctions);
    setBidHistory(prev => [newBid, ...prev]);
    setTransactions(prev => [newTx, ...prev]);
    setBlockNumber(prev => prev + 1);

    toast.dismiss(loader);
    toast.success("Bid placed successfully! You are now the highest bidder.");
    
    return txHash;
  };

  const endAuction = async (auctionId: number): Promise<string> => {
    if (!account) throw new Error("Wallet not connected");

    if (!isVirtual) {
      const loader = toast.loading("Confirming transaction in wallet to finalize auction...");
      try {
        const ethereum = (window as any).ethereum;
        const provider = new ethers.BrowserProvider(ethereum);
        const signer = await provider.getSigner();
        const contract = new ethers.Contract(contractAddress, AUCTION_MANAGER_ABI, signer);
        
        const tx = await contract.endAuction(auctionId);
        
        toast.loading("Finalizing auction on-chain (waiting for confirmations)...", { id: loader });
        const receipt = await tx.wait();
        
        const newTx: Transaction = {
          hash: tx.hash,
          from: account,
          to: contractAddress,
          value: "0.0",
          method: "endAuction",
          status: "success",
          timestamp: Math.floor(Date.now() / 1000),
          blockNumber: receipt.blockNumber,
          gasUsed: receipt.gasUsed.toString()
        };
        
        setTransactions(prev => [newTx, ...prev]);
        toast.dismiss(loader);
        toast.success(`Auction settled on-chain successfully!`);
        
        await loadOnChainData();
        return tx.hash;
      } catch (err: any) {
        toast.dismiss(loader);
        console.error("Smart contract finalize error:", err);
        throw new Error(err.reason || err.message || "On-chain transaction failed.");
      }
    }

    const targetAuction = auctions.find(a => a.id === auctionId);
    if (!targetAuction) throw new Error("Auction not found");

    if (!targetAuction.active && targetAuction.ended) {
      throw new Error("Auction is already ended and settled.");
    }

    const now = Math.floor(Date.now() / 1000);
    if (now < targetAuction.endTime) {
      throw new Error(`Auction is still active! Only ${targetAuction.endTime - now} seconds remaining.`);
    }

    const loader = toast.loading("Finalizing auction smart contract state...");
    await new Promise(resolve => setTimeout(resolve, 1500));

    const winner = targetAuction.highestBidder;
    const finalBid = parseFloat(targetAuction.highestBid);

    if (finalBid > 0 && winner) {
      setVirtualAccounts(prev => prev.map(a => {
        if (a.address.toLowerCase() === targetAuction.seller.toLowerCase()) {
          const nextBal = (parseFloat(a.balance) + finalBid).toFixed(4);
          return { ...a, balance: nextBal };
        }
        return a;
      }));
    }

    const updatedAuctions = auctions.map(a => {
      if (a.id === auctionId) {
        return {
          ...a,
          active: false,
          ended: true
        };
      }
      return a;
    });

    const txHash = "0x" + Math.random().toString(16).substring(2, 66);
    const newTx: Transaction = {
      hash: txHash,
      from: account,
      to: contractAddress,
      value: "0.0",
      method: "endAuction",
      status: "success",
      timestamp: Math.floor(Date.now() / 1000),
      blockNumber: blockNumber + 1,
      gasUsed: "68310"
    };

    setAuctions(updatedAuctions);
    setTransactions(prev => [newTx, ...prev]);
    setBlockNumber(prev => prev + 1);

    toast.dismiss(loader);
    toast.success(finalBid > 0 
      ? `Auction settled! ${targetAuction.title} sold to winner ${winner.slice(0,6)}...${winner.slice(-4)} for ${targetAuction.highestBid} ETH!`
      : `Auction settled! No bids were received.`
    );

    return txHash;
  };

  const withdrawRefund = async (): Promise<string> => {
    if (!account) throw new Error("Wallet not connected");

    if (!isVirtual) {
      const loader = toast.loading("Confirming transaction in wallet to withdraw refundable returns...");
      try {
        const ethereum = (window as any).ethereum;
        const provider = new ethers.BrowserProvider(ethereum);
        const signer = await provider.getSigner();
        const contract = new ethers.Contract(contractAddress, AUCTION_MANAGER_ABI, signer);
        
        const tx = await contract.withdraw();
        
        toast.loading("Withdrawing funds on-chain (waiting for confirmations)...", { id: loader });
        const receipt = await tx.wait();
        
        const newTx: Transaction = {
          hash: tx.hash,
          from: contractAddress,
          to: account,
          value: refundBalances[account] || "0.0",
          method: "withdraw",
          status: "success",
          timestamp: Math.floor(Date.now() / 1000),
          blockNumber: receipt.blockNumber,
          gasUsed: receipt.gasUsed.toString()
        };
        
        setTransactions(prev => [newTx, ...prev]);
        toast.dismiss(loader);
        toast.success(`Withdrew refundable returns on-chain!`);
        
        await loadOnChainData();
        return tx.hash;
      } catch (err: any) {
        toast.dismiss(loader);
        console.error("Smart contract withdraw error:", err);
        throw new Error(err.reason || err.message || "On-chain transaction failed.");
      }
    }
    
    const userRefundAmountStr = refundBalances[account] || "0";
    const userRefundAmountFloat = parseFloat(userRefundAmountStr);

    if (userRefundAmountFloat <= 0) {
      throw new Error("No refundable balance found in smart contract.");
    }

    const loader = toast.loading("Executing pull payments withdrawal pattern...");
    await new Promise(resolve => setTimeout(resolve, 1200));

    setRefundBalances(prev => ({
      ...prev,
      [account]: "0.0"
    }));

    setVirtualAccounts(prev => prev.map(a => {
      if (a.address.toLowerCase() === account.toLowerCase()) {
        const nextBal = (parseFloat(a.balance) + userRefundAmountFloat).toFixed(4);
        return { ...a, balance: nextBal };
      }
      return a;
    }));

    const txHash = "0x" + Math.random().toString(16).substring(2, 66);
    const newTx: Transaction = {
      hash: txHash,
      from: contractAddress,
      to: account,
      value: userRefundAmountStr,
      method: "withdraw",
      status: "success",
      timestamp: Math.floor(Date.now() / 1000),
      blockNumber: blockNumber + 1,
      gasUsed: "28109"
    };

    setTransactions(prev => [newTx, ...prev]);
    setBlockNumber(prev => prev + 1);

    toast.dismiss(loader);
    toast.success(`Withdrew ${userRefundAmountStr} ETH refundable bid returns successfully!`);

    return txHash;
  };

  const deployContract = async (): Promise<string> => {
    if (!account) throw new Error("Wallet not connected");
    if (isVirtual) throw new Error("Please connect a real wallet to deploy on-chain contracts");

    const loader = toast.loading("Initiating smart contract deployment on connected network...");
    try {
      const ethereum = (window as any).ethereum;
      const provider = new ethers.BrowserProvider(ethereum);
      const signer = await provider.getSigner();
      
      const factory = new ethers.ContractFactory(
        AUCTION_MANAGER_ABI, 
        AUCTION_MANAGER_BYTECODE, 
        signer
      );
      
      const contract = await factory.deploy();
      toast.loading("Contract deploying to blockchain... (waiting for block confirmations)", { id: loader });
      
      await contract.waitForDeployment();
      const newAddress = await contract.getAddress();
      
      setContractAddressState(newAddress);
      localStorage.setItem("bf_contract_address", newAddress);
      
      setAuctions([]);
      
      toast.dismiss(loader);
      toast.success(`BidForge Smart Contract Deployed Successfully at: ${newAddress}`, { duration: 8000 });
      
      await loadOnChainData(newAddress);
      
      return newAddress;
    } catch (err: any) {
      toast.dismiss(loader);
      console.error("Smart contract deployment error:", err);
      throw new Error(err.reason || err.message || "Smart contract deployment was rejected or failed.");
    }
  };

  const updateContractAddress = (address: string) => {
    if (!ethers.isAddress(address)) {
      toast.error("Invalid Ethereum contract address!");
      return;
    }
    setContractAddressState(address);
    localStorage.setItem("bf_contract_address", address);
    toast.success(`Connected to custom contract: ${address}`);
    loadOnChainData(address);
  };

  const setSmartBid = (auctionId: number, maxBid: string, active: boolean) => {
    if (!account) {
      toast.error("Please connect your wallet first!");
      return;
    }
    setSmartBids(prev => {
      const updated = {
        ...prev,
        [auctionId]: {
          maxBid,
          bidderAddress: account,
          active
        }
      };
      return updated;
    });
    if (active) {
      toast.success(`Smart bidding active for listing #${auctionId} up to ${maxBid} ETH`);
    } else {
      toast.success(`Smart bidding deactivated for listing #${auctionId}`);
    }
  };

  // Automatic Outbidding Loop
  useEffect(() => {
    const runSmartBids = async () => {
      if (!account) return;

      for (const a of auctions) {
        const sBid = smartBids[a.id];
        if (!sBid || !sBid.active) continue;
        if (sBid.bidderAddress.toLowerCase() !== account.toLowerCase()) continue;
        
        // Already the highest bidder?
        if (a.highestBidder.toLowerCase() === account.toLowerCase()) continue;

        // Is the auction over?
        if (!a.active || a.ended || Math.floor(Date.now() / 1000) >= a.endTime) {
          // Deactivate
          setSmartBids(prev => {
            const updated = {
              ...prev,
              [a.id]: { ...prev[a.id], active: false }
            };
            return updated;
          });
          continue;
        }

        // Calculate next outbid amount
        const highestBidFloat = parseFloat(a.highestBid);
        const nextBidFloat = highestBidFloat === 0 
          ? parseFloat(a.startingPrice)
          : highestBidFloat + 0.005;

        // Check if limit reached
        const maxBidFloat = parseFloat(sBid.maxBid);
        if (nextBidFloat > maxBidFloat) {
          // Deactivate and notify
          setSmartBids(prev => {
            const updated = {
              ...prev,
              [a.id]: { ...prev[a.id], active: false }
            };
            return updated;
          });
          toast(`Smart Bidder: Maximum limit of ${sBid.maxBid} ETH reached for Listing #${a.id}! Auto-bidding disabled.`, { icon: '🛑' });
          continue;
        }

        // Check user balance
        const userBalFloat = parseFloat(balance);
        if (userBalFloat < nextBidFloat) {
          setSmartBids(prev => {
            const updated = {
              ...prev,
              [a.id]: { ...prev[a.id], active: false }
            };
            return updated;
          });
          toast(`Smart Bidder: Insufficient balance to place next bid of ${nextBidFloat.toFixed(3)} ETH. Auto-bidding disabled.`, { icon: '⚠️' });
          continue;
        }

        // Prevent double trigger
        if (autoBidsInProgress.current[a.id]) continue;

        // Trigger auto-bid
        autoBidsInProgress.current[a.id] = true;
        
        const loaderId = `smart-bid-toast-${a.id}`;
        toast.loading(`Smart Bidder: Opponent outbid you! Placing auto-bid of ${nextBidFloat.toFixed(3)} ETH...`, { 
          id: loaderId
        });

        // Execute the bid
        try {
          await placeBid(a.id, nextBidFloat.toFixed(3));
          toast.success(`Smart Bidder: Successfully placed automatic bid of ${nextBidFloat.toFixed(3)} ETH!`, { id: loaderId });
        } catch (err: any) {
          console.error("Smart bid auto place failed:", err);
          toast.error(`Smart Bidder: Auto-bid failed: ${err.message}`, { id: loaderId });
          // Deactivate to avoid infinite attempts
          setSmartBids(prev => {
            const updated = {
              ...prev,
              [a.id]: { ...prev[a.id], active: false }
            };
            return updated;
          });
        } finally {
          autoBidsInProgress.current[a.id] = false;
        }

        break; // Process one at a time
      }
    };

    // Background interval to monitor blockchain events/state and trigger bids
    const intervalId = setInterval(() => {
      runSmartBids();
    }, 3000);

    // Initial run
    runSmartBids();

    return () => {
      clearInterval(intervalId);
    };
  }, [auctions, smartBids, account, balance, placeBid]);

  // Competition/Multi-user Simulator Trigger
  // Lets user trigger a competitive bid from other accounts in real time to test state/events
  const triggerSimulatedBid = async (auctionId: number) => {
    const targetAuction = auctions.find(a => a.id === auctionId);
    if (!targetAuction) {
      toast.error("Auction not found");
      return;
    }

    if (!targetAuction.active || targetAuction.ended || Math.floor(Date.now() / 1000) >= targetAuction.endTime) {
      toast.error("Auction is ended. Can't place simulated bid.");
      return;
    }

    // Pick a simulator account that is NOT the current active user AND NOT the seller
    const availableWhales = virtualAccounts.filter(a => 
      a.address.toLowerCase() !== (account || "").toLowerCase() &&
      a.address.toLowerCase() !== targetAuction.seller.toLowerCase()
    );

    if (availableWhales.length === 0) {
      toast("No suitable whale account found to outbid you!", { icon: '⚠️' });
      return;
    }

    const simulatorAccount = availableWhales[Math.floor(Math.random() * availableWhales.length)];
    const currentHighestFloat = parseFloat(targetAuction.highestBid);
    const nextBidFloat = currentHighestFloat === 0 
      ? parseFloat(targetAuction.startingPrice) * 1.1 // 10% premium over starting price
      : currentHighestFloat * 1.15; // 15% outbid

    const nextBidStr = nextBidFloat.toFixed(3);

    // Validate account balance
    if (parseFloat(simulatorAccount.balance) < nextBidFloat) {
      toast.error(`Whale ${simulatorAccount.name} tried to bid but is out of funds.`);
      return;
    }

    // Trigger toast & transaction update
    const note = toast.loading(`Competitive Whale [${simulatorAccount.name.split(' ')[0]}] is typing a bid...`);
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Credit former highest bidder
    const formerBidder = targetAuction.highestBidder;
    const formerBidAmount = targetAuction.highestBid;

    let updatedRefundBalances = { ...refundBalances };
    if (formerBidder && parseFloat(formerBidAmount) > 0) {
      const prevRefund = parseFloat(updatedRefundBalances[formerBidder] || "0");
      updatedRefundBalances[formerBidder] = (prevRefund + parseFloat(formerBidAmount)).toFixed(4);
    }
    setRefundBalances(updatedRefundBalances);

    // Update auction highest bid
    setAuctions(prev => prev.map(a => {
      if (a.id === auctionId) {
        return {
          ...a,
          highestBid: nextBidStr,
          highestBidder: simulatorAccount.address
        };
      }
      return a;
    }));

    // Deduct simulated whale's wallet
    setVirtualAccounts(prev => prev.map(a => {
      if (a.address.toLowerCase() === simulatorAccount.address.toLowerCase()) {
        return {
          ...a,
          balance: (parseFloat(a.balance) - nextBidFloat).toFixed(4)
        };
      }
      return a;
    }));

    // Add bid entry
    const txHash = "0x" + Math.random().toString(16).substring(2, 66);
    const newBid: BidHistoryItem = {
      id: "tx-sb-" + Math.random().toString(36).substring(2, 10),
      auctionId,
      bidder: simulatorAccount.address,
      amount: nextBidStr,
      timestamp: Math.floor(Date.now() / 1000),
      txHash
    };

    // Add transaction entry
    const newTx: Transaction = {
      hash: txHash,
      from: simulatorAccount.address,
      to: contractAddress,
      value: nextBidStr,
      method: "placeBid",
      status: "success",
      timestamp: Math.floor(Date.now() / 1000),
      blockNumber: blockNumber + 1,
      gasUsed: "44218"
    };

    setBidHistory(prev => [newBid, ...prev]);
    setTransactions(prev => [newTx, ...prev]);
    setBlockNumber(prev => prev + 1);

    toast.dismiss(note);
    toast.custom((t) => (
      <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-md w-full bg-[#0F172A]/90 border border-amber-500/30 backdrop-blur-md shadow-2xl rounded-2xl pointer-events-auto flex ring-1 ring-black ring-opacity-5 p-4`}>
        <div className="flex-1 w-0">
          <div className="flex items-start">
            <div className="flex-shrink-0 pt-0.5">
              <span className="flex h-3 w-3 relative mr-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
              </span>
            </div>
            <div className="ml-1 flex-1">
              <p className="text-sm font-semibold text-white">Outbid Alert! 🚨</p>
              <p className="mt-1 text-xs text-gray-400">
                Whale <span className="text-amber-400 font-mono">{simulatorAccount.address.slice(0, 6)}...{simulatorAccount.address.slice(-4)}</span> just outbid the field on auction #{auctionId} with <span className="font-bold text-white">{nextBidStr} ETH</span>!
              </p>
            </div>
          </div>
        </div>
      </div>
    ), { duration: 5000 });
  };

  // Get current active user's pending refundable returns
  const currentPendingRefund = account ? (refundBalances[account] || "0.0") : "0.0";

  return (
    <Web3Context.Provider value={{
      isConnected,
      isVirtual,
      account,
      accounts: virtualAccounts.map(a => a.address),
      balance,
      networkName,
      chainId,
      contractAddress,
      
      connectWallet,
      disconnectWallet,
      switchAccount,
      requestFaucet,
      
      auctions,
      bidHistory,
      transactions,
      pendingReturns: currentPendingRefund,
      
      createAuction,
      placeBid,
      endAuction,
      withdrawRefund,
      
      deployContract,
      updateContractAddress,
      
      smartBids,
      setSmartBid,
      
      triggerSimulatedBid,
      blockNumber
    }}>
      {children}
    </Web3Context.Provider>
  );
};

export const useWeb3 = () => {
  const context = useContext(Web3Context);
  if (context === undefined) {
    throw new Error('useWeb3 must be used within a Web3Provider');
  }
  return context;
};
