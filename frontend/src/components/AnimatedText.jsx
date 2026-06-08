import { useEffect, useState } from "react";

const words = ["Análisis", "Simulación", "Visualización", "Monitoreo"];
const colors = ["#1A8AF4", "#f4841c", "#28a745", "#dc3545"];

export default function AnimatedText() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prevIndex) => (prevIndex + 1) % words.length);
    }, 2000);

    return () => clearInterval(interval); // Limpiar intervalo al desmontar
  }, []);

  return (
    <span
      id="animated-text"
      style={{
        color: colors[index],
        transition: "opacity 0.5s ease-in-out, color 0.5s ease-in-out",
        display: "inline-block",
      }}
    >
      {words[index]}
    </span>
  );
}
