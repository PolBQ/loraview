import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";


export default function TrackReplay(){
const [playing, setPlaying] = useState(false);
const [t, setT] = useState(0);
const path = useMemo(()=>[
{x:10, y:70, rssi:-70}, {x:60,y:60,rssi:-78}, {x:110,y:52,rssi:-85}, {x:160,y:48,rssi:-92},
{x:210,y:52,rssi:-95}, {x:260,y:63,rssi:-88}, {x:300,y:80,rssi:-75}
],[]);


const intervalRef = useRef(null);
useEffect(()=>{
if(playing){
intervalRef.current = setInterval(()=> setT(prev => (prev+1)%path.length), 700);
} else if(intervalRef.current){
clearInterval(intervalRef.current);
}
return ()=> intervalRef.current && clearInterval(intervalRef.current);
},[playing, path.length]);


const p = path[t];
const color = p.rssi>-80?"var(--ok)": p.rssi>-95?"var(--warn)":"var(--bad)";


return (
<div>
<div className="d-flex gap-2 mb-2">
<button className={`btn btn-sm ${playing?'btn-outline-light':'btn-light'}`} onClick={()=>setPlaying(v=>!v)}>
{playing? 'Pausar':'Reproducir'} recorrido
</button>
<button className="btn btn-sm btn-outline-secondary" onClick={()=>setT(0)}>Reiniciar</button>
</div>


<svg viewBox="0 0 320 120" width="100%" height="140">
<polyline points={path.map(p=>`${p.x},${p.y}`).join(' ')} fill="none" stroke="rgba(255,255,255,.2)" strokeWidth="2"/>
<AnimatePresence>
<motion.circle key={t} cx={p.x} cy={p.y} r="6" fill={color}
initial={{scale:0}} animate={{scale:1}} exit={{scale:0}} transition={{type:'spring'}}/>
</AnimatePresence>
</svg>
<div style={{color:"var(--muted)"}}>RSSI actual: <b style={{color:"var(--ink)"}}>{p.rssi} dBm</b></div>
</div>
);
}