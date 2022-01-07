//SPDX-License-Identifier: UNLICENCED
pragma solidity ^0.8.7;

contract DataOracle {
    address private owner;
    mapping(address => string) private cache;

    // Caught on the JS server side to process the request
    event OnDataRequest(address indexed _fromUser, string indexed _dataId);
    // Caught by the client once the data is ready
    event DataAvailable(address indexed _forUser);
    // Caught by the client if the user doesn't have sufficient permissions
    event AuthorizationFailure(address indexed _forUser);

    constructor() {
        owner = msg.sender;
    }

    /**
    * Called by the end user to request the data by ID.
    */
    function request(string memory dataID) public {
        emit OnDataRequest(msg.sender, dataID);
    }

    /**
    * Called by the js part of the oracle once the data is obtained.
    * If the token is null, it means an authorization failure.
    */
    function fulfill(address forUser, string memory downloadToken) onlyOwner public {
        cache[forUser] = downloadToken;
        emit DataAvailable(forUser);
    }

    /**
    * Called by the requester once the data is available.
    */
    function readData() public view returns(string memory output){
        output = cache[msg.sender];
    }

    modifier onlyOwner(){
        require(msg.sender == owner);
        _;
    }
}