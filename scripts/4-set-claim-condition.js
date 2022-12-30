import sdk from "./1-initialize-sdk.js";
import { MaxUint256 } from "@ethersproject/constants";

(async ()=> {
    try {
        const editionDrop = await sdk.getContract("0xbed337AaA5dE6DcAA96734Bfe8BC621C40B0ab4b", "edition-drop");
        // 発行条件などを設定
        const claimConditions = [
            {
                startTime: new Date(),
                maxClaimable: 50_000,
                price: 0,
                maxClaimablePerWallet: 1,
                waitInSecond: MaxUint256,
            },
        ]
        //　0を設定するのはメンバーシップNFTは0番目のNFTでみんなが0番目のNFTを持つため
        await editionDrop.claimConditions.set("0",claimConditions);
        console.log("Success new condition");
    } catch (error) {
        console.log("Failed to set condition", error);
    }
})();