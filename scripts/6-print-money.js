import sdk from "./1-initialize-sdk.js";

(async () => {
    try {
        const token = await sdk.getContract("0x36108Ac36A6865c597F15235F7c38bD23cC0B733", "token");
        const amount = 1_000_000;
        await token.mint(amount);
        const totalSupply = await token.totalSupply();
        console.log("There now is ", totalSupply.displayValue);
    } catch (error) {
        console.error("Failed to print money", error);
    }
})();