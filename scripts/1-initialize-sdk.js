import { ThirdwebSDK } from "@thirdweb-dev/sdk";

import dotenv from "dotenv";
dotenv.config();

if(!process.env.PRIVATE_KEY || process.env.PRIVATE_KEY === ""){
    console.log("PRIVATE_KEY not found");
}

if(!process.env.QUICKNODE_API_URL || process.env.QUICKNODE_API_URL === ""){
    console.log("QUIKENODE_API_URL not found");
}

if(!process.env.ALCHEMY_API_URL || process.env.ALCHEMY_API_URL === ""){
    console.log("ALCHEMY_API_URL not found");
}

if(!process.env.WALLET_ADDRESS || process.env.WALLET_ADDRESS === ""){
    console.log("WALLET_ADDRESS not found");
}

const sdk = ThirdwebSDK.fromPrivateKey(
    process.env.PRIVATE_KEY,
    process.env.ALCHEMY_API_URL
);

(async () => {
    try {
        const address = await sdk.getSigner().getAddress();
        console.log("SDK address:", address);
    } catch (err) {
        console.error("Failed to initialized sdk",err);
        process.exit(1);
    }
})();

export default sdk;