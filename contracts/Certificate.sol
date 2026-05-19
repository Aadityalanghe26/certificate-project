// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

/**
 * @title Certificate
 * @dev A decentralized certificate issuance and verification system on Ethereum blockchain.
 * 
 * This contract enables institutions to issue tamper-proof certificates that can be
 * instantly verified by anyone without requiring a central authority. Certificates are
 * stored immutably on the blockchain with optional supporting documents on IPFS.
 * 
 * Features:
 * - Issue certificates with unique IDs
 * - Verify certificate authenticity instantly
 * - Track all certificates issued by an address
 * - Immutable and tamper-proof records
 * - Event logging for audit trail
 * 
 * @author CertChain Team
 * @notice This contract is for educational and testing purposes on Sepolia testnet
 */
contract Certificate {

    /**
     * @dev Certificate data structure
     * @param studentName Name of the certificate recipient
     * @param course Name of the course or achievement
     * @param ipfsHash IPFS hash of the certificate document (optional)
     * @param date Unix timestamp when certificate was issued
     * @param issuedBy Address of the wallet that issued the certificate
     */
    struct Cert {
        string studentName;
        string course;
        string ipfsHash;
        uint date;
        address issuedBy;
    }

    /// @dev Mapping from certificate ID to certificate data
    mapping(string => Cert) public certificates;

    /// @dev Mapping from issuer address to array of certificate IDs they issued
    mapping(address => string[]) private issuedBy;

    /**
     * @dev Emitted when a new certificate is issued
     * @param id Unique certificate identifier
     * @param studentName Name of certificate recipient
     * @param course Name of course or achievement
     * @param issuedBy Address of the issuer
     * @param date Unix timestamp of issuance
     */
    event CertificateIssued(
        string indexed id,
        string studentName,
        string course,
        address indexed issuedBy,
        uint date
    );

    /**
     * @dev Issues a new certificate on-chain
     * 
     * Creates a new certificate with the provided details and stores it immutably
     * on the blockchain. The certificate ID must be unique. All required fields
     * must be non-empty.
     * 
     * @param _id Unique certificate identifier (must be unique)
     * @param _name Name of the certificate recipient
     * @param _course Name of the course or achievement
     * @param _hash IPFS hash of certificate document (optional, can be empty)
     * 
     * @notice Emits CertificateIssued event
     * 
     * Requirements:
     * - `_id` must not be empty
     * - `_name` must not be empty
     * - `_course` must not be empty
     * - `_id` must not already exist (no duplicates)
     * 
     * Gas Usage: ~80,000 - 120,000 gas depending on string lengths
     */
    function issueCertificate(
        string memory _id,
        string memory _name,
        string memory _course,
        string memory _hash
    ) public {
        require(bytes(_id).length > 0, "ID cannot be empty");
        require(bytes(_name).length > 0, "Name cannot be empty");
        require(bytes(_course).length > 0, "Course cannot be empty");
        require(bytes(certificates[_id].studentName).length == 0, "Certificate ID already exists");

        // Store certificate data
        certificates[_id] = Cert(_name, _course, _hash, block.timestamp, msg.sender);
        
        // Track certificate for issuer
        issuedBy[msg.sender].push(_id);

        // Emit event for audit trail
        emit CertificateIssued(_id, _name, _course, msg.sender, block.timestamp);
    }

    /**
     * @dev Retrieves certificate details from blockchain
     * 
     * Returns all stored information about a certificate. If the certificate
     * does not exist, returns empty/zero values.
     * 
     * @param _id Certificate ID to verify
     * 
     * @return studentName Name of certificate recipient
     * @return course Name of course or achievement
     * @return ipfsHash IPFS hash of certificate document
     * @return date Unix timestamp of issuance
     * @return issuedBy Address of the issuer
     * 
     * @notice This is a view function and does not consume gas
     * 
     * Gas Usage: ~5,000 gas (view function, no cost)
     */
    function verifyCertificate(string memory _id)
        public
        view
        returns(string memory, string memory, string memory, uint, address)
    {
        Cert memory c = certificates[_id];
        return (c.studentName, c.course, c.ipfsHash, c.date, c.issuedBy);
    }

    /**
     * @dev Retrieves all certificate IDs issued by a specific address
     * 
     * Returns an array of all certificate IDs that were issued by the
     * provided address. Useful for tracking an issuer's certificate history.
     * 
     * @param _issuer Address of the certificate issuer
     * 
     * @return Array of certificate IDs issued by the address
     * 
     * @notice This is a view function and does not consume gas
     * 
     * Gas Usage: ~5,000 gas (view function, no cost)
     */
    function getCertificatesByIssuer(address _issuer)
        public
        view
        returns(string[] memory)
    {
        return issuedBy[_issuer];
    }

    /**
     * @dev Checks if a certificate exists on-chain
     * 
     * Returns true if a certificate with the given ID has been issued,
     * false otherwise.
     * 
     * @param _id Certificate ID to check
     * 
     * @return Boolean indicating if certificate exists
     * 
     * @notice This is a view function and does not consume gas
     * 
     * Gas Usage: ~5,000 gas (view function, no cost)
     */
    function certificateExists(string memory _id)
        public
        view
        returns(bool)
    {
        return bytes(certificates[_id].studentName).length > 0;
    }
}
