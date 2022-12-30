import { AddressZero } from "@ethersproject/constants";
import sdk from "./1-initialize-sdk.js";
import { readFileSync } from "fs";

(async () => {
    try {
        // コレクションを作成している
        const editionDropAddress = await sdk.deployer.deployEditionDrop({
            name: "HealthDAO Membership",
            description:"A DAO for fans of Health",
            // 画像はIPFSにアップロードされる
            image: readFileSync("scripts/assets/minion.png"),
            // トークン発行で収益を受け取らないため
            primary_sale_recipient: AddressZero,
        });
        // ERC-1155のコントラクトをデプロイした
        const editionDrop = await sdk.getContract(editionDropAddress, "edition-drop");
        const metadata = await editionDrop.metadata.get();
        console.log("Success editionDrop, address:", editionDropAddress);
        console.log("editionDrop, metadata:", metadata);
    } catch (erro){
        console.log("Failed to deploy editionDrop contract", error);
    }
})();