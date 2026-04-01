// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script, console} from "forge-std/Script.sol";
import {ConfidentialTrustVault} from "../src/ConfidentialTrustVault.sol";

contract DeployScript is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerPrivateKey);

        ConfidentialTrustVault vault = new ConfidentialTrustVault();
        console.log("ConfidentialTrustVault deployed at:", address(vault));

        vm.stopBroadcast();
    }
}
