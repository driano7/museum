import {
  BarChartOutlined,
  CreditCardOutlined,
  GlobalOutlined,
  LeftOutlined,
  RightOutlined,
  MobileOutlined,
  SafetyCertificateOutlined,
  ShopOutlined,
  StarFilled,
  StarOutlined,
} from "@ant-design/icons";
import { message } from "antd";
import { AnimatePresence, motion, useReducedMotion, useScroll, useTransform } from "framer-motion/dist/framer-motion";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Account } from "../components";
import { DEFAULT_TICKETS_CONTRACT_ADDRESS } from "../constants";
import useTicketContract from "../hooks/useTicketContract";
import PaymentDemoPopup from "../components/PaymentDemoPopup";
import ThemeSwitch from "../components/ThemeSwitch";
import "./Home.css";

const navItems = [
  { href: "#hero", label: "Inicio", mark: "I" },
  { href: "#como-funciona", label: "Como funciona", mark: "C" },
  { href: "#recintos", label: "Para recintos", mark: "R" },
  { href: "#modulos", label: "Modulos", mark: "M" },
  { href: "#adopcion", label: "Adopcion", mark: "A" },
];

const museumBlogs = [
  {
    id: "blog-antropologia",
    headerLabel: "Antropologia",
    category: "Patrimonio",
    title: "Museo Nacional de Antropologia: colecciones clave para una visita cultural en CDMX",
    summary:
      "Ideal para planear una ruta de fin de semana entre salas permanentes y exposiciones temporales. El museo concentra piezas iconicas y actividades de divulgacion del patrimonio.",
    focus: "Agenda recomendada: coleccion mexica, salas etnograficas y cartelera temporal del INAH.",
    image: "/blogs/antropologia.jpg",
    venue: "Bosque de Chapultepec",
    readTime: "5 min",
    sourceUrl: "https://www.mna.inah.gob.mx/",
    imageSource: "https://commons.wikimedia.org/wiki/File:National_Museum_of_Anthropology_Mexico_City.jpg",
  },
  {
    id: "blog-frida",
    headerLabel: "Frida Kahlo",
    category: "Arte moderno",
    title: "Casa Azul: recorridos culturales y actividades del Museo Frida Kahlo",
    summary:
      "Resumen rapido para visitantes locales y turistas que quieren combinar historia del recinto, experiencias guiadas y actividades especiales en Coyoacan.",
    focus: "Agenda recomendada: recorridos historicos, actividades tematicas y reserva anticipada.",
    image: "/blogs/frida-kahlo.jpg",
    venue: "Coyoacan",
    readTime: "4 min",
    sourceUrl: "https://www.museofridakahlo.org.mx/tipo_actividad/recorridos/",
    imageSource: "https://commons.wikimedia.org/wiki/File:Museo_Frida_Kahlo.JPG",
  },
  {
    id: "blog-bellas-artes",
    headerLabel: "Bellas Artes",
    category: "Exposiciones",
    title: "Palacio de Bellas Artes: que revisar en su cartelera de exposiciones y actividades",
    summary:
      "Guia para ubicar exhibiciones temporales, espacios de arte y eventos culturales del recinto, con enfoque en planificacion de ticketing para alta demanda.",
    focus: "Agenda recomendada: exposicion principal vigente, mediacion cultural y horarios extendidos.",
    image: "/blogs/bellas-artes.jpg",
    venue: "Centro Historico",
    readTime: "6 min",
    sourceUrl: "https://museopalaciodebellasartes.inba.gob.mx/",
    imageSource: "https://commons.wikimedia.org/wiki/File:Palacio_de_Bellas_Artes,_Mexico_City,_MX.jpg",
  },
  {
    id: "blog-soumaya",
    headerLabel: "Soumaya",
    category: "Colecciones",
    title: "Museo Soumaya: exposiciones y experiencias culturales para publico general",
    summary:
      "Puntos clave para una visita enfocada en arte y actividades familiares, con una lectura practica de flujos de entrada para eventos culturales masivos.",
    focus: "Agenda recomendada: exposicion temporal destacada, recorrido de coleccion y programa educativo.",
    image: "/blogs/soumaya.jpg",
    venue: "Plaza Carso",
    readTime: "4 min",
    sourceUrl: "https://www.museosoumaya.org/",
    imageSource: "https://commons.wikimedia.org/wiki/File:Museo_Soumaya_Plaza_Carso_Exterior.jpg",
  },
];

const iconicMuseums = [
  {
    id: "mna",
    name: "Museo Nacional de Antropologia",
    location: "Chapultepec",
    rating: 4.9,
    comment: "Recorrido impecable, coleccion espectacular y excelente experiencia cultural.",
    image: "/blogs/antropologia.jpg",
  },
  {
    id: "bellas-artes",
    name: "Palacio de Bellas Artes",
    location: "Centro Historico",
    rating: 4.8,
    comment: "Gran curaduria en exposiciones temporales y un recinto iconico de CDMX.",
    image: "/blogs/bellas-artes.jpg",
  },
  {
    id: "frida",
    name: "Museo Frida Kahlo",
    location: "Coyoacan",
    rating: 4.7,
    comment: "Visita muy completa; vale mucho la pena reservar con anticipacion.",
    image: "/blogs/frida-kahlo.jpg",
  },
  {
    id: "soumaya",
    name: "Museo Soumaya",
    location: "Plaza Carso",
    rating: 4.7,
    comment: "Arquitectura y colecciones muy atractivas para ir en familia.",
    image: "/blogs/soumaya.jpg",
  },
  {
    id: "munal",
    name: "MUNAL",
    location: "Tacuba",
    rating: 4.8,
    comment: "Excelente para entender arte mexicano en un edificio historico impresionante.",
    image: "/blogs/munal.jpg",
  },
  {
    id: "tamayo",
    name: "Museo Tamayo",
    location: "Chapultepec",
    rating: 4.6,
    comment: "Muestras contemporaneas muy bien montadas y espacio muy agradable.",
    image: "/blogs/tamayo.jpg",
  },
  {
    id: "templo-mayor",
    name: "Museo del Templo Mayor",
    location: "Centro Historico",
    rating: 4.8,
    comment: "Impresionante contexto arqueologico en pleno corazon de la ciudad.",
    image: "/blogs/templo-mayor.jpg",
  },
];

const PASSPORT_MUSEUM_COLLECTIONS = [
  {
    museumId: "mna",
    museumName: "Museo Nacional de Antropologia",
    shortLocation: "Chapultepec",
    image: "/blogs/antropologia.jpg",
    nftSeries: [
      { tokenId: 101, label: "Pase Patrimonio I" },
      { tokenId: 102, label: "Pase Patrimonio II" },
      { tokenId: 103, label: "Pase Patrimonio III" },
    ],
  },
  {
    museumId: "bellas-artes",
    museumName: "Palacio de Bellas Artes",
    shortLocation: "Centro Historico",
    image: "/blogs/bellas-artes.jpg",
    nftSeries: [
      { tokenId: 104, label: "Pase Bellas I" },
      { tokenId: 105, label: "Pase Bellas II" },
      { tokenId: 106, label: "Pase Bellas III" },
    ],
  },
  {
    museumId: "frida",
    museumName: "Museo Frida Kahlo",
    shortLocation: "Coyoacan",
    image: "/blogs/frida-kahlo.jpg",
    nftSeries: [
      { tokenId: 107, label: "Pase Casa Azul I" },
      { tokenId: 108, label: "Pase Casa Azul II" },
      { tokenId: 109, label: "Pase Casa Azul III" },
    ],
  },
  {
    museumId: "soumaya",
    museumName: "Museo Soumaya",
    shortLocation: "Plaza Carso",
    image: "/blogs/soumaya.jpg",
    nftSeries: [
      { tokenId: 110, label: "Pase Soumaya I" },
      { tokenId: 111, label: "Pase Soumaya II" },
      { tokenId: 112, label: "Pase Soumaya III" },
    ],
  },
  {
    museumId: "munal",
    museumName: "MUNAL",
    shortLocation: "Tacuba",
    image: "/blogs/munal.jpg",
    nftSeries: [
      { tokenId: 113, label: "Pase MUNAL I" },
      { tokenId: 114, label: "Pase MUNAL II" },
      { tokenId: 115, label: "Pase MUNAL III" },
    ],
  },
  {
    museumId: "tamayo",
    museumName: "Museo Tamayo",
    shortLocation: "Chapultepec",
    image: "/blogs/tamayo.jpg",
    nftSeries: [
      { tokenId: 116, label: "Pase Tamayo I" },
      { tokenId: 117, label: "Pase Tamayo II" },
      { tokenId: 118, label: "Pase Tamayo III" },
    ],
  },
  {
    museumId: "templo-mayor",
    museumName: "Museo del Templo Mayor",
    shortLocation: "Centro Historico",
    image: "/blogs/templo-mayor.jpg",
    nftSeries: [
      { tokenId: 119, label: "Pase Templo I" },
      { tokenId: 120, label: "Pase Templo II" },
      { tokenId: 121, label: "Pase Templo III" },
    ],
  },
];

const mobileDockLinks = [
  {
    href: "#hero",
    label: "Inicio",
    lightIcon: "/docIcons/inicio-light.svg",
    darkIcon: "/docIcons/inicio-dark.svg",
  },
  {
    href: "#como-funciona",
    label: "Como",
    lightIcon: "/docIcons/funciona-light.svg",
    darkIcon: "/docIcons/funciona-dark.svg",
  },
  {
    href: "#recintos",
    label: "Recintos",
    lightIcon: "/docIcons/recintos-light.svg",
    darkIcon: "/docIcons/recintos-dark.svg",
  },
  {
    href: "#blog-museos",
    label: "Blogs",
    lightIcon: "/docIcons/blogs-light.svg",
    darkIcon: "/docIcons/blogs-dark.svg",
  },
  {
    href: "#adopcion",
    label: "Adopcion",
    lightIcon: "/docIcons/adopcion-light.svg",
    darkIcon: "/docIcons/adopcion-dark.svg",
  },
];

const heroPills = [
  { label: "Boletos NFT ERC1155" },
  { label: "Gratis + premium" },
  { label: "Precios local vs internacional" },
  { label: "Infraestructura Monad" },
];

const howItWorksSteps = [
  {
    symbol: "1",
    title: "Conecta tu wallet y valida tu perfil local/turista",
    text: "Inicias sesion con wallet y registras tu CURP. Si es mexicana valida, accedes a tarifa local; si no, se aplica tarifa internacional.",
  },
  {
    symbol: "2",
    title: "Elige evento y obtiene tu boleto NFT",
    text: "Cada recinto usa un tokenId ERC1155 unico. Puedes reclamar boleto gratuito o comprar boleto premium en USDC con beneficios extra.",
  },
  {
    symbol: "3",
    title: "Asiste y conserva tu historial on-chain",
    text: "Tu boleto vive en tu wallet como comprobante, coleccionable y base para futuras recompensas o membresias culturales.",
  },
];

const venueBenefits = [
  "Ventas on-chain transparentes para mejor control operativo y financiero.",
  "Precios inteligentes para locales y turistas con validacion CURP.",
  "Ingresos programables con splits y fondos para programas culturales.",
  "Lealtad y membresias usando historial on-chain de visitas.",
  "Escalabilidad con costos eficientes gracias a Monad.",
];

const suiteCards = [
  {
    id: "top-left",
    icon: GlobalOutlined,
    title: "Emision ERC1155 por evento",
    description: "Cada museo o recinto define un tokenId unico para cada acceso cultural.",
    glow: true,
  },
  {
    id: "top-right",
    icon: MobileOutlined,
    title: "Flujo wallet + CURP",
    description: "Onboarding simple para definir precio local o internacional sin friccion.",
    glow: true,
  },
  {
    id: "mid-left",
    icon: ShopOutlined,
    title: "Boletos gratis y premium",
    description: "Modelo dual: asistencia sin costo y ticket premium en USDC.",
    glow: true,
  },
  {
    id: "mid-right",
    icon: BarChartOutlined,
    title: "Ventas on-chain auditables",
    description: "Operacion trazable para reportes, conciliacion y analitica del recinto.",
  },
  {
    id: "bottom-left",
    icon: SafetyCertificateOutlined,
    title: "Lealtad Web3",
    description: "Recompensas para visitantes frecuentes basadas en asistencia real.",
  },
  {
    id: "bottom-right",
    icon: CreditCardOutlined,
    title: "Pagos premium en USDC",
    description: "Cobro eficiente para usuarios internacionales y locales.",
    glow: true,
  },
];

const plans = [
  { name: "Piloto", price: "1 recinto", subtitle: "Lanzamiento inicial" },
  { name: "Expansion", price: "3 recintos", subtitle: "Red cultural en crecimiento" },
  { name: "Ciudad", price: "10+ recintos", subtitle: "Operacion metropolitana" },
  { name: "Ecosistema", price: "Multi-sede", subtitle: "Protocolos y alianzas" },
];

const EASE_OUT = [0.22, 1, 0.36, 1];

const clamp = (n, min, max) => Math.min(max, Math.max(min, n));

function PeripheralCard({ card, width, height, progressRatio }) {
  const Icon = card.icon;
  const barWidth = `${Math.round(42 + progressRatio * 44)}%`;

  return (
    <div
      className={`xoco-peripheral-card ${card.glow ? "xoco-peripheral-card-glow" : ""}`}
      style={{ width, height }}
      role="img"
      aria-label={card.title}
    >
      <div className="xoco-peripheral-row">
        <div className="xoco-peripheral-icon-wrap" aria-hidden>
          <Icon className="xoco-peripheral-icon" />
        </div>
        <div className="xoco-peripheral-text">
          <p className="xoco-peripheral-title">{card.title}</p>
          <p className="xoco-peripheral-description">{card.description}</p>
        </div>
      </div>
      <div className="xoco-peripheral-progress-track">
        <div
          className={`xoco-peripheral-progress-fill ${card.glow ? "xoco-peripheral-progress-fill-glow" : ""}`}
          style={{ width: barWidth }}
        />
      </div>
      <div className="xoco-peripheral-glow-orb" aria-hidden />
    </div>
  );
}

function PeripheralScreen({ layout, card, index, progress, spreadMedium, spreadLong, viewportWidth }) {
  const xNear = layout.initialX;
  const xMedium = layout.initialX * spreadMedium;
  const xLongRaw = layout.initialX * spreadLong;
  const xClampMax = viewportWidth > 0 ? Math.max(168, viewportWidth / 2 - 40) : Number.POSITIVE_INFINITY;
  const xLong = Math.sign(layout.initialX) * Math.min(Math.abs(xLongRaw), xClampMax);

  const x = useTransform(progress, [0, 0.25, 0.62, 1], [xNear, xMedium, xLong, xLong]);
  const y = useTransform(
    progress,
    [0, 0.25, 0.62, 1],
    [layout.initialY, layout.initialY + 10, layout.initialY + 44, layout.initialY + 76],
  );
  const xRounded = useTransform(x, value => Math.round(value));
  const yRounded = useTransform(y, value => Math.round(value));
  const rotate = useTransform(
    progress,
    [0, 0.25, 0.62, 1],
    [layout.initialRotate, layout.initialRotate, layout.initialRotate * 1.1, layout.initialRotate * 1.2],
  );
  const opacity = useTransform(progress, [0, 0.4, 0.72, 1], [1, 0.9, 0.56, 0.4]);

  return (
    <motion.div style={{ x: xRounded, y: yRounded, rotate, opacity }} className="xoco-peripheral-screen">
      <motion.div
        initial={{ opacity: 0, y: 10, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.65, delay: index * 0.08, ease: EASE_OUT }}
      >
        <PeripheralCard
          card={card}
          width={layout.width}
          height={layout.height}
          progressRatio={0.55 + (index % 3) * 0.13}
        />
      </motion.div>
    </motion.div>
  );
}

function Home({ onAgendaDemoClick, isConnected, accountProps }) {
  const scrollTrackRef = useRef(null);
  const museumsCarouselRef = useRef(null);
  const reduceMotion = useReducedMotion();
  const walletAddress = accountProps?.address;
  const tx = accountProps?.tx;
  const ticketsContractAddress = DEFAULT_TICKETS_CONTRACT_ADDRESS;

  const { ticketReadContract, ticketWriteContract } = useTicketContract({
    contractAddress: ticketsContractAddress,
    provider: accountProps?.localProvider,
    signer: accountProps?.userSigner,
  });

  const [viewportWidth, setViewportWidth] = useState(0);
  const [activeHash, setActiveHash] = useState("#hero");
  const [isPaymentPopupOpen, setIsPaymentPopupOpen] = useState(false);
  const [isMuseumAutoScrollEnabled, setIsMuseumAutoScrollEnabled] = useState(true);
  const [isPassportMintPopupOpen, setIsPassportMintPopupOpen] = useState(false);
  const [passportBalances, setPassportBalances] = useState({});
  const [isPassportLoading, setIsPassportLoading] = useState(false);
  const [mintingTokenId, setMintingTokenId] = useState(null);
  const [revealedPassportTokenIds, setRevealedPassportTokenIds] = useState([]);
  const [activeStampEffect, setActiveStampEffect] = useState(null);
  const knownOwnedTokenIdsRef = useRef(new Set());
  const stampTimersRef = useRef([]);

  const demoTokenIds = useMemo(
    () => PASSPORT_MUSEUM_COLLECTIONS.flatMap(museum => museum.nftSeries.map(item => item.tokenId)),
    [],
  );

  const { scrollYProgress } = useScroll({
    target: scrollTrackRef,
    offset: ["start start", "end start"],
  });

  useEffect(() => {
    const onResize = () => setViewportWidth(window.innerWidth || 0);
    onResize();
    window.addEventListener("resize", onResize, { passive: true });
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    const syncHash = () => setActiveHash(window.location.hash || "#hero");
    syncHash();
    window.addEventListener("hashchange", syncHash);
    return () => window.removeEventListener("hashchange", syncHash);
  }, []);

  const reloadPassportBalances = useCallback(async () => {
    if (!ticketReadContract || !walletAddress) {
      setPassportBalances({});
      return;
    }

    setIsPassportLoading(true);
    try {
      const balances = await Promise.all(
        demoTokenIds.map(async tokenId => {
          const rawBalance = await ticketReadContract.balanceOf(walletAddress, tokenId);
          return [tokenId, Number(rawBalance.toString())];
        }),
      );

      setPassportBalances(Object.fromEntries(balances));
    } catch (error) {
      console.error("Failed to load passport NFT balances", error);
      message.error("No fue posible cargar tus NFTs del pasaporte.");
    } finally {
      setIsPassportLoading(false);
    }
  }, [demoTokenIds, ticketReadContract, walletAddress]);

  useEffect(() => {
    if (!isConnected) {
      setPassportBalances({});
      return;
    }
    reloadPassportBalances();
  }, [isConnected, reloadPassportBalances]);

  useEffect(() => {
    if (!isPassportMintPopupOpen) return;
    reloadPassportBalances();
  }, [isPassportMintPopupOpen, reloadPassportBalances]);

  const isMobile = viewportWidth > 0 ? viewportWidth < 768 : false;

  const { spreadMedium, spreadLong } = useMemo(() => {
    const t = clamp((viewportWidth - 390) / (1440 - 390), 0, 1);
    if (isMobile) {
      return {
        spreadMedium: 1.15 + 0.28 * t,
        spreadLong: 1.4 + 0.58 * t,
      };
    }
    return {
      spreadMedium: 1.28 + 0.62 * t,
      spreadLong: 1.75 + 1.28 * t,
    };
  }, [isMobile, viewportWidth]);

  const phoneFrame = useMemo(() => {
    const t = clamp((viewportWidth - 360) / (1600 - 360), 0, 1);
    const frameWidth = Math.round(220 + 88 * t);
    const frameHeight = Math.round(frameWidth * 2.08);
    const frameRadius = Math.round(38 + 14 * t);
    const bezel = Math.round(10 + 3 * t);
    return {
      width: frameWidth,
      height: frameHeight,
      radius: frameRadius,
      bezel,
    };
  }, [viewportWidth]);

  const sceneHeight = useMemo(() => {
    const base = isMobile ? 620 : 860;
    return Math.max(base, phoneFrame.height + (isMobile ? 124 : 220));
  }, [isMobile, phoneFrame.height]);

  const scrollTrackHeight = useMemo(() => {
    const minHeight = isMobile ? 820 : 980;
    const extra = isMobile ? 130 : 180;
    return Math.max(minHeight, sceneHeight + extra);
  }, [isMobile, sceneHeight]);

  const peripheralLayouts = useMemo(
    () => [
      {
        id: "top-left",
        initialX: isMobile ? -98 : -260,
        initialY: isMobile ? -208 : -208,
        initialRotate: -6,
        width: isMobile ? 172 : 214,
        height: isMobile ? 142 : 154,
      },
      {
        id: "top-right",
        initialX: isMobile ? 98 : 260,
        initialY: isMobile ? -208 : -208,
        initialRotate: 6,
        width: isMobile ? 172 : 214,
        height: isMobile ? 142 : 154,
      },
      {
        id: "mid-left",
        initialX: isMobile ? -120 : -332,
        initialY: isMobile ? -26 : -22,
        initialRotate: -8,
        width: isMobile ? 192 : 250,
        height: isMobile ? 164 : 184,
      },
      {
        id: "mid-right",
        initialX: isMobile ? 120 : 332,
        initialY: isMobile ? -26 : -22,
        initialRotate: 8,
        width: isMobile ? 192 : 250,
        height: isMobile ? 164 : 184,
      },
      {
        id: "bottom-left",
        initialX: isMobile ? -92 : -252,
        initialY: isMobile ? 200 : 208,
        initialRotate: -5,
        width: isMobile ? 170 : 206,
        height: isMobile ? 144 : 150,
      },
      {
        id: "bottom-right",
        initialX: isMobile ? 92 : 252,
        initialY: isMobile ? 200 : 208,
        initialRotate: 5,
        width: isMobile ? 170 : 206,
        height: isMobile ? 144 : 150,
      },
    ],
    [isMobile],
  );

  const phoneScale = useTransform(scrollYProgress, [0, 0.35, 0.65, 1], [0.78, 1.06, 1.02, 1]);
  const phoneY = useTransform(scrollYProgress, [0, 0.35, 0.65, 1], [0, -8, -10, -12]);
  const imageScale = useTransform(scrollYProgress, [0, 0.35, 1], [1.02, 1.1, 1.16]);
  const imageY = useTransform(scrollYProgress, [0, 1], [0, -16]);
  const depthOpacity = useTransform(scrollYProgress, [0, 0.35, 1], [0, 0.35, 0.56]);

  const handlePrimaryCta = () => {
    if (!isConnected && typeof onAgendaDemoClick === "function") {
      onAgendaDemoClick();
      return;
    }
    const target = document.querySelector("#passport-demo");
    target?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleSecondaryCta = () => {
    const target = document.querySelector("#como-funciona");
    target?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const isDockActive = href => {
    if (href === "#blog-museos") {
      return activeHash === "#blog-museos" || activeHash.startsWith("#blog-");
    }
    return activeHash === href;
  };

  const scrollMuseumCards = direction => {
    museumsCarouselRef.current?.scrollBy({
      left: direction * 360,
      behavior: "smooth",
    });
  };

  const handleMuseumCarouselButton = direction => {
    setIsMuseumAutoScrollEnabled(false);
    scrollMuseumCards(direction);
  };

  const renderRatingStars = rating => {
    const filled = Math.round(rating);
    return Array.from({ length: 5 }, (_, index) =>
      index < filled ? (
        <StarFilled key={`filled-${rating}-${index}`} className="xoco-star-filled" />
      ) : (
        <StarOutlined key={`empty-${rating}-${index}`} className="xoco-star-empty" />
      ),
    );
  };

  const museumPortfolio = useMemo(
    () =>
      PASSPORT_MUSEUM_COLLECTIONS.map(museum => {
        const ownedCount = museum.nftSeries.reduce((sum, item) => sum + (passportBalances[item.tokenId] || 0), 0);
        return { ...museum, ownedCount };
      }),
    [passportBalances],
  );

  const totalPassportNfts = useMemo(
    () => demoTokenIds.reduce((sum, tokenId) => sum + (passportBalances[tokenId] || 0), 0),
    [demoTokenIds, passportBalances],
  );

  const museumsWithNfts = useMemo(
    () => museumPortfolio.filter(museum => museum.ownedCount > 0).length,
    [museumPortfolio],
  );

  const tokenMetadataById = useMemo(() => {
    const entries = PASSPORT_MUSEUM_COLLECTIONS.flatMap(museum =>
      museum.nftSeries.map(token => [
        token.tokenId,
        {
          ...token,
          museumId: museum.museumId,
          museumName: museum.museumName,
          shortLocation: museum.shortLocation,
          image: museum.image,
        },
      ]),
    );
    return Object.fromEntries(entries);
  }, []);

  const ownedPassportTokens = useMemo(() => {
    return demoTokenIds
      .filter(tokenId => (passportBalances[tokenId] || 0) > 0)
      .map(tokenId => tokenMetadataById[tokenId])
      .filter(Boolean);
  }, [demoTokenIds, passportBalances, tokenMetadataById]);

  const revealedTokenIdSet = useMemo(() => new Set(revealedPassportTokenIds), [revealedPassportTokenIds]);

  const handleMintPassportNft = async tokenId => {
    if (!walletAddress || !ticketWriteContract || !tx) {
      message.error("Conecta tu wallet para mintear.");
      return;
    }

    setMintingTokenId(tokenId);
    try {
      await tx(ticketWriteContract.mintFree(tokenId));
      message.success(`NFT #${tokenId} mintado para Donovan.`);
      await reloadPassportBalances();
    } catch (error) {
      const reason =
        error?.error?.message || error?.data?.message || error?.message || "No fue posible mintear el NFT.";
      message.error(String(reason).slice(0, 180));
    } finally {
      setMintingTokenId(null);
    }
  };

  useEffect(() => {
    const currentOwnedIds = ownedPassportTokens.map(token => token.tokenId);
    const knownOwned = knownOwnedTokenIdsRef.current;
    const newTokenIds = currentOwnedIds.filter(tokenId => !knownOwned.has(tokenId));

    if (newTokenIds.length > 0) {
      setRevealedPassportTokenIds(prev => Array.from(new Set([...prev, ...newTokenIds])));

      stampTimersRef.current.forEach(timerId => window.clearTimeout(timerId));
      stampTimersRef.current = [];

      newTokenIds.forEach((tokenId, index) => {
        const timerId = window.setTimeout(() => {
          const token = tokenMetadataById[tokenId];
          setActiveStampEffect({
            key: `${tokenId}-${Date.now()}`,
            museumName: token?.museumName || "Museo",
            tokenId,
          });
        }, index * 280);
        stampTimersRef.current.push(timerId);
      });
    }

    knownOwnedTokenIdsRef.current = new Set(currentOwnedIds);

    return () => {
      stampTimersRef.current.forEach(timerId => window.clearTimeout(timerId));
    };
  }, [ownedPassportTokens, tokenMetadataById]);

  useEffect(() => {
    if (!activeStampEffect) return undefined;
    const timerId = window.setTimeout(() => setActiveStampEffect(null), 1200);
    return () => window.clearTimeout(timerId);
  }, [activeStampEffect]);

  useEffect(() => {
    if (!isMuseumAutoScrollEnabled) return undefined;

    const node = museumsCarouselRef.current;
    if (!node) return undefined;

    const interval = window.setInterval(() => {
      const maxScroll = node.scrollWidth - node.clientWidth;
      if (maxScroll <= 0) return;

      const step = Math.min(360, Math.round(node.clientWidth * 0.78));
      const nearEnd = node.scrollLeft + step >= maxScroll - 12;

      if (nearEnd) {
        node.scrollTo({ left: 0, behavior: "smooth" });
      } else {
        node.scrollBy({ left: step, behavior: "smooth" });
      }
    }, 3200);

    return () => window.clearInterval(interval);
  }, [isMuseumAutoScrollEnabled]);

  return (
    <div className="xoco-home" id="hero">
      <nav className="xoco-nav">
        <div className="xoco-nav-main">
          <div className="xoco-nav-brand">
            <span className="xoco-nav-logo">T</span>
            <div>
              <p className="xoco-nav-title">Ticketeria CDMX</p>
              <p className="xoco-nav-subtitle">Ticketing cultural en Monad</p>
            </div>
          </div>

          <div className="xoco-nav-links">
            {navItems.map(item => (
              <a key={item.href} href={item.href} className="xoco-nav-link-pill">
                <span className="xoco-nav-link-logo" aria-hidden>
                  {item.mark}
                </span>
                <span>{item.label}</span>
              </a>
            ))}
          </div>

          <div className="xoco-nav-actions">
            <ThemeSwitch inline />
            {isConnected ? <span className="xoco-user-chip">Donovan</span> : null}
            <div className="xoco-wallet-inline">
              <Account {...accountProps} isConnected={isConnected} minimized />
            </div>
          </div>
        </div>

        <div className="xoco-nav-blog-strip" aria-label="Blogs destacados de museos">
          {museumBlogs.map(blog => (
            <a key={blog.id} href={`#${blog.id}`} className="xoco-nav-blog-pill">
              <span className="xoco-nav-blog-dot" aria-hidden />
              <span>{blog.headerLabel}</span>
            </a>
          ))}
        </div>
      </nav>

      <section className="xoco-section xoco-hero">
        <div className="xoco-hero-bg" aria-hidden>
          <div className="xoco-blob xoco-blob-left" />
          <div className="xoco-blob xoco-blob-right" />
        </div>

        <div className="xoco-hero-content">
          <div className="xoco-hero-badge">
            <span>W3</span>
            <span>Protocolo de boletaje cultural para CDMX</span>
          </div>

          <h1>
            Ticketing Web3 para <span>cultura en CDMX</span>
          </h1>

          <p>
            Ticketeria CDMX convierte cada entrada en un NFT ERC1155 sobre Monad. Ofrece boletos gratuitos de asistencia
            y boletos premium en USDC, con precio local para CURP mexicana valida y precio internacional para turistas.
          </p>

          <div className="xoco-pill-row">
            {heroPills.map(pill => (
              <span key={pill.label} className="xoco-pill">
                <span className="xoco-pill-dot" />
                {pill.label}
              </span>
            ))}
          </div>

          <div className="xoco-cta-row">
            <button className="xoco-button xoco-button-primary" type="button" onClick={handlePrimaryCta}>
              Conecta tu wallet <span>-></span>
            </button>
            <button className="xoco-button xoco-button-secondary" type="button" onClick={handleSecondaryCta}>
              Conoce como funciona
            </button>
          </div>

          <p className="xoco-note">
            Ticketeria CDMX es un protocolo de boletaje cultural para museos, recintos y eventos en Ciudad de Mexico.
            Moderniza la taquilla con ventas on-chain transparentes, menor friccion para el visitante y una base real
            para lealtad, membresias y nuevos ingresos programables.
          </p>
        </div>
      </section>

      {isConnected ? (
        <section className="xoco-section xoco-passport-section" id="passport-demo">
          <div className="xoco-passport-top">
            <div className="xoco-passport-cover">
              <p className="xoco-passport-cover-kicker">Ticket Passport</p>
              <h3>Donovan</h3>
              <p>Portador verificado por Privy</p>
              <div className="xoco-passport-cover-code">MX-CDMX-2026-0001</div>
            </div>

            <div className="xoco-passport-summary">
              <span className="xoco-badge">Pasaporte NFT</span>
              <h2>Hola Donovan, esta es tu vista de pasaporte</h2>
              <p>
                Ya puedes mintear tickets gratuitos de museos desde esta misma pantalla. Cada museo tiene 3 NFTs de demo
                (21 en total).
              </p>
              {!ticketsContractAddress ? (
                <p className="xoco-passport-warning">
                  Configura <code>REACT_APP_TICKETS_CONTRACT_ADDRESS</code> para habilitar el mint on-chain.
                </p>
              ) : null}

              <div className="xoco-passport-metrics">
                <article className="xoco-passport-metric-card">
                  <p>NFTs en wallet</p>
                  <strong>{totalPassportNfts}</strong>
                </article>
                <article className="xoco-passport-metric-card">
                  <p>Museos con NFTs</p>
                  <strong>{museumsWithNfts}/7</strong>
                </article>
                <article className="xoco-passport-metric-card">
                  <p>Estado</p>
                  <strong>{isPassportLoading ? "Cargando..." : "Activo"}</strong>
                </article>
              </div>

              <div className="xoco-passport-gallery-shell">
                <div className="xoco-passport-gallery-head">
                  <p>Coleccion del pasaporte</p>
                  <strong>{ownedPassportTokens.length}/21 NFTs</strong>
                </div>

                {ownedPassportTokens.length ? (
                  <div className="xoco-passport-gallery-grid">
                    <AnimatePresence initial={false}>
                      {ownedPassportTokens
                        .filter(token => revealedTokenIdSet.has(token.tokenId))
                        .map(token => (
                          <motion.article
                            key={token.tokenId}
                            className="xoco-passport-nft-card"
                            initial={{ opacity: 0, y: 26, scale: 0.92, filter: "blur(8px)" }}
                            animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
                            exit={{ opacity: 0, y: 12, scale: 0.98 }}
                            transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
                          >
                            <div className="xoco-passport-nft-media">
                              <img src={token.image} alt={`${token.museumName} NFT`} loading="lazy" />
                            </div>
                            <div className="xoco-passport-nft-body">
                              <p>{token.shortLocation}</p>
                              <h4>{token.label}</h4>
                              <span>#{token.tokenId}</span>
                            </div>
                          </motion.article>
                        ))}
                    </AnimatePresence>
                  </div>
                ) : (
                  <p className="xoco-passport-gallery-empty">
                    Aun no tienes NFTs en este pasaporte. Mintea el primero para activar tu coleccion.
                  </p>
                )}
              </div>

              <div className="xoco-passport-cta-row">
                <button
                  type="button"
                  className="xoco-button xoco-button-primary"
                  onClick={() => setIsPassportMintPopupOpen(true)}
                >
                  Mint NFT de museo
                </button>
                <a href="#museos-destacados" className="xoco-button xoco-button-secondary">
                  Ver museos
                </a>
              </div>

              <AnimatePresence>
                {activeStampEffect ? (
                  <motion.div
                    key={activeStampEffect.key}
                    className="xoco-passport-stamp-fx"
                    initial={{ opacity: 0, scale: 0.42, rotate: -24 }}
                    animate={{ opacity: 1, scale: 1, rotate: -10 }}
                    exit={{ opacity: 0, scale: 1.05, rotate: -8 }}
                    transition={{ duration: 0.34, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <strong>Sello aplicado</strong>
                    <span>#{activeStampEffect.tokenId}</span>
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </div>
          </div>
        </section>
      ) : null}

      <section className="xoco-section" id="como-funciona">
        <div className="xoco-section-heading">
          <span className="xoco-badge">Como funciona</span>
          <h2>Proceso en 3 pasos</h2>
          <p>Experiencia simple para visitantes y operacion eficiente para recintos culturales.</p>
        </div>

        <div className="xoco-grid xoco-grid-3">
          {howItWorksSteps.map(step => (
            <article key={step.title} className="xoco-card">
              <span className="xoco-card-icon">{step.symbol}</span>
              <h3>{step.title}</h3>
              <p>{step.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="xoco-section xoco-muted" id="recintos">
        <div className="xoco-section-heading">
          <span className="xoco-badge xoco-badge-icon">
            <span>R</span>
            Para recintos
          </span>
          <h2>Valor para museos y espacios culturales</h2>
        </div>

        <div className="xoco-card xoco-why-card">
          <ul>
            {venueBenefits.map(text => (
              <li key={text}>
                <span className="xoco-check">v</span>
                <span>{text}</span>
              </li>
            ))}
          </ul>

          <div className="xoco-why-cta">
            <a className="xoco-button xoco-button-secondary" href="#adopcion">
              Ver rutas de adopcion
            </a>
          </div>
        </div>
      </section>

      <section className="xoco-section" id="museos-destacados">
        <div className="xoco-section-heading">
          <span className="xoco-badge">Museos iconicos CDMX</span>
          <h2>Recomendaciones culturales</h2>
          <p>Top de museos con ubicacion corta, puntuacion y una referencia rapida de experiencia visitante.</p>
        </div>

        <div className="xoco-museum-carousel-wrap">
          <div className="xoco-museum-carousel-controls">
            <button
              type="button"
              className="xoco-button xoco-button-secondary xoco-carousel-btn"
              aria-label="Ver museos anteriores"
              onClick={() => handleMuseumCarouselButton(-1)}
            >
              <LeftOutlined />
            </button>
            <button
              type="button"
              className="xoco-button xoco-button-secondary xoco-carousel-btn"
              aria-label="Ver museos siguientes"
              onClick={() => handleMuseumCarouselButton(1)}
            >
              <RightOutlined />
            </button>
          </div>

          <div className="xoco-museum-carousel-track" ref={museumsCarouselRef}>
            {iconicMuseums.map(museum => (
              <article className="xoco-museum-card" key={museum.id}>
                <div className="xoco-museum-card-media">
                  <img src={museum.image} alt={museum.name} loading="lazy" />
                </div>

                <div className="xoco-museum-card-body">
                  <p className="xoco-museum-location">{museum.location}</p>
                  <h3>{museum.name}</h3>

                  <div className="xoco-museum-rating-row">
                    <div className="xoco-museum-stars">{renderRatingStars(museum.rating)}</div>
                    <span className="xoco-museum-rating-value">{museum.rating.toFixed(1)}</span>
                  </div>

                  <p className="xoco-museum-comment">“{museum.comment}”</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="xoco-section" id="blog-museos">
        <div className="xoco-section-heading">
          <span className="xoco-badge">Blog de museos CDMX</span>
          <h2>Agenda cultural y exposiciones destacadas</h2>
          <p>
            Panel editorial de ejemplo con museos clave de Ciudad de Mexico para probar flujo de discovery, contenido y
            navegacion desde header.
          </p>
        </div>

        <div className="xoco-grid xoco-grid-2 xoco-blog-grid">
          {museumBlogs.map(blog => (
            <article key={blog.id} id={blog.id} className="xoco-card xoco-blog-card">
              <div className="xoco-blog-media">
                <img src={blog.image} alt={blog.title} loading="lazy" />
              </div>
              <div className="xoco-blog-body">
                <div className="xoco-blog-tags">
                  <span className="xoco-badge">{blog.category}</span>
                  <span className="xoco-blog-meta-chip">{blog.venue}</span>
                  <span className="xoco-blog-meta-chip">{blog.readTime}</span>
                </div>
                <h3>{blog.title}</h3>
                <p>{blog.summary}</p>
                <p className="xoco-blog-focus">{blog.focus}</p>
                <div className="xoco-blog-links">
                  <a href={blog.sourceUrl} target="_blank" rel="noreferrer">
                    Fuente del recinto <span>ext</span>
                  </a>
                  <a href={blog.imageSource} target="_blank" rel="noreferrer">
                    Credito de imagen <span>ext</span>
                  </a>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="xoco-section xoco-modules" id="modulos">
        <div className="xoco-section-heading">
          <h2>Componentes del protocolo</h2>
          <p>Arquitectura para emitir, vender y reutilizar boletos on-chain a escala cultural.</p>
        </div>

        <div ref={scrollTrackRef} className="xoco-modules-scroll-track" style={{ height: `${scrollTrackHeight}px` }}>
          <div className="xoco-modules-sticky">
            <div className="xoco-modules-scene" style={{ height: `${sceneHeight}px` }}>
              <div className="xoco-peripherals-layer">
                {peripheralLayouts.map((layout, index) => {
                  const card = suiteCards.find(item => item.id === layout.id);
                  if (!card) return null;

                  return (
                    <PeripheralScreen
                      key={layout.id}
                      layout={layout}
                      card={card}
                      index={index}
                      progress={scrollYProgress}
                      spreadMedium={spreadMedium}
                      spreadLong={spreadLong}
                      viewportWidth={viewportWidth}
                    />
                  );
                })}
              </div>

              <div className="xoco-phone-center-anchor">
                <motion.div style={{ scale: phoneScale, y: phoneY }} className="xoco-phone-center">
                  <div
                    className="xoco-phone-frame xoco-phone-frame-animated"
                    style={{
                      width: phoneFrame.width,
                      height: phoneFrame.height,
                      borderRadius: phoneFrame.radius,
                    }}
                  >
                    <motion.div
                      className="xoco-phone-notch xoco-phone-notch-animated"
                      initial={false}
                      animate={
                        reduceMotion
                          ? { width: 108, height: 28, y: 0 }
                          : {
                              width: [92, 130, 108, 120],
                              height: [28, 28, 28, 28],
                              y: [0, 1, 0, 0],
                            }
                      }
                      transition={
                        reduceMotion ? undefined : { duration: 3.6, ease: EASE_OUT, repeat: Number.POSITIVE_INFINITY }
                      }
                    >
                      <div className="xoco-phone-notch-row">
                        <span className="xoco-phone-notch-dot" />
                        <span className="xoco-phone-notch-bar" />
                      </div>
                    </motion.div>

                    <div
                      className="xoco-phone-screen"
                      style={{
                        top: phoneFrame.bezel,
                        right: phoneFrame.bezel,
                        bottom: phoneFrame.bezel,
                        left: phoneFrame.bezel,
                        borderRadius: Math.max(20, phoneFrame.radius - 8),
                      }}
                    >
                      <motion.div style={{ scale: imageScale, y: imageY }} className="xoco-phone-screen-media">
                        <img
                          src="/XocoCafe.png"
                          alt="Pantalla principal Ticketeria CDMX"
                          className="xoco-phone-image"
                        />
                      </motion.div>
                      <div className="xoco-phone-screen-gradient" />
                      <div className="xoco-phone-screen-bottom" />
                    </div>

                    <div className="xoco-phone-side-left-long" aria-hidden />
                    <div className="xoco-phone-side-left-short" aria-hidden />
                    <div className="xoco-phone-side-right" aria-hidden />
                    <div className="xoco-phone-gloss" aria-hidden />
                  </div>
                </motion.div>
              </div>

              {!reduceMotion ? (
                <motion.div className="xoco-depth-layer" style={{ opacity: depthOpacity }} aria-hidden>
                  <div className="xoco-depth-orb-primary" />
                  <div className="xoco-depth-orb-secondary" />
                </motion.div>
              ) : null}
            </div>
          </div>
        </div>

        <p className="xoco-center-link">
          Quieres validar el flujo completo? <a href="#adopcion">Revisa rutas de adopcion aqui</a>.
        </p>
      </section>

      <section className="xoco-section" id="adopcion">
        <div className="xoco-section-heading">
          <h2>Rutas de adopcion para recintos</h2>
          <p>Implementacion gradual para modernizar taquilla sin friccion operativa.</p>
        </div>

        <div className="xoco-grid xoco-grid-4">
          {plans.map(plan => (
            <article key={plan.name} className="xoco-card xoco-pricing-card">
              <p className="xoco-pricing-name">{plan.name}</p>
              <p className="xoco-pricing-price">{plan.price}</p>
              <p className="xoco-pricing-subtitle">{plan.subtitle}</p>
              <p className="xoco-pricing-unit">Ticketeria CDMX</p>
            </article>
          ))}
        </div>

        <div className="xoco-cta-row xoco-cta-center">
          <button className="xoco-button xoco-button-primary" type="button" onClick={() => setIsPaymentPopupOpen(true)}>
            Ir al demo de pagos <span>-></span>
          </button>
          <Link className="xoco-button xoco-button-secondary" to="/tickets">
            Ver tickets on-chain
          </Link>
        </div>

        <p className="xoco-pricing-note">
          Desde pilotos en un solo museo hasta despliegues multi-recinto con integracion de datos y programas de lealtad
          Web3.
        </p>

        <div className="xoco-card xoco-pricing-support">
          <p>Acompanamos al equipo del recinto en onboarding, operacion diaria y activaciones de lealtad.</p>
        </div>
      </section>

      <div className="xoco-mobile-dock" aria-label="Navegacion rapida">
        <div className="xoco-mobile-dock-inner">
          {mobileDockLinks.map(item => (
            <a
              key={item.href}
              href={item.href}
              className={`xoco-mobile-dock-link ${isDockActive(item.href) ? "is-active" : ""}`}
            >
              <span className="xoco-mobile-dock-icon">
                <img src={item.lightIcon} alt={item.label} className="xoco-dock-icon-light" />
                <img src={item.darkIcon} alt={item.label} className="xoco-dock-icon-dark" />
              </span>
              <span className="xoco-mobile-dock-label">{item.label}</span>
            </a>
          ))}
        </div>
      </div>

      {isPassportMintPopupOpen ? (
        <div
          className="xoco-passport-modal-backdrop"
          role="dialog"
          aria-modal="true"
          aria-label="Mint de NFTs de museos"
          onClick={() => setIsPassportMintPopupOpen(false)}
        >
          <div className="xoco-passport-modal-shell" onClick={event => event.stopPropagation()}>
            <button
              type="button"
              className="xoco-passport-modal-close"
              onClick={() => setIsPassportMintPopupOpen(false)}
              aria-label="Cerrar mint popup"
            >
              ×
            </button>

            <div className="xoco-passport-modal-head">
              <span className="xoco-badge">Mint NFT de museo</span>
              <h3>Coleccion demo: 21 NFTs gratis</h3>
              <p>7 museos iconicos de CDMX · 3 NFTs por museo. Cada NFT se mintea una vez por wallet.</p>
            </div>

            <div className="xoco-passport-modal-grid">
              {museumPortfolio.map(museum => (
                <article key={museum.museumId} className="xoco-passport-museum-card">
                  <div className="xoco-passport-museum-media">
                    <img src={museum.image} alt={museum.museumName} loading="lazy" />
                  </div>

                  <div className="xoco-passport-museum-body">
                    <p className="xoco-passport-museum-location">{museum.shortLocation}</p>
                    <h4>{museum.museumName}</h4>
                    <p className="xoco-passport-museum-owned">
                      NFTs en wallet: <strong>{museum.ownedCount}/3</strong>
                    </p>

                    <div className="xoco-passport-token-grid">
                      {museum.nftSeries.map(token => {
                        const owned = (passportBalances[token.tokenId] || 0) > 0;
                        const busy = mintingTokenId === token.tokenId;
                        return (
                          <button
                            key={token.tokenId}
                            type="button"
                            className={`xoco-passport-token-btn ${owned ? "is-owned" : ""}`}
                            disabled={owned || busy}
                            onClick={() => handleMintPassportNft(token.tokenId)}
                          >
                            <span>{token.label}</span>
                            <small>#{token.tokenId}</small>
                            <strong>{owned ? "Ya en wallet" : busy ? "Minteando..." : "Mint gratis"}</strong>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      ) : null}

      <PaymentDemoPopup open={isPaymentPopupOpen} onClose={() => setIsPaymentPopupOpen(false)} />

      <footer className="xoco-footer" id="contacto">
        <div className="xoco-footer-grid">
          <div>
            <div className="xoco-nav-brand">
              <span className="xoco-nav-logo">T</span>
              <div>
                <p className="xoco-nav-title">Ticketeria CDMX</p>
              </div>
            </div>
            <p className="xoco-footer-copy">Protocolo de ticketing Web3 para cultura y eventos en Ciudad de Mexico.</p>
            <p className="xoco-footer-copy xoco-footer-copy-underline">
              NFTs ERC1155 sobre Monad para modernizar taquilla, lealtad y monetizacion cultural.
            </p>
          </div>

          <div>
            <h4>Protocolo</h4>
            <ul>
              <li>
                <a href="#modulos">TicketNFT1155</a>
              </li>
              <li>
                <a href="#modulos">Flujo CURP + wallet</a>
              </li>
              <li>
                <a href="#modulos">Boletos premium en USDC</a>
              </li>
              <li>
                <a href="#recintos">Lealtad on-chain</a>
              </li>
            </ul>
          </div>

          <div>
            <h4>Recursos</h4>
            <ul>
              <li>
                <a href="https://github.com/fruteroclub/monad-blitz-starter" target="_blank" rel="noreferrer">
                  Repositorio base <span>ext</span>
                </a>
              </li>
              <li>
                <a href="https://docs.privy.io/basics/react/quickstart" target="_blank" rel="noreferrer">
                  Login con Privy <span>ext</span>
                </a>
              </li>
              <li>
                <a href="#recintos">Beneficios para recintos</a>
              </li>
              <li>
                <a href="#adopcion">Adopcion</a>
              </li>
            </ul>
          </div>

          <div>
            <h4>Contacto</h4>
            <div className="xoco-socials">
              <a href="https://wa.me/525512291607" target="_blank" rel="noreferrer" aria-label="WhatsApp">
                <img src="/whatsapp-claro.png" alt="WhatsApp" />
              </a>
              <a href="mailto:contacto@ticketeria.mx" aria-label="Email">
                @
              </a>
              <a href="https://t.me/driano7" target="_blank" rel="noreferrer" aria-label="Telegram">
                tg
              </a>
              <a href="https://www.linkedin.com/in/driano7/" target="_blank" rel="noreferrer" aria-label="LinkedIn">
                in
              </a>
            </div>
          </div>
        </div>

        <div className="xoco-footer-bottom">
          <p>
            (c) 2026 Ticketeria CDMX. Desarrollado por{" "}
            <a href="https://studio--donovan-riao-portfolio.us-central1.hosted.app/" target="_blank" rel="noreferrer">
              Donovan Riano
            </a>
            .
          </p>

          <div className="xoco-footer-policies">
            <a href="#privacidad">Privacidad</a>
            <a href="#terminos">Terminos</a>
            <a href="#cookies">Cookies</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Home;
