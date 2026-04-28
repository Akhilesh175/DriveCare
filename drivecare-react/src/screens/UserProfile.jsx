import React from 'react';

export default function UserProfile() {
  React.useEffect(() => {
    window.renderUserProfile?.();
  }, []);

  return (
    <>
      <div className="screen active" id="userProfile" >
<nav className="top-nav"><div className="logo" onClick={() => window.goHome?.()}><div className="logo-icon">🚗</div>DRIVE<em>CARE</em></div></nav>
<div className="sb">
<div className="p-hero"><div className="p-av" id="profAv">?</div><div className="p-name" id="profName">—</div><div className="phone-edit-trigger" onClick={() => window.openChangePhone?.()} title="Tap to change phone number"><div className="p-phone" id="profPhone">—</div><div className="phone-edit-icon">✏️</div></div><div className="p-role-badge" >👤 User</div><div className="p-id" id="profUserId">ID: —</div></div>
<div className="p-stats"><div className="pstat"><div className="pstat-v" id="pJobs">0</div><div className="pstat-l">Jobs</div></div><div className="pstat"><div className="pstat-v" id="pRating">—</div><div className="pstat-l">Rating</div></div><div className="pstat"><div className="pstat-v" id="pSpend">₹0</div><div className="pstat-l">Spent</div></div></div>
<div className="menu-item" onClick={() => window.showTab?.('userHistory')}><div className="menu-ic">📋</div><div >Service History</div><div >›</div></div>

<div className="menu-item" onClick={() => window.showTab?.('userPrivacy')}><div className="menu-ic">🛡️</div><div >Privacy &amp; Safety</div><div >›</div></div>
<div className="menu-item" onClick={() => window.showTab?.('userHelp')}><div className="menu-ic">❓</div><div >Help &amp; Support</div><div >›</div></div>
<div className="menu-item" onClick={() => window.doLogout?.()}><div className="menu-ic">🚪</div><div >Logout</div><div >›</div></div>
<div ></div>
</div>

</div>
    </>
  );
}
