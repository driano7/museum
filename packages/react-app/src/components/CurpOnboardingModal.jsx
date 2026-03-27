import { Alert, Button, Input, Modal, Space, Typography } from "antd";
import React, { useEffect, useState } from "react";

import useCurpOnboarding from "../hooks/useCurpOnboarding";

const { Text } = Typography;

export default function CurpOnboardingModal({ walletAddress, onResolved }) {
  const { needsOnboarding, resolveMexican, resolveForeign } = useCurpOnboarding(walletAddress, onResolved);
  const [curp, setCurp] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    setCurp("");
    setError("");
  }, [walletAddress, needsOnboarding]);

  const handleMexican = () => {
    const result = resolveMexican(curp);
    if (!result?.ok) {
      setError(result?.error || "No se pudo validar la CURP.");
      return;
    }

    setError("");
    setCurp("");
  };

  const handleForeign = () => {
    resolveForeign();
    setError("");
    setCurp("");
  };

  return (
    <Modal
      title="Verificación de nacionalidad"
      visible={Boolean(walletAddress) && needsOnboarding}
      closable={false}
      footer={null}
      maskClosable={false}
      keyboard={false}
      centered
      width={520}
      destroyOnClose={false}
    >
      <Space direction="vertical" size={14} style={{ width: "100%" }}>
        <Text strong>¿Tienes CURP mexicana?</Text>
        <Text type="secondary">
          Guardamos este dato por wallet para definir precio nacional o internacional al comprar boletos.
        </Text>

        <Input
          value={curp}
          placeholder="Ingresa tu CURP (18 caracteres)"
          maxLength={18}
          onChange={event => {
            const normalized = event.target.value.toUpperCase().replace(/\s+/g, "").slice(0, 18);
            setCurp(normalized);
            if (error) setError("");
          }}
        />

        {error ? <Alert type="error" message={error} showIcon /> : null}

        <Space size={12} wrap>
          <Button type="primary" onClick={handleMexican}>
            Soy mexicano
          </Button>
          <Button onClick={handleForeign}>No tengo CURP / Soy extranjero</Button>
        </Space>
      </Space>
    </Modal>
  );
}
