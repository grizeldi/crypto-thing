//SPDX-License-Identifier: UNLICENCED
pragma solidity ^0.8.7;

contract DataIDOracle {
    address private owner;
    mapping(address => string[]) private cache;

    event OnDataRequest(address indexed _fromUser);
    event DataAvailable(address indexed _forUser);

    constructor() {
        owner = msg.sender;
    }

    /**
    * Called to request the available IDs to the sender.
    */
    function request() public {
        //emit OnDataRequest(msg.sender);

        // The following lines are for debugging the frontend, delete when the js part of the oracle works.
        // Data IDs will need to be changed depending on what's in your database.
        string[] memory hardcodedIDs = new string[](1);
        hardcodedIDs[0] = "61cda92ad0730018758b4283";
        //fulfill(msg.sender, hardcodedIDs); //This won't work because ownerOnly
        cache[msg.sender] = hardcodedIDs;
        emit DataAvailable(msg.sender);
    }

    /**
    * Called by the js part of the oracle once the data is obtained
    */
    function fulfill(address forUser, string[] memory availableIDs) onlyOwner public {
        cache[forUser] = availableIDs;
        emit DataAvailable(forUser);
    }

    /**
    * Called by the requester once the data is available.
    */
    function readData() public view returns(string[] memory output){
        output = cache[msg.sender];
    }

    modifier onlyOwner(){
        require(msg.sender == owner);
        _;
    }
}