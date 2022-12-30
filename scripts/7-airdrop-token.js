import sdk from "./1-initialize-sdk.js";

(async () => {
    try {
        const editionDrop = await sdk.getContract("0xbed337AaA5dE6DcAA96734Bfe8BC621C40B0ab4b", "edition-drop");
        const token = await sdk.getContract("0x36108Ac36A6865c597F15235F7c38bD23cC0B733", "token");
        // QUICK_NODE_URLは使用できないため、ALCHEMY_API_URLに変更する
        // ALCHEMY_API_URLを作成する際は、ネットワークをGoeriにすることを忘れないように
        const walletAddress = await editionDrop.history.getAllClaimerAddresses(0);
        if(walletAddress.length === 0){
            console.log("No NFTs have been claimed yet");
            process.exit(0);
        }

        const airdropTargets = walletAddress.map((address) => {
            const randomAmount = Math.floor(Math.random() * 100);
            console.log("amount", randomAmount, "to", address);
            const airdropTarget = {
                toAddress: address,
                amount: randomAmount,
            };
            return airdropTarget;
        });
        console.log("Starting airdrop...");
        await token.transferBatch(airdropTargets);
        console.log("Success airdrop NFT");
    } catch (error) {
        console.error("Failed to airdrop",error);
    }
})();