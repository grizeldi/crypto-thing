A proof of concept implementation of a blockchain based data retrieval system, where every data request is logged onto the blockchain as a transaction. The user-facing application is a web app where the user can check what data they have access to and also obtain the said data.

As this is a proof of concept implementation, we do not currently implement an admin control panel where the data and users in the database could be managed. All the data and users are created through the initial setup script.

**DISCLAIMER: The project is a proof of concept and therefore contains security issues (lack of https, storing plain text passwords...) that would need to be resolved before any kind of production usage. Please don't use in production.**

# How to run
To build and run the project, you will need the following tools:

  * docker
  * docker-compose
  * metamask

Everything else (blockchain, database, web server) is handled inside the docker containers this project builds into.

Once you have all the prerequisites met, to run the project, do the following:

  1. Open the file docker-compose.yml and under crypto-web container, replace the environment variable METAMASK_ADDRESS with the address of your metamask wallet. This is required, so the startup script can add you to the database as an user, sets your permissions and gives you some ether, so you can run the smart contracts.
  2. Run the command `docker-compose up`. That will build the web server image, pull the database and blockchain images and start the containers. This step might take a bit, depending on your internet connection and processor.
  3. Set test network visibility in metamask to visible and select the "localhost:8545" network, which should show up automatically.
  4. Once you see the line `HTTP listening on port <your port here, 5000 by default>` in the docker output logs, it means the server is up and operational. Navigate over to [localhost:5000](http://localhost:5000) and test out the application.

# Known issues and troubleshooting

  * Due to metamask not properly supporting websocket providers (as documented [on web3js github](https://github.com/ChainSafe/web3.js/issues/3379)), we cannot reliably receive events from the smart contracts. Therefore we're forced into using a combination of metamask (for transactions) and standalone websocket providers (for events), which does sometimes result in timing issues. That usually shows as a failed request or metamask saying there aren't enough funds in your wallet when you try to do a transaction. In such cases, please refresh the page and try again.
  * If you delete the blockchain (with `docker-compose down` or otherwise) and restart it, after already executing some transactions, you will need to reset your metamask account (click on the profile picture > settings > advanced > reset account), otherwise the transactions will get stuck. We assume this is due to the nature of the blockchain where each transaction relies on the previous ones and once the blockchain gets reset, the histories on the chain and in metamask no longer match up.
  * Some components might complain about lack of HTTPS/WSS, but as configuring HTTPS for the docker containers is somewhat out of scope of this seminar, we are still relying on good old HTTP.