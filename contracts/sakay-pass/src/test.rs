#![cfg(test)]

use super::*;
use soroban_sdk::{testutils::Address as _, Address, Env};

#[test]
fn test_sakay_pass() {
    let env = Env::default();
    env.mock_all_auths();
    let contract_id = env.register_contract(None, SakayPassContract);
    let client = SakayPassContractClient::new(&env, &contract_id);

    let student = Address::generate(&env);
    let driver = Address::generate(&env);

    // Buy pass
    assert_eq!(client.buy_pass(&student, &10), 10);
    assert_eq!(client.get_student_passes(&student), 10);

    // Record ride
    client.record_ride(&driver, &student);
    assert_eq!(client.get_student_passes(&student), 9);
    assert_eq!(client.get_driver_balance(&driver), 1);

    // Claim
    assert_eq!(client.claim(&driver), 1);
    assert_eq!(client.get_driver_balance(&driver), 0);
}
