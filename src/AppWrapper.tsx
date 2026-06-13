import { useState } from 'react'
import SplashScreen from './components/SplashScreen'
import Onboarding from './components/Onboarding'
import App from './App'

const DONE_KEY = 'worktimer-pro_onboarded_v1'
type Phase = 'splash' | 'onboard' | 'app'

export default function AppWrapper() {
  const [phase, setPhase] = useState<Phase>('splash')
  const features = ["Customizable Pomodoro cycles", "Deep work session tracker", "Daily focus stats", "White noise toggle"]
  return (
    <>
      {phase === 'splash' && <SplashScreen onDone={()=>setPhase(localStorage.getItem(DONE_KEY)?'app':'onboard')} color1="#3b82f6" color2="#2563eb" emoji="⏱️" name="WorkTimer Pro" tagline="Pomodoro and deep work session manager"/>}
      {phase === 'onboard' && <Onboarding onDone={()=>{localStorage.setItem(DONE_KEY,'1');setPhase('app')}} color1="#3b82f6" emoji="⏱️" name="WorkTimer Pro" features={features}/>}
      {phase === 'app' && <App/>}
    </>
  )
}