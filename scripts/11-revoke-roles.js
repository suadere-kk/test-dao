import sdk from "./1-initialize-sdk.js";

(async () => {
    try {
        const token = await sdk.getContract("0x36108Ac36A6865c597F15235F7c38bD23cC0B733", "token");
        const allRoles = await token.roles.getAll();
        console.log("All roles", allRoles);
        //投票や提案に使うトークンの権限をなくす
        await token.roles.setAll({
            admin: [],
            minter: [],
        });
        console.log("All roles after delete", await token.roles.getAll());
    } catch(error){
        console.error("Failed to delete permisiion", error);
    }
})();