// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";

/// @title TicketNFT1155 - Free & Paid Tickets for Events
/// @notice ERC1155 for a ticketeria with free + paid tickets.
contract TicketNFT1155 is ERC1155, Ownable {
  using SafeERC20 for IERC20;

  struct EventConfig {
    string name;
    address payoutWallet;
    uint256 priceMex; // USDC 6 decimals
    uint256 priceForeign; // USDC 6 decimals
    bool active;
    bool allowFree;
  }

  IERC20 public immutable usdc;
  bool public soulbound;

  mapping(uint256 => EventConfig) public events;
  mapping(uint256 => mapping(address => bool)) public hasFreeTicket;

  event EventSet(
    uint256 indexed eventId,
    string name,
    address indexed payoutWallet,
    uint256 priceMex,
    uint256 priceForeign,
    bool active,
    bool allowFree
  );
  event TicketMintedFree(uint256 indexed eventId, address indexed account);
  event TicketMintedPaid(uint256 indexed eventId, address indexed account, bool isMexican, uint256 paidAmount);
  event SoulboundSet(bool enabled);
  event BaseURISet(string newURI);

  constructor(string memory baseURI, address usdc_) ERC1155(baseURI) {
    require(usdc_ != address(0), "USDC_ADDRESS_ZERO");
    usdc = IERC20(usdc_);
  }

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

    events[eventId] = EventConfig({
      name: name,
      payoutWallet: payoutWallet,
      priceMex: priceMex,
      priceForeign: priceForeign,
      active: active,
      allowFree: allowFree
    });

    emit EventSet(eventId, name, payoutWallet, priceMex, priceForeign, active, allowFree);
  }

  function setSoulbound(bool enabled) external onlyOwner {
    soulbound = enabled;
    emit SoulboundSet(enabled);
  }

  function setURI(string memory newURI) external onlyOwner {
    _setURI(newURI);
    emit BaseURISet(newURI);
  }

  function getPrice(uint256 eventId, bool isMexican) public view returns (uint256) {
    EventConfig memory cfg = events[eventId];
    return isMexican ? cfg.priceMex : cfg.priceForeign;
  }

  function mintFree(uint256 eventId) external {
    EventConfig memory cfg = events[eventId];

    require(cfg.active, "EVENT_INACTIVE");
    require(cfg.allowFree, "FREE_TICKET_DISABLED");
    require(!hasFreeTicket[eventId][msg.sender], "FREE_ALREADY_MINTED");

    hasFreeTicket[eventId][msg.sender] = true;
    _mint(msg.sender, eventId, 1, "");

    emit TicketMintedFree(eventId, msg.sender);
  }

  function mintPaid(uint256 eventId, bool isMexican) external {
    EventConfig memory cfg = events[eventId];
    require(cfg.active, "EVENT_INACTIVE");

    uint256 ticketPrice = isMexican ? cfg.priceMex : cfg.priceForeign;
    require(ticketPrice > 0, "PRICE_NOT_SET");

    usdc.safeTransferFrom(msg.sender, cfg.payoutWallet, ticketPrice);
    _mint(msg.sender, eventId, 1, "");

    emit TicketMintedPaid(eventId, msg.sender, isMexican, ticketPrice);
  }

  function _beforeTokenTransfer(
    address operator,
    address from,
    address to,
    uint256[] memory ids,
    uint256[] memory amounts,
    bytes memory data
  ) internal virtual override {
    super._beforeTokenTransfer(operator, from, to, ids, amounts, data);

    if (soulbound && from != address(0) && to != address(0)) {
      revert("SOULBOUND");
    }
  }
}
