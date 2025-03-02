'use strict';
const __compactRuntime = require('@midnight-ntwrk/compact-runtime');
const expectedRuntimeVersionString = '0.7.0';
const expectedRuntimeVersion = expectedRuntimeVersionString.split('-')[0].split('.').map(Number);
const actualRuntimeVersion = __compactRuntime.versionString.split('-')[0].split('.').map(Number);
if (expectedRuntimeVersion[0] != actualRuntimeVersion[0]
     || (actualRuntimeVersion[0] == 0 && expectedRuntimeVersion[1] != actualRuntimeVersion[1])
     || expectedRuntimeVersion[1] > actualRuntimeVersion[1]
     || (expectedRuntimeVersion[1] == actualRuntimeVersion[1] && expectedRuntimeVersion[2] > actualRuntimeVersion[2]))
   throw new __compactRuntime.CompactError(`Version mismatch: compiled code expects ${expectedRuntimeVersionString}, runtime is ${__compactRuntime.versionString}`);
{ const MAX_FIELD = 102211695604070082112571065507755096754575920209623522239390234855480569854275933742834077002685857629445612735086326265689167708028928n;
  if (__compactRuntime.MAX_FIELD !== MAX_FIELD)
     throw new __compactRuntime.CompactError(`compiler thinks maximum field value is ${MAX_FIELD}; run time thinks it is ${__compactRuntime.MAX_FIELD}`)
}

const _descriptor_0 = new __compactRuntime.CompactTypeField();

const _descriptor_1 = new __compactRuntime.CompactTypeVector(2, _descriptor_0);

class _EthiopianNationalityCredential_0 {
  alignment() {
    return _descriptor_0.alignment().concat(_descriptor_0.alignment().concat(_descriptor_0.alignment().concat(_descriptor_0.alignment().concat(_descriptor_0.alignment().concat(_descriptor_0.alignment().concat(_descriptor_1.alignment()))))));
  }
  fromValue(value_0) {
    return {
      id: _descriptor_0.fromValue(value_0),
      issuer: _descriptor_0.fromValue(value_0),
      issuedAt: _descriptor_0.fromValue(value_0),
      expiresAt: _descriptor_0.fromValue(value_0),
      subject: _descriptor_0.fromValue(value_0),
      nationality: _descriptor_0.fromValue(value_0),
      signature: _descriptor_1.fromValue(value_0)
    }
  }
  toValue(value_0) {
    return _descriptor_0.toValue(value_0.id).concat(_descriptor_0.toValue(value_0.issuer).concat(_descriptor_0.toValue(value_0.issuedAt).concat(_descriptor_0.toValue(value_0.expiresAt).concat(_descriptor_0.toValue(value_0.subject).concat(_descriptor_0.toValue(value_0.nationality).concat(_descriptor_1.toValue(value_0.signature)))))));
  }
}

const _descriptor_2 = new _EthiopianNationalityCredential_0();

const _descriptor_3 = new __compactRuntime.CompactTypeBoolean();

const _descriptor_4 = new __compactRuntime.CompactTypeBytes(32);

class _ContractAddress_0 {
  alignment() {
    return _descriptor_4.alignment();
  }
  fromValue(value_0) {
    return {
      bytes: _descriptor_4.fromValue(value_0)
    }
  }
  toValue(value_0) {
    return _descriptor_4.toValue(value_0.bytes);
  }
}

const _descriptor_5 = new _ContractAddress_0();

const _descriptor_6 = new __compactRuntime.CompactTypeUnsignedInteger(18446744073709551615n, 8);

const _descriptor_7 = new __compactRuntime.CompactTypeUnsignedInteger(255n, 1);

class Contract {
  witnesses;
  constructor(...args_0) {
    if (args_0.length !== 1)
      throw new __compactRuntime.CompactError(`Contract constructor: expected 1 argument, received ${args_0.length}`);
    const witnesses_0 = args_0[0];
    if (typeof(witnesses_0) !== 'object')
      throw new __compactRuntime.CompactError('first (witnesses) argument to Contract constructor is not an object');
    if (typeof(witnesses_0.create_test_credential) !== 'function')
      throw new __compactRuntime.CompactError('first (witnesses) argument to Contract constructor does not contain a function-valued field named create_test_credential');
    this.witnesses = witnesses_0;
    this.circuits = {
      verify_and_record_nationality: (...args_1) => {
        if (args_1.length !== 3)
          throw new __compactRuntime.CompactError(`verify_and_record_nationality: expected 3 arguments (as invoked from Typescript), received ${args_1.length}`);
        const contextOrig_0 = args_1[0];
        const credential_0 = args_1[1];
        const current_time_0 = args_1[2];
        if (!(typeof(contextOrig_0) === 'object' && contextOrig_0.originalState != undefined && contextOrig_0.transactionContext != undefined))
          __compactRuntime.type_error('verify_and_record_nationality',
                                      'argument 1 (as invoked from Typescript)',
                                      'contracts/ethiopian_nationality_verification.compact line 73, char 1',
                                      'CircuitContext',
                                      contextOrig_0)
        if (!(typeof(credential_0) === 'object' && typeof(credential_0.id) === 'bigint' && credential_0.id >= 0 && credential_0.id <= __compactRuntime.MAX_FIELD && typeof(credential_0.issuer) === 'bigint' && credential_0.issuer >= 0 && credential_0.issuer <= __compactRuntime.MAX_FIELD && typeof(credential_0.issuedAt) === 'bigint' && credential_0.issuedAt >= 0 && credential_0.issuedAt <= __compactRuntime.MAX_FIELD && typeof(credential_0.expiresAt) === 'bigint' && credential_0.expiresAt >= 0 && credential_0.expiresAt <= __compactRuntime.MAX_FIELD && typeof(credential_0.subject) === 'bigint' && credential_0.subject >= 0 && credential_0.subject <= __compactRuntime.MAX_FIELD && typeof(credential_0.nationality) === 'bigint' && credential_0.nationality >= 0 && credential_0.nationality <= __compactRuntime.MAX_FIELD && Array.isArray(credential_0.signature) && credential_0.signature.length === 2 && credential_0.signature.every((t) => typeof(t) === 'bigint' && t >= 0 && t <= __compactRuntime.MAX_FIELD)))
          __compactRuntime.type_error('verify_and_record_nationality',
                                      'argument 1 (argument 2 as invoked from Typescript)',
                                      'contracts/ethiopian_nationality_verification.compact line 73, char 1',
                                      'struct EthiopianNationalityCredential<id: Field, issuer: Field, issuedAt: Field, expiresAt: Field, subject: Field, nationality: Field, signature: Vector<2, Field>>',
                                      credential_0)
        if (!(typeof(current_time_0) === 'bigint' && current_time_0 >= 0 && current_time_0 <= __compactRuntime.MAX_FIELD))
          __compactRuntime.type_error('verify_and_record_nationality',
                                      'argument 2 (argument 3 as invoked from Typescript)',
                                      'contracts/ethiopian_nationality_verification.compact line 73, char 1',
                                      'Field',
                                      current_time_0)
        const context = { ...contextOrig_0 };
        const partialProofData = {
          input: {
            value: _descriptor_2.toValue(credential_0).concat(_descriptor_0.toValue(current_time_0)),
            alignment: _descriptor_2.alignment().concat(_descriptor_0.alignment())
          },
          output: undefined,
          publicTranscript: [],
          privateTranscriptOutputs: []
        };
        const result_0 = this.#_verify_and_record_nationality_0(context,
                                                                partialProofData,
                                                                credential_0,
                                                                current_time_0);
        partialProofData.output = { value: [], alignment: [] };
        return { result: result_0, context: context, proofData: partialProofData };
      },
      test_verification: (...args_1) => {
        if (args_1.length !== 1)
          throw new __compactRuntime.CompactError(`test_verification: expected 1 argument (as invoked from Typescript), received ${args_1.length}`);
        const contextOrig_0 = args_1[0];
        if (!(typeof(contextOrig_0) === 'object' && contextOrig_0.originalState != undefined && contextOrig_0.transactionContext != undefined))
          __compactRuntime.type_error('test_verification',
                                      'argument 1 (as invoked from Typescript)',
                                      'contracts/ethiopian_nationality_verification.compact line 90, char 1',
                                      'CircuitContext',
                                      contextOrig_0)
        const context = { ...contextOrig_0 };
        const partialProofData = {
          input: { value: [], alignment: [] },
          output: undefined,
          publicTranscript: [],
          privateTranscriptOutputs: []
        };
        const result_0 = this.#_test_verification_0(context, partialProofData);
        partialProofData.output = { value: [], alignment: [] };
        return { result: result_0, context: context, proofData: partialProofData };
      }
    };
    this.impureCircuits = {
      verify_and_record_nationality: this.circuits.verify_and_record_nationality,
      test_verification: this.circuits.test_verification
    };
  }
  initialState(...args_0) {
    if (args_0.length !== 1)
      throw new __compactRuntime.CompactError(`Contract state constructor: expected 1 argument (as invoked from Typescript), received ${args_0.length}`);
    const constructorContext_0 = args_0[0];
    if (typeof(constructorContext_0) !== 'object') {
      throw new __compactRuntime.CompactError(`Contract state constructor: expected 'constructorContext' in argument 1 (as invoked from Typescript) to be an object`);
    }
    if (!('initialPrivateState' in constructorContext_0)) {
      throw new __compactRuntime.CompactError(`Contract state constructor: expected 'initialPrivateState' in argument 1 (as invoked from Typescript)`);
    }
    if (!('initialZswapLocalState' in constructorContext_0)) {
      throw new __compactRuntime.CompactError(`Contract state constructor: expected 'initialZswapLocalState' in argument 1 (as invoked from Typescript)`);
    }
    if (typeof(constructorContext_0.initialZswapLocalState) !== 'object') {
      throw new __compactRuntime.CompactError(`Contract state constructor: expected 'initialZswapLocalState' in argument 1 (as invoked from Typescript) to be an object`);
    }
    const state_0 = new __compactRuntime.ContractState();
    let stateValue_0 = __compactRuntime.StateValue.newArray();
    stateValue_0 = stateValue_0.arrayPush(__compactRuntime.StateValue.newNull());
    state_0.data = stateValue_0;
    state_0.setOperation('verify_and_record_nationality', new __compactRuntime.ContractOperation());
    state_0.setOperation('test_verification', new __compactRuntime.ContractOperation());
    const context = {
      originalState: state_0,
      currentPrivateState: constructorContext_0.initialPrivateState,
      currentZswapLocalState: constructorContext_0.initialZswapLocalState,
      transactionContext: new __compactRuntime.QueryContext(state_0.data, __compactRuntime.dummyContractAddress())
    };
    const partialProofData = {
      input: { value: [], alignment: [] },
      output: undefined,
      publicTranscript: [],
      privateTranscriptOutputs: []
    };
    Contract._query(context,
                    partialProofData,
                    [
                     { push: { storage: false,
                               value: __compactRuntime.StateValue.newCell({ value: _descriptor_7.toValue(0n),
                                                                            alignment: _descriptor_7.alignment() }).encode() } },
                     { push: { storage: true,
                               value: __compactRuntime.StateValue.newMap(
                                        new __compactRuntime.StateMap()
                                      ).encode() } },
                     { ins: { cached: false, n: 1 } }]);
    state_0.data = context.transactionContext.state;
    return {
      currentContractState: state_0,
      currentPrivateState: context.currentPrivateState,
      currentZswapLocalState: context.currentZswapLocalState
    }
  }
  #_get_authorized_issuer_0(context, partialProofData) {
    return 123456789012345678901234567890n;
  }
  #_get_ethiopian_nationality_code_0(context, partialProofData) {
    return 987654321098765432109876543210n;
  }
  #_is_credential_valid_0(context,
                          partialProofData,
                          credential_0,
                          current_time_0)
  {
    const expires_at_uint_0 = ((t1) => {
                                if (t1 > 18446744073709551615n)
                                  throw new __compactRuntime.CompactError('contracts/ethiopian_nationality_verification.compact line 41, char 29: cast from field value to Uint value failed: ' + t1 + ' is greater than 18446744073709551615');
                                return t1;
                              })(credential_0.expiresAt);
    const current_time_uint_0 = ((t1) => {
                                  if (t1 > 18446744073709551615n)
                                    throw new __compactRuntime.CompactError('contracts/ethiopian_nationality_verification.compact line 42, char 31: cast from field value to Uint value failed: ' + t1 + ' is greater than 18446744073709551615');
                                  return t1;
                                })(current_time_0);
    return !(expires_at_uint_0 < current_time_uint_0);
  }
  #_is_issuer_authorized_0(context, partialProofData, issuer_0) {
    return issuer_0
           ===
           this.#_get_authorized_issuer_0(context, partialProofData);
  }
  #_verify_ethiopian_nationality_0(context,
                                   partialProofData,
                                   credential_0,
                                   current_time_0)
  {
    const issuer_valid_0 = this.#_is_issuer_authorized_0(context,
                                                         partialProofData,
                                                         credential_0.issuer);
    const not_expired_0 = this.#_is_credential_valid_0(context,
                                                       partialProofData,
                                                       credential_0,
                                                       current_time_0);
    const is_ethiopian_0 = credential_0.nationality
                           ===
                           this.#_get_ethiopian_nationality_code_0(context,
                                                                   partialProofData);
    return issuer_valid_0 && not_expired_0 && is_ethiopian_0;
  }
  #_verify_and_record_nationality_0(context,
                                    partialProofData,
                                    credential_0,
                                    current_time_0)
  {
    const is_valid_0 = this.#_verify_ethiopian_nationality_0(context,
                                                             partialProofData,
                                                             credential_0,
                                                             current_time_0);
    const tmp_0 = credential_0.subject;
    const tmp_1 = is_valid_0;
    Contract._query(context,
                    partialProofData,
                    [
                     { idx: { cached: false,
                              pushPath: true,
                              path: [
                                     { tag: 'value',
                                       value: { value: _descriptor_7.toValue(0n),
                                                alignment: _descriptor_7.alignment() } }] } },
                     { push: { storage: false,
                               value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(tmp_0),
                                                                            alignment: _descriptor_0.alignment() }).encode() } },
                     { push: { storage: true,
                               value: __compactRuntime.StateValue.newCell({ value: _descriptor_3.toValue(tmp_1),
                                                                            alignment: _descriptor_3.alignment() }).encode() } },
                     { ins: { cached: false, n: 1 } },
                     { ins: { cached: true, n: 1 } }]);
    return [];
  }
  #_create_test_credential_0(context, partialProofData) {
    const witnessContext_0 = __compactRuntime.witnessContext(ledger(context.transactionContext.state), context.currentPrivateState, context.transactionContext.address);
    const [nextPrivateState_0, result_0] = this.witnesses.create_test_credential(witnessContext_0);
    context.currentPrivateState = nextPrivateState_0;
    if (!(typeof(result_0) === 'object' && typeof(result_0.id) === 'bigint' && result_0.id >= 0 && result_0.id <= __compactRuntime.MAX_FIELD && typeof(result_0.issuer) === 'bigint' && result_0.issuer >= 0 && result_0.issuer <= __compactRuntime.MAX_FIELD && typeof(result_0.issuedAt) === 'bigint' && result_0.issuedAt >= 0 && result_0.issuedAt <= __compactRuntime.MAX_FIELD && typeof(result_0.expiresAt) === 'bigint' && result_0.expiresAt >= 0 && result_0.expiresAt <= __compactRuntime.MAX_FIELD && typeof(result_0.subject) === 'bigint' && result_0.subject >= 0 && result_0.subject <= __compactRuntime.MAX_FIELD && typeof(result_0.nationality) === 'bigint' && result_0.nationality >= 0 && result_0.nationality <= __compactRuntime.MAX_FIELD && Array.isArray(result_0.signature) && result_0.signature.length === 2 && result_0.signature.every((t) => typeof(t) === 'bigint' && t >= 0 && t <= __compactRuntime.MAX_FIELD)))
      __compactRuntime.type_error('create_test_credential',
                                  'return value',
                                  'contracts/ethiopian_nationality_verification.compact line 87, char 1',
                                  'struct EthiopianNationalityCredential<id: Field, issuer: Field, issuedAt: Field, expiresAt: Field, subject: Field, nationality: Field, signature: Vector<2, Field>>',
                                  result_0)
    partialProofData.privateTranscriptOutputs.push({
      value: _descriptor_2.toValue(result_0),
      alignment: _descriptor_2.alignment()
    });
    return result_0;
  }
  #_test_verification_0(context, partialProofData) {
    const test_credential_0 = this.#_create_test_credential_0(context,
                                                              partialProofData);
    const current_time_0 = 1677609600n;
    this.#_verify_and_record_nationality_0(context,
                                           partialProofData,
                                           test_credential_0,
                                           current_time_0);
    let tmp_0;
    const is_verified_0 = (tmp_0 = test_credential_0.subject,
                           _descriptor_3.fromValue(Contract._query(context,
                                                                   partialProofData,
                                                                   [
                                                                    { dup: { n: 0 } },
                                                                    { idx: { cached: false,
                                                                             pushPath: false,
                                                                             path: [
                                                                                    { tag: 'value',
                                                                                      value: { value: _descriptor_7.toValue(0n),
                                                                                               alignment: _descriptor_7.alignment() } }] } },
                                                                    { idx: { cached: false,
                                                                             pushPath: false,
                                                                             path: [
                                                                                    { tag: 'value',
                                                                                      value: { value: _descriptor_0.toValue(tmp_0),
                                                                                               alignment: _descriptor_0.alignment() } }] } },
                                                                    { popeq: { cached: false,
                                                                               result: undefined } }]).value));
    return [];
  }
  static _query(context, partialProofData, prog) {
    var res;
    try {
      res = context.transactionContext.query(prog, __compactRuntime.CostModel.dummyCostModel());
    } catch (err) {
      throw new __compactRuntime.CompactError(err.toString());
    }
    context.transactionContext = res.context;
    var reads = res.events.filter((e) => e.tag === 'read');
    var i = 0;
    partialProofData.publicTranscript = partialProofData.publicTranscript.concat(prog.map((op) => {
      if(typeof(op) === 'object' && 'popeq' in op) {
        return { popeq: {
          ...op.popeq,
          result: reads[i++].content,
        } };
      } else {
        return op;
      }
    }));
    if(res.events.length == 1 && res.events[0].tag === 'read') {
      return res.events[0].content;
    } else {
      return res.events;
    }
  }
}
function ledger(state) {
  const context = {
    originalState: state,
    transactionContext: new __compactRuntime.QueryContext(state, __compactRuntime.dummyContractAddress())
  };
  const partialProofData = {
    input: { value: [], alignment: [] },
    output: undefined,
    publicTranscript: [],
    privateTranscriptOutputs: []
  };
  return {
    nationalityVerifications: {
      isEmpty(...args_0) {
        if (args_0.length !== 0)
          throw new __compactRuntime.CompactError(`is_empty: expected 0 arguments, received ${args_0.length}`);
        return _descriptor_3.fromValue(Contract._query(context,
                                                       partialProofData,
                                                       [
                                                        { dup: { n: 0 } },
                                                        { idx: { cached: false,
                                                                 pushPath: false,
                                                                 path: [
                                                                        { tag: 'value',
                                                                          value: { value: _descriptor_7.toValue(0n),
                                                                                   alignment: _descriptor_7.alignment() } }] } },
                                                        'size',
                                                        { push: { storage: false,
                                                                  value: __compactRuntime.StateValue.newCell({ value: _descriptor_6.toValue(0n),
                                                                                                               alignment: _descriptor_6.alignment() }).encode() } },
                                                        'eq',
                                                        { popeq: { cached: true,
                                                                   result: undefined } }]).value);
      },
      size(...args_0) {
        if (args_0.length !== 0)
          throw new __compactRuntime.CompactError(`size: expected 0 arguments, received ${args_0.length}`);
        return _descriptor_6.fromValue(Contract._query(context,
                                                       partialProofData,
                                                       [
                                                        { dup: { n: 0 } },
                                                        { idx: { cached: false,
                                                                 pushPath: false,
                                                                 path: [
                                                                        { tag: 'value',
                                                                          value: { value: _descriptor_7.toValue(0n),
                                                                                   alignment: _descriptor_7.alignment() } }] } },
                                                        'size',
                                                        { popeq: { cached: true,
                                                                   result: undefined } }]).value);
      },
      member(...args_0) {
        if (args_0.length !== 1)
          throw new __compactRuntime.CompactError(`member: expected 1 argument, received ${args_0.length}`);
        const key_0 = args_0[0];
        if (!(typeof(key_0) === 'bigint' && key_0 >= 0 && key_0 <= __compactRuntime.MAX_FIELD))
          __compactRuntime.type_error('member',
                                      'argument 1',
                                      'contracts/ethiopian_nationality_verification.compact line 6, char 1',
                                      'Field',
                                      key_0)
        return _descriptor_3.fromValue(Contract._query(context,
                                                       partialProofData,
                                                       [
                                                        { dup: { n: 0 } },
                                                        { idx: { cached: false,
                                                                 pushPath: false,
                                                                 path: [
                                                                        { tag: 'value',
                                                                          value: { value: _descriptor_7.toValue(0n),
                                                                                   alignment: _descriptor_7.alignment() } }] } },
                                                        { push: { storage: false,
                                                                  value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(key_0),
                                                                                                               alignment: _descriptor_0.alignment() }).encode() } },
                                                        'member',
                                                        { popeq: { cached: true,
                                                                   result: undefined } }]).value);
      },
      lookup(...args_0) {
        if (args_0.length !== 1)
          throw new __compactRuntime.CompactError(`lookup: expected 1 argument, received ${args_0.length}`);
        const key_0 = args_0[0];
        if (!(typeof(key_0) === 'bigint' && key_0 >= 0 && key_0 <= __compactRuntime.MAX_FIELD))
          __compactRuntime.type_error('lookup',
                                      'argument 1',
                                      'contracts/ethiopian_nationality_verification.compact line 6, char 1',
                                      'Field',
                                      key_0)
        return _descriptor_3.fromValue(Contract._query(context,
                                                       partialProofData,
                                                       [
                                                        { dup: { n: 0 } },
                                                        { idx: { cached: false,
                                                                 pushPath: false,
                                                                 path: [
                                                                        { tag: 'value',
                                                                          value: { value: _descriptor_7.toValue(0n),
                                                                                   alignment: _descriptor_7.alignment() } }] } },
                                                        { idx: { cached: false,
                                                                 pushPath: false,
                                                                 path: [
                                                                        { tag: 'value',
                                                                          value: { value: _descriptor_0.toValue(key_0),
                                                                                   alignment: _descriptor_0.alignment() } }] } },
                                                        { popeq: { cached: false,
                                                                   result: undefined } }]).value);
      },
      [Symbol.iterator](...args_0) {
        if (args_0.length !== 0)
          throw new __compactRuntime.CompactError(`iter: expected 0 arguments, received ${args_0.length}`);
        const self_0 = state.asArray()[0];
        return self_0.asMap().keys().map(  (key) => {    const value = self_0.asMap().get(key).asCell();    return [      _descriptor_0.fromValue(key.value),      _descriptor_3.fromValue(value.value)    ];  })[Symbol.iterator]();
      }
    }
  };
}
const _emptyContext = {
  originalState: new __compactRuntime.ContractState(),
  transactionContext: new __compactRuntime.QueryContext(new __compactRuntime.ContractState().data, __compactRuntime.dummyContractAddress())
};
const _dummyContract = new Contract({
  create_test_credential: (...args) => undefined
});
const pureCircuits = { };
const contractReferenceLocations = { tag: 'publicLedgerArray', indices: { } };
exports.Contract = Contract;
exports.ledger = ledger;
exports.pureCircuits = pureCircuits;
exports.contractReferenceLocations = contractReferenceLocations;
//# sourceMappingURL=index.cjs.map
