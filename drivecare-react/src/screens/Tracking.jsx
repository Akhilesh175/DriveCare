import React from 'react';

export default function Tracking() {
  React.useEffect(() => {
    window._restoreTrackingUI?.();
    window.initTrackingCanvas?.();
    window.startTracking?.();
    window.updateMarkCompleteBtn?.();
    window.startSvcCompletePoller?.();
  }, []);

  return (
    <>
      <div className="screen active" id="tracking" >
<nav className="top-nav">
<div className="logo" onClick={() => window.goHome?.()}><div className="logo-icon">🚗</div>DRIVE<em>CARE</em></div>
<div className="nav-r"><button className="npill" onClick={() => window.openCall?.()}>📞 Call</button></div>
</nav>
<div className="sb">
<div className="map-wrapper">
<canvas id="trackCanvas"></canvas>
<div className="no-signal" id="noSignalBanner">⚠ GPS lost — Dead Reckoning active</div>
</div>
<div className="trk-bar">
<div className="trk-mode"><div className="trk-dot ws" id="trkDot"></div><span className="trk-mode-lbl" id="trkModeLbl">WebSocket · Live GPS</span></div>
<div className="trk-coords" id="trkCoord">Lat:27.6038 Lng:77.6000</div>
<div className="trk-eta-top" id="trkEtaLbl">03 min</div>
</div>
<div className="gps-panel">
<div className="gps-row"><span>Mode</span><span className="gps-val" id="gpsModeVal">WebSocket</span></div>
<div className="gps-row"><span>Signal</span><span className="gps-val" id="gpsSignalVal">Strong</span></div>
<div className="gps-row"><span>Speed</span><span className="gps-val" id="gpsSpeedVal">25 km/h</span></div>
<div className="gps-row"><span>Updates</span><span className="gps-val" id="gpsUpdatesVal">7</span></div>
<div className="gps-row"><span>Accuracy</span><span className="gps-val" id="gpsAccVal">±15m</span></div>
</div>

<div className="eta-focus">
<div id="etaNum">03</div>
<div className="eta-sub">minutes away</div>
</div>

<div className="steps">
<div className="step active"><div className="step-d done">✓</div><div className="step-l">Requested</div></div><div className="step-line done"></div>
<div className="step active"><div className="step-d done">✓</div><div className="step-l">Accepted</div></div><div className="step-line done"></div>
<div className="step active"><div className="step-d now">→</div><div className="step-l">On way</div></div><div className="step-line"></div>
<div className="step"><div className="step-d">✦</div><div className="step-l">Arrived</div></div><div className="step-line"></div>
<div className="step"><div className="step-d">★</div><div className="step-l">Done</div></div>
</div>

<div className="act-row">
<button className="act-btn" onClick={() => window.openCall?.()}><span className="abi">📞</span><span className="abl">Call</span></button>
<button className="act-btn" onClick={() => window.openChat?.()}><span className="abi">💬</span><span className="abl">Chat</span></button>
<button className="act-btn" onClick={() => window.openOv?.('shareOv')}><span className="abi">📤</span><span className="abl">Share</span></button>
<button className="act-btn danger" onClick={() => window.openOv?.('cancelOv')}><span className="abi">✕</span><span className="abl">Cancel</span></button>
</div>

<div className="trk-svc-card">
<div className="trk-svc-ic" id="trkSvcIc">🔩</div>
<div className="trk-svc-info">
<div className="trk-svc-lbl">Service</div>
<div className="trk-svc-val" id="trkSvc">Puncture · Tata Nexon · Car</div>
</div>
<div className="trk-svc-price" id="trkPrice">₹199</div>
</div>

<div className="trk-svc-card" style={{marginTop: "-4px"}}>
<div className="trk-svc-ic">📍</div>
<div className="trk-svc-info">
<div className="trk-svc-lbl">Your location</div>
<div className="trk-svc-val" id="trkUserLoc">Lat: 27.6038 · Lng: 77.6000</div>
</div>
</div>

<div id="postPayPanel" style={{display: "none"}}></div>

<div id="otpTrackerPanel">
<div className="mark-locked" id="mechCompleteStatus">
<span className="lock-ic">🔒</span>
<div className="lock-txt"><strong>Waiting for mechanic to complete</strong>The mechanic must mark the service as complete before you can proceed.</div>
</div>

<div className="cta-bar">
<button className="btn-grn" disabled id="markCompleteBtn" onClick={() => window.finishJob?.()} style={{background: "var(--grn)", color: "#fff", opacity: "0.8"}}>⏳ WAITING FOR MECHANIC…</button>
</div>
</div>
</div>
</div>
    </>
  );
}
