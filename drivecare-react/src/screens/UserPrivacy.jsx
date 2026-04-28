import React from 'react';

export default function UserPrivacy() {
  return (
    <>
      <div className="screen active" id="userPrivacy" >
<nav className="top-nav"><div className="logo" onClick={() => window.goHome?.()}><div className="logo-icon">🚗</div>DRIVE<em>CARE</em></div></nav>
<div className="sb">
<div className="p-header"><button className="bk-btn" onClick={() => window.showTab?.('userProfile')}>← Back</button><div className="p-title">Privacy & Safety</div></div>
<div className="cblk" style={{marginTop: "20px"}}>
<div className="toggle-row"><div className="toggle-info"><div className="toggle-title">Location Access</div><div className="toggle-sub">Allow app to access GPS for service requests</div></div><div className="priv-sw on" onClick={(e) => window.togSw?.(e.currentTarget)}></div></div>
<div className="toggle-row"><div className="toggle-info"><div className="toggle-title">Share Live Location</div><div className="toggle-sub">Share location with mechanic during active service</div></div><div className="priv-sw on" onClick={(e) => window.togSw?.(e.currentTarget)}></div></div>
<div className="toggle-row"><div className="toggle-info"><div className="toggle-title">Personalized Offers</div><div className="toggle-sub">Use service history for relevant offers</div></div><div className="priv-sw on" onClick={(e) => window.togSw?.(e.currentTarget)}></div></div>
<div className="toggle-row"><div className="toggle-info"><div className="toggle-title">Analytics Data</div><div className="toggle-sub">Help improve DriveCare with usage data</div></div><div className="priv-sw" onClick={(e) => window.togSw?.(e.currentTarget)}></div></div>
</div>
<div className="slbl">Safety Center</div>
<div className="cblk">
<div className="crow" onClick={() => window.toast?.('🆘 SOS — Calling 112 now!')}><div className="ci">🆘</div><div className="cl"><div className="lb">Emergency SOS</div><div className="vl">Call 112 instantly</div></div><div className="p-arr">›</div></div>
<div className="crow" onClick={() => window.toast?.('👥 Manage trusted contacts')}><div className="ci">👥</div><div className="cl"><div className="lb">Trusted contacts</div><div className="vl">Add emergency contacts</div></div><div className="p-arr">›</div></div>
<div className="crow" onClick={() => window.toast?.('🚩 Report submitted. Thank you.')}><div className="ci">🚩</div><div className="cl"><div className="lb">Report mechanic</div><div className="vl">Report inappropriate behavior</div></div><div className="p-arr">›</div></div>
</div>
<div style={{height: "40px"}}></div>
</div>

</div>
    </>
  );
}
