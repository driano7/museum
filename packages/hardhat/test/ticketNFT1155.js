const { ethers } = require("hardhat");
const { expect } = require("chai");

describe("TicketNFT1155", function () {
  let owner;
  let payoutWallet;
  let mexicanUser;
  let foreignUser;
  let other;

  let usdc;
  let ticket;

  const EVENT_ID = 1;
  const PRICE_MEX = 1_000_000; // 1 USDC (6 decimals)
  const PRICE_FOREIGN = 2_500_000; // 2.5 USDC (6 decimals)

  beforeEach(async function () {
    [owner, payoutWallet, mexicanUser, foreignUser, other] = await ethers.getSigners();

    const MockUSDC = await ethers.getContractFactory("MockUSDC");
    usdc = await MockUSDC.deploy();

    const TicketNFT1155 = await ethers.getContractFactory("TicketNFT1155");
    ticket = await TicketNFT1155.deploy("ipfs://tickets/{id}.json", usdc.address);

    await ticket.setEvent(EVENT_ID, "Monad Fest", payoutWallet.address, PRICE_MEX, PRICE_FOREIGN, true, true);
  });

  it("sets events only as owner", async function () {
    await expect(
      ticket.connect(mexicanUser).setEvent(2, "Nope", payoutWallet.address, 1, 2, true, true),
    ).to.be.revertedWith("Ownable: caller is not the owner");

    await ticket.setEvent(2, "Event 2", payoutWallet.address, 2_000_000, 3_000_000, true, false);
    const cfg = await ticket.events(2);

    expect(cfg.name).to.equal("Event 2");
    expect(cfg.payoutWallet).to.equal(payoutWallet.address);
    expect(cfg.priceMex).to.equal(2_000_000);
    expect(cfg.priceForeign).to.equal(3_000_000);
    expect(cfg.active).to.equal(true);
    expect(cfg.allowFree).to.equal(false);
  });

  it("mints one free ticket per wallet", async function () {
    await ticket.connect(mexicanUser).mintFree(EVENT_ID);
    expect(await ticket.balanceOf(mexicanUser.address, EVENT_ID)).to.equal(1);
    expect(await ticket.hasFreeTicket(EVENT_ID, mexicanUser.address)).to.equal(true);

    await expect(ticket.connect(mexicanUser).mintFree(EVENT_ID)).to.be.revertedWith("FREE_ALREADY_MINTED");
  });

  it("rejects free mint when event is inactive or free is disabled", async function () {
    await ticket.setEvent(2, "Inactive", payoutWallet.address, PRICE_MEX, PRICE_FOREIGN, false, true);
    await expect(ticket.connect(mexicanUser).mintFree(2)).to.be.revertedWith("EVENT_INACTIVE");

    await ticket.setEvent(3, "No free", payoutWallet.address, PRICE_MEX, PRICE_FOREIGN, true, false);
    await expect(ticket.connect(mexicanUser).mintFree(3)).to.be.revertedWith("FREE_TICKET_DISABLED");
  });

  it("mints paid ticket at mexican price and transfers USDC", async function () {
    await usdc.mint(mexicanUser.address, PRICE_MEX);
    await usdc.connect(mexicanUser).approve(ticket.address, PRICE_MEX);

    const before = await usdc.balanceOf(payoutWallet.address);
    await ticket.connect(mexicanUser).mintPaid(EVENT_ID, true);
    const after = await usdc.balanceOf(payoutWallet.address);

    expect(after.sub(before)).to.equal(PRICE_MEX);
    expect(await ticket.balanceOf(mexicanUser.address, EVENT_ID)).to.equal(1);
  });

  it("mints paid ticket at foreign price and transfers USDC", async function () {
    await usdc.mint(foreignUser.address, PRICE_FOREIGN);
    await usdc.connect(foreignUser).approve(ticket.address, PRICE_FOREIGN);

    const before = await usdc.balanceOf(payoutWallet.address);
    await ticket.connect(foreignUser).mintPaid(EVENT_ID, false);
    const after = await usdc.balanceOf(payoutWallet.address);

    expect(after.sub(before)).to.equal(PRICE_FOREIGN);
    expect(await ticket.balanceOf(foreignUser.address, EVENT_ID)).to.equal(1);
  });

  it("rejects paid mint when price is not set", async function () {
    await ticket.setEvent(4, "No price", payoutWallet.address, 0, 0, true, false);

    await expect(ticket.connect(mexicanUser).mintPaid(4, true)).to.be.revertedWith("PRICE_NOT_SET");
    await expect(ticket.connect(foreignUser).mintPaid(4, false)).to.be.revertedWith("PRICE_NOT_SET");
  });

  it("blocks transfers when soulbound is enabled", async function () {
    await ticket.connect(mexicanUser).mintFree(EVENT_ID);

    await ticket.setSoulbound(true);

    await expect(
      ticket.connect(mexicanUser).safeTransferFrom(mexicanUser.address, other.address, EVENT_ID, 1, "0x"),
    ).to.be.revertedWith("SOULBOUND");

    await ticket.setSoulbound(false);

    await ticket.connect(mexicanUser).safeTransferFrom(mexicanUser.address, other.address, EVENT_ID, 1, "0x");
    expect(await ticket.balanceOf(other.address, EVENT_ID)).to.equal(1);
  });
});
