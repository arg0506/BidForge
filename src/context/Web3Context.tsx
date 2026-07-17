import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import toast from 'react-hot-toast';
import { 
  isConnected as isFreighterConnected, 
  getAddress as getFreighterAddress, 
  getNetwork as getFreighterNetwork,
  isAllowed as isFreighterAllowed,
  setAllowed as setFreighterAllowed
} from '@stellar/freighter-api';
import { Auction, BidHistoryItem, Transaction, VirtualAccount, Web3ContextType, SmartBid } from '../types';

const Web3Context = createContext<Web3ContextType | undefined>(undefined);

// Soroban Contract Mock Data & Stellar Accounts
const DEFAULT_AUCTIONS: Auction[] = [
  {
    id: 1,
    seller: "GDVAULT970C51812DC3A010C7D01B50E0D17DC79C8A1B2C3D4ESTEL999", // Vault Master
    title: "Aetherial Obsidian Node Core",
    description: "An incredibly rare decentralized hardware key forged with high-fidelity obsidian titanium casing, embedded with holographic OLED telemetry loops. Allows secure quantum bridging across Soroban smart contract nodes.",
    imageUri: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?q=80&w=600&auto=format&fit=crop",
    startingPrice: "150.00",
    highestBid: "240.00",
    highestBidder: "GDAPEXCO4Y5FTH9R7P5C7B4A2M1L8K3J6H5G4F3D2S1A0B7C6ESTEL456", // Apex Collector
    endTime: Math.floor(Date.now() / 1000) + 7200, // 2 hours from now
    active: true,
    ended: false,
    createdAt: Math.floor(Date.now() / 1000) - 3600,
  },
  {
    id: 2,
    seller: "GDAPEXCO4Y5FTH9R7P5C7B4A2M1L8K3J6H5G4F3D2S1A0B7C6ESTEL456", // Apex Collector
    title: "Cybernetic Chrono-Horizon Timepiece",
    description: "A custom gravity-defying kinetic wristwatch designed to measure the absolute clock decay of Stellar ledger close times. Complete with physical rubies, micro-lasers, and a magnetic floating pendulum.",
    imageUri: "https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?q=80&w=600&auto=format&fit=crop",
    startingPrice: "80.00",
    highestBid: "120.00",
    highestBidder: "GDWHALE970C51812DC3A010C7D01B50E0D17DC79C8A1B2C3D4ESTEL789", // Voxel Whale
    endTime: Math.floor(Date.now() / 1000) + 18000, // 5 hours from now
    active: true,
    ended: false,
    createdAt: Math.floor(Date.now() / 1000) - 7200,
  },
  {
    id: 3,
    seller: "GDXNOMAD7W6Z4C2Y5FTH9R7P5C7B4A2M1L8K3J6H5G4F3D2S1STEL123", // Digital Nomad
    title: "Neo-Tokyo Sovereign Sky-Map",
    description: "Ultra-high definition volumetric voxel grid representing sovereign high-density airspace in virtual Neo-Tokyo. Grants exclusive interactive traffic control rights and neon-lit billboard ownership.",
    imageUri: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=600&auto=format&fit=crop",
    startingPrice: "500.00",
    highestBid: "0.0",
    highestBidder: "",
    endTime: Math.floor(Date.now() / 1000) + 86400, // 24 hours from now
    active: true,
    ended: false,
    createdAt: Math.floor(Date.now() / 1000) - 1200,
  },
  {
    id: 4,
    seller: "GDWHALE970C51812DC3A010C7D01B50E0D17DC79C8A1B2C3D4ESTEL789", // Voxel Whale
    title: "Vaporwave Quantum Hologram",
    description: "An animated, self-stabilizing electromagnetic field of liquid gold displaying algorithmic 80s architectural concepts. Includes physical spatial projection grid module and authentic ownership chip.",
    imageUri: "https://images.unsplash.com/photo-1644024541299-cf30e20b336a?q=80&w=600&auto=format&fit=crop",
    startingPrice: "50.00",
    highestBid: "95.00",
    highestBidder: "GDXNOMAD7W6Z4C2Y5FTH9R7P5C7B4A2M1L8K3J6H5G4F3D2S1STEL123", // Digital Nomad
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
    bidder: "GDXNOMAD7W6Z4C2Y5FTH9R7P5C7B4A2M1L8K3J6H5G4F3D2S1STEL123",
    amount: "180.00",
    timestamp: Math.floor(Date.now() / 1000) - 3000,
    txHash: "a81c5d9bf7736ea795d13ef5ee8b1990c6d7a468d60ef4f8bc69a9dbd4812fcc",
  },
  {
    id: "tx-b2",
    auctionId: 1,
    bidder: "GDAPEXCO4Y5FTH9R7P5C7B4A2M1L8K3J6H5G4F3D2S1A0B7C6ESTEL456",
    amount: "240.00",
    timestamp: Math.floor(Date.now() / 1000) - 1500,
    txHash: "b7b42022b7a9de58f18ac061fcdb432e19a4e32d9e18b846e499dcb69c0d100c",
  },
  {
    id: "tx-b3",
    auctionId: 2,
    bidder: "GDWHALE970C51812DC3A010C7D01B50E0D17DC79C8A1B2C3D4ESTEL789",
    amount: "120.00",
    timestamp: Math.floor(Date.now() / 1000) - 5000,
    txHash: "4fe6d3cfc14be952136e05de66ee0db7725917830f0f15c43dcb67d53066ebcd",
  },
  {
    id: "tx-b4",
    auctionId: 4,
    bidder: "GDXNOMAD7W6Z4C2Y5FTH9R7P5C7B4A2M1L8K3J6H5G4F3D2S1STEL123",
    amount: "95.00",
    timestamp: Math.floor(Date.now() / 1000) - 10000,
    txHash: "e293bc9d6e499dcb69c0d100cb7b42022b7a9de58f18ac061fcdb432e19a4e32d",
  }
];

const DEFAULT_ACCOUNTS: VirtualAccount[] = [
  {
    address: "GDXNOMAD7W6Z4C2Y5FTH9R7P5C7B4A2M1L8K3J6H5G4F3D2S1STEL123",
    privateKey: "S111111111111111111111111111111111111111111111111111111111111111",
    name: "Digital Nomad (Demo 1)",
    balance: "1245.00"
  },
  {
    address: "GDAPEXCO4Y5FTH9R7P5C7B4A2M1L8K3J6H5G4F3D2S1A0B7C6ESTEL456",
    privateKey: "S222222222222222222222222222222222222222222222222222222222222222",
    name: "Apex Collector (Demo 2)",
    balance: "4820.00"
  },
  {
    address: "GDWHALE970C51812DC3A010C7D01B50E0D17DC79C8A1B2C3D4ESTEL789",
    privateKey: "S333333333333333333333333333333333333333333333333333333333333333",
    name: "Voxel Whale (Demo 3)",
    balance: "18575.00"
  },
  {
    address: "GDVAULT970C51812DC3A010C7D01B50E0D17DC79C8A1B2C3D4ESTEL999",
    privateKey: "S444444444444444444444444444444444444444444444444444444444444444",
    name: "Vault Master (Demo 4)",
    balance: "510.00"
  }
];

export const Web3Provider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Core Wallet & Network State
  const [isConnected, setIsConnected] = useState(true);
  const [isVirtual, setIsVirtual] = useState(true);
  const [account, setAccount] = useState<string | null>("GDXNOMAD7W6Z4C2Y5FTH9R7P5C7B4A2M1L8K3J6H5G4F3D2S1STEL123"); // Start with Demo 1
  const [balance, setBalance] = useState<string>("1245.00");
  const [networkName, setNetworkName] = useState<string>("Stellar Futurenet (Sandbox)");
  const [chainId, setChainId] = useState<number>(3); // 3 = Futurenet, 2 = Testnet
  
  // Custom Soroban Smart Contract States
  const [contractAddress, setContractAddressState] = useState<string>(() => {
    return localStorage.getItem("bf_stellar_contract_id") || "CBFD972101344445C7839AAF71A00A2C6A653C44CSTEL123";
  });
  
  // Simulated / Local Storage Data Store
  const [virtualAccounts, setVirtualAccounts] = useState<VirtualAccount[]>(() => {
    const saved = localStorage.getItem("bf_virtual_accounts");
    return saved ? JSON.parse(saved) : DEFAULT_ACCOUNTS;
  });

  const [auctions, setAuctions] = useState<Auction[]>(() => {
    const saved = localStorage.getItem("bf_auctions");
    return saved ? JSON.parse(saved) : DEFAULT_AUCTIONS;
  });

  const [bidHistory, setBidHistory] = useState<BidHistoryItem[]>(() => {
    const saved = localStorage.getItem("bf_bid_history");
    return saved ? JSON.parse(saved) : DEFAULT_BID_HISTORY;
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem("bf_transactions");
    if (saved) return JSON.parse(saved);
    
    // Initial standard history logs
    return [
      {
        hash: "a81c5d9bf7736ea795d13ef5ee8b1990c6d7a468d60ef4f8bc69a9dbd4812fcc",
        from: "GDXNOMAD7W6Z4C2Y5FTH9R7P5C7B4A2M1L8K3J6H5G4F3D2S1STEL123",
        to: "CBFD972101344445C7839AAF71A00A2C6A653C44CSTEL123",
        value: "180.0",
        method: "place_bid",
        status: "success",
        timestamp: Math.floor(Date.now() / 1000) - 3000,
        blockNumber: 48102,
        gasUsed: "42109"
      },
      {
        hash: "b7b42022b7a9de58f18ac061fcdb432e19a4e32d9e18b846e499dcb69c0d100c",
        from: "GDAPEXCO4Y5FTH9R7P5C7B4A2M1L8K3J6H5G4F3D2S1A0B7C6ESTEL456",
        to: "CBFD972101344445C7839AAF71A00A2C6A653C44CSTEL123",
        value: "240.0",
        method: "place_bid",
        status: "success",
        timestamp: Math.floor(Date.now() / 1000) - 1500,
        blockNumber: 48105,
        gasUsed: "44218"
      }
    ];
  });

  const [refundBalances, setRefundBalances] = useState<Record<string, string>>(() => {
    const saved = localStorage.getItem("bf_refund_balances");
    return saved ? JSON.parse(saved) : {};
  });

  const [smartBids, setSmartBids] = useState<Record<number, SmartBid>>(() => {
    const saved = localStorage.getItem("bf_smart_bids");
    return saved ? JSON.parse(saved) : {};
  });

  const [blockNumber, setBlockNumber] = useState<number>(48210);
  const autoBidsInProgress = useRef<Record<number, boolean>>({});

  // Sync to localstorage to persist actions across reloads
  useEffect(() => {
    localStorage.setItem("bf_virtual_accounts", JSON.stringify(virtualAccounts));
  }, [virtualAccounts]);

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
    localStorage.setItem("bf_refund_balances", JSON.stringify(refundBalances));
  }, [refundBalances]);

  useEffect(() => {
    localStorage.setItem("bf_smart_bids", JSON.stringify(smartBids));
  }, [smartBids]);

  // Handle auto-mining ticks
  useEffect(() => {
    const interval = setInterval(() => {
      setBlockNumber(prev => prev + 1);
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  // Freighter Wallet Autodetect
  const detectFreighterProvider = useCallback(async () => {
    try {
      const isConnRes = await isFreighterConnected();
      const connected = isConnRes && isConnRes.isConnected;
      if (connected) {
        const isAllowedRes = await isFreighterAllowed();
        if (isAllowedRes && isAllowedRes.isAllowed) {
          const addrRes = await getFreighterAddress();
          const pubKey = addrRes && addrRes.address;
          if (pubKey) {
            setIsVirtual(false);
            setAccount(pubKey);
            setIsConnected(true);
            setBalance("1500.00");
            const netRes = await getFreighterNetwork();
            const net = netRes && netRes.network;
            setNetworkName(net || "Stellar Futurenet");
            setChainId(3);
          }
        }
      }
    } catch (err) {
      console.warn("Failed to automatically query Freighter provider:", err);
    }
  }, []);

  useEffect(() => {
    detectFreighterProvider();
  }, [detectFreighterProvider]);

  // Handle wallet connecting
  const connectWallet = async (walletType: 'metamask' | 'rabby' | 'coinbase' | 'virtual' | 'freighter') => {
    if (walletType === 'virtual') {
      setIsVirtual(true);
      setAccount(virtualAccounts[0].address);
      setBalance(virtualAccounts[0].balance);
      setNetworkName("Stellar Futurenet (Sandbox)");
      setChainId(3);
      setIsConnected(true);
      toast.success("Booted Virtual Soroban Network! Demo account loaded.");
      return;
    }

    try {
      const isConnRes = await isFreighterConnected();
      const freighterOk = isConnRes && isConnRes.isConnected;
      if (!freighterOk) {
        toast.error("Freighter Wallet is not installed or blocked. Install it from freighter.app or select Virtual Sandbox!");
        return;
      }

      // Check if site is allowed by the wallet, otherwise request user authorization
      const isAllowedRes = await isFreighterAllowed();
      const allowed = isAllowedRes && isAllowedRes.isAllowed;
      if (!allowed) {
        toast.loading("Prompting Freighter Wallet connection...", { id: "freighter-conn" });
        const setAllowedRes = await setFreighterAllowed();
        const accessGranted = setAllowedRes && setAllowedRes.isAllowed;
        toast.dismiss("freighter-conn");
        if (!accessGranted) {
          toast.error("Freighter Wallet access was rejected or cancelled.");
          return;
        }
      }

      const addrRes = await getFreighterAddress();
      const pubKey = addrRes && addrRes.address;
      if (!pubKey) {
        toast.error("User rejected or failed to retrieve public key from Freighter.");
        return;
      }

      setIsVirtual(false);
      setAccount(pubKey);
      setIsConnected(true);
      setBalance("1500.00");
      const netRes = await getFreighterNetwork();
      const net = netRes && netRes.network;
      setNetworkName(net || "Stellar Testnet");
      setChainId(2);

      toast.success("Successfully connected Freighter Wallet!");
    } catch (err: any) {
      console.error(err);
      toast.error("Wallet connection failed. Falling back to Sandbox Mode!");
      connectWallet('virtual');
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
      toast("To change actual accounts, please switch inside your Freighter extension.", { icon: '⚠️' });
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
        const nextBal = (parseFloat(a.balance) + 50.0).toFixed(2);
        return { ...a, balance: nextBal };
      }
      return a;
    }));

    if (account) {
      setBalance(prev => (parseFloat(prev) + 50.0).toFixed(2));
    }

    // Record Faucet Transaction
    const txHash = Math.random().toString(16).substring(2, 66);
    const newTx: Transaction = {
      hash: txHash,
      from: "SYSTEM_RESERVE_STEL_POOL",
      to: account,
      value: "50.0",
      method: "faucet",
      status: "success",
      timestamp: Math.floor(Date.now() / 1000),
      blockNumber: blockNumber + 1,
      gasUsed: "12500"
    };

    setTransactions(prev => [newTx, ...prev]);
    setBlockNumber(prev => prev + 1);
    toast.dismiss(loader);
    toast.success("+50.00 XLM mock faucet funds transferred!");
  };

  // Soroban Smart Contract Actions
  const createAuction = async (
    title: string,
    description: string,
    imageUri: string,
    startingPrice: string,
    durationSeconds: number
  ): Promise<number> => {
    if (!account) throw new Error("Wallet not connected");

    if (!title.trim()) throw new Error("Title is required");
    if (parseFloat(startingPrice) <= 0) throw new Error("Starting price must be > 0 XLM");

    const loader = toast.loading("Publishing auction via Soroban Smart Contract...");
    await new Promise(resolve => setTimeout(resolve, 1500));

    const newId = auctions.length > 0 ? Math.max(...auctions.map(a => a.id)) + 1 : 1;
    const now = Math.floor(Date.now() / 1000);

    const newAuction: Auction = {
      id: newId,
      seller: account,
      title,
      description,
      imageUri: imageUri || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=600&auto=format&fit=crop",
      startingPrice,
      highestBid: "0.0",
      highestBidder: "",
      endTime: now + durationSeconds,
      active: true,
      ended: false,
      createdAt: now
    };

    setAuctions(prev => [newAuction, ...prev]);

    // Deduct user balance or register TX
    const txHash = Math.random().toString(16).substring(2, 66);
    const newTx: Transaction = {
      hash: txHash,
      from: account,
      to: contractAddress,
      value: "0.0",
      method: "create_auction",
      status: "success",
      timestamp: now,
      blockNumber: blockNumber + 1,
      gasUsed: "32100"
    };

    setTransactions(prev => [newTx, ...prev]);
    setBlockNumber(prev => prev + 1);

    toast.dismiss(loader);
    toast.success(`Auction created successfully on Soroban contract! (ID: ${newId})`);

    return newId;
  };

  const placeBid = async (auctionId: number, amount: string): Promise<string> => {
    if (!account) throw new Error("Wallet not connected");

    const amountFloat = parseFloat(amount);
    if (isNaN(amountFloat) || amountFloat <= 0) {
      throw new Error("Bid amount must be strictly greater than 0");
    }

    const targetAuction = auctions.find(a => a.id === auctionId);
    if (!targetAuction) throw new Error("Auction not found");

    if (!targetAuction.active || targetAuction.ended) {
      throw new Error("Auction is no longer active");
    }

    const now = Math.floor(Date.now() / 1000);
    if (now >= targetAuction.endTime) {
      throw new Error("Auction has expired");
    }

    const currentHighest = parseFloat(targetAuction.highestBid);
    const minRequiredBid = currentHighest === 0 
      ? parseFloat(targetAuction.startingPrice)
      : currentHighest + 0.01;

    if (amountFloat < minRequiredBid) {
      throw new Error(`Your bid must be at least ${minRequiredBid} XLM`);
    }

    // Deduct bid amount from user's account
    if (isVirtual) {
      const userAccount = virtualAccounts.find(a => a.address.toLowerCase() === account.toLowerCase());
      if (!userAccount || parseFloat(userAccount.balance) < amountFloat) {
        throw new Error("Insufficient virtual XLM funds");
      }

      setVirtualAccounts(prev => prev.map(a => {
        if (a.address.toLowerCase() === account.toLowerCase()) {
          const nextBal = (parseFloat(a.balance) - amountFloat).toFixed(2);
          return { ...a, balance: nextBal };
        }
        return a;
      }));

      setBalance(prev => (parseFloat(prev) - amountFloat).toFixed(2));
    }

    // Handle refunds for previous highest bidder (if any)
    const formerBidder = targetAuction.highestBidder;
    const formerBidAmount = targetAuction.highestBid;

    if (formerBidder && parseFloat(formerBidAmount) > 0) {
      setRefundBalances(prev => {
        const prevRefund = parseFloat(prev[formerBidder] || "0");
        return {
          ...prev,
          [formerBidder]: (prevRefund + parseFloat(formerBidAmount)).toFixed(2)
        };
      });
    }

    // Update auction state
    setAuctions(prev => prev.map(a => {
      if (a.id === auctionId) {
        return {
          ...a,
          highestBid: amount,
          highestBidder: account
        };
      }
      return a;
    }));

    const txHash = Math.random().toString(16).substring(2, 66);
    const newBidItem: BidHistoryItem = {
      id: "tx-b-" + Math.random().toString(36).substring(2, 10),
      auctionId,
      bidder: account,
      amount,
      timestamp: now,
      txHash
    };

    setBidHistory(prev => [newBidItem, ...prev]);

    const newTx: Transaction = {
      hash: txHash,
      from: account,
      to: contractAddress,
      value: amount,
      method: "place_bid",
      status: "success",
      timestamp: now,
      blockNumber: blockNumber + 1,
      gasUsed: "44218"
    };

    setTransactions(prev => [newTx, ...prev]);
    setBlockNumber(prev => prev + 1);

    toast.success(`Successfully placed bid of ${amount} XLM!`);
    return txHash;
  };

  const endAuction = async (auctionId: number): Promise<string> => {
    if (!account) throw new Error("Wallet not connected");

    const targetAuction = auctions.find(a => a.id === auctionId);
    if (!targetAuction) throw new Error("Auction not found");

    if (!targetAuction.active && targetAuction.ended) {
      throw new Error("Auction is already ended and settled.");
    }

    const now = Math.floor(Date.now() / 1000);
    if (now < targetAuction.endTime) {
      throw new Error(`Auction is still active! Only ${targetAuction.endTime - now} seconds remaining.`);
    }

    const loader = toast.loading("Finalizing auction smart contract state on Soroban...");
    await new Promise(resolve => setTimeout(resolve, 1500));

    const winner = targetAuction.highestBidder;
    const finalBid = parseFloat(targetAuction.highestBid);

    if (finalBid > 0 && winner) {
      setVirtualAccounts(prev => prev.map(a => {
        if (a.address.toLowerCase() === targetAuction.seller.toLowerCase()) {
          const nextBal = (parseFloat(a.balance) + finalBid).toFixed(2);
          return { ...a, balance: nextBal };
        }
        return a;
      }));
    }

    setAuctions(prev => prev.map(a => {
      if (a.id === auctionId) {
        return {
          ...a,
          active: false,
          ended: true
        };
      }
      return a;
    }));

    const txHash = Math.random().toString(16).substring(2, 66);
    const newTx: Transaction = {
      hash: txHash,
      from: account,
      to: contractAddress,
      value: "0.0",
      method: "end_auction",
      status: "success",
      timestamp: Math.floor(Date.now() / 1000),
      blockNumber: blockNumber + 1,
      gasUsed: "68310"
    };

    setTransactions(prev => [newTx, ...prev]);
    setBlockNumber(prev => prev + 1);

    toast.dismiss(loader);
    toast.success(finalBid > 0 
      ? `Auction settled! ${targetAuction.title} sold to winner ${winner.slice(0,6)}...${winner.slice(-4)} for ${targetAuction.highestBid} XLM!`
      : `Auction settled! No bids were received.`
    );

    return txHash;
  };

  const withdrawRefund = async (): Promise<string> => {
    if (!account) throw new Error("Wallet not connected");

    const userRefundAmountStr = refundBalances[account] || "0";
    const userRefundAmountFloat = parseFloat(userRefundAmountStr);

    if (userRefundAmountFloat <= 0) {
      throw new Error("No refundable balance found in smart contract.");
    }

    const loader = toast.loading("Executing pull payments withdrawal pattern from Soroban...");
    await new Promise(resolve => setTimeout(resolve, 1200));

    setRefundBalances(prev => ({
      ...prev,
      [account]: "0.0"
    }));

    setVirtualAccounts(prev => prev.map(a => {
      if (a.address.toLowerCase() === account.toLowerCase()) {
        const nextBal = (parseFloat(a.balance) + userRefundAmountFloat).toFixed(2);
        return { ...a, balance: nextBal };
      }
      return a;
    }));

    if (account) {
      setBalance(prev => (parseFloat(prev) + userRefundAmountFloat).toFixed(2));
    }

    const txHash = Math.random().toString(16).substring(2, 66);
    const newTx: Transaction = {
      hash: txHash,
      from: contractAddress,
      to: account,
      value: userRefundAmountStr,
      method: "withdraw_refund",
      status: "success",
      timestamp: Math.floor(Date.now() / 1000),
      blockNumber: blockNumber + 1,
      gasUsed: "28109"
    };

    setTransactions(prev => [newTx, ...prev]);
    setBlockNumber(prev => prev + 1);

    toast.dismiss(loader);
    toast.success(`Withdrew ${userRefundAmountStr} XLM refundable bid returns successfully!`);

    return txHash;
  };

  const deployContract = async (): Promise<string> => {
    if (!account) throw new Error("Wallet not connected");

    const loader = toast.loading("Deploying Rust Soroban Web3 contract WASM payload...");
    await new Promise(resolve => setTimeout(resolve, 2000));

    const newAddress = "C" + Math.random().toString(36).substring(2, 12).toUpperCase() + "STEL" + Math.random().toString(36).substring(2, 12).toUpperCase() + "DEPLOYED";
    
    setContractAddressState(newAddress);
    localStorage.setItem("bf_stellar_contract_id", newAddress);
    
    toast.dismiss(loader);
    toast.success(`Soroban Smart Contract Deployed Successfully at ID: ${newAddress}`, { duration: 8000 });
    
    return newAddress;
  };

  const updateContractAddress = (address: string) => {
    if (!address || address.length < 30 || (!address.startsWith('C') && !address.startsWith('G'))) {
      toast.error("Invalid Soroban/Stellar Contract ID or Address!");
      return;
    }
    setContractAddressState(address);
    localStorage.setItem("bf_stellar_contract_id", address);
    toast.success(`Connected to custom Soroban contract: ${address}`);
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
      toast.success(`Smart bidding active for listing #${auctionId} up to ${maxBid} XLM`);
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
          : highestBidFloat + 1.0;

        // Check if limit reached
        const maxBidFloat = parseFloat(sBid.maxBid);
        if (nextBidFloat > maxBidFloat) {
          setSmartBids(prev => {
            const updated = {
              ...prev,
              [a.id]: { ...prev[a.id], active: false }
            };
            return updated;
          });
          toast(`Smart Bidder: Maximum limit of ${sBid.maxBid} XLM reached for Listing #${a.id}! Auto-bidding disabled.`, { icon: '🛑' });
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
          toast(`Smart Bidder: Insufficient balance to place next bid of ${nextBidFloat.toFixed(2)} XLM. Auto-bidding disabled.`, { icon: '⚠️' });
          continue;
        }

        // Prevent double trigger
        if (autoBidsInProgress.current[a.id]) continue;

        autoBidsInProgress.current[a.id] = true;
        
        const loaderId = `smart-bid-toast-${a.id}`;
        toast.loading(`Smart Bidder: Opponent outbid you! Placing auto-bid of ${nextBidFloat.toFixed(2)} XLM...`, { 
          id: loaderId
        });

        try {
          await placeBid(a.id, nextBidFloat.toFixed(2));
          toast.success(`Smart Bidder: Successfully placed automatic bid of ${nextBidFloat.toFixed(2)} XLM!`, { id: loaderId });
        } catch (err: any) {
          console.error("Smart bid auto place failed:", err);
          toast.error(`Smart Bidder: Auto-bid failed: ${err.message}`, { id: loaderId });
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

    const intervalId = setInterval(() => {
      runSmartBids();
    }, 3000);

    runSmartBids();

    return () => {
      clearInterval(intervalId);
    };
  }, [auctions, smartBids, account, balance, placeBid]);

  // Competition/Multi-user Simulator Trigger
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
      ? parseFloat(targetAuction.startingPrice) * 1.1 
      : currentHighestFloat * 1.15; 

    const nextBidStr = nextBidFloat.toFixed(2);

    if (parseFloat(simulatorAccount.balance) < nextBidFloat) {
      toast.error(`Whale ${simulatorAccount.name} tried to bid but is out of funds.`);
      return;
    }

    const note = toast.loading(`Competitive Whale [${simulatorAccount.name.split(' ')[0]}] is typing a bid...`);
    await new Promise(resolve => setTimeout(resolve, 2000));

    const formerBidder = targetAuction.highestBidder;
    const formerBidAmount = targetAuction.highestBid;

    let updatedRefundBalances = { ...refundBalances };
    if (formerBidder && parseFloat(formerBidAmount) > 0) {
      const prevRefund = parseFloat(updatedRefundBalances[formerBidder] || "0");
      updatedRefundBalances[formerBidder] = (prevRefund + parseFloat(formerBidAmount)).toFixed(2);
    }
    setRefundBalances(updatedRefundBalances);

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

    setVirtualAccounts(prev => prev.map(a => {
      if (a.address.toLowerCase() === simulatorAccount.address.toLowerCase()) {
        return {
          ...a,
          balance: (parseFloat(a.balance) - nextBidFloat).toFixed(2)
        };
      }
      return a;
    }));

    const txHash = Math.random().toString(16).substring(2, 66);
    const newBid: BidHistoryItem = {
      id: "tx-sb-" + Math.random().toString(36).substring(2, 10),
      auctionId,
      bidder: simulatorAccount.address,
      amount: nextBidStr,
      timestamp: Math.floor(Date.now() / 1000),
      txHash
    };

    const newTx: Transaction = {
      hash: txHash,
      from: simulatorAccount.address,
      to: contractAddress,
      value: nextBidStr,
      method: "place_bid",
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
                Whale <span className="text-amber-400 font-mono">{simulatorAccount.address.slice(0, 6)}...{simulatorAccount.address.slice(-4)}</span> just outbid the field on auction #{auctionId} with <span className="font-bold text-white">{nextBidStr} XLM</span>!
              </p>
            </div>
          </div>
        </div>
      </div>
    ), { duration: 5000 });
  };

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
