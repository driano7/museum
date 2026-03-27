// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {ERC1155} from "openzeppelin-contracts/contracts/token/ERC1155/ERC1155.sol";
import {Ownable} from "openzeppelin-contracts/contracts/access/Ownable.sol";
import {IERC20} from "openzeppelin-contracts/contracts/token/ERC20/IERC20.sol";

/// @title TicketNFT1155 - Free & Paid Tickets for Events
/// @notice ERC1155 for ticketing where each tokenId represents one event/museum ticket.
contract TicketNFT1155 is ERC1155, Ownable {
  /// @notice Event configuration for one tokenId.
  struct EventConfig {
    string name;
    address payoutWallet;
    /// @dev USDC price for Mexican users (6 decimals).
    uint256 priceMex;
    /// @dev USDC price for foreign users (6 decimals).
    uint256 priceForeign;
    bool active;
    bool allowFree;
  }

  IERC20 public immutable usdc;
  mapping(uint256 => EventConfig) public events;
  mapping(uint256 => mapping(address => bool)) public hasFreeTicket;

  /// @notice Creates the ticket contract.
  /// @param baseURI Base metadata URI used by ERC1155.
  /// @param usdc_ USDC token address used for paid mints.
  constructor(string memory baseURI, address usdc_) ERC1155(baseURI) Ownable(msg.sender) {
    require(usdc_ != address(0), "USDC_ADDRESS_ZERO");
    usdc = IERC20(usdc_);
  }

  /// @notice Creates or updates an event configuration.
  /// @param eventId ERC1155 tokenId for the event.
  /// @param name Event display name.
  /// @param payoutWallet Wallet receiving USDC payments.
  /// @param priceMex Price for Mexican users (USDC 6 decimals).
  /// @param priceForeign Price for foreign users (USDC 6 decimals).
  /// @param active Whether minting is enabled for this event.
  /// @param allowFree Whether one free mint per wallet is allowed.
  function setEvent(
    uint256 eventId,
    string memory name,
    address payoutWallet,
    uint256 priceMex,
    uint256 priceForeign,
    bool active,
    bool allowFree
  ) external onlyOwner {
    require(payoutWallet != address(0), "PAYOUT_WALLET_ZERO");

    events[eventId] = EventConfig(name, payoutWallet, priceMex, priceForeign, active, allowFree);
  }

  /// @notice Returns full event configuration for a given eventId.
  /// @param eventId ERC1155 tokenId for the event.
  /// @return EventConfig struct for the event.
  function getEvent(uint256 eventId) external view returns (EventConfig memory) {
    return events[eventId];
  }

  /// @notice Mints one free ticket for sender if the event allows it.
  /// @dev One free ticket per wallet per event.
  /// @param eventId ERC1155 tokenId for the event.
  function mintFree(uint256 eventId) external {
    EventConfig memory config = events[eventId];
    require(config.active, "Event inactive");
    require(config.allowFree, "Free mint disabled");
    require(!hasFreeTicket[eventId][msg.sender], "Already claimed free");

    hasFreeTicket[eventId][msg.sender] = true;
    _mint(msg.sender, eventId, 1, "");
  }

  /// @notice Mints one paid ticket for sender, charging USDC.
  /// @param eventId ERC1155 tokenId for the event.
  /// @param isMexican Whether to apply Mexican or foreign pricing.
  function mintPaid(uint256 eventId, bool isMexican) external {
    EventConfig memory config = events[eventId];
    require(config.active, "Event inactive");

    uint256 price = isMexican ? config.priceMex : config.priceForeign;
    require(price > 0, "No paid price");
    require(usdc.transferFrom(msg.sender, config.payoutWallet, price), "USDC transfer failed");

    _mint(msg.sender, eventId, 1, "");
  }

  /// @notice Prevents ticket transfers between wallets (soulbound behavior).
  /// @dev Minting (from zero) and burning (to zero) are still allowed.
  function _update(address from, address to, uint256[] memory ids, uint256[] memory values) internal virtual override {
    if (from != address(0) && to != address(0)) {
      revert("Soulbound");
    }
    super._update(from, to, ids, values);
  }
}
