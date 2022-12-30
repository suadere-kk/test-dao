import sdk from "./1-initialize-sdk.js";

(async () => {
    try {
        const voteContractAddress = await sdk.deployer.deployVote({
            name: "Vote HealthDAO",
            // 投票や提案に使用できるトークンの指定
            voting_token_address: "0x36108Ac36A6865c597F15235F7c38bD23cC0B733",
            // 提案が作成されたあと、いつから投票できるか？
            voting_delay_in_blocks: 0,
            // 提案後の投票期間、1day = 6570
            voting_period_in_blocks: 6570,
            // 投票結果の可決には、最低何％のtーくんが投票に使われなければならないか？
            voting_quorum_fraction: 0,
            // 提案を作成するために必要なトークン
            proposal_token_threshold: 0,
        });
        console.log("Success vote contract address:", voteContractAddress);
    } catch (error) {
        console.error("Falied to vote contract", error);
    }
})();