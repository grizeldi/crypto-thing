//SPDX-License-Identifier: UNLICENCED
pragma solidity ^0.8.7;

contract DataIDOracle {
    address private owner;
    mapping(address => int[]) private cache;

    event OnDataRequest(address indexed _fromUser);
    event DataAvailable(address indexed _forUser);

    constructor() {
        owner = msg.sender;
    }

    /**
    * Called to request the available IDs to the sender.
    */
    function request() public {
        emit OnDataRequest(msg.sender);
    }

    /**
    * Called by the js part of the oracle once the data is obtained
    */
    function fulfill(address forUser, int[] calldata availableIDs) onlyOwner public {
        cache[forUser] = availableIDs;
        emit DataAvailable(forUser);
    }

    /**
    * Called by the requester once the data is available.
    */
    function readData() public view returns(int[] memory){
        return cache[msg.sender];
    }

    modifier onlyOwner(){
        require(msg.sender == owner);
        _;
    }
}