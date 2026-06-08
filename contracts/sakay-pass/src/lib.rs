#![no_std]
use soroban_sdk::{contract, contracterror, contractimpl, contracttype, Address, Env};

#[contracttype]
pub enum DataKey {
    Passes(Address),
    DriverBalance(Address),
}

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum Error {
    NotEnoughPasses = 1,
    InvalidAmount = 2,
    NoBalance = 3,
}

#[contract]
pub struct SakayPassContract;

#[contractimpl]
impl SakayPassContract {
    /// Student buys a pass
    pub fn buy_pass(env: Env, student: Address, amount: i128) -> Result<i128, Error> {
        student.require_auth();
        if amount <= 0 {
            return Err(Error::InvalidAmount);
        }
        
        let mut passes: i128 = env.storage().persistent().get(&DataKey::Passes(student.clone())).unwrap_or(0);
        passes += amount;
        env.storage().persistent().set(&DataKey::Passes(student.clone()), &passes);
        env.storage().persistent().extend_ttl(&DataKey::Passes(student.clone()), 1000, 5000);
        Ok(passes)
    }

    /// Driver records a ride for a student, transferring 1 pass to the driver's balance
    pub fn record_ride(env: Env, driver: Address, student: Address) -> Result<(), Error> {
        driver.require_auth();

        let passes: i128 = env.storage().persistent().get(&DataKey::Passes(student.clone())).unwrap_or(0);
        if passes < 1 {
            return Err(Error::NotEnoughPasses);
        }
        
        // Deduct from student
        env.storage().persistent().set(&DataKey::Passes(student.clone()), &(passes - 1));
        
        // Add to driver
        let mut balance: i128 = env.storage().persistent().get(&DataKey::DriverBalance(driver.clone())).unwrap_or(0);
        balance += 1;
        env.storage().persistent().set(&DataKey::DriverBalance(driver.clone()), &balance);
        
        env.storage().persistent().extend_ttl(&DataKey::Passes(student), 1000, 5000);
        env.storage().persistent().extend_ttl(&DataKey::DriverBalance(driver), 1000, 5000);
        Ok(())
    }

    /// Driver claims their accumulated balance
    pub fn claim(env: Env, driver: Address) -> Result<i128, Error> {
        driver.require_auth();
        
        let balance: i128 = env.storage().persistent().get(&DataKey::DriverBalance(driver.clone())).unwrap_or(0);
        if balance <= 0 {
            return Err(Error::NoBalance);
        }
        
        env.storage().persistent().set(&DataKey::DriverBalance(driver.clone()), &0i128);
        env.storage().persistent().extend_ttl(&DataKey::DriverBalance(driver), 1000, 5000);
        Ok(balance)
    }
    
    pub fn get_student_passes(env: Env, student: Address) -> i128 {
        env.storage().persistent().get(&DataKey::Passes(student)).unwrap_or(0)
    }

    pub fn get_driver_balance(env: Env, driver: Address) -> i128 {
        env.storage().persistent().get(&DataKey::DriverBalance(driver)).unwrap_or(0)
    }
}

mod test;
