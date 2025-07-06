import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';

export interface Account {
  'owner' : Principal,
  'subaccount' : [] | [Uint8Array | number[]],
}
export type MetadataValue = { 'Int' : bigint } |
  { 'Nat' : bigint } |
  { 'Blob' : Uint8Array | number[] } |
  { 'Text' : string };
export type Result = { 'ok' : string } |
  { 'err' : string };
export type Result_1 = { 'ok' : UserStatus } |
  { 'err' : string };
export type Time = bigint;
export interface TransferArgs {
  'to' : Account,
  'fee' : [] | [bigint],
  'memo' : [] | [Uint8Array | number[]],
  'from_subaccount' : [] | [Uint8Array | number[]],
  'created_at_time' : [] | [bigint],
  'amount' : bigint,
}
export type TransferError = {
    'GenericError' : { 'message' : string, 'error_code' : bigint }
  } |
  { 'TemporarilyUnavailable' : null } |
  { 'BadBurn' : { 'min_burn_amount' : bigint } } |
  { 'Duplicate' : { 'duplicate_of' : bigint } } |
  { 'BadFee' : { 'expected_fee' : bigint } } |
  { 'CreatedInFuture' : { 'ledger_time' : bigint } } |
  { 'TooOld' : null } |
  { 'InsufficientFunds' : { 'balance' : bigint } };
export type TransferResult = { 'Ok' : bigint } |
  { 'Err' : TransferError };
export interface UserStatus {
  'owner' : Principal,
  'backupWallet' : [] | [Principal],
  'tokenBalance' : bigint,
  'timeout' : bigint,
  'lastPing' : Time,
}
export interface _SERVICE {
  'claim' : ActorMethod<[Principal], Result>,
  'getAllTokenHolders' : ActorMethod<[], Array<[Principal, bigint]>>,
  'getAllUsers' : ActorMethod<[], Array<Principal>>,
  'getMyStatus' : ActorMethod<[], Result_1>,
  'getMyTokenBalance' : ActorMethod<[], bigint>,
  'getUserStatus' : ActorMethod<[Principal], Result_1>,
  'icrc1_balance_of' : ActorMethod<[Account], bigint>,
  'icrc1_decimals' : ActorMethod<[], number>,
  'icrc1_fee' : ActorMethod<[], bigint>,
  'icrc1_metadata' : ActorMethod<[], Array<[string, MetadataValue]>>,
  'icrc1_minting_account' : ActorMethod<[], [] | [Account]>,
  'icrc1_name' : ActorMethod<[], string>,
  'icrc1_supported_standards' : ActorMethod<
    [],
    Array<{ 'url' : string, 'name' : string }>
  >,
  'icrc1_symbol' : ActorMethod<[], string>,
  'icrc1_total_supply' : ActorMethod<[], bigint>,
  'icrc1_transfer' : ActorMethod<[TransferArgs], TransferResult>,
  'initializeUser' : ActorMethod<[], Result>,
  'ping' : ActorMethod<[], Result>,
  'setBackup' : ActorMethod<[Principal], Result>,
  'setTimeout' : ActorMethod<[bigint], Result>,
  'userExists' : ActorMethod<[Principal], boolean>,
}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
