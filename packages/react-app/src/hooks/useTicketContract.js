import { ethers } from "ethers";
import { useEffect, useMemo, useState } from "react";

const TICKET_NFT_1155_ABI = [
  "function usdc() view returns (address)",
  "function getEvent(uint256) view returns (tuple(string name, address payoutWallet, uint256 priceMex, uint256 priceForeign, bool active, bool allowFree))",
  "function events(uint256) view returns (string name, address payoutWallet, uint256 priceMex, uint256 priceForeign, bool active, bool allowFree)",
  "function hasFreeTicket(uint256,address) view returns (bool)",
  "function mintFree(uint256) external",
  "function mintPaid(uint256,bool) external",
  "function balanceOf(address,uint256) view returns (uint256)",
  "function owner() view returns (address)",
  "function setEvent(uint256 eventId, string name, address payoutWallet, uint256 priceMex, uint256 priceForeign, bool active, bool allowFree) external",
];

const ERC20_ABI = [
  "function allowance(address owner, address spender) view returns (uint256)",
  "function approve(address spender, uint256 amount) returns (bool)",
  "function symbol() view returns (string)",
];

export default function useTicketContract({ contractAddress, provider, signer, usdcAddressOverride }) {
  const ticketReadContract = useMemo(() => {
    if (!contractAddress || !provider) return null;
    return new ethers.Contract(contractAddress, TICKET_NFT_1155_ABI, provider);
  }, [contractAddress, provider]);

  const ticketWriteContract = useMemo(() => {
    if (!contractAddress || !signer) return null;
    return new ethers.Contract(contractAddress, TICKET_NFT_1155_ABI, signer);
  }, [contractAddress, signer]);

  const [usdcAddress, setUsdcAddress] = useState("");

  useEffect(() => {
    let stale = false;

    const loadUsdcAddress = async () => {
      if (usdcAddressOverride) {
        setUsdcAddress(usdcAddressOverride);
        return;
      }

      if (!ticketReadContract) {
        setUsdcAddress("");
        return;
      }

      try {
        const addr = await ticketReadContract.usdc();
        if (!stale) {
          setUsdcAddress(String(addr || ""));
        }
      } catch (error) {
        if (!stale) {
          setUsdcAddress("");
        }
        console.error("Failed to load USDC address from ticket contract", error);
      }
    };

    loadUsdcAddress();

    return () => {
      stale = true;
    };
  }, [ticketReadContract, usdcAddressOverride]);

  const usdcReadContract = useMemo(() => {
    if (!usdcAddress || !provider) return null;
    return new ethers.Contract(usdcAddress, ERC20_ABI, provider);
  }, [usdcAddress, provider]);

  const usdcWriteContract = useMemo(() => {
    if (!usdcAddress || !signer) return null;
    return new ethers.Contract(usdcAddress, ERC20_ABI, signer);
  }, [usdcAddress, signer]);

  return {
    ticketReadContract,
    ticketWriteContract,
    usdcAddress,
    usdcReadContract,
    usdcWriteContract,
  };
}
