pragma circom 2.0.0;

include "circomlib/circuits/poseidon.circom";

template ZKCode() {
    signal private input code;
    signal input codeHash;
    signal output isValid;

    component hasher = Poseidon(1);
    hasher.inputs[0] <== code;

    isValid <== hasher.out === codeHash;
}

component main { public [codeHash, isValid] } = ZKCode();