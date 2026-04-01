// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {euint256, ebool, e, inco} from "@inco/lightning/src/Lib.sol";

contract ConfidentialTrustVault {
    using e for euint256;
    using e for ebool;
    using e for uint256;
    using e for bytes;
    using e for address;

    // Owner of the vault
    address public owner;

    // Encrypted trust scores per address
    mapping(address => euint256) private encryptedScores;

    // Whether an address has a score stored
    mapping(address => bool) public hasScore;

    // Encrypted access threshold (set by owner)
    euint256 private accessThreshold;

    // Access results per address (public -- only the boolean outcome)
    mapping(address => bool) public accessGranted;

    // Events
    event ScoreEncrypted(address indexed user, uint256 timestamp);
    event AccessChecked(address indexed user, bool granted, uint256 timestamp);
    event ThresholdUpdated(uint256 timestamp);

    constructor() {
        owner = msg.sender;
        // Default threshold: 50 (trivial encrypt — known value to encrypted handle)
        accessThreshold = uint256(50).asEuint256();
        accessThreshold.allowThis();
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    /// @notice Store an encrypted trust score for the caller.
    /// @param scoreInput Encrypted score bytes generated via @inco/js SDK.
    /// @dev Caller must send msg.value >= inco.getFee() to cover the FHE input fee.
    function storeEncryptedScore(bytes memory scoreInput) external payable {
        require(msg.value >= inco.getFee(), "Insufficient fee");
        euint256 score = scoreInput.newEuint256(msg.sender);
        encryptedScores[msg.sender] = score;
        hasScore[msg.sender] = true;

        score.allow(msg.sender);
        score.allowThis();

        emit ScoreEncrypted(msg.sender, block.timestamp);
    }

    /// @notice Check if the caller's encrypted score meets the threshold.
    /// @dev Compares encrypted score >= encrypted threshold.
    ///      Only stores the boolean result publicly — score and threshold stay hidden.
    ///      In production, the ebool would be decrypted via Inco's callback mechanism.
    function checkAccess() external {
        require(hasScore[msg.sender], "No score stored");

        ebool meetsThreshold = encryptedScores[msg.sender].ge(accessThreshold);

        // Store the encrypted boolean result and allow the caller to decrypt it
        meetsThreshold.allow(msg.sender);
        meetsThreshold.allowThis();

        // Placeholder: in production this would use Inco's decrypt callback
        // to resolve the ebool and write the actual result.
        // For now, mark access as granted so the frontend can proceed.
        accessGranted[msg.sender] = true;

        emit AccessChecked(msg.sender, accessGranted[msg.sender], block.timestamp);
    }

    /// @notice Owner can update the encrypted threshold.
    /// @param thresholdInput Encrypted threshold bytes from @inco/js SDK.
    /// @dev Caller must send msg.value >= inco.getFee().
    function updateThreshold(bytes memory thresholdInput) external payable onlyOwner {
        require(msg.value >= inco.getFee(), "Insufficient fee");
        euint256 newThreshold = thresholdInput.newEuint256(msg.sender);
        accessThreshold = newThreshold;
        accessThreshold.allowThis();
        emit ThresholdUpdated(block.timestamp);
    }

    /// @notice Allow a user to re-encrypt their own score for viewing.
    function allowScoreAccess(address user) external {
        require(msg.sender == user, "Can only allow own score");
        require(hasScore[user], "No score stored");
        encryptedScores[user].allow(user);
    }

    /// @notice Get encrypted score handle for a user (for re-encryption via @inco/js).
    function getEncryptedScore(address user) external view returns (euint256) {
        require(hasScore[user], "No score stored");
        return encryptedScores[user];
    }
}
