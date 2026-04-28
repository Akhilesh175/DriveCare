import React, { useEffect, useState } from 'react';

export default function Auth() {
  const [authTab, setAuthTab] = useState('login');

  useEffect(() => {
    window.__dc_setAuthTab = setAuthTab;
    return () => {
      if (window.__dc_setAuthTab === setAuthTab) delete window.__dc_setAuthTab;
    };
  }, []);

  const goTab = (t) => {
    setAuthTab(t);
    window.switchAuthTab?.(t);
  };

  return (
    <>
      <div className="screen active" id="auth" >
<div className="sb">
<div className="auth-wrap">
<div className="auth-logo">DRIVE<em>CARE</em></div>
<div className="auth-sub">Mechanic on demand · Anywhere on the road</div>
<div className="auth-tabs">
<div className={`auth-tab ${authTab === 'login' ? 'active' : ''}`} onClick={() => goTab('login')}>Login</div>
<div className={`auth-tab ${authTab === 'register' ? 'active' : ''}`} onClick={() => goTab('register')}>Register</div>
</div>
{/*  LOGIN  */}
<div className={`auth-panel auth-form ${authTab === 'login' ? 'active' : ''}`} id="loginPanel">
<div className="phone-note">📱 Enter your registered mobile number. No auto-fill for security.</div>
<div className="field">
<label>Your mobile number</label>
<input autoComplete="off" id="loginPhone" maxLength="16" onInput={(e) => window.fmtPhone?.(e.target)} placeholder="Enter 10-digit mobile number" type="tel"/>
<div className="etx" id="loginPhErr">Enter a valid 10-digit Indian mobile number (starts with 6–9)</div>
</div>
<button className="btn" id="loginOtpBtn" onClick={() => window.sendLoginOtp?.()} >📱 SEND OTP</button>
<div id="loginOtpWrap" style={{display: "none"}}>
<div id="loginOtpMsg" ></div>
<div className="otp-row">
<input className="otp-box" id="lo0" maxLength="1" onInput={(e) => window.on?.(e.target,0,'lo')} onKeyDown={(e) => window.ob?.(e,0,'lo')} type="tel"/>
<input className="otp-box" id="lo1" maxLength="1" onInput={(e) => window.on?.(e.target,1,'lo')} onKeyDown={(e) => window.ob?.(e,1,'lo')} type="tel"/>
<input className="otp-box" id="lo2" maxLength="1" onInput={(e) => window.on?.(e.target,2,'lo')} onKeyDown={(e) => window.ob?.(e,2,'lo')} type="tel"/>
<input className="otp-box" id="lo3" maxLength="1" onInput={(e) => window.on?.(e.target,3,'lo')} onKeyDown={(e) => window.ob?.(e,3,'lo')} type="tel"/>
</div>
<div className="etx" id="loginOtpErr">Incorrect OTP. Please try again.</div>
<button className="btn" onClick={() => window.verifyLoginOtp?.()} >✓ VERIFY &amp; LOGIN</button>
<div >
            Didn't receive it? <span onClick={() => window.resendOtp?.()} >Resend OTP</span>
</div>
</div>
<div >
<div ></div>
<span >or</span>
<div ></div>
</div>
<button className="btn-o" onClick={() => window.demoLogin?.('user')} >🚗 Demo User (for testing)</button>
<button className="btn-o" onClick={() => window.demoLogin?.('mechanic')} >🔧 Demo Mechanic (for testing)</button>
</div>
{/*  REGISTER  */}
<div className={`auth-panel auth-form ${authTab === 'register' ? 'active' : ''}`} id="registerPanel">
<div className="slbl" >I am registering as a:</div>
<div className="role-row">
<div className="role-card" id="roleUser" onClick={() => window.selRole?.('user')}>
<div className="role-ic">👤</div>
<div className="role-name">User</div>
<div className="role-sub">I need a mechanic</div>
</div>
<div className="role-card" id="roleMech" onClick={() => window.selRole?.('mechanic')}>
<div className="role-ic">🔧</div>
<div className="role-name">Mechanic</div>
<div className="role-sub">I provide service</div>
</div>
</div>
<div id="regRoleErr" >Please select a role to continue</div>
<div className="field">
<label>Full Name</label>
<input autoComplete="off" id="regName" placeholder="Your full name" type="text"/>
<div className="etx" id="regNameErr">Full name is required</div>
</div>
<div className="phone-note">📱 Enter your own valid mobile number. Used for OTP and your account.</div>
<div className="field">
<label>Your mobile number</label>
<input autoComplete="off" id="regPhone" maxLength="16" onInput={(e) => window.fmtPhone?.(e.target)} placeholder="Enter 10-digit mobile number" type="tel"/>
<div className="phone-hint">Format: +91XXXXXXXXXX (starting with 6, 7, 8, or 9)</div>
<div className="etx" id="regPhErr">Enter a valid 10-digit Indian mobile number</div>
</div>
{/*  Mechanic-specific fields (shown only when role = mechanic)  */}
<div id="mechFields" style={{display: "none"}}>
<div className="field">
<label>Shop / Garage Name</label>
<input id="shopName" placeholder="Your garage name" type="text"/>
</div>
<div className="field">
<label>Specialization</label>
<select id="specialization">
<option value="">Select specialization</option>
<option>All vehicle types</option>
<option>Bikes &amp; Scooters</option>
<option>Cars &amp; SUVs</option>
<option>Trucks &amp; Heavy vehicles</option>
<option>Tractors &amp; Farm equipment</option>
</select>
</div>
<div className="field">
<label>Experience (years)</label>
<input id="experience" max="50" min="0" placeholder="Years of experience" type="number"/>
</div>
{/*  Preferred Vehicle Brands  */}
<div >
<div >🚘 Preferred Vehicle Brands</div>
<div >Select the brands you prefer to service. Requests will be matched to your preferences.</div>
<div id="brandPickerGrid" ></div>
<div id="brandPickErr" >Please select at least one brand.</div>
</div>
{/*  Bank Details  */}
<div >
<div >🏦 Bank Details (required for payouts)</div>
<div className="field" >
<label>Bank Account Number</label>
<input id="bankAcc" onInput={(e) => { e.target.value = e.target.value.replace(/\D/g,'').slice(0,18); window.validateBank?.(); }} placeholder="9–18 digit account number" type="text"/>
<div className="etx" id="bankAccErr">Enter valid account number (9–18 digits)</div>
</div>
<div className="field" >
<label>Confirm Account Number</label>
<input id="bankAccConf" onInput={(e) => { e.target.value = e.target.value.replace(/\D/g,'').slice(0,18); window.validateBank?.(); }} placeholder="Re-enter account number" type="text"/>
<div className="etx" id="bankAccConfErr">Account numbers do not match</div>
</div>
<div className="field" >
<label>IFSC Code</label>
<input id="bankIfsc" onInput={(e) => { e.target.value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g,'').slice(0,11); window.validateBank?.(); }} placeholder="e.g. SBIN0001234" type="text"/>
<div className="etx" id="bankIfscErr">Enter valid IFSC (format: XXXX0XXXXXX)</div>
</div>
<div id="bankStatusEl" style={{display: "none"}}></div>
</div>
</div>{/*  /mechFields  */}
<div className="field">
<label>City</label>
<input id="regCity" placeholder="Your city" type="text"/>
</div>
<button className="btn" id="regOtpBtn" onClick={() => window.sendRegOtp?.()} >📱 SEND OTP</button>
<div id="regOtpWrap" style={{display: "none"}}>
<div id="regOtpMsg" ></div>
<div className="otp-row">
<input className="otp-box" id="ro0" maxLength="1" onInput={(e) => window.on?.(e.target,0,'ro')} onKeyDown={(e) => window.ob?.(e,0,'ro')} type="tel"/>
<input className="otp-box" id="ro1" maxLength="1" onInput={(e) => window.on?.(e.target,1,'ro')} onKeyDown={(e) => window.ob?.(e,1,'ro')} type="tel"/>
<input className="otp-box" id="ro2" maxLength="1" onInput={(e) => window.on?.(e.target,2,'ro')} onKeyDown={(e) => window.ob?.(e,2,'ro')} type="tel"/>
<input className="otp-box" id="ro3" maxLength="1" onInput={(e) => window.on?.(e.target,3,'ro')} onKeyDown={(e) => window.ob?.(e,3,'ro')} type="tel"/>
</div>
<div className="etx" id="regOtpErr">Incorrect OTP.</div>
<button className="btn" onClick={() => window.verifyRegOtp?.()}>✓ CREATE ACCOUNT</button>
</div>
<div >
<div ></div>
<span >or</span>
<div ></div>
</div>
<button className="btn-o" onClick={() => window.demoLogin?.('user')} >🚗 Demo User (Skip)</button>
<button className="btn-o" onClick={() => window.demoLogin?.('mechanic')} >🔧 Demo Mechanic (Skip)</button>
<div ></div>
</div>{/*  /registerPanel  */}
<div className="admin-access-section">
<div className="admin-access-label">Staff Access</div>
<button className="btn-admin-link" onClick={() => window.showScreen?.('adminLogin')} >🛡️ Admin Portal</button>
</div>
</div>{/*  /auth-wrap  */}
</div>{/*  /sb  */}
</div>
    </>
  );
}
