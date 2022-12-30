import sdk from "./1-initialize-sdk.js";
import { readFileSync } from "fs";

(async ()=> {
    try {
        const editionDrop = await sdk.getContract("0xbed337AaA5dE6DcAA96734Bfe8BC621C40B0ab4b", "edition-drop");
        // NFTを作成している
        await editionDrop.createBatch([
            {
                name:"minion favarite banana",
                description:"This NFT will give you access to HealthDAO",
                image: readFileSync("scripts/assets/banana.png"),
            },
        ]);
        console.log("Success new NFT");
    } catch (error) {
        console.log("Failed to create NFT", error);
    }
})();