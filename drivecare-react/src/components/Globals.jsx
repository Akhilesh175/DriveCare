import React from 'react';

export function Sidebar() {
  return (
    <>
      <nav id="sidebar">
        <div className="sidebar-logo" onClick={() => window.goHome?.()}>
          <div className="logo-icon">🚗</div>
          DRIVE<em>CARE</em>
        </div>

        <div className="snav-section">
          {/* User nav items */}
          <div id="snav-user" style={{display: "none"}}>
            <div className="snav-sep">Main Menu</div>
            <button className="snav-item active" id="snav-home" onClick={() => window.showTab?.('home')}> <span className="sni">🏠</span><span className="snl">Dashboard</span></button>
            <button className="snav-item" id="snav-history" onClick={() => window.showTab?.('userHistory')}><span className="sni">📋</span><span className="snl">Service History</span></button>
            <button className="snav-item" id="snav-profile" onClick={() => window.showTab?.('userProfile')}><span className="sni">👤</span><span className="snl">My Profile</span></button>
            
            <div className="snav-sep">Support</div>
            <button className="snav-item" id="snav-privacy" onClick={() => window.showTab?.('userPrivacy')}><span className="sni">🛡️</span><span className="snl">Privacy &amp; Safety</span></button>
            <button className="snav-item" id="snav-help" onClick={() => window.showTab?.('userHelp')}> <span className="sni">❓</span><span className="snl">Help Center</span></button>
          </div>

          {/* Mechanic nav items */}
          <div id="snav-mech" style={{display: "none"}}>
            <div className="snav-sep">Mechanic Console</div>
            <button className="snav-item active" id="snav-mdash" onClick={() => window.showMechTab?.('home')}> <span className="sni">📊</span><span className="snl">Analytics</span></button>
            <button className="snav-item" id="snav-msvc" onClick={() => window.showMechTab?.('svcComplete')}> <span className="sni">✅</span><span className="snl">Active Service</span></button>
            <button className="snav-item" id="snav-mhist" onClick={() => window.showMechTab?.('history')}> <span className="sni">📋</span><span className="snl">History</span></button>
            <button className="snav-item" id="snav-mearn" onClick={() => window.showMechTab?.('earnings')}> <span className="sni">💰</span><span className="snl">Earnings</span></button>
            <button className="snav-item" id="snav-mprofile" onClick={() => window.showTab?.('mechProfile')}> <span className="sni">👤</span><span className="snl">Profile Settings</span></button>
          </div>
        </div>

        <div className="snav-avatar" id="snavAvatar">
          <div className="av" id="sidebarAv">?</div>
          <div className="snav-avatar-info">
            <div className="snav-avatar-name" id="sidebarName">Loading...</div>
            <div className="snav-avatar-role" id="sidebarRole">User</div>
          </div>
          <button className="snav-logout" onClick={() => window.doLogout?.()} title="Logout">🚪</button>
        </div>
      </nav>
    </>
  );
}

export function BottomNav({ activeTab }) {
  return (
    <div className="bnav">
      <button className={`bni ${activeTab === 'home' ? 'active' : ''}`} onClick={() => window.showTab?.('home')}>
        <span className="bi">🏠</span><span className="bl">Home</span>
      </button>
      <button className={`bni ${activeTab === 'history' ? 'active' : ''}`} onClick={() => window.showTab?.('userHistory')}>
        <span className="bi">📋</span><span className="bl">History</span>
      </button>
      <button className={`bni ${activeTab === 'profile' ? 'active' : ''}`} onClick={() => window.showTab?.('userProfile')}>
        <span className="bi">👤</span><span className="bl">Profile</span>
      </button>
    </div>
  );
}

export function GlobalModals() {
  return (
    <>
      <div aria-live="polite" id="toast" role="status"></div><div aria-label="Phone call" aria-modal="true" id="callModal" role="dialog">
<div className="call-card">
<div className="call-av" id="callEmoji">🔧</div>
<div className="call-name" id="callName">Mechanic</div>
<div className="call-status" id="callStatus">● Calling...</div>
<div className="call-acts">
<div className="cact" onClick={() => window.doHangup?.()}>
<div className="cact-btn" >📵</div>
<div className="cact-lbl">End</div>
</div>
<div className="cact" onClick={() => window.togMute?.()}>
<div className="cact-btn" id="muteBtn" >🔇</div>
<div className="cact-lbl" id="muteLbl">Mute</div>
</div>
<div className="cact" onClick={() => window.togSpk?.()}>
<div className="cact-btn" id="spkBtn" >🔊</div>
<div className="cact-lbl">Speaker</div>
</div>
</div>
</div>
</div><div aria-label="Chat with mechanic" aria-modal="true" id="chatModal" role="dialog">
<div className="chat-nav">
<button className="bk-btn" onClick={() => window.closeChat?.()}>← Back</button>
<div id="chatTitle" >Mechanic</div>
<button className="npill" onClick={() => { window.closeChat?.(); window.openCall?.(); }}>📞</button>
</div>
<div className="chat-body" id="chatBody">
<div className="msg them">Hello! Request received. On my way! 🚀<span className="msg-time">Just now</span></div>
</div>
<div className="chat-ir">
<input className="chat-in" id="chatIn" onKeyDown={(e) => { if(e.key==='Enter') window.sendMsg?.(); }} placeholder="Type a message…"/>
<button className="chat-send" onClick={() => window.sendMsg?.()}>➤</button>
</div>
</div><div className="ov" id="cancelOv">
<div className="sheet">
<div className="hdl"></div>
<div >Cancel Request?</div>
<div >Are you sure? The mechanic is on the way.</div>
<button className="btn-red" onClick={() => window.doCancel?.()}>YES, CANCEL</button>
<button className="btn-o" onClick={() => window.closeOv?.('cancelOv')}>No, Keep</button>
</div>
</div><div className="ov" id="shareOv">
<div className="sheet">
<div className="hdl"></div>
<div >Share Location</div>
<div id="shareLinkTxt" >https://drivecare.app/track/DC8821</div>
<div >
<button onClick={() => window.doShareWhatsApp?.()} >📱 WhatsApp</button>
<button onClick={() => window.copyTrackLink?.()} >📋 Copy</button>
</div>
<button className="btn-o" onClick={() => window.closeOv?.('shareOv')}>Close</button>
</div>
</div>



<div className="ov" id="payoutModal">
<div className="sheet">
<div className="hdl"></div>
<div >Request Payout</div>
<div className="po-summary"><div className="po-row"><span>Available</span><span id="poAvail">₹0</span></div><div className="po-row"><span>Account</span><span id="poBank">Not set</span></div></div>
<div className="field"><label>Amount to withdraw (₹)</label><input id="payoutAmt" placeholder="Min ₹100" type="number"/></div>
<div className="p-later-note">Funds will be credited to your verified bank account within 24 hours.</div>
<button className="btn-grn" onClick={() => window.requestPayout?.()}>CONFIRM WITHDRAWAL</button>
<button className="btn-o" onClick={() => window.closeOv?.('payoutModal')}>Cancel</button>
</div>
</div>
<div className="ov" id="changePhoneOv">
<div className="sheet">
<div className="hdl"></div>
<div id="cpStep1">
<div >Update Phone Number</div>
<div className="field"><label>New mobile number</label><input id="cpNewPhone" maxLength="16" onInput={(e) => window.fmtPhone?.(e.target)} placeholder="10-digit number" type="tel"/><div className="etx" id="cpPhErr"></div></div>
<button className="btn" onClick={() => window.cpSendOtp?.()}>SEND OTP</button>
</div>
<div id="cpStep2" style={{display: "none"}}>
<div >Verify New Number</div>
<div className="otp-row">
<input className="otp-box" id="cp0" maxLength="1" onInput={(e) => window.on?.(e.target,0,'cp')} onKeyDown={(e) => window.ob?.(e,0,'cp')} type="tel"/>
<input className="otp-box" id="cp1" maxLength="1" onInput={(e) => window.on?.(e.target,1,'cp')} onKeyDown={(e) => window.ob?.(e,1,'cp')} type="tel"/>
<input className="otp-box" id="cp2" maxLength="1" onInput={(e) => window.on?.(e.target,2,'cp')} onKeyDown={(e) => window.ob?.(e,2,'cp')} type="tel"/>
<input className="otp-box" id="cp3" maxLength="1" onInput={(e) => window.on?.(e.target,3,'cp')} onKeyDown={(e) => window.ob?.(e,3,'cp')} type="tel"/>
</div>
<div className="etx" id="cpOtpErr">Incorrect OTP</div>
<button className="btn" onClick={() => window.cpVerifyOtp?.()}>VERIFY &amp; UPDATE</button>
<div className="p-later-note" onClick={() => window.cpResendOtp?.()}>Didn't receive? Resend OTP</div>
<button className="btn-o" onClick={() => window.cpBack?.()}>Back</button>
</div>
<button className="btn-o" onClick={() => window.closeOv?.('changePhoneOv')} style={{marginTop: "10px"}}>Cancel</button>
</div>
</div>
{/*  Admin Modals  */}
<div className="ov" id="adminDetailModal">
<div className="sheet admin-sheet">
<div className="hdl"></div>
<div className="admin-modal-top"><div className="ad-av" id="adModalAv">?</div><div className="ad-info"><div className="ad-name" id="adModalName">—</div><div className="ad-role" id="adModalRole">—</div></div><button className="ad-close" onClick={() => window.closeAdminModal?.('adminDetailModal')}>✕</button></div>
<div className="ad-modal-body" id="adModalBody"></div>
</div>
</div>
<div className="ov" id="assignMechModal">
<div className="sheet admin-sheet">
<div className="hdl"></div>
<div className="admin-modal-top"><div >Assign Mechanic</div><button className="ad-close" onClick={() => window.closeAdminModal?.('assignMechModal')}>✕</button></div>
<div id="assignMechList" style={{maxHeight: "350px", overflowY: "auto"}}></div>
<button className="btn" onClick={() => window.confirmAssign?.()} style={{marginTop: "15px"}}>CONFIRM ASSIGNMENT</button>
</div>
</div>
    </>
  );
}

export function IntegrityModals() {
  return (
    <div className="ov" id="integrityReconOv">
      <div className="sheet">
        <div className="hdl"></div>
        <div id="reconTitle" className="slbl" style={{textAlign: "center", fontSize: "18px", marginBottom: "5px"}}>Financial Reconciliation</div>
        <div id="reconJobId" style={{textAlign: "center", fontSize: "12px", color: "var(--tx3)", marginBottom: "20px"}}>Job ID: —</div>
        <div className="recon-grid">
          <div className="recon-card">
            <div className="recon-title">User Paid</div>
            <div className="recon-val" id="reconUserPaid">₹0</div>
            <div className="recon-sub">Method: UPI / Razorpay</div>
          </div>
          <div className="recon-card">
            <div className="recon-title">Mech Earned</div>
            <div className="recon-val" id="reconMechEarned">₹0</div>
            <div className="recon-sub">Bank: xxxx1234</div>
          </div>
        </div>
        <div className="recon-total-bar">
          <div className="rtb-label">Platform Commission (20%)</div>
          <div className="rtb-val" id="reconComm">₹0</div>
        </div>
        <button className="btn" onClick={() => window.closeOv?.('integrityReconOv')} style={{marginTop: "20px"}}>✓ VERIFIED OK</button>
      </div>
    </div>
  );
}

export function MechBottomNav({ activeTab }) {
  return (
    <div className="bnav">
      <button className={`bni ${activeTab === 'home' ? 'active' : ''}`} onClick={() => window.showMechTab?.('home')}>
        <span className="bi">🏠</span><span className="bl">Dashboard</span>
      </button>
      <button className={`bni ${activeTab === 'service' ? 'active' : ''}`} onClick={() => window.showMechTab?.('svcComplete')}>
        <span className="bi">✅</span><span className="bl">Service</span>
      </button>
      <button className={`bni ${activeTab === 'history' ? 'active' : ''}`} onClick={() => window.showMechTab?.('history')}>
        <span className="bi">📋</span><span className="bl">History</span>
      </button>
      <button className={`bni ${activeTab === 'earnings' ? 'active' : ''}`} onClick={() => window.showMechTab?.('earnings')}>
        <span className="bi">💰</span><span className="bl">Earnings</span>
      </button>
      <button className={`bni ${activeTab === 'profile' ? 'active' : ''}`} onClick={() => window.showTab?.('mechProfile')}>
        <span className="bi">👤</span><span className="bl">Profile</span>
      </button>
      <button className="bni" onClick={() => window.doLogout?.()}>
        <span className="bi">🚪</span><span className="bl">Logout</span>
      </button>
    </div>
  );
}
