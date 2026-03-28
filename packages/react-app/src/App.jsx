import "antd/dist/antd.css";
import { Button, Modal, Space, Spin, Typography } from "antd";
import { usePrivy } from "@privy-io/react-auth";
import { useUserProviderAndSigner } from "eth-hooks";
import { useExchangeEthPrice } from "eth-hooks/dapps/dex";
import React, { useCallback, useEffect, useState } from "react";
import { Route, Switch } from "react-router-dom";

import "./App.css";
import { CurpOnboardingModal } from "./components";
import { NETWORKS } from "./constants";
import { getRPCPollTime, Transactor } from "./helpers";
import { useGasPrice, useStaticJsonRPC } from "./hooks";
import { setStoredTicketeriaUser } from "./lib/ticketeriaUserStorage";
import { Home, Payments, Tickets } from "./views";

const initialNetwork = NETWORKS.monadTestnet || NETWORKS.localhost;
const USE_BURNER_WALLET = false;
const FORCE_MOCK_CONNECT = (process.env.REACT_APP_FORCE_MOCK_CONNECT || "true").toLowerCase() !== "false";
const FALLBACK_MOCK_ADDRESS = "0x8B01F57F986BB215418d5f247C241C4894bCF96d";
const MOCK_CONNECTED_STORAGE_KEY = "ticketeria:mock-connected-address";
const PRIVY_APP_ID = String(process.env.REACT_APP_PRIVY_APP_ID || "").trim();
const isAddressLike = value => /^0x[a-fA-F0-9]{40}$/.test(String(value || "").trim());

const { Text } = Typography;

function App() {
  const [injectedProvider, setInjectedProvider] = useState();
  const [address, setAddress] = useState();
  const [connectionType, setConnectionType] = useState(null);
  const [isMockConnectOpen, setIsMockConnectOpen] = useState(false);
  const [isMockConnecting, setIsMockConnecting] = useState(false);
  const [mockConnectedWalletName, setMockConnectedWalletName] = useState("");

  const { ready: authReady, authenticated, login, logout, getEthersProvider } = usePrivy();

  const targetNetwork = initialNetwork;
  const blockExplorer = targetNetwork.blockExplorer;

  const localProvider = useStaticJsonRPC([
    process.env.REACT_APP_PROVIDER ? process.env.REACT_APP_PROVIDER : targetNetwork.rpcUrl,
  ]);
  // Keep a single-provider setup to avoid legacy Ethereum mainnet RPC calls.
  const mainnetProvider = localProvider;

  const localProviderPollingTime = getRPCPollTime(localProvider);

  const scrollToPassportDemo = useCallback(() => {
    if (typeof window === "undefined" || window.location.pathname !== "/") return;

    const scrollWithRetry = attempt => {
      const target = document.querySelector("#passport-demo");
      if (target) {
        target.scrollIntoView({ behavior: "smooth", block: "start" });
        if (window.location.hash !== "#passport-demo") {
          window.history.replaceState(null, "", "#passport-demo");
        }
        return;
      }

      if (attempt < 20) {
        window.setTimeout(() => scrollWithRetry(attempt + 1), 90);
      }
    };

    window.setTimeout(() => scrollWithRetry(0), 60);
  }, []);

  const connectWithPrivy = useCallback(() => {
    // Fallback to demo modal whenever Privy is disabled, missing, or still not ready.
    if (FORCE_MOCK_CONNECT || !PRIVY_APP_ID || !authReady) {
      setIsMockConnectOpen(true);
      return;
    }

    setConnectionType("privy");

    // Always open Privy login flow from the main CTA so users can choose social login.
    // Wallet-linking stays available later once the user is authenticated.
    try {
      login();
    } catch (error) {
      console.error("Privy login failed, falling back to demo connect modal", error);
      setIsMockConnectOpen(true);
    }
  }, [authReady, login]);

  const handleMockWalletSelection = useCallback(
    walletName => {
      if (isMockConnecting) return;

      const candidateAddresses = [process.env.REACT_APP_MOCK_DEPLOYER_ADDRESS, process.env.REACT_APP_MOCK_USDC_ADDRESS]
        .map(value => String(value || "").trim())
        .filter(isAddressLike);

      if (isAddressLike(FALLBACK_MOCK_ADDRESS)) {
        candidateAddresses.push(FALLBACK_MOCK_ADDRESS);
      }

      const selectedAddress =
        candidateAddresses[Math.floor(Math.random() * candidateAddresses.length)] || FALLBACK_MOCK_ADDRESS;

      setIsMockConnecting(true);
      setMockConnectedWalletName(walletName);
      try {
        // Connect immediately so passport section appears without waiting for any modal animation.
        setConnectionType(`mock-${walletName.toLowerCase()}`);
        setInjectedProvider(undefined);
        setAddress(selectedAddress);
        if (typeof window !== "undefined") {
          window.localStorage.setItem(MOCK_CONNECTED_STORAGE_KEY, selectedAddress);
        }
        setStoredTicketeriaUser(selectedAddress, {
          walletAddress: selectedAddress,
          curp: "",
          isMexican: true,
        });
      } finally {
        setIsMockConnecting(false);
        setIsMockConnectOpen(false);
        scrollToPassportDemo();
      }
    },
    [isMockConnecting, scrollToPassportDemo],
  );

  const logoutOfWeb3Modal = useCallback(async () => {
    if (FORCE_MOCK_CONNECT) {
      setConnectionType(null);
      setInjectedProvider(undefined);
      setAddress(undefined);
      setMockConnectedWalletName("");
      setIsMockConnecting(false);
      setIsMockConnectOpen(false);
      if (typeof window !== "undefined") {
        window.localStorage.removeItem(MOCK_CONNECTED_STORAGE_KEY);
      }
      return;
    }

    if (authenticated) {
      await logout();
    }

    if (injectedProvider && injectedProvider.provider && typeof injectedProvider.provider.disconnect === "function") {
      await injectedProvider.provider.disconnect();
    }

    setConnectionType(null);
    setInjectedProvider(undefined);
    setAddress(undefined);
  }, [authenticated, injectedProvider, logout]);

  const userProviderAndSigner = useUserProviderAndSigner(injectedProvider, localProvider, USE_BURNER_WALLET);
  const userSigner = userProviderAndSigner.signer;

  const price = useExchangeEthPrice(targetNetwork, localProvider, localProviderPollingTime);
  const gasPrice = useGasPrice(targetNetwork, "FastGasPrice", localProviderPollingTime);
  const tx = Transactor(userSigner, gasPrice);

  useEffect(() => {
    if (FORCE_MOCK_CONNECT) {
      return;
    }

    if (!authReady) {
      return;
    }

    if (!authenticated) {
      setInjectedProvider(undefined);
      return;
    }

    try {
      const provider = getEthersProvider();
      setConnectionType("privy");
      setInjectedProvider(provider);
    } catch (error) {
      console.error("Failed to sync Privy wallet", error);
      setInjectedProvider(undefined);
    }
  }, [authReady, authenticated, getEthersProvider]);

  useEffect(() => {
    if (!FORCE_MOCK_CONNECT || typeof window === "undefined" || address) return;

    const restored = String(window.localStorage.getItem(MOCK_CONNECTED_STORAGE_KEY) || "").trim();
    if (!isAddressLike(restored)) return;

    setConnectionType("mock-restored");
    setAddress(restored);
  }, [address]);

  useEffect(() => {
    let mounted = true;

    async function syncAddress() {
      if (FORCE_MOCK_CONNECT) {
        return;
      }

      if (!userSigner) {
        if (mounted) setAddress(undefined);
        return;
      }

      const nextAddress = await userSigner.getAddress();
      if (mounted) setAddress(nextAddress);
    }

    syncAddress();

    return () => {
      mounted = false;
    };
  }, [userSigner]);

  return (
    <div className="App">
      {!FORCE_MOCK_CONNECT ? <CurpOnboardingModal walletAddress={address} /> : null}

      <Modal
        title="Conecta tu wallet (Demo)"
        visible={isMockConnectOpen}
        onCancel={() => (!isMockConnecting ? setIsMockConnectOpen(false) : null)}
        footer={null}
        maskClosable={!isMockConnecting}
        keyboard={!isMockConnecting}
        centered
      >
        {isMockConnecting ? (
          <Space direction="vertical" size={14} style={{ width: "100%", textAlign: "center", padding: "12px 0" }}>
            <Spin size="large" />
            <Text strong>Conectando con {mockConnectedWalletName || "wallet"}...</Text>
            <Text type="secondary">Cargando dirección de demo para hackathon</Text>
          </Space>
        ) : (
          <Space direction="vertical" size={10} style={{ width: "100%" }}>
            <Button
              block
              type="primary"
              onClick={() => handleMockWalletSelection("Metamask")}
              onMouseDown={() => handleMockWalletSelection("Metamask")}
            >
              Metamask
            </Button>
            <Button
              block
              onClick={() => handleMockWalletSelection("Coinbase Wallet")}
              onMouseDown={() => handleMockWalletSelection("Coinbase Wallet")}
            >
              Coinbase Wallet
            </Button>
            <Button
              block
              onClick={() => handleMockWalletSelection("WalletConnect")}
              onMouseDown={() => handleMockWalletSelection("WalletConnect")}
            >
              WalletConnect
            </Button>
            <Text type="secondary" style={{ fontSize: 12 }}>
              Modo demo: no se abre Privy, solo simula conexión para presentar el flujo.
            </Text>
          </Space>
        )}
      </Modal>

      <Switch>
        <Route exact path="/">
          <Home
            onAgendaDemoClick={connectWithPrivy}
            isConnected={Boolean(address)}
            accountProps={{
              useBurner: USE_BURNER_WALLET,
              address,
              localProvider,
              userSigner,
              tx,
              mainnetProvider,
              price,
              authReady: FORCE_MOCK_CONNECT || !PRIVY_APP_ID ? true : authReady,
              forceEnableConnect: FORCE_MOCK_CONNECT || !PRIVY_APP_ID,
              connectionType,
              connectWithPrivy,
              logoutOfWeb3Modal,
              blockExplorer,
            }}
          />
        </Route>
        <Route path="/payments">
          <Payments address={address} tx={tx} price={price} />
        </Route>
        <Route path="/tickets">
          <Tickets address={address} userSigner={userSigner} readProvider={localProvider} tx={tx} />
        </Route>
      </Switch>
    </div>
  );
}

export default App;
