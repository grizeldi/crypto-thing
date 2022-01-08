(function () {
    const Web3 = require("web3");
    const web3 = new Web3("ws://localhost:8546");
    const w3personal = require('web3-eth-personal');
    const w3eth = require('web3-eth');
    const personal = new w3personal('http://localhost:8545'); // Weee, plain text passwords over http, here we come
    const eth = new w3eth("ws://localhost:8546");
    const fs = require('fs');
    const mongo = require("mongodb");
    const { MongoClient } = require("mongodb");

    const uri = "mongodb://RubyRose:thanatoast@localhost:27017/";

    let mongoClient = new MongoClient(uri);

    const generateDownloadToken = function () {

    };

    module.exports.getFilePathFromToken = function () {
        
    };

    module.exports.connectToDatabase = function () {
        return new Promise(async (done, failed) => {
            await mongoClient.connect();
            console.log("Data retrieval oracle mongo connection established.");
            done();
        });
    };

    module.exports.listen = function () {
        const config = JSON.parse(fs.readFileSync("config/chainconfig.json"));
        let contract = new eth.Contract(config.dataOracleAbi, config.dataOracleAddress);
        contract.events.OnDataRequest({}, async (error, event) => {
            if (error){
                console.log("Error in connection to the ID smart contract.");
                console.log(error);
                return;
            }
            const reqAddress = event.returnValues._fromUser;
            console.log("Data retrieval oracle receiving request from " + reqAddress);

            const db = mongoClient.db("crypto");
            const user = await db.collection("users").findOne({address: reqAddress});
            const roles = user.roles;

            const datapiece = await db.collection("data").findOne({_id: mongo.ObjectId(event.returnValues._dataId)});
            if (datapiece) {
                let shareRoles = false;
                roles.forEach(element => {
                    datapiece.roles.forEach(otherrole => {
                        if (otherrole.toString() == element.toString()){
                            shareRoles = true;
                            return;
                        }
                    });
                    if (shareRoles)
                        return;
                });
                
                await personal.unlockAccount(config.adminAddress, "testingpassword", 30);
                await contract.methods.fulfill(reqAddress, shareRoles ? datapiece.content : "null").send({from: config.adminAddress});
    
                console.log("Data oracle fullfilled request for " + reqAddress);
            } else {
                console.log("Data request from " + reqAddress + " comes with an invalid data ID.");
            }
        })
        .on("connected", function (subscriptionId) {
            console.log("Oracle connected to the data retrieval smart contract.");
        });
    }
}());