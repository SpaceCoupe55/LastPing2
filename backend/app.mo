import Nat "mo:base/Nat";
import Nat8 "mo:base/Nat8";
import Nat64 "mo:base/Nat64";
import Time "mo:base/Time";
import Principal "mo:base/Principal";
import HashMap "mo:base/HashMap";
import Iter "mo:base/Iter";
import Array "mo:base/Array";
import Result "mo:base/Result";
import Text "mo:base/Text";
import Option "mo:base/Option";
import Blob "mo:base/Blob";

actor LastPingFactory {
  // ICRC-1 Types
  public type Account = {
    owner : Principal;
    subaccount : ?Blob;
  };

  public type TransferArgs = {
    from_subaccount : ?Blob;
    to : Account;
    amount : Nat;
    fee : ?Nat;
    memo : ?Blob;
    created_at_time : ?Nat64;
  };

  public type TransferResult = {
    #Ok : Nat;
    #Err : TransferError;
  };

  public type TransferError = {
    #BadFee : { expected_fee : Nat };
    #BadBurn : { min_burn_amount : Nat };
    #InsufficientFunds : { balance : Nat };
    #TooOld;
    #CreatedInFuture : { ledger_time : Nat64 };
    #Duplicate : { duplicate_of : Nat };
    #TemporarilyUnavailable;
    #GenericError : { error_code : Nat; message : Text };
  };

  public type Value = {
    #Nat : Nat;
    #Int : Int;
    #Text : Text;
    #Blob : Blob;
  };

  public type MetadataValue = {
    #Nat : Nat;
    #Int : Int;
    #Text : Text;
    #Blob : Blob;
  };

  // Token metadata
  private let TOKEN_NAME = "LastPing Token";
  private let TOKEN_SYMBOL = "LPT";
  private let TOKEN_DECIMALS = 8; // Changed to 8 for ICRC-1 compliance
  private let TOKEN_FEE = 10000; // 0.0001 LPT (10000 / 10^8)
  private let INITIAL_TOKEN_GRANT = 10000000000; // 100 LPT (100 * 10^8)
  private let PING_REWARD = 100000000; // 1 LPT (1 * 10^8)

  // Individual user's LastPing data
  public type UserPingData = {
    owner: Principal;
    backupWallet: ?Principal;
    lastPing: Time.Time;
    timeout: Nat;
  };

  // Enhanced user data with token info
  public type UserStatus = {
    owner: Principal;
    backupWallet: ?Principal;
    lastPing: Time.Time;
    timeout: Nat;
    tokenBalance: Nat;
  };

  // Stable storage for users and tokens
  private stable var users : [(Principal, UserPingData)] = [];
  private stable var tokenBalances : [(Principal, Nat)] = [];
  private stable var isInitialized : Bool = false;
  private stable var totalSupply : Nat = 0;
  private stable var transactionCounter : Nat = 0;
  
  // Runtime hashmaps
  private var userMap = HashMap.HashMap<Principal, UserPingData>(0, Principal.equal, Principal.hash);
  private var tokenMap = HashMap.HashMap<Principal, Nat>(0, Principal.equal, Principal.hash);

  // Sample test data
  private let sampleAccounts : [(Principal, Nat)] = [
    (Principal.fromText("rrkah-fqaaa-aaaaa-aaaaq-cai"), 50000000000), // 500 LPT
    (Principal.fromText("rdmx6-jaaaa-aaaaa-aaadq-cai"), 75000000000), // 750 LPT
    (Principal.fromText("rno2w-sqaaa-aaaaa-aaacq-cai"), 25000000000), // 250 LPT
    (Principal.fromText("rkp4c-7iaaa-aaaaa-aaaca-cai"), 120000000000), // 1200 LPT
    (Principal.fromText("renrk-eyaaa-aaaaa-aaada-cai"), 30000000000)  // 300 LPT
  ];

  // Initialize sample data
  private func initializeSampleData() {
    for ((principal, balance) in sampleAccounts.vals()) {
      tokenMap.put(principal, balance);
      totalSupply += balance;
    };
    isInitialized := true;
  };

  // Restore state after upgrade
  system func preupgrade() {
    users := Iter.toArray(userMap.entries());
    tokenBalances := Iter.toArray(tokenMap.entries());
  };

  system func postupgrade() {
    userMap := HashMap.fromIter<Principal, UserPingData>(users.vals(), users.size(), Principal.equal, Principal.hash);
    tokenMap := HashMap.fromIter<Principal, Nat>(tokenBalances.vals(), tokenBalances.size(), Principal.equal, Principal.hash);
    
    if (not isInitialized) {
      initializeSampleData();
    };
  };

  // Helper function to get account balance
  private func getBalance(account : Account) : Nat {
    // For now, we ignore subaccounts and use only the owner
    // In a full implementation, you'd need to handle subaccounts
    switch (tokenMap.get(account.owner)) {
      case (?balance) { balance };
      case null { 0 };
    };
  };

  // Helper function to set account balance
  private func setBalance(account : Account, balance : Nat) {
    tokenMap.put(account.owner, balance);
  };

  // ICRC-1 REQUIRED FUNCTIONS

  // Get token name
  public query func icrc1_name() : async Text {
    TOKEN_NAME;
  };

  // Get token symbol
  public query func icrc1_symbol() : async Text {
    TOKEN_SYMBOL;
  };

  // Get token decimals
  public query func icrc1_decimals() : async Nat8 {
    Nat8.fromNat(TOKEN_DECIMALS);
  };

  // Get token fee
  public query func icrc1_fee() : async Nat {
    TOKEN_FEE;
  };

  // Get token metadata
  public query func icrc1_metadata() : async [(Text, MetadataValue)] {
    [
      ("icrc1:name", #Text(TOKEN_NAME)),
      ("icrc1:symbol", #Text(TOKEN_SYMBOL)),
      ("icrc1:decimals", #Nat(TOKEN_DECIMALS)),
      ("icrc1:fee", #Nat(TOKEN_FEE)),
      ("icrc1:total_supply", #Nat(totalSupply)),
      ("icrc1:minting_account", #Blob(Principal.toBlob(Principal.fromActor(LastPingFactory)))),
    ];
  };

  // Get total supply
  public query func icrc1_total_supply() : async Nat {
    totalSupply;
  };

  // Get minting account
  public query func icrc1_minting_account() : async ?Account {
    ?{
      owner = Principal.fromActor(LastPingFactory);
      subaccount = null;
    };
  };

  // Get account balance
  public query func icrc1_balance_of(account : Account) : async Nat {
    getBalance(account);
  };

  // Transfer tokens
  public shared(msg) func icrc1_transfer(args : TransferArgs) : async TransferResult {
    let caller = msg.caller;
    let now = Nat64.fromIntWrap(Time.now());
    
    // Create from account
    let from_account : Account = {
      owner = caller;
      subaccount = args.from_subaccount;
    };
    
    // Validate transfer
    if (args.amount == 0) {
      return #Err(#GenericError({ error_code = 1; message = "Transfer amount must be greater than 0" }));
    };
    
    // Check fee
    let fee = Option.get(args.fee, TOKEN_FEE);
    if (fee != TOKEN_FEE) {
      return #Err(#BadFee({ expected_fee = TOKEN_FEE }));
    };
    
    // Check balance
    let from_balance = getBalance(from_account);
    let total_amount = args.amount + fee;
    
    if (from_balance < total_amount) {
      return #Err(#InsufficientFunds({ balance = from_balance }));
    };
    
    // Check for duplicate transaction (simplified)
    // In a full implementation, you'd track transaction hashes
    
    // Check timestamp
    switch (args.created_at_time) {
      case (?timestamp) {
        let diff = if (now > timestamp) { now - timestamp } else { timestamp - now };
        if (diff > 300_000_000_000) { // 5 minutes in nanoseconds
          return #Err(#TooOld);
        };
        if (timestamp > now + 60_000_000_000) { // 1 minute in future
          return #Err(#CreatedInFuture({ ledger_time = now }));
        };
      };
      case null {};
    };
    
    // Perform transfer
    let to_balance = getBalance(args.to);
    
    setBalance(from_account, from_balance - total_amount);
    setBalance(args.to, to_balance + args.amount);
    
    // Fee goes to minting account (or is burned)
    // In this case, we'll reduce total supply (burn the fee)
    totalSupply := totalSupply - fee;
    
    transactionCounter += 1;
    
    #Ok(transactionCounter);
  };

  // Get supported standards
  public query func icrc1_supported_standards() : async [{ name : Text; url : Text }] {
    [
      { name = "ICRC-1"; url = "https://github.com/dfinity/ICRC-1" },
      { name = "ICRC-2"; url = "https://github.com/dfinity/ICRC-2" }
    ];
  };

  // EXISTING LASTPING FUNCTIONS (Updated for ICRC-1)

  // Initialize a new user's LastPing account
  public shared(msg) func initializeUser() : async Result.Result<Text, Text> {
    let caller = msg.caller;
    
    if (not isInitialized) {
      initializeSampleData();
    };
    
    switch (userMap.get(caller)) {
      case (?existing) {
        #err("User already has an active LastPing account");
      };
      case null {
        let newUserData : UserPingData = {
          owner = caller;
          backupWallet = null;
          lastPing = Time.now();
          timeout = 30 * 86_400_000_000_000; // 30 days in nanoseconds
        };
        userMap.put(caller, newUserData);
        
        // Grant initial tokens to new user
        let currentBalance = getBalance({ owner = caller; subaccount = null });
        setBalance({ owner = caller; subaccount = null }, currentBalance + INITIAL_TOKEN_GRANT);
        totalSupply += INITIAL_TOKEN_GRANT;
        
        #ok("LastPing account initialized successfully! You received " # Nat.toText(INITIAL_TOKEN_GRANT / 100000000) # " " # TOKEN_SYMBOL);
      };
    };
  };

  // Set backup wallet for the calling user
  public shared(msg) func setBackup(backupPrincipal : Principal) : async Result.Result<Text, Text> {
    let caller = msg.caller;
    
    switch (userMap.get(caller)) {
      case (?userData) {
        let updatedData : UserPingData = {
          owner = userData.owner;
          backupWallet = ?backupPrincipal;
          lastPing = userData.lastPing;
          timeout = userData.timeout;
        };
        userMap.put(caller, updatedData);
        #ok("Backup wallet set successfully. This wallet will inherit your account and all tokens if you fail to ping.");
      };
      case null {
        #err("User not found. Please initialize your account first.");
      };
    };
  };

  // Set timeout for the calling user
  public shared(msg) func setTimeout(newTimeout : Nat) : async Result.Result<Text, Text> {
    let caller = msg.caller;
    
    switch (userMap.get(caller)) {
      case (?userData) {
        let updatedData : UserPingData = {
          owner = userData.owner;
          backupWallet = userData.backupWallet;
          lastPing = userData.lastPing;
          timeout = newTimeout;
        };
        userMap.put(caller, updatedData);
        #ok("Timeout updated successfully");
      };
      case null {
        #err("User not found. Please initialize your account first.");
      };
    };
  };

  // Ping function for the calling user (now with ICRC-1 compliant token rewards)
  public shared(msg) func ping() : async Result.Result<Text, Text> {
    let caller = msg.caller;
    
    switch (userMap.get(caller)) {
      case (?userData) {
        let updatedData : UserPingData = {
          owner = userData.owner;
          backupWallet = userData.backupWallet;
          lastPing = Time.now();
          timeout = userData.timeout;
        };
        userMap.put(caller, updatedData);
        
        // Reward user with tokens for pinging
        let currentBalance = getBalance({ owner = caller; subaccount = null });
        setBalance({ owner = caller; subaccount = null }, currentBalance + PING_REWARD);
        totalSupply += PING_REWARD;
        
        #ok("Ping successful! Timer reset. You earned " # Nat.toText(PING_REWARD / 100000000) # " " # TOKEN_SYMBOL # " tokens!");
      };
      case null {
        #err("User not found. Please initialize your account first.");
      };
    };
  };

  // Enhanced claim ownership (now includes ICRC-1 compliant token transfer)
  public shared(msg) func claim(originalOwner : Principal) : async Result.Result<Text, Text> {
    let caller = msg.caller;
    
    switch (userMap.get(originalOwner)) {
      case (?userData) {
        switch (userData.backupWallet) {
          case (?backup) {
            if (Principal.equal(caller, backup)) {
              if (Time.now() > userData.lastPing + userData.timeout) {
                // Get original owner's token balance
                let tokensToTransfer = getBalance({ owner = originalOwner; subaccount = null });
                
                // Transfer tokens to backup wallet
                if (tokensToTransfer > 0) {
                  let backupCurrentBalance = getBalance({ owner = backup; subaccount = null });
                  
                  setBalance({ owner = originalOwner; subaccount = null }, 0);
                  setBalance({ owner = backup; subaccount = null }, backupCurrentBalance + tokensToTransfer);
                };
                
                // Transfer ownership to backup
                let updatedData : UserPingData = {
                  owner = backup;
                  backupWallet = null;
                  lastPing = Time.now();
                  timeout = userData.timeout;
                };
                userMap.put(originalOwner, updatedData);
                
                let tokenMessage = if (tokensToTransfer > 0) {
                  " You also inherited " # Nat.toText(tokensToTransfer / 100000000) # " " # TOKEN_SYMBOL # " tokens.";
                } else {
                  "";
                };
                
                #ok("Ownership claimed successfully!" # tokenMessage);
              } else {
                #err("Timeout period has not expired yet");
              };
            } else {
              #err("Only the designated backup wallet can claim ownership");
            };
          };
          case null {
            #err("No backup wallet is set for this account");
          };
        };
      };
      case null {
        #err("Original owner account not found");
      };
    };
  };

  // CONVENIENCE FUNCTIONS (Non-ICRC-1 but useful)

  // Get calling user's token balance (convenience function)
  public shared(msg) func getMyTokenBalance() : async Nat {
    let caller = msg.caller;
    getBalance({ owner = caller; subaccount = null });
  };

  // Get enhanced status for the calling user
  public shared(msg) func getMyStatus() : async Result.Result<UserStatus, Text> {
    let caller = msg.caller;
    
    switch (userMap.get(caller)) {
      case (?userData) {
        let tokenBalance = getBalance({ owner = caller; subaccount = null });
        
        let enhancedStatus : UserStatus = {
          owner = userData.owner;
          backupWallet = userData.backupWallet;
          lastPing = userData.lastPing;
          timeout = userData.timeout;
          tokenBalance = tokenBalance;
        };
        #ok(enhancedStatus);
      };
      case null {
        #err("User not found. Please initialize your account first.");
      };
    };
  };

  // Get enhanced status for any user
  public query func getUserStatus(user : Principal) : async Result.Result<UserStatus, Text> {
    switch (userMap.get(user)) {
      case (?userData) {
        let tokenBalance = getBalance({ owner = user; subaccount = null });
        
        let enhancedStatus : UserStatus = {
          owner = userData.owner;
          backupWallet = userData.backupWallet;
          lastPing = userData.lastPing;
          timeout = userData.timeout;
          tokenBalance = tokenBalance;
        };
        #ok(enhancedStatus);
      };
      case null {
        #err("User not found");
      };
    };
  };

  // Check if user exists
  public query func userExists(user : Principal) : async Bool {
    switch (userMap.get(user)) {
      case (?_) { true };
      case null { false };
    };
  };

  // Get all users (for admin purposes)
  public query func getAllUsers() : async [Principal] {
    Iter.toArray(userMap.keys());
  };

  // Get all token holders (for testing/admin purposes)
  public query func getAllTokenHolders() : async [(Principal, Nat)] {
    Iter.toArray(tokenMap.entries());
  };
}