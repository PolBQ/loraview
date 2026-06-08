import React, { useEffect, useRef, useState } from "react";

/**
 * Paquetes viajando: éxito/fracaso según un SNR virtual.
 * Ajustado para ser visible en modo diurno/nocturno leyendo variables CSS.
 */
export default function LinkPlay() {
  const [snr, setSnr] = useState(-5);    // dB (virtual)
  const [rate, setRate] = useState(1.0); // velocidad de envío
  const [running, setRunning] = useState(false);
  const canvasRef = useRef(null);
  const [stats, setStats] = useState({ sent: 0, ok: 0 });

  // Colores desde CSS variables
  const colorsRef = useRef({
    bg: "", ink: "", noise: "", ok: "", dead: "", rx: ""
  });

  // Lee variables CSS actuales
  const readCssVars = () => {
    const cs = getComputedStyle(document.documentElement);
    colorsRef.current = {
      bg:   cs.getPropertyValue("--canvas-bg").trim()   || "linear-gradient(180deg, rgba(0,0,0,.03), rgba(0,0,0,.015))",
      ink:  cs.getPropertyValue("--canvas-ink").trim()  || "#203148",
      noise:cs.getPropertyValue("--canvas-noise").trim()|| "rgba(32,49,72,.22)",
      ok:   cs.getPropertyValue("--packet-ok").trim()   || "#0ea5e9",
      dead: cs.getPropertyValue("--packet-dead").trim() || "#e11d48",
      rx:   cs.getPropertyValue("--rx-fill").trim()     || "#1678f3",
    };
  };

  // Escala el canvas a DPR para nitidez
  const fitDPR = (canvas) => {
    const dpr = window.devicePixelRatio || 1;
    const rectW = canvas.clientWidth || 640;
    const rectH = canvas.clientHeight || 200;
    canvas.width  = Math.round(rectW * dpr);
    canvas.height = Math.round(rectH * dpr);
    const ctx = canvas.getContext("2d");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    return { ctx, W: rectW, H: rectH };
  };

  useEffect(() => {
    readCssVars();
    // Observa cambios en el tema
    const mo = new MutationObserver(() => readCssVars());
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    return () => mo.disconnect();
  }, []);

  useEffect(() => {
    let raf;
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Asegura tamaño CSS para fitDPR
    canvas.style.width = "100%";
    canvas.style.height = "200px";

    const { ctx, W, H } = fitDPR(canvas);

    // Fondo (pinta el gradiente con CSS, no en ctx, usando estilo del <canvas>)
    // Nota: el gradiente de fondo lo dejamos al style del canvas; aquí solo limpiamos.
    // Para forzar BG del canvas según el tema:
    canvas.style.background = colorsRef.current.bg;

    const packets = [];
    const noiseFloor = -95; // referencia virtual

    const spawn = () => {
      const rssi = -70 + Math.random() * 20 - 10; // -80..-60
      packets.push({
        x: 40,
        y: H / 2 + (Math.random() * 60 - 30),
        vx: 2.2 + Math.random() * 0.6,
        rssi, ttl: 1, alive: true
      });
      setStats(s => ({ ...s, sent: s.sent + 1 }));
    };

    let tSpawn = 0;

    const loop = () => {
      ctx.clearRect(0, 0, W, H);

      // Emisor (rect) y Receptor (círculo)
      ctx.fillStyle = colorsRef.current.ink;
      ctx.fillRect(18, H / 2 - 18, 24, 36);
      ctx.beginPath(); ctx.arc(W - 24, H / 2, 14, 0, Math.PI * 2); 
      ctx.fillStyle = colorsRef.current.rx; 
      ctx.fill();

      // Línea “ruido”
      ctx.strokeStyle = colorsRef.current.noise;
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(0, H / 2 + 40); ctx.lineTo(W, H / 2 + 40); ctx.stroke();

      // Spawns
      tSpawn += rate;
      if (running && tSpawn > 16) { tSpawn = 0; spawn(); }

      // Movimiento + prob. de muerte
      packets.forEach(p => {
        if (!p.alive) return;
        p.x += p.vx;
        const curSnr = p.rssi - noiseFloor;
        const margin = curSnr - snr; // si < 0, peor que umbral
        const deathChance = margin < 0 ? Math.min(0.25, Math.abs(margin) / 40) : 0.01;
        if (Math.random() < deathChance) { p.alive = false; p.ttl = 0.9; }
      });

      // Dibujar paquetes
      packets.forEach(p => {
        if (p.alive) {
          ctx.fillStyle = colorsRef.current.ok;
          ctx.beginPath(); ctx.arc(p.x, p.y, 4, 0, Math.PI * 2); ctx.fill();
        } else if (p.ttl > 0) {
          ctx.fillStyle = colorsRef.current.dead.replace(')', `, ${p.ttl})`).replace('rgb', 'rgba'); // robustez por si viene rgb()
          // Si el token ya es rgba(a), esta línea intenta ajustar la a; si prefieres simple:
          // ctx.globalAlpha = p.ttl; ctx.fillStyle = colorsRef.current.dead;
          ctx.beginPath(); ctx.arc(p.x, p.y, 4, 0, Math.PI * 2); ctx.fill();
          // ctx.globalAlpha = 1;
          p.ttl -= 0.02;
        }
      });

      // Recepción
      packets.forEach(p => {
        if (p.alive && p.x >= W - 38) {
          p.alive = false; p.ttl = 0.9;
          setStats(s => ({ ...s, ok: s.ok + 1 }));
        }
      });

      // Limpiar fuera de pantalla
      while (packets.length && packets[0].x > W + 10) packets.shift();

      raf = requestAnimationFrame(loop);
    };

    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [snr, rate, running]);

  const pct = stats.sent ? Math.round((stats.ok / stats.sent) * 100) : 0;

  return (
    <div className="card-fluent p-3">
      <h3 className="title-grad">¿Llega o no llega? (SNR &amp; éxito de paquetes)</h3>
      <canvas
        ref={canvasRef}
        width={640}
        height={200}
        style={{
          width: "100%",
          height: 200,
          borderRadius: 12,
          background: "var(--canvas-bg)"   // se actualiza al cambiar tema
        }}
      />
      <div className="row g-3 mt-2">
        <div className="col-12 col-md-4">
          <label className="form-label" style={{ color: "var(--muted)" }}>
            Umbral SNR virtual (dB): {snr}
          </label>
          <input type="range" min="-12" max="6" step="1" value={snr}
                 onChange={(e) => setSnr(parseInt(e.target.value))}
                 className="form-range" />
        </div>
        <div className="col-12 col-md-4">
          <label className="form-label" style={{ color: "var(--muted)" }}>
            Ritmo de envío
          </label>
          <input type="range" min="0.4" max="2" step="0.1" value={rate}
                 onChange={(e) => setRate(parseFloat(e.target.value))}
                 className="form-range" />
        </div>
        <div className="col-12 col-md-4 d-flex align-items-end">
          <button className={`btn ${running ? "btn-ghost" : "btn-accent"} w-100`}
                  onClick={() => setRunning(v => !v)}>
            {running ? "Pausar" : "Reproducir"}
          </button>
        </div>
      </div>

      <div className="mt-2 d-flex gap-3 flex-wrap">
        <div className="chip">Enviados: {stats.sent}</div>
        <div className="chip">Recibidos: {stats.ok}</div>
        <div className="chip">Éxito: {pct}%</div>
      </div>

      <small className="d-block mt-2" style={{ color: "var(--muted)" }}>
        Demostración visual: a peor SNR ⇒ más pérdidas en el trayecto. LoRa permite SNR negativos, por eso
        puede recibir paquetes incluso cuando el ruido es alto.
      </small>
    </div>
  );
}
