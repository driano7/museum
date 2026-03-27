import "antd/dist/antd.css";
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
import { Home, Payments, Tickets } from "./views";

const initialNetwork = NETWORKS.monadTestnet || NETWORKS.localhost;
const USE_BURNER_WALLET = false;

function App() {
  const [injectedProvider, setInjectedProvider] = useState();
  const [address, setAddress] = useState();
  const [connectionType, setConnectionType] = useState(null);

  const { ready: authReady, authenticated, login, logout, getEthersProvider } = usePrivy();

  const targetNetwork = initialNetwork;
  const blockExplorer = targetNetwork.blockExplorer;

  const localProvider = useStaticJsonRPC([
    process.env.REACT_APP_PROVIDER ? process.env.REACT_APP_PROVIDER : targetNetwork.rpcUrl,
  ]);
  // Keep a single-provider setup to avoid legacy Ethereum mainnet RPC calls.
  const mainnetProvider = localProvider;

  const localProviderPollingTime = getRPCPollTime(localProvider);

  const connectWithPrivy = useCallback(() => {
    if (!authReady) return;

    setConnectionType("privy");

    // Always open Privy login flow from the main CTA so users can choose social login.
    // Wallet-linking stays available later once the user is authenticated.
    login();
  }, [authReady, login]);

  const logoutOfWeb3Modal = useCallback(async () => {
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
    let mounted = true;

    async function syncAddress() {
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
      <CurpOnboardingModal walletAddress={address} />

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
              authReady,
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
