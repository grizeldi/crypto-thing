//SPDX-License-Identifier: UNLICENCED
pragma solidity ^0.8.7;

contract AuthContract {
    address private owner;
    address private oracleAddress;
    
    event DataRetrieved(
        address indexed _userAddress
    );
    mapping(address => string) private cache;
    
    constructor() {
        owner = msg.sender;
    }
    
    function requestData(int dataId) public{
        address userAddress = msg.sender;
        //TODO call the oracle
    }
    
    function fulfill(string memory _data) public{
        //TODO pass caller address into here
        address userAddress;
        cache[userAddress] = _data;
        emit DataRetrieved(userAddress);
    }
    
    function retrieveCachedData() public view returns(string memory){
        return cache[msg.sender];
    }
    
    modifier onlyOwner(){
        require(msg.sender == owner);
        _;
    }
}