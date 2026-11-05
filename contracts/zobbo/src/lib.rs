#![no_std]

use soroban_sdk::{
    contract, contracterror, contractimpl, contracttype, panic_with_error, symbol_short, token,
    Address, Env, String,
};

const DAY: u32 = 17_280;
const TTL_THRESHOLD: u32 = 7 * DAY;
const TTL_EXTEND: u32 = 30 * DAY;

const MAX_MESSAGE_LEN: u32 = 140;
const MAX_NAME_LEN: u32 = 50;
const MAX_BIO_LEN: u32 = 160;

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq)]
#[repr(u32)]
pub enum Error {
    InvalidHandle = 1,
    HandleTaken = 2,
    AlreadyRegistered = 3,
    NotFound = 4,
    InvalidAmount = 5,
    MessageTooLong = 6,
    SelfTip = 7,
    FieldTooLong = 8,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct Profile {
    pub owner: Address,
    pub handle: String,
    pub display_name: String,
    pub bio: String,
    pub total_received: i128,
    pub tip_count: u32,
    pub created_at: u64,
}

#[contracttype]
pub enum DataKey {
    Token,
    Profile(String),
    OwnerHandle(Address),
}

#[contract]
pub struct Zobbo;

#[contractimpl]
impl Zobbo {
    pub fn __constructor(env: Env, token: Address) {
        env.storage().instance().set(&DataKey::Token, &token);
    }

    pub fn register(
        env: Env,
        owner: Address,
        handle: String,
        display_name: String,
        bio: String,
    ) {
        owner.require_auth();

        validate_handle(&env, &handle);
        validate_profile_text(&env, &display_name, &bio);

        let profile_key = DataKey::Profile(handle.clone());
        let owner_key = DataKey::OwnerHandle(owner.clone());
        let store = env.storage().persistent();

        if store.has(&profile_key) {
            panic_with_error!(&env, Error::HandleTaken);
        }
        if store.has(&owner_key) {
            panic_with_error!(&env, Error::AlreadyRegistered);
        }

        let profile = Profile {
            owner: owner.clone(),
            handle: handle.clone(),
            display_name,
            bio,
            total_received: 0,
            tip_count: 0,
            created_at: env.ledger().timestamp(),
        };

        store.set(&profile_key, &profile);
        store.set(&owner_key, &handle);
        bump(&env, &profile_key);
        bump(&env, &owner_key);

        env.events()
            .publish((symbol_short!("register"), handle), owner);
    }

    pub fn update_profile(env: Env, owner: Address, display_name: String, bio: String) {
        owner.require_auth();
        validate_profile_text(&env, &display_name, &bio);

        let owner_key = DataKey::OwnerHandle(owner);
        let handle: String = env
            .storage()
            .persistent()
            .get(&owner_key)
            .unwrap_or_else(|| panic_with_error!(&env, Error::NotFound));

        let profile_key = DataKey::Profile(handle);
        let mut profile: Profile = env
            .storage()
            .persistent()
            .get(&profile_key)
            .unwrap_or_else(|| panic_with_error!(&env, Error::NotFound));

        profile.display_name = display_name;
        profile.bio = bio;

        env.storage().persistent().set(&profile_key, &profile);
        bump(&env, &profile_key);
        bump(&env, &owner_key);
    }

    pub fn tip(env: Env, from: Address, handle: String, amount: i128, message: String) {
        from.require_auth();

        if amount <= 0 {
            panic_with_error!(&env, Error::InvalidAmount);
        }
        if message.len() > MAX_MESSAGE_LEN {
            panic_with_error!(&env, Error::MessageTooLong);
        }

        let profile_key = DataKey::Profile(handle.clone());
        let mut profile: Profile = env
            .storage()
            .persistent()
            .get(&profile_key)
            .unwrap_or_else(|| panic_with_error!(&env, Error::NotFound));

        if profile.owner == from {
            panic_with_error!(&env, Error::SelfTip);
        }

        let token_id: Address = env.storage().instance().get(&DataKey::Token).unwrap();
        token::Client::new(&env, &token_id).transfer(&from, &profile.owner, &amount);

        profile.total_received += amount;
        profile.tip_count += 1;

        env.storage().persistent().set(&profile_key, &profile);
        bump(&env, &profile_key);
        env.storage().instance().extend_ttl(TTL_THRESHOLD, TTL_EXTEND);

        env.events()
            .publish((symbol_short!("tip"), handle), (from, amount, message));
    }

    pub fn get_profile(env: Env, handle: String) -> Profile {
        env.storage()
            .persistent()
            .get(&DataKey::Profile(handle))
            .unwrap_or_else(|| panic_with_error!(&env, Error::NotFound))
    }

    pub fn get_handle(env: Env, owner: Address) -> Option<String> {
        env.storage().persistent().get(&DataKey::OwnerHandle(owner))
    }

    pub fn token(env: Env) -> Address {
        env.storage().instance().get(&DataKey::Token).unwrap()
    }
}

fn bump(env: &Env, key: &DataKey) {
    env.storage()
        .persistent()
        .extend_ttl(key, TTL_THRESHOLD, TTL_EXTEND);
}

fn validate_handle(env: &Env, handle: &String) {
    let len = handle.len();
    if !(3..=20).contains(&len) {
        panic_with_error!(env, Error::InvalidHandle);
    }
    let mut buf = [0u8; 20];
    let bytes = &mut buf[..len as usize];
    handle.copy_into_slice(bytes);
    for &c in bytes.iter() {
        let ok = c.is_ascii_lowercase() || c.is_ascii_digit() || c == b'_';
        if !ok {
            panic_with_error!(env, Error::InvalidHandle);
        }
    }
}

fn validate_profile_text(env: &Env, display_name: &String, bio: &String) {
    if display_name.len() > MAX_NAME_LEN || bio.len() > MAX_BIO_LEN {
        panic_with_error!(env, Error::FieldTooLong);
    }
}

#[cfg(test)]
mod test;
