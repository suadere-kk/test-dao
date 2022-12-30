import { AddressZero } from "@ethersproject/constants";
import sdk from "./1-initialize-sdk.js";

(async () => {
    try {
        // ERC-20 コンストラクト
        const tokenAddress = await sdk.deployer.deployToken({
            name: "HealthDAO Governance Token",
            symbol: "HEALTH",
            primary_sale_recipient: AddressZero,
        });
        console.log("Success deployed token address", tokenAddress);
    } catch (error){
        console.error("Failed to deploy token", error);
    }
}
)();