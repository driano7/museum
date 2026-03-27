import { CopyOutlined, CreditCardOutlined, DollarOutlined, QrcodeOutlined } from "@ant-design/icons";
import { Alert, Button, Card, Col, Divider, Form, Input, message, Radio, Row, Space, Tabs, Typography } from "antd";
import { ethers } from "ethers";
import QR from "qrcode.react";
import { loadStripe } from "@stripe/stripe-js";
import React, { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";

import FlipCard from "../components/FlipCard";

const { Text, Title } = Typography;
const { TabPane } = Tabs;

const PRODUCTS = [
  {
    id: "stablecoins-para-mortales",
    title: "Stablecoins para mortales",
    description: "Ebook introductorio para uso real de stablecoins.",
    price: 1,
  },
  {
    id: "puede-crypto-salvar-mi-bolsillo",
    title: "Puede crypto salvar mi bolsillo?",
    description: "Estrategias de adopcion crypto para negocio y flujo de caja.",
    price: 1,
  },
];

const CURP_REGEX =
  /^[A-Z]{1}[AEIOU]{1}[A-Z]{2}[0-9]{2}(0[1-9]|1[0-2])(0[1-9]|[1-2][0-9]|3[0-1])[HM]{1}(AS|BC|BS|CC|CS|CH|CL|CM|DF|DG|GT|GR|HG|JC|MC|MN|MS|NT|NL|OC|PL|QT|QR|SP|SL|SR|TC|TS|TL|VZ|YN|ZS|NE)[B-DF-HJ-NP-TV-Z]{3}[0-9A-Z]{1}[0-9]{1}$/;

const parseStripePriceIds = raw =>
  (raw || "")
    .split(",")
    .map(value => value.trim())
    .filter(Boolean);

const formatUsd = value =>
  new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
  }).format(value);

export default function Payments({ address, tx, price }) {
  const location = useLocation();
  const status = useMemo(() => new URLSearchParams(location.search).get("status"), [location.search]);
  const stripeKey = process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY || "";
  const stripePriceIdsMx = useMemo(
    () => parseStripePriceIds(process.env.REACT_APP_STRIPE_PRICE_IDS_MX || process.env.REACT_APP_STRIPE_PRICE_IDS),
    [],
  );
  const stripePriceIdsIntl = useMemo(() => parseStripePriceIds(process.env.REACT_APP_STRIPE_PRICE_IDS_INTL), []);
  const internationalMultiplier = useMemo(() => {
    const parsed = Number(process.env.REACT_APP_INTERNATIONAL_PRICE_MULTIPLIER || "1.4");
    if (Number.isNaN(parsed) || parsed <= 0) return 1.4;
    return parsed;
  }, []);
  const cryptoReceiver = (process.env.REACT_APP_CRYPTO_RECEIVER || "").trim();
  const cryptoChainLabel = (process.env.REACT_APP_CRYPTO_CHAIN_LABEL || "Ethereum").trim();

  const [cardNumber, setCardNumber] = useState("");
  const [cardHolder, setCardHolder] = useState("");
  const [expiration, setExpiration] = useState("");
  const [cvv, setCvv] = useState("");
  const [focusField, setFocusField] = useState(null);
  const [contactEmail, setContactEmail] = useState("");
  const [billingFirstName, setBillingFirstName] = useState("");
  const [billingLastName, setBillingLastName] = useState("");
  const [curp, setCurp] = useState("");

  const [stripeSubmitting, setStripeSubmitting] = useState(false);
  const [stripeError, setStripeError] = useState("");

  const [cryptoAmountEth, setCryptoAmountEth] = useState("0.001");
  const [cryptoSubmitting, setCryptoSubmitting] = useState(false);
  const [cryptoMethod, setCryptoMethod] = useState("wallet");

  const normalizedCurp = useMemo(() => curp.trim().toUpperCase(), [curp]);
  const isMexican = useMemo(() => CURP_REGEX.test(normalizedCurp), [normalizedCurp]);
  const isInternationalPricing = useMemo(() => !isMexican, [isMexican]);
  const selectedStripePriceIds = useMemo(() => {
    if (isInternationalPricing) return stripePriceIdsIntl;
    return stripePriceIdsMx;
  }, [isInternationalPricing, stripePriceIdsIntl, stripePriceIdsMx]);

  const pricedProducts = useMemo(
    () =>
      PRODUCTS.map(item => ({
        ...item,
        effectivePrice: isInternationalPricing ? Number((item.price * internationalMultiplier).toFixed(2)) : item.price,
      })),
    [internationalMultiplier, isInternationalPricing],
  );

  const cartTotal = useMemo(() => pricedProducts.reduce((sum, item) => sum + item.effectivePrice, 0), [pricedProducts]);
  const estimatedEth = useMemo(() => {
    const n = Number(price);
    if (!n || Number.isNaN(n) || n <= 0) return null;
    return (cartTotal / n).toFixed(6);
  }, [cartTotal, price]);

  useEffect(() => {
    if (estimatedEth) {
      setCryptoAmountEth(estimatedEth);
    }
  }, [estimatedEth]);

  const handleCardNumber = event => {
    const digits = event.target.value.replace(/\D/g, "").slice(0, 19);
    setCardNumber(digits.replace(/(.{4})/g, "$1 ").trim());
  };

  const handleExpiration = event => {
    const digits = event.target.value.replace(/\D/g, "").slice(0, 4);
    setExpiration(digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits);
  };

  const handleCvv = event => {
    setCvv(event.target.value.replace(/\D/g, "").slice(0, 4));
  };

  const handleStripeCheckout = async event => {
    event.preventDefault();
    setStripeError("");

    if (!stripeKey) {
      setStripeError("Falta REACT_APP_STRIPE_PUBLISHABLE_KEY en el frontend.");
      return;
    }

    if (selectedStripePriceIds.length === 0) {
      setStripeError(
        isInternationalPricing
          ? "Falta configurar REACT_APP_STRIPE_PRICE_IDS_INTL para cobrar precio internacional."
          : "Falta configurar REACT_APP_STRIPE_PRICE_IDS_MX o REACT_APP_STRIPE_PRICE_IDS con Price IDs de Stripe test.",
      );
      return;
    }

    setStripeSubmitting(true);

    try {
      const stripe = await loadStripe(stripeKey);
      if (!stripe) {
        throw new Error("No fue posible inicializar Stripe.");
      }

      const base = window.location.origin;
      const successUrl = `${base}${location.pathname}?status=success`;
      const cancelUrl = `${base}${location.pathname}?status=cancel`;

      const result = await stripe.redirectToCheckout({
        mode: "payment",
        lineItems: selectedStripePriceIds.map(priceId => ({ price: priceId, quantity: 1 })),
        customerEmail: contactEmail || undefined,
        successUrl,
        cancelUrl,
      });

      if (result.error) {
        throw result.error;
      }
    } catch (error) {
      const msg = error instanceof Error ? error.message : "No fue posible abrir Stripe Checkout.";
      setStripeError(msg);
      setStripeSubmitting(false);
    }
  };

  const handleCryptoPay = async () => {
    if (!tx) {
      message.error("No hay signer disponible para enviar la transaccion.");
      return;
    }
    if (!cryptoReceiver) {
      message.error("Falta REACT_APP_CRYPTO_RECEIVER.");
      return;
    }

    let value;
    try {
      value = ethers.utils.parseEther(String(cryptoAmountEth || "0"));
    } catch (error) {
      message.error("Monto invalido de ETH.");
      return;
    }

    if (value.lte(ethers.constants.Zero)) {
      message.error("El monto debe ser mayor a 0.");
      return;
    }

    setCryptoSubmitting(true);
    try {
      const response = tx({
        to: cryptoReceiver,
        value,
      });

      await response;
      message.success("Transaccion enviada correctamente.");
    } catch (error) {
      const msg = error instanceof Error ? error.message : "No se pudo completar el pago cripto.";
      message.error(msg);
    } finally {
      setCryptoSubmitting(false);
    }
  };

  const copyReceiver = async () => {
    if (!cryptoReceiver) return;
    await navigator.clipboard.writeText(cryptoReceiver);
    message.success("Direccion copiada.");
  };

  return (
    <div style={{ maxWidth: 1180, margin: "0 auto", padding: "24px 16px 72px" }}>
      <Space direction="vertical" size={4} style={{ width: "100%", marginBottom: 20 }}>
        <Text style={{ textTransform: "uppercase", letterSpacing: "0.28em", color: "#14b8a6", fontSize: 11 }}>
          Demo Payments (Test)
        </Text>
        <Title level={2} style={{ margin: 0 }}>
          Ticketeria Pay
        </Title>
        <Text type="secondary">Paga con tarjeta (Stripe test) o con cripto desde tu wallet conectada.</Text>
      </Space>

      <Alert
        type={isMexican ? "success" : "warning"}
        showIcon
        style={{ marginBottom: 18 }}
        message={
          isMexican ? "CURP valida: precio mexicano." : "CURP ausente o invalida: se aplicara precio internacional."
        }
        description={
          normalizedCurp
            ? `CURP capturada: ${normalizedCurp}`
            : "Puedes continuar sin CURP, pero se clasifica como no mexicano."
        }
      />

      {status === "success" && (
        <Alert
          type="success"
          message="Pago de prueba completado"
          description="Stripe redirecciono con status=success."
          showIcon
          style={{ marginBottom: 18 }}
        />
      )}
      {status === "cancel" && (
        <Alert
          type="warning"
          message="Checkout cancelado"
          description="Stripe redirecciono con status=cancel."
          showIcon
          style={{ marginBottom: 18 }}
        />
      )}

      <Tabs defaultActiveKey="card">
        <TabPane
          tab={
            <span>
              <CreditCardOutlined /> Tarjeta (Stripe)
            </span>
          }
          key="card"
        >
          <Row gutter={[16, 16]}>
            <Col xs={24} lg={14}>
              <Card>
                <Title level={4}>Datos de tarjeta</Title>
                <Text type="secondary">
                  La tarjeta es solo preview visual. El cobro real sucede en Stripe Checkout en modo test.
                </Text>
                <Divider />
                <Form layout="vertical" onSubmitCapture={handleStripeCheckout}>
                  <Form.Item label="Email de contacto" required>
                    <Input
                      type="email"
                      value={contactEmail}
                      onChange={event => setContactEmail(event.target.value)}
                      placeholder="tu@correo.com"
                      required
                    />
                  </Form.Item>

                  <Form.Item label="CURP (opcional, valida precio mexicano)">
                    <Input
                      value={curp}
                      onChange={event =>
                        setCurp(
                          event.target.value
                            .toUpperCase()
                            .replace(/[^A-Z0-9]/g, "")
                            .slice(0, 18),
                        )
                      }
                      placeholder="AAAA000000HDFBBB00"
                      maxLength={18}
                    />
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      Si no pasa el regex de CURP o no se captura, aplica precio internacional.
                    </Text>
                  </Form.Item>

                  <Row gutter={12}>
                    <Col span={12}>
                      <Form.Item label="Nombre">
                        <Input value={billingFirstName} onChange={event => setBillingFirstName(event.target.value)} />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item label="Apellidos">
                        <Input value={billingLastName} onChange={event => setBillingLastName(event.target.value)} />
                      </Form.Item>
                    </Col>
                  </Row>

                  <Form.Item label="Numero de tarjeta">
                    <Input
                      value={cardNumber}
                      onChange={handleCardNumber}
                      onFocus={() => setFocusField("cardNumber")}
                      onBlur={() => setFocusField(null)}
                      placeholder="XXXX XXXX XXXX XXXX"
                    />
                  </Form.Item>

                  <Row gutter={12}>
                    <Col span={12}>
                      <Form.Item label="Nombre en la tarjeta">
                        <Input
                          value={cardHolder}
                          onChange={event => setCardHolder(event.target.value)}
                          onFocus={() => setFocusField("cardHolder")}
                          onBlur={() => setFocusField(null)}
                        />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item label="Expiracion">
                        <Input
                          value={expiration}
                          onChange={handleExpiration}
                          onFocus={() => setFocusField("expiration")}
                          onBlur={() => setFocusField(null)}
                          placeholder="MM/AA"
                        />
                      </Form.Item>
                    </Col>
                  </Row>

                  <Form.Item label="CVV">
                    <Input.Password
                      value={cvv}
                      onChange={handleCvv}
                      onFocus={() => setFocusField("cvv")}
                      onBlur={() => setFocusField(null)}
                      placeholder="***"
                      style={{ maxWidth: 180 }}
                    />
                  </Form.Item>

                  <Button htmlType="submit" type="primary" loading={stripeSubmitting} style={{ width: "100%" }}>
                    {stripeSubmitting ? "Abriendo Stripe..." : "Pagar con Stripe (test)"}
                  </Button>
                </Form>
                {stripeError ? <Alert type="error" showIcon message={stripeError} style={{ marginTop: 12 }} /> : null}
              </Card>
            </Col>

            <Col xs={24} lg={10}>
              <Space direction="vertical" style={{ width: "100%" }} size={16}>
                <Card>
                  <FlipCard
                    cardNumber={cardNumber}
                    cardHolder={cardHolder}
                    expiration={expiration}
                    cvv={cvv}
                    isFlipped={focusField === "cvv"}
                  />
                </Card>
                <Card>
                  <Title level={5}>Resumen</Title>
                  {pricedProducts.map(product => (
                    <div
                      key={product.id}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        marginBottom: 10,
                      }}
                    >
                      <div style={{ marginRight: 8 }}>
                        <div style={{ fontWeight: 600 }}>{product.title}</div>
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          {product.description}
                        </Text>
                      </div>
                      <Text>{formatUsd(product.effectivePrice)}</Text>
                    </div>
                  ))}
                  <Divider style={{ margin: "12px 0" }} />
                  <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 700 }}>
                    <span>Total</span>
                    <span>{formatUsd(cartTotal)}</span>
                  </div>
                  <Text type="secondary" style={{ fontSize: 12, display: "block", marginTop: 4 }}>
                    Tarifa aplicada: {isMexican ? "mexicano" : "internacional"}
                  </Text>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    Stripe usa Price IDs por tarifa: `REACT_APP_STRIPE_PRICE_IDS_MX` y
                    `REACT_APP_STRIPE_PRICE_IDS_INTL`.
                  </Text>
                </Card>
              </Space>
            </Col>
          </Row>
        </TabPane>

        <TabPane
          tab={
            <span>
              <DollarOutlined /> Cripto
            </span>
          }
          key="crypto"
        >
          <Row gutter={[16, 16]}>
            <Col xs={24} lg={14}>
              <Card>
                <Title level={4}>Pago con cripto</Title>
                <Text type="secondary">
                  Demo onchain: envia ETH desde la wallet conectada al address receptor configurado.
                </Text>
                <Divider />

                {!address ? (
                  <Alert
                    type="warning"
                    showIcon
                    message="Conecta tu wallet para pagar con cripto."
                    style={{ marginBottom: 14 }}
                  />
                ) : null}

                <Form layout="vertical">
                  <Form.Item label="Metodo">
                    <Radio.Group value={cryptoMethod} onChange={event => setCryptoMethod(event.target.value)}>
                      <Radio.Button value="wallet">Wallet conectada</Radio.Button>
                      <Radio.Button value="manual">Manual (QR + address)</Radio.Button>
                    </Radio.Group>
                  </Form.Item>

                  <Form.Item label="CURP (opcional, valida precio mexicano)">
                    <Input
                      value={curp}
                      onChange={event =>
                        setCurp(
                          event.target.value
                            .toUpperCase()
                            .replace(/[^A-Z0-9]/g, "")
                            .slice(0, 18),
                        )
                      }
                      placeholder="AAAA000000HDFBBB00"
                      maxLength={18}
                    />
                  </Form.Item>

                  <Form.Item label={`Monto en ETH (${cryptoChainLabel})`}>
                    <Input
                      value={cryptoAmountEth}
                      onChange={event => setCryptoAmountEth(event.target.value)}
                      placeholder="0.001"
                    />
                    {estimatedEth ? (
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        Estimado por total USD actual: {estimatedEth} ETH
                      </Text>
                    ) : null}
                  </Form.Item>

                  <Form.Item label="Direccion receptora">
                    <Input value={cryptoReceiver || "Configura REACT_APP_CRYPTO_RECEIVER"} readOnly />
                  </Form.Item>
                </Form>

                <Space>
                  <Button icon={<CopyOutlined />} onClick={copyReceiver} disabled={!cryptoReceiver}>
                    Copiar direccion
                  </Button>
                  <Button
                    type="primary"
                    loading={cryptoSubmitting}
                    disabled={!address || !cryptoReceiver || cryptoMethod !== "wallet"}
                    onClick={handleCryptoPay}
                  >
                    Enviar pago cripto
                  </Button>
                </Space>

                {cryptoMethod === "manual" ? (
                  <Alert
                    type="info"
                    showIcon
                    style={{ marginTop: 14 }}
                    message="Modo manual"
                    description="Escanea el QR y envia el monto desde cualquier wallet externa."
                  />
                ) : null}
              </Card>
            </Col>

            <Col xs={24} lg={10}>
              <Card>
                <Title level={5}>
                  <QrcodeOutlined /> QR de pago
                </Title>
                <div style={{ display: "flex", justifyContent: "center", margin: "16px 0" }}>
                  <QR value={cryptoReceiver || "missing-receiver"} size={220} />
                </div>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  Este QR contiene la direccion receptora. Monto sugerido: {cryptoAmountEth} ETH.
                </Text>
              </Card>
            </Col>
          </Row>
        </TabPane>
      </Tabs>
    </div>
  );
}
