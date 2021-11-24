//SPDX-License-Identifier: UNLICENCED
pragma solidity ^0.8.7;

contract DataOracle {
    address private owner;
    
    Request[] private requestsQueue;
    
    event FetchCallback();
    struct Request {
        address userAddress;
        int dataid;
        address requesterAddress;
        bytes4 callback;
    }
    
    constructor() {
        owner = msg.sender;
    }
    
    function requestData(address _userAddress, int _dataid, address _requesterAddress, bytes4 _callback) public {
        requestsQueue.push(Request(_userAddress, _dataid, _requesterAddress, _callback));
        emit FetchCallback();
    }
    
    function getNextRequest() public ownerOnly returns(Request memory){
        Request memory current = requestsQueue[0];
        delete requestsQueue[0]; //TODO fix this to actually delete the element
        return current;
    }
    
    modifier ownerOnly(){
        require(msg.sender == owner);
        _;
    }
}