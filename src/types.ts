export interface Auction {
  id: number;
  seller: string;
  title: string;
  description: string;
  imageUri: string;
  startingPrice: string; // in ETH, string format
  highestBid: string;    // in ETH, string format, or "0" if no bids
  highestBidder: string; // address, or empty string
  endTime: number;       // timestamp in seconds
  active: boolean;
  ended: boolean;
  createdAt: number;     // timestamp in seconds
}

export interface BidHistoryItem {
  id: string;
  auctionId: number;
  bidder: string;
  amount: string; // in ETH
  timestamp: number;
  txHash: string;
}

export interface Transaction {
  hash: string;
  from: string;
  to: string;
  value: string; // in ETH
  method: string;
  status: 'pending' | 'success' | 'failed';
  timestamp: number;
  blockNumber: number;
  gasUsed: string;
}

export interface VirtualAccount {
  address: string;
  privateKey: string;
  name: string;
  balance: string; // in ETH
}

export interface SmartBid {
  maxBid: string;
  bidderAddress: string;
  active: boolean;
}

export interface Web3ContextType {
  isConnected: boolean;
  isVirtual: boolean;
  account: string | null;
  accounts: string[];
  balance: string; // in ETH
  networkName: string;
  chainId: number;
  contractAddress: string;
  
  // Real or Virtual Actions
  connectWallet: (walletType: 'metamask' | 'rabby' | 'coinbase' | 'virtual') => Promise<void>;
  disconnectWallet: () => void;
  switchAccount: (address: string) => void;
  requestFaucet: () => Promise<void>;
  
  // Contract Actions
  auctions: Auction[];
  bidHistory: BidHistoryItem[];
  transactions: Transaction[];
  pendingReturns: string; // current connected user's claimable refunded balance (in ETH)
  
  createAuction: (title: string, description: string, imageUri: string, startingPrice: string, durationSeconds: number) => Promise<number>;
  placeBid: (auctionId: number, amount: string) => Promise<string>;
  endAuction: (auctionId: number) => Promise<string>;
  withdrawRefund: () => Promise<string>;
  
  // Custom smart contract actions
  deployContract: () => Promise<string>;
  updateContractAddress: (address: string) => void;
  
  // Smart Bidding Feature
  smartBids: Record<number, SmartBid>;
  setSmartBid: (auctionId: number, maxBid: string, active: boolean) => void;
  
  // Simulator Utilities (to mock multi-user environment in real-time)
  triggerSimulatedBid: (auctionId: number) => Promise<void>;
  blockNumber: number;
}
