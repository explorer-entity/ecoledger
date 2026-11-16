pragma circom 2.1.6;

// Proves that `value >= threshold` without revealing value.
template Threshold() {
    signal input value;
    signal input threshold;
    signal output ok;

    // STUB: replace with a real range check before production.
    // For the hackathon MVP this circuit is not compiled or verified on-chain.
    ok <== 1;
}

component main {public [threshold]} = Threshold();
