// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script} from "forge-std/Script.sol";
import {TicketNFT1155} from "../src/TicketNFT1155.sol";

/// @notice Foundry deploy script for TicketNFT1155
/// @dev Required env:
/// - PRIVATE_KEY
/// - USDC_ADDRESS
/// - BASE_URI
/// Optional env:
/// - PAYOUT_WALLET (defaults to broadcaster)
contract DeployTicketNFT1155 is Script {
  function run() external returns (TicketNFT1155 ticket) {
    uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
    address usdcAddress = vm.envAddress("USDC_ADDRESS");
    string memory baseURI = vm.envString("BASE_URI");

    vm.startBroadcast(deployerPrivateKey);

    ticket = new TicketNFT1155(baseURI, usdcAddress);

    address payoutWallet = vm.envOr("PAYOUT_WALLET", msg.sender);

    // Demo event 1: low-price event with free option.
    ticket.setEvent(
      1,
      "Monad Genesis Meetup",
      payoutWallet,
      5_000_000, // 5 USDC
      12_000_000, // 12 USDC
      true,
      true
    );

    // Demo event 2: mid-price event, paid only.
    ticket.setEvent(
      2,
      "Monad Builders Summit",
      payoutWallet,
      10_000_000, // 10 USDC
      25_000_000, // 25 USDC
      true,
      false
    );

    // Demo event 3: premium event with free quota enabled at contract level.
    ticket.setEvent(
      3,
      "Monad Night Conference",
      payoutWallet,
      18_000_000, // 18 USDC
      40_000_000, // 40 USDC
      true,
      true
    );

    vm.stopBroadcast();
  }
}
