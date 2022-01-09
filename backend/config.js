(function () {
    console.log("Loading config paths.");
    module.exports.CONFIG_FILE_PATH = "config/chainconfig.json";
    module.exports.MONGO_ADMIN_URL = "mongodb://RubyRose:thanatoast@localhost:27017/";
    module.exports.MONGO_URL = "mongodb://localhost:27017/";
    module.exports.BLOCKCHAIN_HTTP_URL = "http://localhost:8545";
    module.exports.BLOCKCHAIN_WS_URL = "ws://localhost:8546";

    if (process.env.NODE_ENV == "docker") {
        console.log("Running inside a docker container. Adjusting the paths accordingly.");

        module.exports.MONGO_ADMIN_URL = "mongodb://RubyRose:thanatoast@crypto-database:27017/";
        module.exports.MONGO_URL = "mongodb://crypto-database:27017/";
        module.exports.BLOCKCHAIN_HTTP_URL = "http://crypto-blockchain:8545";
        module.exports.BLOCKCHAIN_WS_URL = "ws://crypto-blockchain:8546";
    }
}());