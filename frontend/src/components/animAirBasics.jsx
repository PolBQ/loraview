import React, { useState } from "react";

/** Tarjetas interactivas de conceptos: Frecuencia, Potencia, Ruido, SNR */
export default function AirBasics() {
  const [sel, setSel] = useState("freq");

  const items = {
    freq: {
      title: "Frecuencia",
      desc: "Cuántas veces vibra la onda por segundo (MHz). Afecta la pérdida por distancia y el comportamiento ante obstáculos.",
      hint: "En LoRa solemos usar 868/915 MHz (bandas ISM)."
    },
    power: {
      title: "Potencia",
      desc: "Energía con la que transmitimos (dBm). Más potencia ≠ infinito alcance: el entorno manda.",
      hint: "Valores típicos: 14–20 dBm según región y normativa."
    },
    noise: {
      title: "Ruido",
      desc: "Interferencias y señales no deseadas. Si el ruido sube, es más difícil distinguir la señal.",
      hint: "Ambientes urbanos densos suelen tener más interferencias."
    },
    snr: {
      title: "SNR",
      desc: "Relación señal/ruido: cuánta señal útil hay respecto al ruido. Determina si el receptor puede decodificar.",
      hint: "LoRa soporta SNR negativos gracias a su modulación robusta."
    }
  };

  return (
    <div className="card-fluent p-3">
      <div className="d-flex gap-2 flex-wrap mb-3">
        {Object.keys(items).map((k) => (
          <button
            key={k}
            className={`btn btn-sm ${sel === k ? "btn-light" : "btn-outline-light"}`}
            onClick={() => setSel(k)}
          >
            {items[k].title}
          </button>
        ))}
      </div>

      <div className="row g-3">
        {Object.entries(items).map(([k, v]) => (
          <div key={k} className={`col-12 col-md-6 ${sel === k ? "" : "d-none d-md-block"}`}>
            <div
              className="p-3"
              style={{
                borderRadius: 12,
                border: "1px solid rgba(255,255,255,.12)",
                background:
                  sel === k
                    ? "linear-gradient(180deg, rgba(255,255,255,.06), rgba(255,255,255,.03))"
                    : "transparent"
              }}
            >
              <div className="chip">{v.title}</div>
              <p className="mt-2" style={{ color: "var(--muted)" }}>{v.desc}</p>
              <small style={{ color: "var(--muted)" }}>{v.hint}</small>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
