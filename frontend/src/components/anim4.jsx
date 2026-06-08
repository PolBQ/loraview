import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";


// Mini simulador visual sin mapas: anillos SVG para cobertura por umbral
export default function CoverageSimulatorMini(){
const [height, setHeight] = useState(15); // m
const [power, setPower] = useState(14); // dBm
const [env, setEnv] = useState(3); // 1-5 (1=abierto,5=denso)


const radii = useMemo(()=>{
// Modelo ilustrativo: mayor altura/potencia → mayor radio; entorno penaliza
const base = 120 + (power-14)*6 + (height-15)*1.2; // px
const factor = 1 - (env-1)*0.12; // 1 .. 0.52
const rStrong = Math.max(30, base*factor*0.45);
const rUsable = Math.max(60, base*factor*0.8);
const rWeak = Math.max(90, base*factor*1.1);
return { rStrong, rUsable, rWeak };
},[height,power,env]);


return (
<div className="row g-3">
<div className="col-lg-6">
<div className="mb-2" style={{color:"var(--muted)"}}>Altura antena: {height} m</div>
<input type="range" min="5" max="40" value={height} onChange={e=>setHeight(parseInt(e.target.value))} className="form-range"/>
<div className="mb-2 mt-3" style={{color:"var(--muted)"}}>Potencia Tx: {power} dBm</div>
<input type="range" min="2" max="20" value={power} onChange={e=>setPower(parseInt(e.target.value))} className="form-range"/>
<div className="mb-2 mt-3" style={{color:"var(--muted)"}}>Entorno: {env} / 5</div>
<input type="range" min="1" max="5" value={env} onChange={e=>setEnv(parseInt(e.target.value))} className="form-range"/>
</div>
<div className="col-lg-6 d-flex justify-content-center">
<motion.svg width="320" height="320" viewBox="0 0 320 320" initial={{opacity:0}} animate={{opacity:1}}>
<defs>
<radialGradient id="g1" cx="50%" cy="50%">
<stop offset="0%" stopColor="rgba(98,160,255,0.9)"/>
<stop offset="100%" stopColor="rgba(98,160,255,0.0)"/>
</radialGradient>
<radialGradient id="g2" cx="50%" cy="50%">
<stop offset="0%" stopColor="rgba(104,225,253,0.7)"/>
<stop offset="100%" stopColor="rgba(104,225,253,0.0)"/>
</radialGradient>
<radialGradient id="g3" cx="50%" cy="50%">
<stop offset="0%" stopColor="rgba(255,255,255,0.35)"/>
<stop offset="100%" stopColor="rgba(255,255,255,0.0)"/>
</radialGradient>
</defs>
<circle cx="160" cy="160" r={radii.rWeak} fill="url(#g3)"/>
<circle cx="160" cy="160" r={radii.rUsable} fill="url(#g2)"/>
<circle cx="160" cy="160" r={radii.rStrong} fill="url(#g1)"/>
<motion.circle cx="160" cy="160" r="6" fill="white" initial={{scale:0}} animate={{scale:1}} transition={{type:'spring'}} />
<text x="160" y="300" textAnchor="middle" fill="var(--muted)" fontSize="12">Cobertura: fuerte / usable / débil</text>
</motion.svg>
</div>
</div>
);
}