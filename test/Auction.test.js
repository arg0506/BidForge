const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("AuctionManager Smart Contract", function () {
  let AuctionManager;
  let auctionManager;
  let owner;
  let seller;
  let bidder1;
  let bidder2;

  beforeEach(async function () {
    // Get signers
    [owner, seller, bidder1, bidder2] = await ethers.getSigners();

    // Deploy AuctionManager
    AuctionManager = await ethers.getContractFactory("AuctionManager");
    auctionManager = await AuctionManager.deploy();
    await auctionManager.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should set the right contract owner", async function () {
      expect(await auctionManager.owner()).to.equal(owner.address);
    });
  });

  describe("Auction Lifecycle", function () {
    const title = "Vintage Cyberpunk Ledger";
    const desc = "A fully custom Ledger Nano S from early 2021 with neon glow paint.";
    const imgUri = "https://example.com/item.png";
    const startingPrice = ethers.parseEther("0.1"); // 0.1 ETH
    const duration = 3600; // 1 hour

    it("Should successfully create an auction with correct state", async function () {
      const tx = await auctionManager.connect(seller).createAuction(
        title,
        desc,
        imgUri,
        startingPrice,
        duration
      );

      // Verify event was emitted
      await expect(tx)
        .to.emit(auctionManager, "AuctionCreated")
        .withArgs(1, seller.address, title, startingPrice, sinon => true); // timestamp check is loose

      const auction = await auctionManager.auctions(1);
      expect(auction.title).to.equal(title);
      expect(auction.description).to.equal(desc);
      expect(auction.startingPrice).to.equal(startingPrice);
      expect(auction.active).to.be.true;
      expect(auction.ended).to.be.false;
      expect(auction.seller).to.equal(seller.address);
    });

    it("Should prevent bidding on your own auction", async function () {
      await auctionManager.connect(seller).createAuction(
        title,
        desc,
        imgUri,
        startingPrice,
        duration
      );

      await expect(
        auctionManager.connect(seller).placeBid(1, { value: ethers.parseEther("0.2") })
      ).to.be.revertedWith("Seller cannot bid on own auction");
    });

    it("Should reject bids below the starting price", async function () {
      await auctionManager.connect(seller).createAuction(
        title,
        desc,
        imgUri,
        startingPrice,
        duration
      );

      await expect(
        auctionManager.connect(bidder1).placeBid(1, { value: ethers.parseEther("0.05") })
      ).to.be.revertedWith("Bid must be at least starting price");
    });

    it("Should allow valid bids and track highest bidder", async function () {
      await auctionManager.connect(seller).createAuction(
        title,
        desc,
        imgUri,
        startingPrice,
        duration
      );

      const bidValue = ethers.parseEther("0.15");
      const tx = await auctionManager.connect(bidder1).placeBid(1, { value: bidValue });

      await expect(tx)
        .to.emit(auctionManager, "BidPlaced")
        .withArgs(1, bidder1.address, bidValue);

      const auction = await auctionManager.auctions(1);
      expect(auction.highestBidder).to.equal(bidder1.address);
      expect(auction.highestBid).to.equal(bidValue);
    });

    it("Should credit the previous bidder's balance when outbid", async function () {
      await auctionManager.connect(seller).createAuction(
        title,
        desc,
        imgUri,
        startingPrice,
        duration
      );

      const bid1 = ethers.parseEther("0.2");
      const bid2 = ethers.parseEther("0.3");

      await auctionManager.connect(bidder1).placeBid(1, { value: bid1 });
      
      // Bidder 2 outbids Bidder 1
      await auctionManager.connect(bidder2).placeBid(1, { value: bid2 });

      // Check that Bidder 1 was credited
      const refundBalance = await auctionManager.pendingReturns(bidder1.address);
      expect(refundBalance).to.equal(bid1);
    });

    it("Should allow outbid users to withdraw their funds", async function () {
      await auctionManager.connect(seller).createAuction(
        title,
        desc,
        imgUri,
        startingPrice,
        duration
      );

      const bid1 = ethers.parseEther("0.2");
      const bid2 = ethers.parseEther("0.3");

      await auctionManager.connect(bidder1).placeBid(1, { value: bid1 });
      await auctionManager.connect(bidder2).placeBid(1, { value: bid2 });

      const initialBalance = await ethers.provider.getBalance(bidder1.address);

      // Bidder 1 withdraws
      const tx = await auctionManager.connect(bidder1).withdraw();
      const receipt = await tx.wait();
      
      // Calculate gas spent
      const gasUsed = receipt.gasUsed * receipt.gasPrice;

      const finalBalance = await ethers.provider.getBalance(bidder1.address);
      
      // Final balance = Initial balance + refund - gas fees
      expect(finalBalance).to.equal(initialBalance + bid1 - gasUsed);
    });

    it("Should prevent ending active auctions before duration elapsed", async function () {
      await auctionManager.connect(seller).createAuction(
        title,
        desc,
        imgUri,
        startingPrice,
        duration
      );

      await expect(
        auctionManager.connect(seller).endAuction(1)
      ).to.be.revertedWith("Auction duration has not elapsed");
    });
  });
});
