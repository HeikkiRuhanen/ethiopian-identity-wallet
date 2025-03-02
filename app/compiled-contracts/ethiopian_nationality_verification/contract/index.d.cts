import type * as __compactRuntime from '@midnight-ntwrk/compact-runtime';

export type Witnesses<T> = {
  create_test_credential(context: __compactRuntime.WitnessContext<Ledger, T>): [T, { id: bigint,
                                                                                     issuer: bigint,
                                                                                     issuedAt: bigint,
                                                                                     expiresAt: bigint,
                                                                                     subject: bigint,
                                                                                     nationality: bigint,
                                                                                     signature: bigint[]
                                                                                   }];
}

export type ImpureCircuits<T> = {
  verify_and_record_nationality(context: __compactRuntime.CircuitContext<T>,
                                credential_0: { id: bigint,
                                                issuer: bigint,
                                                issuedAt: bigint,
                                                expiresAt: bigint,
                                                subject: bigint,
                                                nationality: bigint,
                                                signature: bigint[]
                                              },
                                current_time_0: bigint): __compactRuntime.CircuitResults<T, []>;
  test_verification(context: __compactRuntime.CircuitContext<T>): __compactRuntime.CircuitResults<T, []>;
}

export type PureCircuits = {
}

export type Circuits<T> = {
  verify_and_record_nationality(context: __compactRuntime.CircuitContext<T>,
                                credential_0: { id: bigint,
                                                issuer: bigint,
                                                issuedAt: bigint,
                                                expiresAt: bigint,
                                                subject: bigint,
                                                nationality: bigint,
                                                signature: bigint[]
                                              },
                                current_time_0: bigint): __compactRuntime.CircuitResults<T, []>;
  test_verification(context: __compactRuntime.CircuitContext<T>): __compactRuntime.CircuitResults<T, []>;
}

export type Ledger = {
  nationalityVerifications: {
    isEmpty(): boolean;
    size(): bigint;
    member(key_0: bigint): boolean;
    lookup(key_0: bigint): boolean;
    [Symbol.iterator](): Iterator<[bigint, boolean]>
  };
}

export type ContractReferenceLocations = any;

export declare const contractReferenceLocations : ContractReferenceLocations;

export declare class Contract<T, W extends Witnesses<T> = Witnesses<T>> {
  witnesses: W;
  circuits: Circuits<T>;
  impureCircuits: ImpureCircuits<T>;
  constructor(witnesses: W);
  initialState(context: __compactRuntime.ConstructorContext<T>): __compactRuntime.ConstructorResult<T>;
}

export declare function ledger(state: __compactRuntime.StateValue): Ledger;
export declare const pureCircuits: PureCircuits;
