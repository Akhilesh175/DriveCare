import React from 'react';

export default function MechHelp() {
  return (
    <>
      <div className="screen active" id="mechHelp" >
<nav className="top-nav"><div className="logo" onClick={() => window.goHome?.()}><div className="logo-icon">🚗</div>DRIVE<em>CARE</em></div></nav>
<div className="sb">
<div className="p-header"><button className="bk-btn" onClick={() => window.showTab?.('mechProfile')}>← Back</button><div className="p-title">Help & Support</div></div>
<div className="help-hero">
<div className="hh-ic">🔧</div>
<div className="hh-title">Mechanic Partner Support</div>
<div className="hh-sub">We're here to help you grow your business and solve technical issues.</div>
</div>
<div className="help-grid">
<button className="help-card" onClick={() => window.toast?.('📞 1800-MECHANIC-HELP')} ><div className="hc-ic">📞</div><div className="hc-lbl">Mechanic Support</div></button>
<button className="help-card whatsapp" onClick={() => window.openMechHelpWhatsApp?.()} ><div className="hc-ic">📱</div><div className="hc-lbl">WhatsApp</div></button>
</div>
<div className="slbl">Frequently Asked Questions</div>
<div className="faq-list">
<div className="faq-item" onClick={(e) => window.togFaq?.(e.currentTarget)}><div className="faq-q">How is commission calculated?</div><div className="faq-a-ic">▾</div></div>
<div className="faq-item" onClick={(e) => window.togFaq?.(e.currentTarget)}><div className="faq-q">How do I request a payout?</div><div className="faq-a-ic">▾</div></div>
<div className="faq-item" onClick={(e) => window.togFaq?.(e.currentTarget)}><div className="faq-q">What happens when I decline a request?</div><div className="faq-a-ic">▾</div></div>
</div>
<div style={{height: "40px"}}></div>
</div>
</div>
    </>
  );
}
