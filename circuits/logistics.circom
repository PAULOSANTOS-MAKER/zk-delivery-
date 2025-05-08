pragma circom 2.0.0;

include "circomlib/circuits/poseidon.circom";
include "circomlib/circuits/comparators.circom";

template DeliveryProof() {
    // Inputs
    signal input deliveryId;        // ID único da entrega
    signal input secretLocation;    // Localização secreta (hash)
    signal input expectedLocation;  // Localização esperada (hash)
    signal input timestamp;         // Timestamp da entrega
    signal input deliveryCode;      // Código de entrega
    
    // Outputs
    signal output isValid;
    signal output proofTimestamp;
    signal output deliveryProof;

    // Verifica se a localização corresponde
    component locationHasher = Poseidon(1);
    locationHasher.inputs[0] <== secretLocation;

    component locationCheck = IsEqual();
    locationCheck.in[0] <== locationHasher.out;
    locationCheck.in[1] <== expectedLocation;

    // Verifica o código de entrega
    component codeHasher = Poseidon(1);
    codeHasher.inputs[0] <== deliveryCode;

    // Gera prova de entrega
    component deliveryHasher = Poseidon(3);
    deliveryHasher.inputs[0] <== deliveryId;
    deliveryHasher.inputs[1] <== locationHasher.out;
    deliveryHasher.inputs[2] <== timestamp;

    // Validação final
    isValid <== locationCheck.out;
    proofTimestamp <== timestamp;
    deliveryProof <== deliveryHasher.out;
}

component main = DeliveryProof(); 