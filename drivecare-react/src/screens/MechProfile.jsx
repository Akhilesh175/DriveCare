import React from 'react';

export default function MechProfile() {
  React.useEffect(() => {
    window.renderMechProfile?.();
  }, []);

  return (
    <>
      <div className="screen active" id="mechProfile" >
<nav className="top-nav"><div className="logo" onClick={() => window.goHome?.()}><div className="logo-icon">🚗</div>DRIVE<em>CARE</em></div></nav>
<div className="sb">
<div className="p-hero"><div className="p-av" id="mechProfAv">?</div><div className="p-name" id="mechProfName">—</div><div className="phone-edit-trigger" onClick={() => window.openChangePhone?.()} title="Tap to change phone number"><div className="p-phone" id="mechProfPhone">—</div><div className="phone-edit-icon">✏️</div></div><div className="p-role-badge" >🔧 Mechanic</div><div className="p-id" id="mechProfId">ID: —</div></div>
<div className="p-stats"><div className="pstat"><div className="pstat-v" id="mpJobs">0</div><div className="pstat-l">Jobs</div></div><div className="pstat"><div className="pstat-v" id="mpRating">—</div><div className="pstat-l">Rating</div></div><div className="pstat"><div className="pstat-v" id="mpEarned">₹0</div><div className="pstat-l">Earned</div></div></div>
<div className="cblk" >
<div className="crow"><div className="ci">🏪</div><div className="cl"><div className="lb">Shop name</div><div className="vl" id="mpShop">—</div></div></div>
<div className="crow"><div className="ci">⚙️</div><div className="cl"><div className="lb">Specialization</div><div className="vl" id="mpSpec">—</div></div></div>
<div className="crow"><div className="ci">🚘</div><div className="cl"><div className="lb">Preferred brands</div><div id="mpBrands" ></div></div></div>
<div className="crow"><div className="ci">🏦</div><div className="cl"><div className="lb">Bank (for payouts)</div><div className="vl" id="mpBank">—</div></div></div>
</div>
<div className="menu-item" onClick={() => window.showMechTab?.('history')}><div className="menu-ic">📋</div><div >Service History</div><div >›</div></div>
<div className="menu-item" onClick={() => window.showMechTab?.('earnings')}><div className="menu-ic">💰</div><div >Earnings &amp; Payout</div><div >›</div></div>
<div className="menu-item" onClick={() => window.showTab?.('mechPrivacy')}><div className="menu-ic">🛡️</div><div >Privacy &amp; Safety</div><div >›</div></div>
<div className="menu-item" onClick={() => window.showTab?.('mechHelp')}><div className="menu-ic">❓</div><div >Help &amp; Support</div><div >›</div></div>
<div className="menu-item" onClick={() => window.doLogout?.()}><div className="menu-ic">🚪</div><div >Logout</div><div >›</div></div>
<div ></div>
</div>
</div>
    </>
  );
}
