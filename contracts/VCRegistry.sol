// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract VCRegistry {
    struct CredentialRecord {
        string ipfsCid;
        address issuer;
        string subjectDid;
        uint256 timestamp;
        bool revoked;
    }
    
    mapping(bytes32 => CredentialRecord) public credentials;
    mapping(address => bytes32[]) public issuerCredentials;
    mapping(string => bytes32[]) public subjectCredentials;
    
    event CredentialIssued(
        bytes32 indexed credentialId,
        string ipfsCid,
        address indexed issuer,
        string subjectDid
    );
    
    event CredentialRevoked(bytes32 indexed credentialId);
    
    function issueCredential(
        bytes32 credentialId,
        string memory ipfsCid,
        string memory subjectDid
    ) external {
        require(credentials[credentialId].issuer == address(0), "Credential already exists");
        
        credentials[credentialId] = CredentialRecord({
            ipfsCid: ipfsCid,
            issuer: msg.sender,
            subjectDid: subjectDid,
            timestamp: block.timestamp,
            revoked: false
        });
        
        issuerCredentials[msg.sender].push(credentialId);
        subjectCredentials[subjectDid].push(credentialId);
        
        emit CredentialIssued(credentialId, ipfsCid, msg.sender, subjectDid);
    }
    
    function revokeCredential(bytes32 credentialId) external {
        require(credentials[credentialId].issuer == msg.sender, "Only issuer can revoke");
        require(!credentials[credentialId].revoked, "Already revoked");
        
        credentials[credentialId].revoked = true;
        emit CredentialRevoked(credentialId);
    }
    
    function getCredential(bytes32 credentialId) external view returns (CredentialRecord memory) {
        return credentials[credentialId];
    }
    
    function getIssuerCredentials(address issuer) external view returns (bytes32[] memory) {
        return issuerCredentials[issuer];
    }
    
    function getSubjectCredentials(string memory subjectDid) external view returns (bytes32[] memory) {
        return subjectCredentials[subjectDid];
    }
}