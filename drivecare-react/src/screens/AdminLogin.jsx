import React from 'react';

export default function AdminLogin() {
  return (
    <>
      <div className="screen active" id="adminLogin" >
<div className="sb" >
<div className="admin-login-wrap">
<div >
<div className="admin-badge">🔐 Restricted Access</div>
<div className="admin-login-title">ADMIN<br/><em>PORTAL</em></div>
<div className="admin-login-sub">DriveCare Control Center · Authorized personnel only</div>
</div>
<div className="admin-security-note">
<span>🛡️</span>
<span>This portal is restricted to authorized administrators only. All login attempts are logged and monitored.</span>
</div>
<div className="admin-field">
<label>Admin Username</label>
<input autoComplete="off" id="adminUser" placeholder="Enter admin username" type="text"/>
<div className="admin-err" id="adminUserErr">Username is required</div>
</div>
<div className="admin-field">
<label>Admin Password</label>
<input autoComplete="off" id="adminPass" onKeyDown={(e) => { if (e.key === 'Enter') window.adminLogin?.(); }} placeholder="Enter admin password" type="password"/>
<div className="admin-err" id="adminPassErr">Password is required</div>
</div>
<div className="admin-err" id="adminLoginErr" >Invalid credentials. Access denied.</div>
<button className="btn-admin" onClick={() => window.adminLogin?.()}>🔐 SECURE LOGIN</button>
<div className="admin-back-link" onClick={() => window.showScreen?.('auth')}>← Back to DriveCare App</div>
<div >
<div >Demo Credentials</div>
<div >Username: <span >admin</span>  |  Password: <span >admin123</span></div>
</div>
</div>
</div>
</div>
    </>
  );
}
