import { useCallback, useEffect, useState } from "react";

import { isValidCurp, normalizeCurp } from "../lib/curp";
import { getStoredTicketeriaUser, setStoredTicketeriaUser } from "../lib/ticketeriaUserStorage";

export default function useCurpOnboarding(walletAddress, onResolved) {
  const [userData, setUserData] = useState(null);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);

  useEffect(() => {
    if (!walletAddress) {
      setUserData(null);
      setNeedsOnboarding(false);
      return;
    }

    const stored = getStoredTicketeriaUser(walletAddress);
    setUserData(stored);
    setNeedsOnboarding(!stored || typeof stored.isMexican !== "boolean");
  }, [walletAddress]);

  const resolveMexican = useCallback(
    curpInput => {
      if (!walletAddress) {
        return { ok: false, error: "Conecta tu wallet primero." };
      }

      const curp = normalizeCurp(curpInput);
      if (!isValidCurp(curp)) {
        return { ok: false, error: "CURP inválida. Verifica el formato." };
      }

      const next = {
        walletAddress: walletAddress.toLowerCase(),
        curp,
        isMexican: true,
      };

      setStoredTicketeriaUser(walletAddress, next);
      setUserData(next);
      setNeedsOnboarding(false);
      if (onResolved) onResolved(next);

      return { ok: true, data: next };
    },
    [walletAddress, onResolved],
  );

  const resolveForeign = useCallback(() => {
    if (!walletAddress) return null;

    const next = {
      walletAddress: walletAddress.toLowerCase(),
      curp: "",
      isMexican: false,
    };

    setStoredTicketeriaUser(walletAddress, next);
    setUserData(next);
    setNeedsOnboarding(false);
    if (onResolved) onResolved(next);

    return next;
  }, [walletAddress, onResolved]);

  return {
    userData,
    needsOnboarding,
    resolveMexican,
    resolveForeign,
  };
}
