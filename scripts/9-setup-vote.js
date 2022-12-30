import sdk from "./1-initialize-sdk.js";

(async () => {
    try {
        const vote = await sdk.getContract("0x167AcC6f761E04a46548EF8fA677c5C744dB369E", "vote");
        const token = await sdk.getContract("0x36108Ac36A6865c597F15235F7c38bD23cC0B733", "token");
        // トークンを作成する権限を与える
        await token.roles.grant("minter", vote.getAddress());
        console.log("success attach permission");
    } catch (error){
        console.log("Failed to attach permission", error);
        process.exit(1);
    }

    try {
        const vote = await sdk.getContract("0x167AcC6f761E04a46548EF8fA677c5C744dB369E", "vote");
        const token = await sdk.getContract("0x36108Ac36A6865c597F15235F7c38bD23cC0B733", "token");
        // 自分のウォレットには、エアドロップした分以外のトークンが全て入っている
        const ownedTokenBalance = await token.balanceOf(process.env.WALLET_ADDRESS);

        const ownedAmount = ownedTokenBalance.displayValue;
        const percent90 = Number(ownedAmount) / 100 * 90;
        // 90%をvoteに移行
        await token.transfer(vote.getAddress(), percent90);
        console.log("success transfer", percent90);
    } catch(error){
        console.error("Failed to setup contract", error);
    }
})();