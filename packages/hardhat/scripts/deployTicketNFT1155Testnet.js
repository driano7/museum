const hre = require("hardhat");

const MUSEUM_COLLECTIONS = [
  { name: "Museo Nacional de Antropologia", baseTokenId: 101 },
  { name: "Palacio de Bellas Artes", baseTokenId: 104 },
  { name: "Museo Frida Kahlo", baseTokenId: 107 },
  { name: "Museo Soumaya", baseTokenId: 110 },
  { name: "MUNAL", baseTokenId: 113 },
  { name: "Museo Tamayo", baseTokenId: 116 },
  { name: "Museo del Templo Mayor", baseTokenId: 119 },
];

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  const baseURI = process.env.BASE_URI || "https://ticketeria-metadata.example/metadata/{id}.json";
  const usdcAddress = process.env.USDC_ADDRESS;
  const existingAddress = process.env.TICKETS_CONTRACT_ADDRESS;

  if (!usdcAddress) {
    throw new Error("Missing USDC_ADDRESS in env");
  }

  let ticketContract;

  if (existingAddress) {
    ticketContract = await hre.ethers.getContractAt("TicketNFT1155", existingAddress, deployer);
    console.log(`Using existing TicketNFT1155 at: ${existingAddress}`);
  } else {
    const TicketNFT1155 = await hre.ethers.getContractFactory("TicketNFT1155");
    ticketContract = await TicketNFT1155.connect(deployer).deploy(baseURI, usdcAddress);
    await ticketContract.deployed();
    console.log(`Deployed TicketNFT1155 at: ${ticketContract.address}`);
  }

  for (const museum of MUSEUM_COLLECTIONS) {
    for (let index = 0; index < 3; index += 1) {
      const tokenId = museum.baseTokenId + index;
      const ticketName = `${museum.name} - Pase ${index + 1}`;
      const tx = await ticketContract
        .connect(deployer)
        .setEvent(tokenId, ticketName, deployer.address, 0, 0, true, true);
      await tx.wait();
      console.log(`Configured tokenId ${tokenId}: ${ticketName}`);
    }
  }

  console.log("Done. 21 free demo NFTs configured (7 museums x 3 tokenIds).");
  console.log(`Contract address: ${ticketContract.address}`);
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
