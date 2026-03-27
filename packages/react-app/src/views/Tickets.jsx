import { CheckCircleOutlined, GiftOutlined, ShoppingCartOutlined } from "@ant-design/icons";
import { Alert, Button, Card, Col, Divider, Row, Space, Tag, Typography } from "antd";
import { ethers } from "ethers";
import { AnimatePresence, motion } from "framer-motion/dist/framer-motion";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import toast, { Toaster } from "react-hot-toast";

import useTicketContract from "../hooks/useTicketContract";
import { getStoredTicketeriaUser } from "../lib/ticketeriaUserStorage";

const { Text, Title } = Typography;

const EVENT_IDS = [1, 2, 3];
const EVENT_NAME_FALLBACK = {
  1: "Museo Nacional de Antropologia",
  2: "Museo Frida Kahlo",
  3: "Palacio de Bellas Artes",
};

const ZERO = ethers.BigNumber.from(0);

const toUsdc = value => {
  try {
    return `${Number(ethers.utils.formatUnits(value || ZERO, 6)).toLocaleString("es-MX", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })} USDC`;
  } catch (error) {
    return "0.00 USDC";
  }
};

const ensureBigNumber = value => {
  if (ethers.BigNumber.isBigNumber(value)) return value;
  try {
    return ethers.BigNumber.from(value || 0);
  } catch (error) {
    return ZERO;
  }
};

export default function Tickets({ address, userSigner, readProvider, tx }) {
  const ticketsContractAddress =
    process.env.REACT_APP_TICKETS_CONTRACT_ADDRESS || process.env.TICKETS_CONTRACT_ADDRESS || "";

  const { ticketReadContract, ticketWriteContract, usdcReadContract, usdcWriteContract, usdcAddress } =
    useTicketContract({
      contractAddress: ticketsContractAddress,
      provider: readProvider,
      signer: userSigner,
    });

  const [eventConfigs, setEventConfigs] = useState({});
  const [balances, setBalances] = useState({});
  const [onchainFreeClaimed, setOnchainFreeClaimed] = useState({});
  const [optimisticFreeClaimed, setOptimisticFreeClaimed] = useState({});
  const [allowance, setAllowance] = useState(ZERO);
  const [loadingData, setLoadingData] = useState(false);
  const [submittingByAction, setSubmittingByAction] = useState({});
  const [pulseEventId, setPulseEventId] = useState(null);

  const [userProfile, setUserProfile] = useState(null);

  useEffect(() => {
    if (!address) {
      setUserProfile(null);
      return;
    }
    setUserProfile(getStoredTicketeriaUser(address));
  }, [address]);

  const isMexican = userProfile?.isMexican;
  const hasNationalityDecision = typeof isMexican === "boolean";

  const setSubmitting = (actionKey, value) => {
    setSubmittingByAction(prev => ({
      ...prev,
      [actionKey]: value,
    }));
  };

  const reloadTicketData = useCallback(async () => {
    if (!ticketReadContract) return;

    setLoadingData(true);
    try {
      const configsArray = await Promise.all(
        EVENT_IDS.map(async eventId => {
          const raw = await ticketReadContract.events(eventId);
          return [
            eventId,
            {
              eventId,
              name: String(raw.name || EVENT_NAME_FALLBACK[eventId] || `Evento ${eventId}`),
              payoutWallet: String(raw.payoutWallet || ethers.constants.AddressZero),
              priceMex: ensureBigNumber(raw.priceMex),
              priceForeign: ensureBigNumber(raw.priceForeign),
              active: Boolean(raw.active),
              allowFree: Boolean(raw.allowFree),
            },
          ];
        }),
      );

      setEventConfigs(Object.fromEntries(configsArray));

      if (address) {
        const [balancesArray, freeClaimsArray] = await Promise.all([
          Promise.all(EVENT_IDS.map(async eventId => [eventId, await ticketReadContract.balanceOf(address, eventId)])),
          Promise.all(
            EVENT_IDS.map(async eventId => [eventId, await ticketReadContract.hasFreeTicket(eventId, address)]),
          ),
        ]);

        setBalances(Object.fromEntries(balancesArray));
        setOnchainFreeClaimed(Object.fromEntries(freeClaimsArray));
      } else {
        setBalances({});
        setOnchainFreeClaimed({});
      }
    } catch (error) {
      console.error("Failed to load ticket data", error);
      toast.error("No fue posible cargar eventos del contrato.");
    } finally {
      setLoadingData(false);
    }
  }, [address, ticketReadContract]);

  const reloadAllowance = useCallback(async () => {
    if (!usdcReadContract || !address || !ticketsContractAddress) {
      setAllowance(ZERO);
      return;
    }

    try {
      const nextAllowance = await usdcReadContract.allowance(address, ticketsContractAddress);
      setAllowance(nextAllowance);
    } catch (error) {
      console.error("Failed to read USDC allowance", error);
      setAllowance(ZERO);
    }
  }, [address, ticketsContractAddress, usdcReadContract]);

  useEffect(() => {
    reloadTicketData();
  }, [reloadTicketData]);

  useEffect(() => {
    reloadAllowance();
  }, [reloadAllowance]);

  useEffect(() => {
    if (!pulseEventId) return undefined;
    const timeout = window.setTimeout(() => {
      setPulseEventId(null);
    }, 800);
    return () => window.clearTimeout(timeout);
  }, [pulseEventId]);

  const handleApprove = async (eventId, requiredPrice) => {
    const actionKey = `approve-${eventId}`;
    if (!address || !usdcWriteContract || !tx) {
      toast.error("Conecta wallet para aprobar USDC.");
      return;
    }

    setSubmitting(actionKey, true);
    try {
      await tx(usdcWriteContract.approve(ticketsContractAddress, requiredPrice));
      toast.success("USDC aprobado para TicketNFT1155.");
      await reloadAllowance();
    } catch (error) {
      const message = error instanceof Error ? error.message : "No se pudo aprobar USDC.";
      toast.error(message);
    } finally {
      setSubmitting(actionKey, false);
    }
  };

  const handleMintFree = async eventId => {
    const actionKey = `free-${eventId}`;
    if (!address || !ticketWriteContract || !tx) {
      toast.error("Conecta wallet para mintear.");
      return;
    }

    setSubmitting(actionKey, true);
    try {
      await tx(ticketWriteContract.mintFree(eventId));
      setOptimisticFreeClaimed(prev => ({ ...prev, [eventId]: true }));
      setPulseEventId(eventId);
      toast.success(`Ticket gratis obtenido para evento #${eventId}.`);
      await reloadTicketData();
    } catch (error) {
      const message = error instanceof Error ? error.message : "No se pudo mintear ticket gratis.";
      toast.error(message);
    } finally {
      setSubmitting(actionKey, false);
    }
  };

  const handleMintPaid = async eventId => {
    const config = eventConfigs[eventId];
    if (!config) return;

    if (!hasNationalityDecision) {
      toast.error("Primero completa onboarding CURP para definir precio.");
      return;
    }

    if (!address || !ticketWriteContract || !tx) {
      toast.error("Conecta wallet para comprar.");
      return;
    }

    const actionKey = `paid-${eventId}`;
    const selectedPrice = isMexican ? config.priceMex : config.priceForeign;

    if (selectedPrice.lte(ZERO)) {
      toast.error("Este evento no tiene precio configurado.");
      return;
    }

    if (allowance.lt(selectedPrice)) {
      toast.error("Primero aprueba USDC para este ticket.");
      return;
    }

    setSubmitting(actionKey, true);
    try {
      await tx(ticketWriteContract.mintPaid(eventId, Boolean(isMexican)));
      setPulseEventId(eventId);
      toast.success(`Compra completada para evento #${eventId}.`);
      await Promise.all([reloadTicketData(), reloadAllowance()]);
    } catch (error) {
      const message = error instanceof Error ? error.message : "No se pudo comprar ticket.";
      toast.error(message);
    } finally {
      setSubmitting(actionKey, false);
    }
  };

  const ownedTickets = useMemo(
    () =>
      EVENT_IDS.map(eventId => {
        const config = eventConfigs[eventId];
        const balance = ensureBigNumber(balances[eventId]);
        return {
          eventId,
          name: config?.name || EVENT_NAME_FALLBACK[eventId],
          balance,
        };
      }).filter(item => item.balance.gt(ZERO)),
    [balances, eventConfigs],
  );

  return (
    <div style={{ maxWidth: 1160, margin: "0 auto", padding: "24px 16px 72px" }}>
      <Toaster position="top-right" />
      <Space direction="vertical" size={6} style={{ width: "100%", marginBottom: 18 }}>
        <Text style={{ textTransform: "uppercase", letterSpacing: "0.28em", color: "#14b8a6", fontSize: 11 }}>
          TicketeriaCDMX
        </Text>
        <Title level={2} style={{ margin: 0 }}>
          Tickets (Free + Pago)
        </Title>
        <Text type="secondary">Compra en USDC o reclama ticket gratis si el evento lo permite.</Text>
      </Space>

      {!ticketsContractAddress && (
        <Alert
          type="error"
          showIcon
          style={{ marginBottom: 16 }}
          message="Falta TICKETS_CONTRACT_ADDRESS"
          description="Configura REACT_APP_TICKETS_CONTRACT_ADDRESS en el frontend."
        />
      )}

      <Alert
        type={hasNationalityDecision ? "success" : "warning"}
        showIcon
        style={{ marginBottom: 16 }}
        message={
          hasNationalityDecision
            ? `Nacionalidad definida: ${isMexican ? "Mexicano" : "Extranjero"}`
            : "No hay nacionalidad definida para esta wallet"
        }
        description={
          hasNationalityDecision
            ? "El precio de compra se calcula con tu onboarding CURP."
            : "Completa el modal CURP para habilitar la compra con precio correcto."
        }
      />

      <Alert
        type="info"
        showIcon
        style={{ marginBottom: 20 }}
        message={`USDC allowance actual: ${toUsdc(allowance)}`}
        description={usdcAddress ? `USDC token: ${usdcAddress}` : "Leyendo token USDC del contrato..."}
      />

      <Row gutter={[16, 16]}>
        {EVENT_IDS.map(eventId => {
          const config = eventConfigs[eventId];
          const isLoadingCard = loadingData && !config;
          const balance = ensureBigNumber(balances[eventId]);
          const freeClaimed = Boolean(onchainFreeClaimed[eventId] || optimisticFreeClaimed[eventId]);
          const selectedPrice = isMexican ? config?.priceMex || ZERO : config?.priceForeign || ZERO;
          const needsApproval = selectedPrice.gt(ZERO) && allowance.lt(selectedPrice);

          return (
            <Col xs={24} md={12} lg={8} key={eventId}>
              <motion.div
                animate={pulseEventId === eventId ? { scale: [1, 1.03, 1], y: [0, -8, 0], opacity: [1, 1, 1] } : {}}
                transition={{ duration: 0.55 }}
              >
                <Card
                  title={config?.name || EVENT_NAME_FALLBACK[eventId]}
                  bordered
                  loading={isLoadingCard}
                  extra={
                    <Tag color={config?.active ? "green" : "default"}>{config?.active ? "Activo" : "Inactivo"}</Tag>
                  }
                >
                  <Space direction="vertical" size={8} style={{ width: "100%" }}>
                    <Text>
                      <strong>Evento ID:</strong> {eventId}
                    </Text>
                    <Text>
                      <strong>Precio Mex:</strong> {toUsdc(config?.priceMex || ZERO)}
                    </Text>
                    <Text>
                      <strong>Precio Extranjero:</strong> {toUsdc(config?.priceForeign || ZERO)}
                    </Text>

                    {config?.allowFree ? <Tag color="blue">Free ticket available</Tag> : null}
                    {balance.gt(ZERO) ? <Tag color="green">Ya tienes {balance.toString()} boleto(s)</Tag> : null}

                    <Divider style={{ margin: "8px 0" }} />

                    {config?.allowFree ? (
                      <Button
                        icon={<GiftOutlined />}
                        block
                        disabled={!config?.active || freeClaimed || submittingByAction[`free-${eventId}`]}
                        loading={Boolean(submittingByAction[`free-${eventId}`])}
                        onClick={() => handleMintFree(eventId)}
                      >
                        {freeClaimed ? "Ticket gratis ya reclamado" : "Obtener ticket gratis"}
                      </Button>
                    ) : null}

                    {needsApproval ? (
                      <Button
                        block
                        type="default"
                        disabled={!address || submittingByAction[`approve-${eventId}`]}
                        loading={Boolean(submittingByAction[`approve-${eventId}`])}
                        onClick={() => handleApprove(eventId, selectedPrice)}
                      >
                        Aprobar {toUsdc(selectedPrice)} USDC
                      </Button>
                    ) : (
                      <Button
                        icon={<ShoppingCartOutlined />}
                        type="primary"
                        block
                        disabled={!config?.active || !hasNationalityDecision || submittingByAction[`paid-${eventId}`]}
                        loading={Boolean(submittingByAction[`paid-${eventId}`])}
                        onClick={() => handleMintPaid(eventId)}
                      >
                        Comprar ticket ({toUsdc(selectedPrice)})
                      </Button>
                    )}

                    <AnimatePresence>
                      {pulseEventId === eventId ? (
                        <motion.div
                          initial={{ opacity: 0, y: 8, scale: 0.96 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -4 }}
                        >
                          <Tag color="success" icon={<CheckCircleOutlined />}>
                            Ticket actualizado exitosamente
                          </Tag>
                        </motion.div>
                      ) : null}
                    </AnimatePresence>
                  </Space>
                </Card>
              </motion.div>
            </Col>
          );
        })}
      </Row>

      <Divider />

      <Title level={4}>Mis Boletos</Title>
      {ownedTickets.length === 0 ? (
        <Text type="secondary">Aun no tienes boletos en esta wallet.</Text>
      ) : (
        <Row gutter={[12, 12]}>
          {ownedTickets.map(item => (
            <Col xs={24} md={12} lg={8} key={`owned-${item.eventId}`}>
              <Card size="small">
                <Space direction="vertical" size={4}>
                  <Text strong>{item.name}</Text>
                  <Text type="secondary">Evento #{item.eventId}</Text>
                  <Text>Tickets: {item.balance.toString()}</Text>
                </Space>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </div>
  );
}
