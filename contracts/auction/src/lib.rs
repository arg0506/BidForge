#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, Address, Env, String, Symbol};

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct Auction {
    pub id: u64,
    pub seller: Address,
    pub title: String,
    pub description: String,
    pub image_uri: String,
    pub starting_price: u128,
    pub highest_bid: u128,
    pub highest_bidder: Option<Address>,
    pub end_time: u64,
    pub active: bool,
    pub ended: bool,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub enum DataKey {
    Auction(u64),
    Refund(Address),
    Counter,
}

#[contract]
pub struct AuctionContract;

#[contractimpl]
impl AuctionContract {
    pub fn get_auction_count(env: Env) -> u64 {
        env.storage().instance().get(&DataKey::Counter).unwrap_or(0)
    }

    pub fn get_auction(env: Env, id: u64) -> Option<Auction> {
        env.storage().persistent().get(&DataKey::Auction(id))
    }

    pub fn create_auction(
        env: Env,
        seller: Address,
        title: String,
        description: String,
        image_uri: String,
        starting_price: u128,
        duration: u64,
    ) -> u64 {
        seller.require_auth();

        let mut counter = Self::get_auction_count(env.clone());
        counter += 1;
        env.storage().instance().set(&DataKey::Counter, &counter);

        let end_time = env.ledger().timestamp() + duration;

        let auction = Auction {
            id: counter,
            seller: seller.clone(),
            title,
            description,
            image_uri,
            starting_price,
            highest_bid: starting_price,
            highest_bidder: None,
            end_time,
            active: true,
            ended: false,
        };

        env.storage().persistent().set(&DataKey::Auction(counter), &auction);

        // Publish event
        env.events().publish(
            (Symbol::new(&env, "auction_created"), counter, seller),
            starting_price,
        );

        counter
    }

    pub fn place_bid(env: Env, bidder: Address, auction_id: u64, amount: u128) {
        bidder.require_auth();

        let mut auction: Auction = env
            .storage()
            .persistent()
            .get(&DataKey::Auction(auction_id))
            .expect("Auction not found");

        assert!(auction.active, "Auction is not active");
        assert!(!auction.ended, "Auction has ended");
        assert!(env.ledger().timestamp() < auction.end_time, "Auction has expired");
        assert!(amount > auction.highest_bid, "Bid must be higher than current highest bid");

        // Save pending returns for previous highest bidder (if any)
        if let Some(prev_bidder) = auction.highest_bidder {
            let refund_key = DataKey::Refund(prev_bidder.clone());
            let current_refund: u128 = env.storage().persistent().get(&refund_key).unwrap_or(0);
            env.storage().persistent().set(&refund_key, &(current_refund + auction.highest_bid));
        }

        auction.highest_bid = amount;
        auction.highest_bidder = Some(bidder.clone());

        env.storage().persistent().set(&DataKey::Auction(auction_id), &auction);

        // Publish event
        env.events().publish(
            (Symbol::new(&env, "bid_placed"), auction_id, bidder),
            amount,
        );
    }

    pub fn end_auction(env: Env, auction_id: u64) {
        let mut auction: Auction = env
            .storage()
            .persistent()
            .get(&DataKey::Auction(auction_id))
            .expect("Auction not found");

        assert!(auction.active, "Auction already ended");
        assert!(
            env.ledger().timestamp() >= auction.end_time,
            "Auction end time has not been reached yet"
        );

        auction.active = false;
        auction.ended = true;

        env.storage().persistent().set(&DataKey::Auction(auction_id), &auction);

        // Publish event
        let winner = auction.highest_bidder.clone();
        env.events().publish(
            (Symbol::new(&env, "auction_ended"), auction_id, winner),
            auction.highest_bid,
        );
    }

    pub fn get_refund_balance(env: Env, bidder: Address) -> u128 {
        env.storage().persistent().get(&DataKey::Refund(bidder)).unwrap_or(0)
    }

    pub fn withdraw_refund(env: Env, bidder: Address) -> u128 {
        bidder.require_auth();

        let refund_key = DataKey::Refund(bidder.clone());
        let amount: u128 = env.storage().persistent().get(&refund_key).unwrap_or(0);
        assert!(amount > 0, "No pending refund");

        env.storage().persistent().remove(&refund_key);

        // Publish event
        env.events().publish(
            (Symbol::new(&env, "refund_withdrawn"), bidder),
            amount,
        );

        amount
    }
}
