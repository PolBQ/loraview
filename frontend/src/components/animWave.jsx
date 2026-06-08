import React, { useEffect, useMemo, useRef, useState } from "react";

/**
 * Ondas tipo “) ) ) )” (arcos concéntricos) izq→der.
 * Antena Tx omnidireccional con altura variable; Rx fija.
 * Obstáculos aleatorios según ruido.
 * LÓGICA: alcance depende de velocidad, ruido, potencia + ALTURA (efecto paraguas).
 * VISUAL: “sombra” cerca del Tx que desaparece al elevar la antena.
 */
export default function WaveIntro() {
  // Controles
  const [speed, setSpeed] = useState(1.0);   // velocidad de transmisión (visual)
  const [noise, setNoise] = useState(0.35);  // 0..1: +ruido = +obstáculos (y -alcance)
  const [power, setPower] = useState(14);    // dBm (ilustrativo) => +alcance
  const [txH, setTxH]   = useState(22);      // altura de antena Tx (px, visual)

  // Lienzo
  const W = 640, H = 260, groundY = 210;

  // Obstáculos aleatorios (recalcula cuando cambia noise)
  const obstacles = useMemo(() => {
    const n = Math.round(3 + noise * 18); // 3..21
    const arr = [];
    let seed = Math.floor(noise * 1e6) || 1234567;
    const rnd = () => { // xorshift32
      seed ^= seed << 13; seed ^= seed >> 17; seed ^= seed << 5;
      return (seed >>> 0) / 2 ** 32;
    };
    for (let i = 0; i < n; i++) {
      const isTree = rnd() < 0.55;
      const x = 160 + rnd() * (W - 210);  // evita pegarse al Tx
      const h = isTree ? 20 + rnd() * 40 : 30 + rnd() * 80;
      arr.push({ x, h, type: isTree ? "tree" : "bld" });
    }
    return arr.sort((a, b) => a.x - b.x);
  }, [noise]);

  // Helpers
  const arcPath = (cx, cy, r, a0, a1) => {
    const x0 = cx + r * Math.cos(a0);
    const y0 = cy + r * Math.sin(a0);
    const x1 = cx + r * Math.cos(a1);
    const y1 = cy + r * Math.sin(a1);
    const large = Math.abs(a1 - a0) > Math.PI ? 1 : 0;
    const sweep = 1;
    return `M ${x0},${y0} A ${r} ${r} 0 ${large} ${sweep} ${x1} ${y1}`;
  };
  const clamp = (x, min, max) => Math.max(min, Math.min(max, x));

  // Animación y “efecto paraguas”
  const svgRef = useRef(null);
  const phaseRef = useRef(0);

  useEffect(() => {
    let raf;
    const tick = () => {
      // avance de las ondas (visual)
      phaseRef.current += 0.9 * speed;

      const svg = svgRef.current;
      if (svg) {
        const group = svg.querySelector("#waves-group");
        const umbrella = svg.querySelector("#umbra-circle");
        if (group) {
          group.innerHTML = "";

          // Centro de emisión en la antena Tx
          const cx = 47;
          const cy = groundY - txH;

          // ======== ALCANCE con EFECTO ALTURA (paraguas) ========
          const reachBase = 420;

          // Normalizaciones
          const sNorm = clamp((speed - 0.4) / (2.0 - 0.4), 0, 1); // 0..1
          const hNorm = clamp((txH - 12) / (60 - 12), 0, 1);      // 0..1

          // Factores existentes
          const fSpeed = 1 - 0.35 * sNorm;                 // ↑velocidad ⇒ ↓alcance
          const fNoise = 1 - 0.50 * clamp(noise, 0, 1);    // ↑ruido ⇒ ↓alcance
          const fPower = 1 + 0.04 * (power - 14);          // ↑potencia ⇒ ↑alcance

          // NUEVO: factor de altura (muy no lineal para “salto” realista)
          // baja altura (hNorm≈0) ⇒ ~0.35; alta altura (≈1) ⇒ ~1.7
          const fHeight = 0.35 + Math.pow(hNorm, 1.7) * 1.35;

          // Alcance máximo efectivo
          const maxReach = clamp(reachBase * fSpeed * fNoise * fPower * fHeight, 120, 580);
          // ======================================================

          // Parámetros visuales de las ondas
          const spacing = 22;                     // separación entre arcos
          const count   = 30;                      // número de frentes
          const baseR   = 26;                     // radio inicial
          const offset  = (phaseRef.current % spacing + spacing) % spacing;

          // Apertura hacia la derecha (±65°). Leve apertura extra con altura.
          const spread = 65 + hNorm * 6;          // un toque más de “apertura” en altura
          const a0 = (-spread * Math.PI) / 180;
          const a1 = ( spread * Math.PI) / 180;

          for (let k = 0; k < count; k++) {
            const r = baseR + k * spacing + offset;

            // corte por alcance
            if (r > maxReach) continue;

            // Atenuar al borde + leve realce en media distancia (paraguas anular)
            const edge = clamp((maxReach - r) / (maxReach * 0.6), 0, 1);
            const midBoost = clamp(Math.exp(-Math.pow((r / maxReach - 0.45) / 0.22, 2)), 0.7, 1.2);

            const strokeW = 1.8 * (1 - k * 0.06) * (0.6 + 0.4 * edge) * midBoost;
            const opacity = (0.9 - k * 0.07) * (0.5 + 0.5 * edge) * midBoost;

            const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
            path.setAttribute("d", arcPath(cx, cy, r, a0, a1));
            path.setAttribute("fill", "none");
            path.setAttribute("stroke", "var(--accent)");
            path.setAttribute("stroke-linecap", "round");
            path.setAttribute("stroke-width", String(clamp(strokeW, 0.6, 3)));
            path.setAttribute("opacity", String(clamp(opacity, 0.12, 1)));
            group.appendChild(path);
          }

          // UMBRA (sombra de paraguas) — zona de cobertura pobre junto al poste
          // Radio grande cuando la antena está baja; se reduce drásticamente al subirla.
          if (umbrella) {
            const rUmbra = 140 * Math.pow(1 - hNorm, 1.6) + 18; // 158→18 aprox
            umbrella.setAttribute("cx", String(cx));
            umbrella.setAttribute("cy", String(cy));
            umbrella.setAttribute("r", String(rUmbra));
            umbrella.setAttribute("opacity", String(0.55 * Math.pow(1 - hNorm, 1.2)));
          }
        }
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [speed, power, txH, noise]);

  return (
    <div>
      <div className="mb-3">
        <div className="chip">Introducción</div>
        <h2 className="mt-2 title-grad">¿Qué es una comunicación inalámbrica?</h2>
        <p style={{ color: "var(--muted)" }}>
          Una antena <b>omnidireccional</b> (Tx) emite ondas hacia el receptor (Rx).
          Con <i>baja altura</i> la cobertura cerca del poste cae (efecto <b>paraguas</b>);
          al elevar la antena el alcance mejora notablemente. Velocidad y obstáculos también influyen.
        </p>
      </div>

      <div className="card-fluent p-3">
        <svg
          ref={svgRef}
          id="wave-intro"
          viewBox={`0 0 ${W} ${H}`}
          width="100%"
          className="soft-shadow"
          style={{
            background: "linear-gradient(180deg, rgba(255,255,255,.02), rgba(255,255,255,.01))",
            borderRadius: 12,
            color: "var(--svg-ink)"
          }}
        >
          {/* Gradiente para la umbra (sombra) */}
          <defs>
            <radialGradient id="umbraGrad" cx="50%" cy="50%">
              <stop offset="0%"  stopColor="rgba(11,15,23,0.75)" />
              <stop offset="65%" stopColor="rgba(11,15,23,0.35)" />
              <stop offset="100%" stopColor="rgba(11,15,23,0.00)" />
            </radialGradient>
          </defs>

          {/* Suelo */}
          <rect x="0" y={groundY} width={W} height={H - groundY} fill="var(--ground-fill)" />

          {/* Antena Tx (omni) con altura variable */}
          <g>
            <rect x="44" y={groundY - txH} width="6" height={txH} fill="currentColor" />  {/* antes #fff */}
            <circle cx="47" cy={groundY - txH} r="10" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.75" />
            <circle cx="47" cy={groundY - txH} r="16" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.55" />
            <rect  x="36" y={groundY - 6} width="22" height="6" rx="2" fill="currentColor" opacity="0.85" />
            <text x="20" y={groundY + 18} fill="var(--muted)" fontSize="10">Tx (omni)</text>
          </g>  

          {/* Antena Rx */}
          <g>
            <rect x={W - 58} y={groundY - 40} width="6" height="40" fill="currentColor" />
            <circle cx={W - 55} cy={groundY - 42} r="6" fill="var(--accent)" />   {/* marca el Rx */}
            <rect x={W - 66} y={groundY - 6} width="22" height="6" rx="2" fill="currentColor" opacity="0.85" />
            <text x={W - 78} y={groundY + 18} fill="var(--muted)" fontSize="10">Rx</text>
          </g>

          {/* Obstáculos aleatorios */}
          <g opacity={0.5 + noise * 0.35}>
            {obstacles.map((o, i) =>
              o.type === "tree" ? (
                <g key={i} transform={`translate(${o.x} ${groundY})`}>
                  <rect   x="-2" y={-o.h} width="4"  height={o.h} fill="var(--svg-ink-soft)" />
                  <polygon points={`-10,${-o.h} 0,${-o.h - 14} 10,${-o.h}`} fill="var(--svg-ink-soft)" opacity=".8" />
                </g>
              ) : (
                <g key={i} transform={`translate(${o.x} ${groundY})`}>
                  <rect x="-6" y={-o.h} width="12" height={o.h} rx="2" fill="var(--svg-ink-soft)" />
                  <rect x="-6" y={-o.h} width="12" height="6"           fill="var(--svg-ink)" opacity=".65" />
                </g>
              )
            )}
          </g>
          {/* Ondas (izq → der) */}
          <g id="waves-group"></g>

          {/* Umbra del paraguas (encima de las ondas para “tapar” la zona inmediata) */}
          <circle id="umbra-circle" cx="47" cy={groundY - txH} r="120" fill="url(#umbraGrad)" opacity="0.55" pointerEvents="none" />
        </svg>

        {/* Controles */}
        <div className="row g-3 mt-3">
          <div className="col-12 col-md-3">
            <label className="form-label" style={{ color: "var(--muted)" }}>
              Velocidad de transmisión
            </label>
            <input type="range" min="0.4" max="2" step="0.1" value={speed}
                   onChange={(e) => setSpeed(parseFloat(e.target.value))}
                   className="form-range" />
          </div>
          <div className="col-12 col-md-3">
            <label className="form-label" style={{ color: "var(--muted)" }}>
              Obstáculos / ruido
            </label>
            <input type="range" min="0" max="1" step="0.05" value={noise}
                   onChange={(e) => setNoise(parseFloat(e.target.value))}
                   className="form-range" />
          </div>
          <div className="col-12 col-md-3">
            <label className="form-label" style={{ color: "var(--muted)" }}>
              Potencia Tx (ilustrativa): {power} dBm
            </label>
            <input type="range" min="2" max="22" step="1" value={power}
                   onChange={(e) => setPower(parseInt(e.target.value))}
                   className="form-range" />
          </div>
          <div className="col-12 col-md-3">
            <label className="form-label" style={{ color: "var(--muted)" }}>
              Altura antena Tx (visual): {txH}px
            </label>
            <input type="range" min="12" max="60" step="1" value={txH}
                   onChange={(e) => setTxH(parseInt(e.target.value))}
                   className="form-range" />
          </div>
        </div>

        <small className="d-block mt-2" style={{ color: "var(--muted)" }}>
          <b>Idea clave:</b> a baja altura aparece una “zona ciega” bajo el poste (paraguas).
          Al elevar la antena esa zona se reduce y el alcance aumenta; la velocidad, el ruido
          y la potencia siguen afectando como antes.
        </small>
      </div>
    </div>
  );
}
