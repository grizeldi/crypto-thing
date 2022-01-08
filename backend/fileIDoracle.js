(function () {
    const Web3 = require("web3");
    const web3 = new Web3("ws://localhost:8546");
    const w3personal = require('web3-eth-personal');
    const w3eth = require('web3-eth');
    const personal = new w3personal('http://localhost:8545'); // Weee, plain text passwords over http, here we come
    const eth = new w3eth("ws://localhost:8546");
    const fs = require('fs');
    const { MongoClient } = require("mongodb");

    const uri = "mongodb://RubyRose:thanatoast@localhost:27017/";

    let mongoClient = new MongoClient(uri);

    module.exports.connectToDatabase = function () {
        return new Promise(async (done, failed) => {
            await mongoClient.connect();
            console.log("Data ID oracle mongo connection established.");
            done();
        });
    }

    module.exports.listen = function () {
        const config = JSON.parse(fs.readFileSync("config/chainconfig.json"));
        let contract = new eth.Contract(config.idOracleAbi, config.idOracleAddress);
        contract.events.OnDataRequest({}, async (error, event) => {
            if (error){
                console.log("Error in connection to the ID smart contract.");
                console.log(error);
                return;
            }
            const reqAddress = event.returnValues._fromUser;
            console.log("Data ID oracle receiving request from " + reqAddress);

            const db = mongoClient.db("crypto");
            const user = await db.collection("users").findOne({address: reqAddress});
            const roles = user.roles;

            const dataIds = [];
            for (let i = 0; i < roles.length; i++){
                const dataAvailable = await db.collection("data").find({roles: roles[i]}).toArray();
                dataAvailable.forEach((datapiece) => dataIds.push(datapiece._id.toString()));
            }
            
            // Send the data back to the contract where the user can pick it up
            await personal.unlockAccount(config.adminAddress, "testingpassword", 30);
            await contract.methods.fulfill(reqAddress, dataIds).send({from: config.adminAddress});
            console.log("Data ID oracle fullfilled request for " + reqAddress);
        })
        .on("connected", function (subscriptionId) {
            console.log("Oracle connected to the ID smart contract.");
        });
    }
}());