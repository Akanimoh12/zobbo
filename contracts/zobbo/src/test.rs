#![cfg(test)]

extern crate std;

use super::*;
use soroban_sdk::{
    testutils::{Address as _, Events},
    token::{StellarAssetClient, TokenClient},
    Env, String,
};

const ONE: i128 = 10_000_000;

struct Ctx<'a> {
    env: Env,
    zobbo: ZobboClient<'a>,
    token: TokenClient<'a>,
    mint: StellarAssetClient<'a>,
}

fn setup<'a>() -> Ctx<'a> {
    let env = Env::default();
    env.mock_all_auths();

    let admin = Address::generate(&env);
    let sac = env.register_stellar_asset_contract_v2(admin);
    let token_addr = sac.address();

    let zobbo_id = env.register(Zobbo, (&token_addr,));

    Ctx {
        zobbo: ZobboClient::new(&env, &zobbo_id),
        token: TokenClient::new(&env, &token_addr),
        mint: StellarAssetClient::new(&env, &token_addr),
        env,
    }
}

fn s(env: &Env, v: &str) -> String {
    String::from_str(env, v)
}

fn register(ctx: &Ctx, handle: &str) -> Address {
    let owner = Address::generate(&ctx.env);
    ctx.zobbo.register(&owner, &s(&ctx.env, handle), &s(&ctx.env, "Tobi"), &s(&ctx.env, "Beats"));
    owner
}

#[test]
fn constructor_stores_token() {
    let ctx = setup();
    assert_eq!(ctx.zobbo.token(), ctx.token.address);
}

#[test]
fn register_and_read_back() {
    let ctx = setup();
    let owner = register(&ctx, "tobi_01");

    let p = ctx.zobbo.get_profile(&s(&ctx.env, "tobi_01"));
    assert_eq!(p.owner, owner);
    assert_eq!(p.display_name, s(&ctx.env, "Tobi"));
    assert_eq!(p.total_received, 0);
    assert_eq!(p.tip_count, 0);
    assert_eq!(ctx.zobbo.get_handle(&owner), Some(s(&ctx.env, "tobi_01")));
}

#[test]
fn get_handle_none_for_unregistered() {
    let ctx = setup();
    assert_eq!(ctx.zobbo.get_handle(&Address::generate(&ctx.env)), None);
}

#[test]
fn rejects_bad_handles() {
    let ctx = setup();
    let owner = Address::generate(&ctx.env);
    for bad in ["ab", "Tobi", "has space", "dash-ed", "this_handle_is_way_too_long"] {
        let r = ctx.zobbo.try_register(&owner, &s(&ctx.env, bad), &s(&ctx.env, "N"), &s(&ctx.env, "B"));
        assert_eq!(r, Err(Ok(Error::InvalidHandle)), "handle {bad}");
    }
}

#[test]
fn rejects_duplicate_handle() {
    let ctx = setup();
    register(&ctx, "tobi");
    let other = Address::generate(&ctx.env);
    let r = ctx.zobbo.try_register(&other, &s(&ctx.env, "tobi"), &s(&ctx.env, "N"), &s(&ctx.env, "B"));
    assert_eq!(r, Err(Ok(Error::HandleTaken)));
}

#[test]
fn rejects_second_handle_for_same_owner() {
    let ctx = setup();
    let owner = register(&ctx, "tobi");
    let r = ctx.zobbo.try_register(&owner, &s(&ctx.env, "tobi2"), &s(&ctx.env, "N"), &s(&ctx.env, "B"));
    assert_eq!(r, Err(Ok(Error::AlreadyRegistered)));
}

#[test]
fn update_profile_changes_text_only() {
    let ctx = setup();
    let owner = register(&ctx, "tobi");
    ctx.zobbo.update_profile(&owner, &s(&ctx.env, "Tobi B"), &s(&ctx.env, "New bio"));

    let p = ctx.zobbo.get_profile(&s(&ctx.env, "tobi"));
    assert_eq!(p.display_name, s(&ctx.env, "Tobi B"));
    assert_eq!(p.bio, s(&ctx.env, "New bio"));
    assert_eq!(p.owner, owner);
}

#[test]
fn update_profile_requires_registration() {
    let ctx = setup();
    let stranger = Address::generate(&ctx.env);
    let r = ctx.zobbo.try_update_profile(&stranger, &s(&ctx.env, "N"), &s(&ctx.env, "B"));
    assert_eq!(r, Err(Ok(Error::NotFound)));
}

#[test]
fn tip_moves_funds_directly_and_updates_stats() {
    let ctx = setup();
    let creator = register(&ctx, "tobi");
    let fan = Address::generate(&ctx.env);
    ctx.mint.mint(&fan, &(10 * ONE));

    ctx.zobbo.tip(&fan, &s(&ctx.env, "tobi"), &(2 * ONE), &s(&ctx.env, "love it"));

    assert_eq!(ctx.token.balance(&fan), 8 * ONE);
    assert_eq!(ctx.token.balance(&creator), 2 * ONE);
    assert_eq!(ctx.token.balance(&ctx.zobbo.address), 0, "contract must never hold funds");

    let p = ctx.zobbo.get_profile(&s(&ctx.env, "tobi"));
    assert_eq!(p.total_received, 2 * ONE);
    assert_eq!(p.tip_count, 1);
}

#[test]
fn tip_emits_event() {
    let ctx = setup();
    register(&ctx, "tobi");
    let fan = Address::generate(&ctx.env);
    ctx.mint.mint(&fan, &ONE);
    ctx.zobbo.tip(&fan, &s(&ctx.env, "tobi"), &ONE, &s(&ctx.env, "hi"));

    let events = ctx.env.events().all();
    assert!(events.iter().any(|(contract, _, _)| contract == ctx.zobbo.address));
}

#[test]
fn multiple_tips_accumulate() {
    let ctx = setup();
    register(&ctx, "tobi");
    for _ in 0..3 {
        let fan = Address::generate(&ctx.env);
        ctx.mint.mint(&fan, &ONE);
        ctx.zobbo.tip(&fan, &s(&ctx.env, "tobi"), &ONE, &s(&ctx.env, "gm"));
    }
    let p = ctx.zobbo.get_profile(&s(&ctx.env, "tobi"));
    assert_eq!(p.total_received, 3 * ONE);
    assert_eq!(p.tip_count, 3);
}

#[test]
fn rejects_self_tip() {
    let ctx = setup();
    let creator = register(&ctx, "tobi");
    ctx.mint.mint(&creator, &ONE);
    let r = ctx.zobbo.try_tip(&creator, &s(&ctx.env, "tobi"), &ONE, &s(&ctx.env, "me"));
    assert_eq!(r, Err(Ok(Error::SelfTip)));
}

#[test]
fn rejects_zero_and_negative_amounts() {
    let ctx = setup();
    register(&ctx, "tobi");
    let fan = Address::generate(&ctx.env);
    for amt in [0i128, -1] {
        let r = ctx.zobbo.try_tip(&fan, &s(&ctx.env, "tobi"), &amt, &s(&ctx.env, "x"));
        assert_eq!(r, Err(Ok(Error::InvalidAmount)));
    }
}

#[test]
fn rejects_long_message_but_allows_exactly_140() {
    let ctx = setup();
    register(&ctx, "tobi");
    let fan = Address::generate(&ctx.env);
    ctx.mint.mint(&fan, &ONE);

    let long = "a".repeat(141);
    let r = ctx.zobbo.try_tip(&fan, &s(&ctx.env, "tobi"), &ONE, &s(&ctx.env, &long));
    assert_eq!(r, Err(Ok(Error::MessageTooLong)));

    let exact = "a".repeat(140);
    ctx.zobbo.tip(&fan, &s(&ctx.env, "tobi"), &ONE, &s(&ctx.env, &exact));
}

#[test]
fn rejects_tip_to_unknown_handle() {
    let ctx = setup();
    let fan = Address::generate(&ctx.env);
    let r = ctx.zobbo.try_tip(&fan, &s(&ctx.env, "ghost"), &ONE, &s(&ctx.env, "x"));
    assert_eq!(r, Err(Ok(Error::NotFound)));
}
