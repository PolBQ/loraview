import { useEffect, useRef } from "react";

/**
 * Fondo animado con ondas + imagen que cambia por tema (claro/oscuro).
 * - Lee variables CSS:
 *    --login-canvas-bg    (fondo del canvas)
 *    --login-image-path   (ruta de imagen por tema)
 *    --city-opacity       (opacidad de la imagen)
 * - Escala a devicePixelRatio para nitidez.
 * - Observa data-theme y actualiza al vuelo.
 */
const WaveBackground = () => {
  const canvasRef = useRef(null);
  const imageRef = useRef(null);
  const intervalRef = useRef(null);
  const moRef = useRef(null);
  const opacityRef = useRef(0.6); // ciudad (se actualiza por CSS var)

  const CONFIG = {
    numRings: 4,
    ringSpacing: 35,
    maxRadius: 400,
    waveSpeed: 0.5,
    opacityDecay: 0.004,
    centerDotSize: 5,
    centerDotColor: "rgba(226, 121, 50, 0.9)",
    colorBase: [50, 150, 255],     // base de las ondas (se mezcla aleatorio)
    waveSpawnInterval: 1000,       // ms
  };

  // ---- Utilidades de estilo/tema ----
  const readCssVar = (name, fallback = "") => {
    const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
    if (!v) return fallback;
    // Limpia comillas si las hubiera
    return v.replace(/^['"]|['"]$/g, "");
  };

  const loadImage = (src) =>
    new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.src = src;
    });

  // Ajusta el canvas a DPR para nitidez
  const fitDPR = (canvas, ctx) => {
    const dpr = window.devicePixelRatio || 1;
    const w = canvas.clientWidth || window.innerWidth;
    const h = canvas.clientHeight || window.innerHeight;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    return { W: w, H: h };
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });

    // Dimensiones CSS (para que fitDPR funcione bien)
    const ensureCssSize = () => {
      canvas.style.width = "100%";
      canvas.style.height = "100%";
    };
    ensureCssSize();

    // Aplica variables de tema (fondo, imagen, opacidad)
    let stop = false;
    const applyTheme = async () => {
      const bg = readCssVar("--login-canvas-bg", "transparent");
      canvas.style.background = bg;
      const op = parseFloat(readCssVar("--city-opacity", "0.6"));
      opacityRef.current = isNaN(op) ? 0.6 : op;
    };

    // Primera aplicación de tema
    applyTheme();

    // Observa cambios de data-theme
    const mo = new MutationObserver(() => applyTheme());
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    moRef.current = mo;

    // Redimensionado
    const onResize = () => fitDPR(canvas, ctx);
    onResize();
    window.addEventListener("resize", onResize);

    // Ondas
    const waves = [];
    class Wave {
      constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.radii = Array(CONFIG.numRings).fill(0);
        this.opacity = 1;
        this.color = color;
      }
      update() {
        this.radii = this.radii.map((r, i) => r + CONFIG.waveSpeed + i * 0.2);
        this.opacity -= CONFIG.opacityDecay;
        if (this.radii[this.radii.length - 1] > CONFIG.maxRadius) this.opacity = 0;
      }
      draw() {
        ctx.strokeStyle = `rgba(${this.color[0]}, ${this.color[1]}, ${this.color[2]}, ${this.opacity})`;
        ctx.lineWidth = 2;
        this.radii.forEach((r) => {
          ctx.beginPath();
          ctx.arc(this.x, this.y, r, 0, Math.PI * 2);
          ctx.stroke();
        });
        ctx.fillStyle = CONFIG.centerDotColor;
        ctx.beginPath();
        ctx.arc(this.x, this.y, CONFIG.centerDotSize, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    const spawn = () => {
      const rectW = canvas.clientWidth;
      const rectH = canvas.clientHeight;
      const x = Math.random() * rectW;
      const y = Math.random() * rectH;
      const color = [
        CONFIG.colorBase[0] + Math.floor(Math.random() * 50),
        CONFIG.colorBase[1] + Math.floor(Math.random() * 50),
        CONFIG.colorBase[2],
      ];
      waves.push(new Wave(x, y, color));
    };

    let raf;
    const loop = () => {
      const rectW = canvas.clientWidth;
      const rectH = canvas.clientHeight;
      ctx.clearRect(0, 0, rectW, rectH);

      // Imagen de fondo (si cargó)
      const img = imageRef.current;
      if (img && img.complete) {
        ctx.save();
        ctx.globalAlpha = opacityRef.current;
        // cover manual
        const cw = rectW, ch = rectH;
        const iw = img.naturalWidth, ih = img.naturalHeight;
        const imgAR = iw / ih;
        const canAR = cw / ch;
        let dw, dh;
        if (canAR > imgAR) { dw = cw; dh = cw / imgAR; } else { dh = ch; dw = ch * imgAR; }
        const dx = (cw - dw) / 2, dy = (ch - dh) / 2;
        ctx.drawImage(img, dx, dy, dw, dh);
        ctx.restore();
      }

      // Ondas
      for (let i = waves.length - 1; i >= 0; i--) {
        const w = waves[i];
        w.update();
        w.draw();
        if (w.opacity <= 0) waves.splice(i, 1);
      }

      raf = requestAnimationFrame(loop);
    };

    intervalRef.current = window.setInterval(spawn, CONFIG.waveSpawnInterval);
    raf = requestAnimationFrame(loop);

    return () => {
      stop = true;
      window.removeEventListener("resize", onResize);
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (moRef.current) moRef.current.disconnect();
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 0,             // queda debajo del contenido (.inicio) pero visible
        pointerEvents: "none", // no bloquea clics
      }}
    />
  );
};

export default WaveBackground;
