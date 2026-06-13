import { useState, useEffect, useRef } from 'react';
import { Timer, Play, Pause, RotateCcw, Settings, Check, X } from 'lucide-react';

interface Session { id:string; type:'focus'|'break'; duration:number; completedAt:number; }
const SK='wt_sessions_v1';
const ld=():Session[]=>{try{return JSON.parse(localStorage.getItem(SK)||'[]')}catch{return[]}};
const C='#3b82f6';

export default function App() {
  const [sessions,setSessions]=useState<Session[]>(ld);
  const [mode,setMode]=useState<'focus'|'break'>('focus');
  const [running,setRunning]=useState(false);
  const [elapsed,setElapsed]=useState(0);
  const [showSettings,setShowSettings]=useState(false);
  const [focusMins,setFocusMins]=useState(25);
  const [breakMins,setBreakMins]=useState(5);
  const [cycles,setCycles]=useState(0);
  const intervalRef=useRef<ReturnType<typeof setInterval>|null>(null);

  const totalSecs=(mode==='focus'?focusMins:breakMins)*60;
  const remaining=totalSecs-elapsed;
  const progress=elapsed/totalSecs;
  const mins=Math.floor(remaining/60).toString().padStart(2,'0');
  const secs=(remaining%60).toString().padStart(2,'0');

  useEffect(()=>{
    if(running){
      intervalRef.current=setInterval(()=>{
        setElapsed(e=>{
          if(e>=totalSecs-1){
            setRunning(false);
            const s:Session={id:crypto.randomUUID(),type:mode,duration:totalSecs,completedAt:Date.now()};
            setSessions(prev=>{const u=[s,...prev];localStorage.setItem(SK,JSON.stringify(u));return u;});
            if(mode==='focus')setCycles(c=>c+1);
            setMode(m=>m==='focus'?'break':'focus');
            setElapsed(0);
            return 0;
          }
          return e+1;
        });
      },1000);
    } else if(intervalRef.current) clearInterval(intervalRef.current);
    return ()=>{if(intervalRef.current)clearInterval(intervalRef.current)};
  },[running,totalSecs,mode]);

  const todaySessions=sessions.filter(s=>new Date(s.completedAt).toDateString()===new Date().toDateString());
  const todayFocus=todaySessions.filter(s=>s.type==='focus');
  const totalFocusMins=Math.round(todayFocus.reduce((a,s)=>a+s.duration,0)/60);

  const circumference=2*Math.PI*80;
  const dashOffset=circumference*(1-progress);

  return (
    <div style={{minHeight:'100vh',background:'#060810',display:'flex',flexDirection:'column',alignItems:'center'}}>
      <header style={{width:'100%',padding:'16px 20px',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
        <div style={{display:'flex',alignItems:'center',gap:'10px'}}>
          <div style={{width:'36px',height:'36px',borderRadius:'10px',background:`linear-gradient(135deg,${C},#2563eb)`,display:'flex',alignItems:'center',justifyContent:'center',boxShadow:`0 4px 14px ${C}30`}}><Timer size={16} color="white"/></div>
          <div style={{fontWeight:'700',fontSize:'16px',color:'white'}}>WorkTimer Pro</div>
        </div>
        <button onClick={()=>setShowSettings(!showSettings)} style={{padding:'7px',borderRadius:'7px',background:'none',border:'none',cursor:'pointer',color:`${C}60`}}><Settings size={16}/></button>
      </header>

      {showSettings&&(
        <div style={{width:'100%',maxWidth:'360px',background:'#0e1220',border:`1px solid ${C}20`,borderRadius:'16px',padding:'20px',margin:'0 20px 20px',display:'flex',flexDirection:'column',gap:'12px'}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
            <span style={{color:'white',fontSize:'14px',fontWeight:'600'}}>Settings</span>
            <button onClick={()=>setShowSettings(false)} style={{background:'none',border:'none',cursor:'pointer',color:`${C}60`}}><X size={14}/></button>
          </div>
          {[['Focus (min)',focusMins,(v:number)=>setFocusMins(v)],['Break (min)',breakMins,(v:number)=>setBreakMins(v)]].map(([label,val,setter])=>(
            <div key={label as string} style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
              <span style={{color:'#94a3b8',fontSize:'13px'}}>{label as string}</span>
              <div style={{display:'flex',alignItems:'center',gap:'10px'}}>
                <button onClick={()=>(setter as Function)(Math.max(1,(val as number)-5))} style={{width:'28px',height:'28px',borderRadius:'50%',background:`${C}15`,border:`1px solid ${C}30`,color:C,cursor:'pointer',fontSize:'16px'}}>-</button>
                <span style={{color:'white',fontSize:'14px',fontWeight:'600',minWidth:'24px',textAlign:'center'}}>{val as number}</span>
                <button onClick={()=>(setter as Function)((val as number)+5)} style={{width:'28px',height:'28px',borderRadius:'50%',background:`${C}15`,border:`1px solid ${C}30`,color:C,cursor:'pointer',fontSize:'16px'}}>+</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Mode tabs */}
      <div style={{display:'flex',gap:'6px',marginBottom:'32px',padding:'4px',background:'#0e1220',borderRadius:'12px',border:`1px solid ${C}20`}}>
        {(['focus','break'] as const).map(m=><button key={m} onClick={()=>{setMode(m);setElapsed(0);setRunning(false);}}
          style={{padding:'8px 20px',borderRadius:'9px',background:mode===m?C:'transparent',border:'none',color:mode===m?'white':'#94a3b8',fontSize:'13px',fontWeight:'600',cursor:'pointer',fontFamily:'Inter',textTransform:'capitalize',transition:'all 0.2s'}}>{m}</button>)}
      </div>

      {/* Timer circle */}
      <div style={{position:'relative',width:'200px',height:'200px',marginBottom:'32px'}}>
        <svg width="200" height="200" style={{transform:'rotate(-90deg)'}}>
          <circle cx="100" cy="100" r="80" fill="none" stroke={`${C}15`} strokeWidth="10"/>
          <circle cx="100" cy="100" r="80" fill="none" stroke={C} strokeWidth="10"
            strokeDasharray={circumference} strokeDashoffset={dashOffset} strokeLinecap="round" style={{transition:'stroke-dashoffset 1s linear'}}/>
        </svg>
        <div style={{position:'absolute',inset:0,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center'}}>
          <div style={{fontSize:'48px',fontWeight:'700',color:'white',fontFamily:'Inter',letterSpacing:'-2px'}}>{mins}:{secs}</div>
          <div style={{fontSize:'12px',color:`${C}80`,textTransform:'capitalize'}}>{mode} time</div>
        </div>
      </div>

      {/* Controls */}
      <div style={{display:'flex',gap:'12px',marginBottom:'32px'}}>
        <button onClick={()=>{setElapsed(0);setRunning(false);}} style={{width:'48px',height:'48px',borderRadius:'50%',background:`${C}15`,border:`1px solid ${C}30`,color:C,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center'}}>
          <RotateCcw size={18}/>
        </button>
        <button onClick={()=>setRunning(!running)} style={{width:'72px',height:'72px',borderRadius:'50%',background:running?`${C}30`:C,border:running?`2px solid ${C}`:'none',color:'white',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',boxShadow:running?'none':`0 8px 24px ${C}40`,transition:'all 0.2s'}}>
          {running?<Pause size={28}/>:<Play size={28}/>}
        </button>
        <div style={{width:'48px',height:'48px',borderRadius:'50%',background:`${C}15`,border:`1px solid ${C}30`,display:'flex',alignItems:'center',justifyContent:'center'}}>
          <span style={{color:C,fontSize:'16px',fontWeight:'700'}}>{cycles}</span>
        </div>
      </div>

      {/* Stats */}
      <div style={{width:'100%',maxWidth:'360px',padding:'0 20px'}}>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:'10px',marginBottom:'20px'}}>
          {[['Today','focus','sessions',todayFocus.length],[' ','focus','minutes',totalFocusMins],['Streak','any','cycles',cycles]].map(([l,_t,unit,val])=>(
            <div key={String(l)+String(unit)} style={{background:'#0e1220',border:`1px solid ${C}15`,borderRadius:'12px',padding:'12px',textAlign:'center'}}>
              <div style={{fontSize:'22px',fontWeight:'700',color:C}}>{String(val)}</div>
              <div style={{fontSize:'10px',color:'#475569',marginTop:'2px'}}>{String(unit)}</div>
            </div>
          ))}
        </div>
        {todaySessions.length>0&&(
          <div style={{background:'#0e1220',border:`1px solid ${C}15`,borderRadius:'12px',padding:'14px'}}>
            <div style={{fontSize:'11px',color:'#475569',fontWeight:'600',marginBottom:'10px',textTransform:'uppercase',letterSpacing:'0.08em'}}>Today</div>
            <div style={{display:'flex',flexDirection:'column',gap:'6px'}}>
              {todaySessions.slice(0,4).map(s=>(
                <div key={s.id} style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                  <div style={{display:'flex',alignItems:'center',gap:'7px'}}>
                    <div style={{width:'6px',height:'6px',borderRadius:'50%',background:s.type==='focus'?C:'#10b981'}}/>
                    <span style={{fontSize:'12px',color:'#94a3b8',textTransform:'capitalize'}}>{s.type}</span>
                  </div>
                  <span style={{fontSize:'12px',color:'#475569'}}>{Math.round(s.duration/60)}m · {new Date(s.completedAt).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}