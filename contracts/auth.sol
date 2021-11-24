//SPDX-License-Identifier: UNLICENCED
pragma solidity ^0.8.7;

import "@chainlink/contracts/src/v0.8/ChainlinkClient.sol";

contract AuthContract {
    using Chainlink for Chainlink.Request;
    
    // API authentication stuff
    address private owner;
    string private authToken = "";
    
    // Oracle stuff
    address private oracle;
    bytes32 private jobId;
    uint256 private fee;
    
    event DataRetrieved(
        address indexed _userAddress
    );
    mapping(address => string) private cache;
    
    constructor() {
        owner = msg.sender;
        
        setPublicChainlinkToken();
        oracle = 0xc57B33452b4F7BB189bB5AfaE9cc4aBa1f7a4FD8;
        jobId = "d5270d1c311941d0b08bead21fea7747";
        fee = 0.1 * 10 ** 18;
    }
    
    function requestData(int dataId) public{
        address userAddress = msg.sender;
        
        Chainlink.Request memory request = buildChainlinkRequest(jobId, address(this), this.fulfill.selector);
        //This will be done over https in an actual deployment
        request.add("get", "http://ourapi.herokuapp.com/?apiKey=" + authToken + "&data=" + dataId + "&user=" + userAddress);
        request.add("path", "data");
        return sendChainlinkRequestTo(oracle, request, fee);
    }
    
    function fulfill(bytes32 _requestId, string _data) public recordChainlinkFulfillment(_requestId){
        //TODO pass caller address into here
        address userAddress;
        cache[userAddress] = _data;
        emit DataRetrieved(userAddress);
    }
    
    function retrieveCachedData() public {
        return cache[msg.sender];
    }
    
    function setAuthToken(string memory _authToken) public onlyOwner{
        authToken = _authToken;
    }
    
    modifier onlyOwner(){
        require(msg.sender == owner);
        _;
    }
}