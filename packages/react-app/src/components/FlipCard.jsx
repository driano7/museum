import React, { useMemo } from "react";

const CARD_PATTERNS = {
  visa: [4, 4, 4, 4],
  mastercard: [4, 4, 4, 4],
  amex: [4, 6, 5],
  generic: [4, 4, 4, 4],
};

const detectCardType = digits => {
  if (/^4/.test(digits)) return "visa";
  if (/^5[1-5]/.test(digits)) return "mastercard";
  if (/^3[47]/.test(digits)) return "amex";
  return "generic";
};

const formatCardNumber = (digits, type) => {
  const pattern = CARD_PATTERNS[type] || CARD_PATTERNS.generic;
  const maxLength = pattern.reduce((sum, length) => sum + length, 0);
  const clean = digits.replace(/\D/g, "").slice(0, maxLength);
  const blocks = [];
  let offset = 0;

  pattern.forEach(length => {
    const chunk = clean.slice(offset, offset + length);
    blocks.push((chunk || "").padEnd(length, "X"));
    offset += length;
  });

  return blocks.join(" ");
};

const CardLogo = ({ type }) => {
  if (type === "visa") {
    return (
      <div
        style={{
          width: 54,
          height: 30,
          borderRadius: 7,
          background: "linear-gradient(135deg, #1a3da8 0%, #1f80f4 100%)",
          color: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontWeight: 700,
          fontSize: 13,
        }}
      >
        VISA
      </div>
    );
  }

  if (type === "mastercard") {
    return (
      <div style={{ position: "relative", width: 54, height: 30 }}>
        <span
          style={{
            position: "absolute",
            left: 10,
            top: 3,
            width: 24,
            height: 24,
            borderRadius: "50%",
            background: "#ea4c3f",
          }}
        />
        <span
          style={{
            position: "absolute",
            right: 10,
            top: 3,
            width: 24,
            height: 24,
            borderRadius: "50%",
            background: "#fcca46",
          }}
        />
      </div>
    );
  }

  if (type === "amex") {
    return (
      <div
        style={{
          width: 54,
          height: 30,
          borderRadius: 7,
          background: "#0f172a",
          color: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontWeight: 600,
          fontSize: 12,
        }}
      >
        AMEX
      </div>
    );
  }

  return (
    <div
      style={{
        width: 54,
        height: 30,
        borderRadius: 7,
        background: "#cbd5f5",
        color: "#1e1b4b",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontWeight: 600,
        fontSize: 11,
      }}
    >
      TARJETA
    </div>
  );
};

export default function FlipCard({
  cardNumber,
  cardHolder,
  expiration,
  cvv,
  isFlipped,
  brandLabel = "Ticketeria Pay",
  footerLabel = "Monad Test",
}) {
  const digits = useMemo(() => (cardNumber || "").replace(/\D/g, ""), [cardNumber]);
  const cardType = useMemo(() => detectCardType(digits), [digits]);
  const formattedNumber = useMemo(() => formatCardNumber(digits, cardType), [digits, cardType]);
  const holderLabel = cardHolder && cardHolder.trim() ? cardHolder.trim().toUpperCase() : "NOMBRE DEL TITULAR";
  const expirationLabel = expiration && expiration.trim() ? expiration.trim() : "MM/AA";
  const cvvLabel = (cvv || "").replace(/\D/g, "").length ? "•".repeat((cvv || "").replace(/\D/g, "").length) : "•••";

  return (
    <div style={{ maxWidth: 380, margin: "0 auto", perspective: 1200 }}>
      <div
        style={{
          position: "relative",
          height: 210,
          borderRadius: 28,
          transformStyle: "preserve-3d",
          transition: "transform 700ms ease",
          transform: isFlipped ? "rotateY(180deg)" : "none",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: 28,
            padding: "20px 24px",
            color: "#fff",
            background: "linear-gradient(145deg, #0f172a 0%, #1e293b 100%)",
            boxShadow: "0 24px 45px rgba(2,6,23,0.55)",
            backfaceVisibility: "hidden",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28 }}>
            <div>
              <div style={{ fontSize: 10, letterSpacing: "0.25em", textTransform: "uppercase", color: "#94a3b8" }}>
                {brandLabel}
              </div>
              <div style={{ marginTop: 4, fontSize: 12, fontWeight: 600, letterSpacing: "0.08em" }}>
                {cardType.toUpperCase()}
              </div>
            </div>
            <CardLogo type={cardType} />
          </div>

          <div style={{ fontSize: 23, letterSpacing: "0.24em", fontWeight: 500 }}>{formattedNumber}</div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginTop: 30 }}>
            <div>
              <div style={{ fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase", color: "#94a3b8" }}>
                Titular
              </div>
              <div style={{ marginTop: 5, fontSize: 14, fontWeight: 600, letterSpacing: "0.14em" }}>{holderLabel}</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase", color: "#94a3b8" }}>
                Expira
              </div>
              <div style={{ marginTop: 5, fontSize: 14, fontWeight: 600, letterSpacing: "0.22em" }}>
                {expirationLabel}
              </div>
            </div>
          </div>
        </div>

        <div
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: 28,
            padding: "20px 24px",
            color: "#fff",
            background: "#0f172a",
            boxShadow: "0 24px 45px rgba(2,6,23,0.55)",
            border: "1px solid rgba(148,163,184,0.18)",
            backfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
          }}
        >
          <div style={{ height: 42, width: "100%", borderRadius: 12, background: "#111827" }} />
          <div style={{ marginTop: 28 }}>
            <div
              style={{
                height: 40,
                borderRadius: 10,
                border: "1px solid rgba(148,163,184,0.35)",
                background: "rgba(255,255,255,0.05)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "0 14px",
              }}
            >
              <span style={{ fontSize: 12, color: "#94a3b8", letterSpacing: "0.3em", textTransform: "uppercase" }}>
                Firma
              </span>
              <span style={{ fontSize: 14, fontWeight: 600, letterSpacing: "0.25em" }}>{cvvLabel}</span>
            </div>
            <div
              style={{
                marginTop: 8,
                fontSize: 11,
                color: "#64748b",
                letterSpacing: "0.25em",
                textTransform: "uppercase",
              }}
            >
              CVV
            </div>
          </div>
          <div style={{ marginTop: 30, display: "flex", justifyContent: "space-between", opacity: 0.85, fontSize: 12 }}>
            <span style={{ letterSpacing: "0.2em", fontWeight: 600 }}>Seguro</span>
            <span style={{ letterSpacing: "0.2em" }}>{footerLabel}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
