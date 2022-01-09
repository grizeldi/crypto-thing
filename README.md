A proof of concept implementation of a blockchain based data retrieval system, where every data request is logged onto the blockchain as a transaction. The user-facing application is a web app where the user can check what data they have access to and also obtain the said data.

As this is a proof of concept implementation, we do not currently implement an admin control panel where the data and users in the database could be managed. All the data and users are created through the initial setup script.

# How to run
To build and run the project, you will need the following tools:

  * docker
  * docker-compose

Everything else (blockchain, database, web server) is handled inside the docker containers this project builds into.

Once you have all the prerequisites met, to run the project, do the following:

  1. Open the file docker-compose.yml and under crypto-web container, replace the environment variable METAMASK_ADDRESS with the address of your metamask wallet. This is required, so the startup script can add you to the database as an user, sets your permissions and gives you some ether, so you can run the smart contracts.
  2. Run the command `docker-compose up`. That will build the web server image, pull the database and blockchain images and start the containers. This step might take a bit, depending on your internet connection and processor.
  3. Once you see the line `HTTP listening on port <your port here, 5000 by default>` in the docker output logs, it means the server is up and operational. Navigate over to [http://localhost:5000]() and test out the application.

**DISCLAIMER: The project is a proof of concept and therefore contains security issues (lack of https, storing plain text passwords...) that would need to be resolved before any kind of production usage. Please don't use in production.**