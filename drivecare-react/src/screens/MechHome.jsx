import React from 'react';

export default function MechHome() {
  React.useEffect(() => {
    window.refreshMechDash?.();
  }, []);

  return (
    <>
      <div className="screen active" id="mechHome" >
<nav className="top-nav"><div className="logo" onClick={() => window.goHome?.()}><div className="logo-icon">🚗</div>DRIVE<em>CARE</em></div><div className="nav-r"><div className="av" id="mechHomeAv" onClick={() => window.showTab?.('mechProfile')}>?</div></div></nav>
<div className="sb sb-pad-top">
<div className="mech-id-bar">
  <div>
    <div className="slbl" style={{marginBottom: "2px", fontSize: "9px"}}>Mechanic ID</div>
    <div id="mechIdDisplay">DC-M-001</div>
  </div>
  <div className="sw-wrap">
    <span id="mechStatusLbl" style={{color: "var(--grn)"}}>Online</span>
    <div className="sw on" id="mechSw" onClick={() => window.togMechOnline?.()}></div>
  </div>
</div>

<div className="stats-grid">
  <div className="stat-card">
    <div className="stat-v" id="mechDayEarn">₹0</div>
    <div className="stat-l">Today</div>
  </div>
  <div className="stat-card">
    <div className="stat-v" id="mechTotalJobs">2</div>
    <div className="stat-l">Total Jobs</div>
  </div>
  <div className="stat-card">
    <div className="stat-v" id="mechRatingDisp">—</div>
    <div className="stat-l">Rating</div>
  </div>
</div>

<div className="vs-step-label">Incoming requests</div>
<div id="mechReqList"></div>
<div style={{height: "80px"}}></div>
</div>
</div>
    </>
  );
}
