pragma circom 2.0.0;
include "circomlib/poseidon.circom";

template HashWithTimestamp() {
    signal input secretCode;
    signal input timestamp;
    signal input expectedHash;

    component hasher = Poseidon(2);
    hasher.inputs[0] <== secretCode;
    hasher.inputs[1] <== timestamp;

    hasher.out === expectedHash;
}

component main = HashWithTimestamp();

