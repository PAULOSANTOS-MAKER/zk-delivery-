pragma circom 2.0.0;

include "circomlib/circuits/poseidon.circom";
include "circomlib/circuits/comparators.circom";

template SmartLocker() {
    // Inputs
    signal input secretCode;
    signal input expectedHash;
    signal input timestamp;
    
    // Outputs
    signal output isValid;
    signal output proofTimestamp;

    // Hash the secret code
    component hasher = Poseidon(1);
    hasher.inputs[0] <== secretCode;

    // Compare the hashed code with expected hash
    component isEqual = IsEqual();
    isEqual.in[0] <== hasher.out;
    isEqual.in[1] <== expectedHash;

    // Output validation result
    isValid <== isEqual.out;
    
    // Output timestamp for audit purposes
    proofTimestamp <== timestamp;
}

component main = SmartLocker();
