const circomlibjs = require("circomlibjs");

(async () => {
  const poseidon = await circomlibjs.buildPoseidon();
  const F = poseidon.F;

  const code = BigInt(1234); // valor secreto convertido para BigInt nativo
  const hash = poseidon([code]);

  console.log("Hash Poseidon de", code.toString(), "→", F.toString(hash));
})();
