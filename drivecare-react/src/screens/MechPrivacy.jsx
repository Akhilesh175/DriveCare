import React from 'react';

export default function MechPrivacy() {
  return (
    <>
      <div className="screen active" id="mechPrivacy" >
<nav className="top-nav"><div className="logo" onClick={() => window.goHome?.()}><div className="logo-icon">🚗</div>DRIVE<em>CARE</em></div></nav>
<div className="sb">
<div className="p-header"><button className="bk-btn" onClick={() => window.showTab?.('mechProfile')}>← Back</button><div className="p-title">Privacy & Safety</div></div>
<div className="cblk" style={{marginTop: "20px"}}>
<div className="toggle-row"><div className="toggle-info"><div className="toggle-title">Location Sharing</div><div className="toggle-sub">Share live location with users during active jobs</div></div><div className="priv-sw on" onClick={(e) => window.togSw?.(e.currentTarget)}></div></div>
<div className="toggle-row"><div className="toggle-info"><div className="toggle-title">Online Status Visibility</div><div className="toggle-sub">Let users see when you are online</div></div><div className="priv-sw on" onClick={(e) => window.togSw?.(e.currentTarget)}></div></div>
<div className="toggle-row"><div className="toggle-info"><div className="toggle-title">Profile Visibility</div><div className="toggle-sub">Show your name, rating and shop to users</div></div><div className="priv-sw on" onClick={(e) => window.togSw?.(e.currentTarget)}></div></div>
</div>
<div className="slbl">Safety Tools</div>
<div className="cblk">
<div className="crow" onClick={() => window.toast?.('🆘 SOS — Calling 112')}><div className="ci">🆘</div><div className="cl"><div className="lb">Emergency SOS</div><div className="vl">Call 112 instantly</div></div><div className="p-arr">›</div></div>
<div className="crow" onClick={() => window.toast?.('📋 Incident report submitted')}><div className="ci">📋</div><div className="cl"><div className="lb">Report incident</div><div className="vl">Report safety concerns</div></div><div className="p-arr">›</div></div>
</div>
<div style={{height: "40px"}}></div>
</div>
</div>
    </>
  );
}
