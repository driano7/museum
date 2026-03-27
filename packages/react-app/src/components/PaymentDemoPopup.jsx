import React, { useEffect, useMemo, useState } from "react";
import FlipCard from "./FlipCard";
import "./PaymentDemoPopup.css";

export default function PaymentDemoPopup({ open, onClose }) {
  const [cardNumber, setCardNumber] = useState("");
  const [cardHolder, setCardHolder] = useState("");
  const [expiration, setExpiration] = useState("");
  const [cvv, setCvv] = useState("");
  const [focusField, setFocusField] = useState(null);
  const [email, setEmail] = useState("");

  const isFlipped = useMemo(() => focusField === "cvv", [focusField]);

  useEffect(() => {
    if (!open) return undefined;

    const onKeyDown = event => {
      if (event.key === "Escape") onClose?.();
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose]);

  if (!open) return null;

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

  return (
    <div
      className="xoco-pay-modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-label="Demo de pago con tarjeta"
      onClick={onClose}
    >
      <div className="xoco-pay-modal-shell" onClick={event => event.stopPropagation()}>
        <button type="button" className="xoco-pay-modal-close" onClick={onClose} aria-label="Cerrar demo de pagos">
          ×
        </button>

        <div className="xoco-pay-modal-head">
          <p className="xoco-pay-modal-kicker">Demo de pagos (UI)</p>
          <h3>Tarjeta con flip animation</h3>
          <p>Solo interfaz: captura de tarjeta y contacto adaptada al estilo de Ticketeria CDMX.</p>
        </div>

        <div className="xoco-pay-modal-grid">
          <div className="xoco-pay-card-wrap">
            <FlipCard
              cardNumber={cardNumber}
              cardHolder={cardHolder}
              expiration={expiration}
              cvv={cvv}
              isFlipped={isFlipped}
              brandLabel="Ticketeria Pay"
              footerLabel="Monad Test"
            />
          </div>

          <form className="xoco-pay-form" onSubmit={event => event.preventDefault()}>
            <label>
              Numero de tarjeta
              <input
                value={cardNumber}
                onChange={handleCardNumber}
                onFocus={() => setFocusField("cardNumber")}
                placeholder="4242 4242 4242 4242"
                inputMode="numeric"
                autoComplete="cc-number"
              />
            </label>

            <label>
              Nombre del titular
              <input
                value={cardHolder}
                onChange={event => setCardHolder(event.target.value)}
                onFocus={() => setFocusField("cardHolder")}
                placeholder="Nombre Apellido"
                autoComplete="cc-name"
              />
            </label>

            <div className="xoco-pay-form-row">
              <label>
                Expiracion
                <input
                  value={expiration}
                  onChange={handleExpiration}
                  onFocus={() => setFocusField("expiration")}
                  placeholder="MM/AA"
                  inputMode="numeric"
                  autoComplete="cc-exp"
                />
              </label>

              <label>
                CVV
                <input
                  value={cvv}
                  onChange={handleCvv}
                  onFocus={() => setFocusField("cvv")}
                  placeholder="123"
                  inputMode="numeric"
                  autoComplete="cc-csc"
                />
              </label>
            </div>

            <label>
              Email de contacto
              <input
                type="email"
                value={email}
                onChange={event => setEmail(event.target.value)}
                onFocus={() => setFocusField("email")}
                placeholder="museo@dominio.com"
                autoComplete="email"
              />
            </label>

            <div className="xoco-pay-form-actions">
              <button type="button" className="xoco-button xoco-button-secondary" onClick={onClose}>
                Cerrar
              </button>
              <button type="button" className="xoco-button xoco-button-primary">
                Continuar (demo)
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
