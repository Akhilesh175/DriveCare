import React from 'react';

export default function UserHelp() {
  return (
    <>
      <div className="screen active" id="userHelp" >
<nav className="top-nav"><div className="logo" onClick={() => window.goHome?.()}><div className="logo-icon">🚗</div>DRIVE<em>CARE</em></div></nav>
<div className="sb">
<div className="p-header"><button className="bk-btn" onClick={() => window.showTab?.('userProfile')}>← Back</button><div className="p-title">Help & Support</div></div>
<div className="help-hero">
<div className="hh-ic">❓</div>
<div className="hh-title">How can we help?</div>
<div className="hh-sub">Search our FAQs or contact our 24/7 support team for assistance.</div>
</div>
<div className="help-grid">
<button className="help-card" onClick={() => window.toast?.('📞 1800-DRIVECARE (Toll-free)')} ><div className="hc-ic">📞</div><div className="hc-lbl">Call Support</div></button>
<button className="help-card whatsapp" onClick={() => window.openHelpWhatsApp?.()} ><div className="hc-ic">📱</div><div className="hc-lbl">WhatsApp</div></button>
</div>
<div className="slbl">Common Questions</div>
<div className="faq-list">

<div className="faq-item" onClick={(e) => window.togFaq?.(e.currentTarget)}><div className="faq-q">How does real-time tracking work?</div><div className="faq-a-ic">▾</div></div>

</div>
<div style={{height: "40px"}}></div>
</div>

</div>
    </>
  );
}
