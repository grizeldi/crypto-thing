const paths = require("./config");
const { MongoClient } = require("mongodb");
const Web3 = require("web3");
const web3 = new Web3(paths.BLOCKCHAIN_HTTP_URL);
const w3personal = require('web3-eth-personal');
const w3eth = require('web3-eth');
const personal = new w3personal(paths.BLOCKCHAIN_HTTP_URL); // Weee, plain text passwords over http, here we come
const eth = new w3eth(paths.BLOCKCHAIN_HTTP_URL);
const fs = require('fs');
const solidityCompiler = require('solc');

// In a non local deployment, don't hardcode the username/password combo.
const adminUri = paths.MONGO_ADMIN_URL;
const uri = paths.MONGO_URL;
const userMetaMaskAddress = process.env.METAMASK_ADDRESS != null ? process.env.METAMASK_ADDRESS : "0xbe4C690E2CF401804b409e2B64d885430b0983a2"; //hardcoded address is for dev, so I don't need to specify the env every time

async function run() {
    // Delete the DB
    let client = new MongoClient(adminUri);
    try {
        console.log("Dropping DB.");
        await client.connect();
        const database = client.db("crypto");
        await database.dropDatabase();
    } catch (err) {
        console.log("Error while trying to delete DB: " + err);
    } finally {
        await client.close();
        console.log("DB dropped.");
    }
    console.log("Creating DB.");
    const newDbClient = await MongoClient.connect(uri + "crypto");
    console.log("Created DB.")
    newDbClient.close();
    try {
        console.log("Filling in with test data.");
        client = new MongoClient(adminUri);
        await client.connect();
        const database = client.db("crypto");
        const rolesCollection = database.collection("roles");
        const dataCollection = database.collection("data");
        const usersColelction = database.collection("users");

        // Add the roles
        defaultRoles = [
            { name: "Accounting" },
            { name: "Human Resources" },
            { name: "Research and Development" },
            { name: "Sales" }
        ];
        await rolesCollection.insertMany(defaultRoles);

        // Add the data
        defaultData = [
            { title: "Earnings Report 1999", content: "In that year we earned such and such moniez. It was a good year.", roles: [defaultRoles[0]._id, defaultRoles[3]._id] },
            { title: "Promotional Pamphlet June 2020", content: "<insert marketing text here>", roles: [defaultRoles[3]._id] },
            { title: "Open Positions April 2020", content: "Web Developers. Like seriously, we need more of those.", roles: [defaultRoles[1]._id] },
            { title: "Junior Web Developer Expertise Test", content: "Task 1: make a calculator in angularjs.\n Task 2: reimplement google homepage's design.", roles: [defaultRoles[1]._id]},
            { title: "Top Secret Juice Recipe", content: "Mix 2 mangos with 1 avocado. Add cinammon and put into the fridge for at least 2 hours.", roles: [defaultRoles[2]._id]}
        ]
        await dataCollection.insertMany(defaultData);

        // Add the users
        console.log("Creating default users.");
        defaultUsers = [
            { name: "Janez Novak", roles: [defaultRoles[1]._id], address: "", passphrase: "jonez" },
            { name: "Anastazija Petek", roles: [defaultRoles[3]._id], address: "", passphrase: "sosedovkuza" }
        ];
        for (const user of defaultUsers) {
            const address = await personal.newAccount(user.passphrase);
            user.address = address;
            eth.sendTransaction({ from: await eth.getCoinbase(), to: address, value: 1000000000000000000 }); //Gib people money to run the contracts
            delete user.passphrase;
        }
        eth.sendTransaction({ from: await eth.getCoinbase(), to: userMetaMaskAddress, value: 100000000000000000000 });
        defaultUsers.push({ name: "Testni Uporabnik", roles: [defaultRoles[1]._id, defaultRoles[0]._id], address: userMetaMaskAddress });
        await usersColelction.insertMany(defaultUsers);
    } catch (err) {
        console.log(err);
    } finally {
        await client.close();
    }

    // Compile and deploy the smart contracts
    console.log("Preparing smart contracts.");
    // Create the admin account
    const adminAddress = await personal.newAccount("testingpassword"); //TODO move this into env
    eth.sendTransaction({ from: await eth.getCoinbase(), to: adminAddress, value: 1000000000000000000 });
    // Read the source and compile the contracts
    const dataIDOracleSource = fs.readFileSync("contracts/available_ids.sol").toString();
    const dataOracleSource = fs.readFileSync("contracts/data_retrieval.sol").toString();

    let input = {
        language: "Solidity",
        sources: {
            'available_ids.sol': {
                content: dataIDOracleSource
            },
            'data.sol': {
                content: dataOracleSource
            }
        },
        settings: {
            outputSelection: {
                '*': {
                    '*': ['*']
                }
            }
        }
    };
    const compiled = JSON.parse(solidityCompiler.compile(JSON.stringify(input)));
    // Deploy the compiled contracts
    const dataIDOracleAbi = compiled.contracts['available_ids.sol']['DataIDOracle'].abi;
    const dataIDOracleBytecode = compiled.contracts['available_ids.sol']['DataIDOracle'].evm.bytecode.object;
    const dataOracleAbi = compiled.contracts['data.sol']['DataOracle'].abi;
    const dataOracleBytecode = compiled.contracts['data.sol']['DataOracle'].evm.bytecode.object;
    
    let dataIdOracleContract = new eth.Contract(dataIDOracleAbi);
    let dataOracleContract = new eth.Contract(dataOracleAbi);
    await personal.unlockAccount(adminAddress, "testingpassword", 30);
    dataIdOracleContract = await dataIdOracleContract.deploy({data: dataIDOracleBytecode}).send({from: adminAddress});
    dataOracleContract = await dataOracleContract.deploy({data: dataOracleBytecode}).send({from: adminAddress});
    const outputConfig = {idOracleAddress: dataIdOracleContract.options.address, idOracleAbi: dataIDOracleAbi, 
        dataOracleAddress: dataOracleContract.options.address, dataOracleAbi: dataOracleAbi,
        adminAddress: adminAddress}
    console.log("Deployed the ID oracle to " + outputConfig.idOracleAddress + " and the data oracle to " + outputConfig.dataOracleAddress);

    fs.writeFileSync("config/chainconfig.json", JSON.stringify(outputConfig));
    console.log("Contract addresses saved into server config.");
    console.log("Setup finished.");
}
run().catch(console.dir);