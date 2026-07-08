// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @dev Contract module that helps prevent reentrant calls to a function.
 */
abstract contract ReentrancyGuard {
    uint256 private constant _NOT_ENTERED = 1;
    uint256 private constant _ENTERED = 2;
    uint256 private _status;

    constructor() {
        _status = _NOT_ENTERED;
    }

    modifier nonReentrant() {
        require(_status != _ENTERED, "ReentrancyGuard: reentrant call");
        _status = _ENTERED;
        _;
        _status = _NOT_ENTERED;
    }
}

/**
 * @dev Contract module which provides a basic access control mechanism, where
 * there is an account (an owner) that can be granted exclusive access to
 * specific functions.
 */
abstract contract Ownable {
    address private _owner;

    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

    constructor() {
        _owner = msg.sender;
        emit OwnershipTransferred(address(0), msg.sender);
    }

    function owner() public view virtual returns (address) {
        return _owner;
    }

    modifier onlyOwner() {
        require(owner() == msg.sender, "Ownable: caller is not the owner");
        _;
    }

    function transferOwnership(address newOwner) public virtual onlyOwner {
        require(newOwner != address(0), "Ownable: new owner is the zero address");
        emit OwnershipTransferred(_owner, newOwner);
        _owner = newOwner;
    }
}

/**
 * @title BidForge Auction Smart Contract
 * @notice Manages decentralized real-time English auctions with bidding, refunds, and withdrawals.
 */
contract AuctionManager is ReentrancyGuard, Ownable {
    
    struct Auction {
        uint256 auctionId;
        address payable seller;
        string title;
        string description;
        string imageUri;
        uint256 startingPrice;
        uint256 highestBid;
        address highestBidder;
        uint256 endTime;
        bool active;
        bool ended;
    }

    // Counter for auction IDs
    uint256 private _auctionIdCounter;

    // Mapping from auction ID to Auction struct
    mapping(uint256 => Auction) public auctions;

    // Mapping to track refundable bids for users (pull payments pattern)
    mapping(address => uint256) public pendingReturns;

    // Events as required by the DApp specifications
    event AuctionCreated(
        uint256 indexed auctionId,
        address indexed seller,
        string title,
        uint256 startingPrice,
        uint256 endTime
    );
    event BidPlaced(
        uint256 indexed auctionId,
        address indexed bidder,
        uint256 amount
    );
    event AuctionEnded(
        uint256 indexed auctionId,
        address winner,
        uint256 highestBid
    );
    event FundsWithdrawn(
        address indexed withdrawer,
        uint256 amount
    );

    /**
     * @notice Creates a new auction
     * @param _title The title of the auction
     * @param _description Detailed description of the auction item
     * @param _imageUri Link or IPFS URI of the item's image
     * @param _startingPrice The initial minimum bid price in wei
     * @param _duration The length of the auction in seconds
     */
    function createAuction(
        string calldata _title,
        string calldata _description,
        string calldata _imageUri,
        uint256 _startingPrice,
        uint256 _duration
    ) external returns (uint256) {
        require(bytes(_title).length > 0, "Title cannot be empty");
        require(_startingPrice > 0, "Starting price must be > 0");
        require(_duration >= 60, "Duration must be at least 1 minute");

        _auctionIdCounter++;
        uint256 newAuctionId = _auctionIdCounter;
        uint256 calculatedEndTime = block.timestamp + _duration;

        auctions[newAuctionId] = Auction({
            auctionId: newAuctionId,
            seller: payable(msg.sender),
            title: _title,
            description: _description,
            imageUri: _imageUri,
            startingPrice: _startingPrice,
            highestBid: 0,
            highestBidder: address(0),
            endTime: calculatedEndTime,
            active: true,
            ended: false
        });

        emit AuctionCreated(
            newAuctionId,
            msg.sender,
            _title,
            _startingPrice,
            calculatedEndTime
        );

        return newAuctionId;
    }

    /**
     * @notice Places a bid on an active auction
     * @param _auctionId The ID of the target auction
     */
    function placeBid(uint256 _auctionId) external payable nonReentrant {
        Auction storage auction = auctions[_auctionId];
        
        // Validation checks
        require(auction.active, "Auction is not active");
        require(block.timestamp < auction.endTime, "Auction has ended");
        require(msg.sender != auction.seller, "Seller cannot bid on own auction");
        
        uint256 minimumBid = auction.highestBid == 0 ? auction.startingPrice : auction.highestBid;
        if (auction.highestBid == 0) {
            require(msg.value >= minimumBid, "Bid must be at least starting price");
        } else {
            require(msg.value > minimumBid, "Bid must be higher than current highest bid");
        }

        // If there was a previous highest bidder, credit their bid amount to their returns balance
        if (auction.highestBidder != address(0)) {
            pendingReturns[auction.highestBidder] += auction.highestBid;
        }

        // Update auction state
        auction.highestBidder = msg.sender;
        auction.highestBid = msg.value;

        emit BidPlaced(_auctionId, msg.sender, msg.value);
    }

    /**
     * @notice Ends an auction. Can be called by anyone once the end time is passed.
     * @param _auctionId The ID of the auction to finalize
     */
    function endAuction(uint256 _auctionId) external nonReentrant {
        Auction storage auction = auctions[_auctionId];

        require(auction.active, "Auction is not active or already ended");
        require(block.timestamp >= auction.endTime, "Auction duration has not elapsed");
        require(!auction.ended, "Auction already finalized");

        // Set state before transfer (Checks-Effects-Interactions pattern)
        auction.ended = true;
        auction.active = false;

        uint256 finalPayout = auction.highestBid;
        address payable seller = auction.seller;
        address winner = auction.highestBidder;

        emit AuctionEnded(_auctionId, winner, finalPayout);

        // If there was a highest bid, transfer the funds to the seller
        if (finalPayout > 0 && winner != address(0)) {
            (bool success, ) = seller.call{value: finalPayout}("");
            require(success, "Transfer of final payout to seller failed");
        }
    }

    /**
     * @notice Withdraws refundable bids (pull-payment pattern)
     */
    function withdraw() external nonReentrant returns (bool) {
        uint256 amount = pendingReturns[msg.sender];
        require(amount > 0, "No refundable balance found");

        // Zero out balance before transferring to prevent reentrancy
        pendingReturns[msg.sender] = 0;

        (bool success, ) = payable(msg.sender).call{value: amount}("");
        require(success, "Withdrawal transfer failed");

        emit FundsWithdrawn(msg.sender, amount);
        return true;
    }

    /**
     * @notice Get current total count of auctions created
     */
    function getAuctionCount() external view returns (uint256) {
        return _auctionIdCounter;
    }
}
