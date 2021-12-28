const { MongoClient } = require("mongodb");
const web3 = require("web3");
const w3acc = require('web3-eth-accounts');
const w3personal = require('web3-eth-personal');

// In a non local deployment, don't hardcode the username/password combo.
const adminUri = "mongodb://RubyRose:thanatoast@localhost:27017/";
const uri = "mongodb://localhost:27017/";//?retryWrites=true&writeConcern=majority";

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
            {name: "Accounting"},
            {name: "Human Resources"},
            {name: "Research and Development"},
            {name: "Sales"}
        ];
        await rolesCollection.insertMany(defaultRoles);

        // Add the data
        defaultData = [
            {title: "Earnings Report 1999", content: "In that year we earned such and such moniez. It was a good year.", roles: [defaultRoles[0]._id, defaultRoles[3]._id]},
            {title: "Promotional Pamphlet June 2020", content: "<insert marketing text here>", roles: [defaultRoles[3]._id]},
            {title: "Open Positions April 2020", content: "Web Developers. Like seriously, we need more of those.", roles: [defaultRoles[1]._id]}
        ]
        await dataCollection.insertMany(defaultData);

        // Add the users
        defaultUsers = [
            {name: "Janez Novak", roles: [defaultRoles[1]._id], address: "", passphrase: "jonez"},
            {name: "Anastazija Petek", roles: [defaultRoles[3]._id], address: "", passphrase: "sosedovkuza"}
        ];
        const personal = new w3personal('http://localhost:8545'); // Weee, plain text passwords over http, here we come
        for (const user of defaultUsers){
            const address = await personal.newAccount(user.passphrase);
            user.address = address;
            delete user.passphrase;
        }
        await usersColelction.insertMany(defaultUsers);
    } catch(err) {
        console.log(err);
    }finally {
        await client.close();
    }
}
run().catch(console.dir);