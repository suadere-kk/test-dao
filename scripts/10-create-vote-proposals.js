import sdk from "./1-initialize-sdk.js";
import { ethers } from "ethers";

(async () => {
    try {
        const vote = await sdk.getContract("0x167AcC6f761E04a46548EF8fA677c5C744dB369E", "vote");
        const token = await sdk.getContract("0x36108Ac36A6865c597F15235F7c38bD23cC0B733", "token");
        const amount = 420_000;
        const description = "Should the DAO mint an adiitional " + amount + " token into to treasury?";
        const executions = [
            {
                //作成するトークン
                toAddress: token.getAddress(),
                //提案で送信したいETHの量、トークン作成のみのため0でOK
                nativeTokenValue: 0,
                // amountをwei単位に変換する
                // voteに送金する
                transactionData: token.encoder.encode(
                    "mintTo",
                    [
                        vote.getAddress(),
                        ethers.utils.parseUnits(amount.toString(),18),
                    ]
                ),
            }
        ];
        await vote.propose(description, executions);
        console.log("success create proposal")
    } catch(error) {
        console.error("Failed to create first proposal", error);
    }

    try {
        const vote = await sdk.getContract("0x167AcC6f761E04a46548EF8fA677c5C744dB369E", "vote");
        const token = await sdk.getContract("0x36108Ac36A6865c597F15235F7c38bD23cC0B733", "token");
        const amount = 6_900;
        const description = "Should the DAO transfer " + amount + " token from treasury to" + process.env.WALLET_ADDRESS + "?";
        const executions = [
            {
                //作成するトークン
                toAddress: token.getAddress(),
                //例えば、0.1EHTとトークンを報酬として送りたい場合は、ここに0.1ETHを書き込む
                nativeTokenValue: 0,
                // amountをwei単位に変換する
                // voteに送金する
                transactionData: token.encoder.encode(
                    "transfer",
                    [
                        process.env.WALLET_ADDRESS,
                        ethers.utils.parseUnits(amount.toString(),18),
                    ]
                ),
            }
        ];
        await vote.propose(description, executions);
        console.log("success create proposal")
    } catch(error) {
        console.error("Failed to create first proposal", error);
    }
})();