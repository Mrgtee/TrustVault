// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test, console} from "forge-std/Test.sol";
import {ConfidentialTrustVault} from "../src/ConfidentialTrustVault.sol";

contract ConfidentialTrustVaultTest is Test {
    ConfidentialTrustVault public vault;
    address owner = address(1);
    address user = address(2);

    function setUp() public {
        vm.prank(owner);
        vault = new ConfidentialTrustVault();
    }

    function test_OwnerIsSet() public view {
        assertEq(vault.owner(), owner);
    }

    function test_HasScoreFalseInitially() public view {
        assertFalse(vault.hasScore(user));
    }

    function test_AccessGrantedFalseInitially() public view {
        assertFalse(vault.accessGranted(user));
    }
}
