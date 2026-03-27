// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script} from "forge-std/Script.sol";
import {console2} from "forge-std/console2.sol";
import {TicketNFT1155} from "../src/TicketNFT1155.sol";

/// @notice Deploy script for TicketNFT1155 on Monad.
/// @dev Required env vars:
/// - MONAD_RPC_URL
/// - DEPLOYER_PRIVATE_KEY
/// - USDC_ADDRESS
/// - BASE_URI
///
/// Run with:
/// forge script script/DeployTicketNFT.s.sol:DeployTicketNFT \
///   --rpc-url $MONAD_RPC_URL \
///   --broadcast -vvvv
contract DeployTicketNFT is Script {
  function run() external returns (TicketNFT1155 ticket) {
    string memory monadRpcUrl = vm.envString("MONAD_RPC_URL");
    uint256 deployerPrivateKey = vm.envUint("DEPLOYER_PRIVATE_KEY");
    address usdcAddress = vm.parseAddress(vm.envString("USDC_ADDRESS"));
    string memory baseURI = vm.envString("BASE_URI");

    address deployer = vm.addr(deployerPrivateKey);

    vm.startBroadcast(deployerPrivateKey);

    ticket = new TicketNFT1155(baseURI, usdcAddress);

    // 21 demo NFTs gratis: 7 museos iconicos * 3 tokenIds cada uno (101-121).
    ticket.setEvent(101, "Museo Nacional de Antropologia - Pase I", deployer, 0, 0, true, true);
    ticket.setEvent(102, "Museo Nacional de Antropologia - Pase II", deployer, 0, 0, true, true);
    ticket.setEvent(103, "Museo Nacional de Antropologia - Pase III", deployer, 0, 0, true, true);

    ticket.setEvent(104, "Palacio de Bellas Artes - Pase I", deployer, 0, 0, true, true);
    ticket.setEvent(105, "Palacio de Bellas Artes - Pase II", deployer, 0, 0, true, true);
    ticket.setEvent(106, "Palacio de Bellas Artes - Pase III", deployer, 0, 0, true, true);

    ticket.setEvent(107, "Museo Frida Kahlo - Pase I", deployer, 0, 0, true, true);
    ticket.setEvent(108, "Museo Frida Kahlo - Pase II", deployer, 0, 0, true, true);
    ticket.setEvent(109, "Museo Frida Kahlo - Pase III", deployer, 0, 0, true, true);

    ticket.setEvent(110, "Museo Soumaya - Pase I", deployer, 0, 0, true, true);
    ticket.setEvent(111, "Museo Soumaya - Pase II", deployer, 0, 0, true, true);
    ticket.setEvent(112, "Museo Soumaya - Pase III", deployer, 0, 0, true, true);

    ticket.setEvent(113, "MUNAL - Pase I", deployer, 0, 0, true, true);
    ticket.setEvent(114, "MUNAL - Pase II", deployer, 0, 0, true, true);
    ticket.setEvent(115, "MUNAL - Pase III", deployer, 0, 0, true, true);

    ticket.setEvent(116, "Museo Tamayo - Pase I", deployer, 0, 0, true, true);
    ticket.setEvent(117, "Museo Tamayo - Pase II", deployer, 0, 0, true, true);
    ticket.setEvent(118, "Museo Tamayo - Pase III", deployer, 0, 0, true, true);

    ticket.setEvent(119, "Museo del Templo Mayor - Pase I", deployer, 0, 0, true, true);
    ticket.setEvent(120, "Museo del Templo Mayor - Pase II", deployer, 0, 0, true, true);
    ticket.setEvent(121, "Museo del Templo Mayor - Pase III", deployer, 0, 0, true, true);

    vm.stopBroadcast();

    console2.log("MONAD_RPC_URL:", monadRpcUrl);
    console2.log("TicketNFT1155 deployed at:", address(ticket));
  }
}
