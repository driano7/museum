const fs = require('fs');
const path = require('path');

const outputDir = path.resolve(__dirname, '../public/metadata');
fs.mkdirSync(outputDir, { recursive: true });

const museums = [
  {
    name: 'Museo Nacional de Antropologia',
    location: 'Chapultepec, CDMX',
    image: 'https://commons.wikimedia.org/wiki/Special:FilePath/National%20Museum%20of%20Anthropology%20Mexico%20City.jpg',
    tokenIds: [101, 102, 103],
  },
  {
    name: 'Palacio de Bellas Artes',
    location: 'Centro Historico, CDMX',
    image: 'https://commons.wikimedia.org/wiki/Special:FilePath/Palacio%20de%20Bellas%20Artes%2C%20Mexico%20City%2C%20MX.jpg',
    tokenIds: [104, 105, 106],
  },
  {
    name: 'Museo Frida Kahlo',
    location: 'Coyoacan, CDMX',
    image: 'https://commons.wikimedia.org/wiki/Special:FilePath/Museo%20Frida%20Kahlo.JPG',
    tokenIds: [107, 108, 109],
  },
  {
    name: 'Museo Soumaya',
    location: 'Plaza Carso, CDMX',
    image: 'https://commons.wikimedia.org/wiki/Special:FilePath/Museo%20Soumaya%20Plaza%20Carso%20Exterior.jpg',
    tokenIds: [110, 111, 112],
  },
  {
    name: 'MUNAL',
    location: 'Tacuba, CDMX',
    image: 'https://commons.wikimedia.org/wiki/Special:FilePath/Museo%20Nacional%20de%20Arte%20(MUNAL)%2C%20Ciudad%20de%20M%C3%A9xico.jpg',
    tokenIds: [113, 114, 115],
  },
  {
    name: 'Museo Tamayo',
    location: 'Chapultepec, CDMX',
    image: 'https://commons.wikimedia.org/wiki/Special:FilePath/Facade%20-%20Museo%20Tamayo%20Arte%20Contempor%C3%A1neo%20-%20Mexico%20City%202024.jpg',
    tokenIds: [116, 117, 118],
  },
  {
    name: 'Museo del Templo Mayor',
    location: 'Centro Historico, CDMX',
    image: 'https://commons.wikimedia.org/wiki/Special:FilePath/Museo%20del%20Templo%20Mayor%20-%20Ciudad%20de%20M%C3%A9xico.jpg',
    tokenIds: [119, 120, 121],
  },
];

for (const museum of museums) {
  museum.tokenIds.forEach((tokenId, idx) => {
    const serial = idx + 1;
    const metadata = {
      name: `${museum.name} - Pase Demo ${serial}`,
      description: `TicketNFT1155 demo for ${museum.name}. Free museum collectible on Monad testnet.`,
      image: museum.image,
      external_url: 'https://testnet.monad.xyz/',
      attributes: [
        { trait_type: 'City', value: 'Ciudad de Mexico' },
        { trait_type: 'Museum', value: museum.name },
        { trait_type: 'Location', value: museum.location },
        { trait_type: 'Series', value: `Demo ${serial}` },
        { trait_type: 'Collection', value: 'Ticketeria CDMX Passport' },
      ],
    };

    const decimalFile = path.join(outputDir, `${tokenId}.json`);
    fs.writeFileSync(decimalFile, JSON.stringify(metadata, null, 2));

    const hexId = tokenId.toString(16).padStart(64, '0');
    const hexFile = path.join(outputDir, `${hexId}.json`);
    fs.writeFileSync(hexFile, JSON.stringify(metadata, null, 2));
  });
}

console.log(`Generated metadata for ${museums.reduce((sum, m) => sum + m.tokenIds.length, 0)} tokens in ${outputDir}`);
