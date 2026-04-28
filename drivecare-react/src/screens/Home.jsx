import React from 'react';

export default function Home() {
  React.useEffect(() => {
    window.vsRender?.();
  }, []);

  return (
    <>
      <div className="screen active" id="home" >
<nav className="top-nav">
<div className="logo" onClick={() => window.goHome?.()}><div className="logo-icon">🚗</div>DRIVE<em>CARE</em></div>
<div className="nav-r">
<button className="npill" onClick={() => window.showTab?.('userHistory')}>History</button>
<div className="av" id="homeAv" onClick={() => window.showTab?.('userProfile')}>?</div>
</div>
</nav>
<div className="sb">
<div className="hero">
<div className="htag">3 mechanics nearby</div>
<div className="h-title">NEED A<br/><em>FIX?</em></div>
<div className="h-sub">Mechanic at your location in 20–25 min. Anywhere on the road.</div>
</div>
<div className="loc-bar" id="locBar" onClick={() => window.requestGPS?.()}>
<div >📍</div>
<div >
<div >Your location</div>
<div id="locText" >Tap to detect location</div>
</div>
<div >›</div>
</div>
{/*  Two-column on desktop: wizard left, mechanics right  */}
<div className="home-cols">
<div>
{/*  Vehicle selection wizard renders here  */}
<div id="vsWizard"></div>
</div>
{/*  Mechanics (shown after all steps complete)  */}
<div id="mechSection" style={{display: "none"}}>
<div className="slbl">Nearby mechanics</div>
<div className="mech-list">
<div className="mc" onClick={() => window.goBook?.('Ramesh Kumar','🧰','#1e293b','1.2 km','8','4.9','DC-M-001')}>
<div className="ma" >🧰<div className="ma-dot"></div></div>
<div className="mi"><div className="mn">Ramesh Kumar</div><div className="mm"><span className="stars-d">★★★★★</span>4.9<span className="mdot"></span>182 jobs</div></div>
<div className="mr"><div className="mrd">1.2 km</div><div className="mre">~8 min</div></div>
</div>
<div className="mc" onClick={() => window.goBook?.('Suresh Auto Works','🔑','#1c1917','2.1 km','14','4.7','DC-M-002')}>
<div className="ma" >🔑<div className="ma-dot"></div></div>
<div className="mi"><div className="mn">Suresh Auto Works</div><div className="mm"><span className="stars-d">★★★★☆</span>4.7<span className="mdot"></span>94 jobs</div></div>
<div className="mr"><div className="mrd">2.1 km</div><div className="mre">~14 min</div></div>
</div>
<div className="mc" onClick={() => window.goBook?.('Manoj Garage','🛠️','#1a1a2e','2.8 km','19','4.8','DC-M-003')}>
<div className="ma" >🛠️<div className="ma-dot"></div></div>
<div className="mi"><div className="mn">Manoj Garage</div><div className="mm"><span className="stars-d">★★★★★</span>4.8<span className="mdot"></span>311 jobs</div></div>
<div className="mr"><div className="mrd">2.8 km</div><div className="mre">~19 min</div></div>
</div>
</div>
</div>
</div>
<div ></div>
</div>
<div className="cta-bar">
<button className="btn vs-cta-locked" id="homeBookBtn" onClick={() => window.vsRequestNearest?.()}>🔧 REQUEST NEAREST MECHANIC</button>
</div>
</div>
    </>
  );
}
