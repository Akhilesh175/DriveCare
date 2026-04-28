import React from 'react';

export default function Booking() {
  React.useEffect(() => {
    window._restoreBookingUI?.();
  }, []);

  return (
    <>
      <div className="screen active" id="booking" >
<nav className="top-nav">
<div className="logo" onClick={() => window.goHome?.()}><div className="logo-icon">🚗</div>DRIVE<em>CARE</em></div>
<div className="nav-r"><div className="av" id="bookAv">?</div></div>
</nav>
<div className="sb">
<div className="sb-pad-top">
<button className="bk-btn" onClick={() => window.showScreen?.('home')}>← Back to Home</button>

<div className="vs-step-label" style={{marginTop: "20px"}}>Mechanic</div>
<div className="sel-mech">
<div className="sm-av" id="b-av" >🧰</div>
<div>
<div id="b-name" style={{fontSize: "16px", fontWeight: "600"}}>Ramesh Kumar</div>
<div style={{fontSize: "12px", color: "var(--tx3)", marginTop: "2px"}}><span className="stars-d" style={{color: "var(--org)"}}>★★★★★</span> <span id="b-rating">4.9</span> · Verified</div>
<div style={{fontSize: "10px", color: "var(--grn)", fontWeight: "700", marginTop: "4px"}}>● ONLINE</div>
<div id="b-mechid" style={{fontSize: "10px", color: "var(--tx3)", marginTop: "2px"}}>ID: DC-M-001</div>
</div>
</div>

<div className="vs-step-label">Job summary</div>
<div className="vs-summary-list">
<div className="vs-summary-card"><div className="vs-br-ic">📍</div><div className="vs-br-info"><div className="vs-br-lbl">Location</div><div className="vs-br-val" id="b-loc">Detecting…</div></div></div>
<div className="vs-summary-card"><div className="vs-br-ic" id="b-svc-ic">🔩</div><div className="vs-br-info"><div className="vs-br-lbl">Service / Problem</div><div className="vs-br-val" id="b-svc">Puncture</div></div></div>
<div className="vs-summary-card"><div className="vs-br-ic" id="b-veh-ic">🚗</div><div className="vs-br-info"><div className="vs-br-lbl">Vehicle</div><div className="vs-br-val" id="b-veh">Car · Nexon</div></div></div>
<div className="vs-summary-card" id="b-brand-row" style={{display: "none"}}><div className="vs-br-ic">🏭</div><div className="vs-br-info"><div className="vs-br-lbl">Brand · Model</div><div className="vs-br-val" id="b-brand-model">Tata Nexon</div></div></div>
<div className="vs-summary-card"><div className="vs-br-ic">⏱️</div><div className="vs-br-info"><div className="vs-br-lbl">ETA</div><div className="vs-br-val" id="b-eta">~8 min</div></div><div className="vs-br-price" id="b-dist" style={{fontSize: "12px", color: "var(--acc)"}}>1.2 km</div></div>
</div>

<div className="vs-step-label">When would you like to pay?</div>
<div className="pay-timing-row">
<div className="pt-opt sel-now" id="ptNow" onClick={() => window.selPayTiming?.('now')}><div className="pt-ic">💳</div><span className="pt-lbl">Pay Now</span><span className="pt-sub">At booking</span></div>
<div className="pt-opt" id="ptAfter" onClick={() => window.selPayTiming?.('after')}><div className="pt-ic">🕐</div><span className="pt-lbl">Pay After</span><span className="pt-sub">After service done</span></div>
</div>

<div id="payNowSection">
  <div className="vs-step-label">Payment method</div>
  <div className="pay-methods">
    <div className="pay-opt sel" id="payUpi" onClick={() => window.selPay?.('upi')}>
      <div className="po-ic" style={{background: "rgba(255,255,255,.05)"}}>💳</div>
      <div className="po-info">
        <div className="po-name">UPI / Cards / NetBanking</div>
        <div className="po-sub">Pay securely via Razorpay</div>
      </div>
      <div className="po-radio"><div className="po-chk"></div></div>
    </div>
    <div className="pay-opt" id="payQr" onClick={() => window.selPay?.('qr')}>
      <div className="po-ic" style={{background: "var(--agl)"}}>📲</div>
      <div className="po-info">
        <div className="po-name">Scan QR Code</div>
        <div className="po-sub">Pay via any UPI app</div>
      </div>
      <div className="po-radio"><div className="po-chk"></div></div>
    </div>
  </div>

  {/* Dedicated QR Display (shown when QR selected) */}
  <div id="qrCodeDisplay" style={{display: "none", textAlign: "center", marginTop: "16px", padding: "20px", background: "var(--bg3)", borderRadius: "var(--r)", border: "1px solid var(--b)"}}>
    <div style={{fontSize: "12px", color: "var(--tx3)", marginBottom: "12px", textTransform: "uppercase", letterSpacing: "1px"}}>Scan to Pay</div>
    <img src="/QR_Code.jpeg" alt="Payment QR" style={{width: "180px", height: "180px", margin: "0 auto", borderRadius: "12px", border: "4px solid #fff"}} />
    <div style={{marginTop: "12px", fontSize: "11px", color: "var(--tx2)"}}>Once paid, click Confirm below</div>
  </div>
</div>

<div id="payAfterSection" style={{display: "none"}}>
<div className="pay-later-note">🕐 <span>Payment will be collected <strong>after the mechanic completes</strong> the service. You'll choose your payment method at that point.</span></div>
</div>

<div className="pay-breakdown">
<div className="pb-title">Payment breakdown</div>
<div className="pb-row"><span className="pb-lbl">Service total</span><span className="pb-val" id="b-price" >₹199</span></div>
<div className="pb-sub-row"><span className="pb-sub-lbl">Platform commission (20%)</span><span className="pb-sub-val neg" id="commAmt" >-₹40</span></div>
<div className="pb-sub-row"><span className="pb-sub-lbl">Mechanic earns</span><span className="pb-sub-val pos" id="mechEarnAmt" >₹159</span></div>
</div>
</div>
</div>
<div className="cta-bar"><button className="btn" id="bookingConfirmBtn" onClick={() => window.confirmBooking?.()}>✓ CONFIRM &amp; REQUEST</button></div>
</div>
    </>
  );
}
