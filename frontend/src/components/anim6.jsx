import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";


export default function CompareCard(){
const [a, setA] = useState({ height:15, power:14, env:3 });
const [b, setB] = useState({ height:25, power:18, env:2 });


const score = (cfg)=>{
const base = 50 + (cfg.power-10)*2 + (cfg.height-10)*1.2 - (cfg.env-1)*6; // 0..100 aprox
return Math.max(0, Math.min(100, Math.round(base)));
};


const diff = useMemo(()=> score(b) - score(a), [a,b]);


const Field = ({label, value, onChange, min, max})=> (
<div className="mb-2">
<small style={{color:"var(--muted)"}}>{label}: {value}</small>
<input className="form-range" type="range" min={min} max={max} value={value} onChange={e=>onChange(parseInt(e.target.value))} />
</div>
);


return (
<div className="row g-3">
<div className="col-lg-6">
<div className="card-fluent p-3">
<h6>Escenario A</h6>
<Field label="Altura (m)" value={a.height} onChange={v=>setA({...a,height:v})} min={5} max={40} />
<Field label="Potencia (dBm)" value={a.power} onChange={v=>setA({...a,power:v})} min={2} max={20} />
<Field label="Entorno (1=abierto,5=denso)" value={a.env} onChange={v=>setA({...a,env:v})} min={1} max={5} />
<div style={{color:"var(--muted)"}}>Cobertura estimada</div>
<motion.div className="mt-1" style={{height:10, background:"rgba(255,255,255,.08)", borderRadius:8}}
initial={{opacity:0}} animate={{opacity:1}}>
<motion.div layout style={{height:10, width:`${score(a)}%`, background:"var(--accent)", borderRadius:8}} />
</motion.div>
</div>
</div>
<div className="col-lg-6">
<div className="card-fluent p-3">
<h6>Escenario B</h6>
<Field label="Altura (m)" value={b.height} onChange={v=>setB({...b,height:v})} min={5} max={40} />
<Field label="Potencia (dBm)" value={b.power} onChange={v=>setB({...b,power:v})} min={2} max={20} />
<Field label="Entorno (1=abierto,5=denso)" value={b.env} onChange={v=>setB({...b,env:v})} min={1} max={5} />
<div style={{color:"var(--muted)"}}>Cobertura estimada</div>
<motion.div className="mt-1" style={{height:10, background:"rgba(255,255,255,.08)", borderRadius:8}}
initial={{opacity:0}} animate={{opacity:1}}>
<motion.div layout style={{height:10, width:`${score(b)}%`, background:"var(--accent2)", borderRadius:8}} />
</motion.div>
</div>
</div>


<div className="col-12">
<div className="card-fluent p-3 d-flex justify-content-between align-items-center">
<div>
<div style={{color:"var(--muted)"}}>Diferencia (B − A)</div>
<h4 className="m-0" style={{color: diff>=0? 'var(--ok)':'var(--bad)'}}>{diff >= 0? '+'+diff : diff} pts</h4>
</div>
<div className="d-flex gap-2">
<button className="btn btn-sm btn-outline-light" onClick={()=>{navigator.clipboard?.writeText(JSON.stringify({A:a,B:b}));}}>Copiar config</button>
<button className="btn btn-sm btn-light" onClick={()=>{const t=a; setA(b); setB(t);}}>Intercambiar</button>
</div>
</div>
</div>
</div>
);
}