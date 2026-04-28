import React from 'react';

export default function AdminPortal() {
  return (
    <>
      <div className="screen active" id="adminPortal" >
{/*  Top bar  */}
<div className="admin-topbar">
<div className="admin-topbar-logo" onClick={() => window.adminTab?.('dashboard')}  title="Go to Admin Dashboard">
<div className="logo-icon" >🛡️</div>
      DRIVE<em >CARE</em>
</div>
<div className="admin-topbar-badge">ADMIN</div>
<div className="admin-topbar-r">
<div id="adminTopbarUser" style={{color: "var(--tx3)", fontSize: "11px", fontWeight: "600", letterSpacing: "0.5px"}}>Super Admin</div>
<button className="btn-admin-logout" onClick={() => window.adminLogout?.()}>Logout</button>
</div>
</div>
{/*  Tab nav  */}
<div className="admin-tab-nav" id="adminTabNav">
<button className="admin-tab-btn active" onClick={() => window.adminTab?.('dashboard')}>📊 Dashboard</button>
<button className="admin-tab-btn" onClick={() => window.adminTab?.('users')}>👤 Users <span className="atb-badge" id="atbUsers">0</span></button>
<button className="admin-tab-btn" onClick={() => window.adminTab?.('mechanics')}>🔧 Mechanics <span className="atb-badge" id="atbMechs">0</span></button>
<button className="admin-tab-btn" onClick={() => window.adminTab?.('services')}>📋 Services</button>
<button className="admin-tab-btn" onClick={() => window.adminTab?.('payments')}>💰 Payments</button>
<button className="admin-tab-btn" onClick={() => window.adminTab?.('notifications')}>📢 Notify</button>
<button className="admin-tab-btn" onClick={() => window.adminTab?.('pricing')}>🏷️ Pricing</button>
<button className="admin-tab-btn" onClick={() => window.adminTab?.('logs')}>📜 Logs</button>
<button className="admin-tab-btn" onClick={() => window.adminTab?.('integrity')}>🛡️ Integrity</button>
</div>
{/*  Scrollable body  */}
<div className="sb" id="adminBody">
{/*  ── DASHBOARD ──  */}
<div className="admin-panel active" id="apDashboard">
<div className="admin-stats-grid" id="adminStatsGrid">
<div className="admin-stat-card blue">
<div className="asc-ic">👤</div>
<div className="asc-val" id="statTotalUsers">0</div>
<div className="asc-lbl">Total Users</div>
<div className="asc-chg" id="statUsersChg">+0 this week</div>
</div>
<div className="admin-stat-card orange">
<div className="asc-ic">🔧</div>
<div className="asc-val" id="statTotalMechs">0</div>
<div className="asc-lbl">Mechanics</div>
<div className="asc-chg" id="statMechsChg">+0 this week</div>
</div>
<div className="admin-stat-card green">
<div className="asc-ic">✅</div>
<div className="asc-val" id="statCompleted">0</div>
<div className="asc-lbl">Completed</div>
<div className="asc-chg">All time</div>
</div>
<div className="admin-stat-card red">
<div className="asc-ic">💰</div>
<div className="asc-val" id="statRevenue">₹0</div>
<div className="asc-lbl">Revenue</div>
<div className="asc-chg">Platform commission</div>
</div>
</div>
{/*  Charts row  */}
<div className="admin-chart-row">
<div className="admin-chart-card">
<div className="admin-chart-title">Services by Type</div>
<div className="mini-bar-wrap" id="chartSvcType"></div>
</div>
<div className="admin-chart-card">
<div className="admin-chart-title">Activity (7 days)</div>
<div className="mini-bar-wrap" id="chartActivity"></div>
</div>
</div>
{/*  Recent requests  */}
<div className="admin-section-hd">
<div className="admin-section-title">Recent Service Requests</div>
</div>
<div id="dashRecentRequests"></div>
{/*  Online mechanics  */}
<div className="admin-section-hd" >
<div className="admin-section-title">Online Mechanics Now</div>
<div className="admin-section-count" id="onlineMechCount" >0 online</div>
</div>
<div id="dashOnlineMechs"></div>
</div>
{/*  ── USERS ──  */}
<div className="admin-panel" id="apUsers">
<div className="admin-filter-bar">
<input className="admin-search" id="userSearch" onInput={() => window.renderAdminUsers?.()} placeholder="🔍 Search users by name or phone…"/>
<select className="admin-filter-select" id="userStatusFilter" onChange={() => window.renderAdminUsers?.()}>
<option value="all">All Status</option>
<option value="active">Active</option>
<option value="blocked">Blocked</option>
</select>
</div>
<div className="admin-section-hd">
<div className="admin-section-title">Registered Users</div>
<div className="admin-section-count" id="userCount">0 users</div>
</div>
<div id="adminUsersList"></div>
</div>
{/*  ── MECHANICS ──  */}
<div className="admin-panel" id="apMechanics">
<div className="admin-filter-bar">
<input className="admin-search" id="mechSearch" onInput={() => window.renderAdminMechs?.()} placeholder="🔍 Search mechanics by name, ID, shop…"/>
<select className="admin-filter-select" id="mechStatusFilter" onChange={() => window.renderAdminMechs?.()}>
<option value="all">All Status</option>
<option value="active">Active</option>
<option value="blocked">Blocked</option>
<option value="offline">Offline</option>
</select>
</div>
<div className="admin-section-hd">
<div className="admin-section-title">Registered Mechanics</div>
<div className="admin-section-count" id="mechCount">0 mechanics</div>
</div>
<div id="adminMechsList"></div>
</div>
{/*  ── SERVICES ──  */}
<div className="admin-panel" id="apServices">
<div className="admin-filter-bar">
<input className="admin-search" id="svcSearch" onInput={() => window.renderAdminServices?.()} placeholder="🔍 Search service requests…"/>
<select className="admin-filter-select" id="svcStatusFilter" onChange={() => window.renderAdminServices?.()}>
<option value="all">All Status</option>
<option value="pending">Pending</option>
<option value="inprogress">In Progress</option>
<option value="done">Completed</option>
<option value="cancelled">Cancelled</option>
<option value="declined">Declined</option>
</select>
</div>
<div className="admin-section-hd">
<div className="admin-section-title">All Service Requests</div>
<div className="admin-section-count" id="svcCount">0 requests</div>
</div>
<div id="adminSvcList"></div>
</div>
{/*  ── PAYMENTS ──  */}
<div className="admin-panel" id="apPayments">
{/*  Summary  */}
<div className="admin-stats-grid" >
<div className="admin-stat-card green">
<div className="asc-ic">💳</div>
<div className="asc-val" id="payTotalGross">₹0</div>
<div className="asc-lbl">Gross Revenue</div>
</div>
<div className="admin-stat-card red">
<div className="asc-ic">🏦</div>
<div className="asc-val" id="payTotalComm">₹0</div>
<div className="asc-lbl">Commission (20%)</div>
</div>
<div className="admin-stat-card orange">
<div className="asc-ic">📤</div>
<div className="asc-val" id="payTotalPaid">₹0</div>
<div className="asc-lbl">Paid Out</div>
</div>
</div>
<div className="admin-section-hd">
<div className="admin-section-title">All Transactions</div>
<div className="admin-section-count" id="txnCount">0 transactions</div>
</div>
<div >
<div id="adminTxnList"></div>
</div>
</div>
{/*  ── NOTIFICATIONS ──  */}
<div className="admin-panel" id="apNotifications">
<div className="notif-composer">
<div className="admin-section-title" >Compose Notification</div>
<div >Send to:</div>
<div className="notif-target-row">
<button className="notif-target-btn sel" id="ntAll" onClick={() => window.selNotifTarget?.('all')}>📢 All</button>
<button className="notif-target-btn" id="ntUsers" onClick={() => window.selNotifTarget?.('users')}>👤 Users</button>
<button className="notif-target-btn" id="ntMechs" onClick={() => window.selNotifTarget?.('mechs')}>🔧 Mechanics</button>
<button className="notif-target-btn" id="ntSingle" onClick={() => window.selNotifTarget?.('single')}>👤 One Person</button>
</div>
<div id="notifSingleWrap" >
<input className="admin-search" id="notifSinglePhone" placeholder="Enter phone number (+91XXXXXXXXXX)" />
</div>
<div >Notification type:</div>
<div className="notif-target-row" >
<button className="notif-target-btn sel" id="ntTypeInfo" onClick={() => window.selNotifType?.('info')}>ℹ️ Info</button>
<button className="notif-target-btn" id="ntTypeAlert" onClick={() => window.selNotifType?.('alert')}>⚠️ Alert</button>
<button className="notif-target-btn" id="ntTypeOffer" onClick={() => window.selNotifType?.('offer')}>🎁 Offer</button>
<button className="notif-target-btn" id="ntTypeUpdate" onClick={() => window.selNotifType?.('update')}>🔄 Update</button>
</div>
<textarea className="notif-textarea" id="notifMsg" placeholder="Type your notification message here…" rows="4"></textarea>
<button className="btn-admin" onClick={() => window.sendAdminNotif?.()} >📤 SEND NOTIFICATION</button>
</div>
<div className="admin-section-hd">
<div className="admin-section-title">Notification History</div>
</div>
<div id="notifHistory"></div>
</div>
{/*  ── PRICING ──  */}
<div className="admin-panel" id="apPricing">
<div >
        ⚠️ Changes to pricing affect all future service requests. Current active requests are unaffected.
      </div>
<div className="admin-section-hd">
<div className="admin-section-title">Service Pricing (₹)</div>
<button className="admin-btn approve" onClick={() => window.savePricing?.()} >✓ Save Changes</button>
</div>
<div >
<div id="pricingEditor"></div>
</div>
<div className="admin-section-hd">
<div className="admin-section-title">Platform Commission</div>
</div>
<div className="admin-pricing-card">
  <div className="apc-info">
    <div className="apc-title">Commission Rate</div>
    <div className="apc-sub">Percentage taken from each service payment</div>
  </div>
  <div className="apc-input-wrap">
    <input className="admin-search" id="commRateInput" max="50" min="0" style={{width: "60px", textAlign: "center"}} type="number" defaultValue="20"/>
    <span style={{fontSize: "12px", color: "var(--tx3)", fontWeight: "600"}}>%</span>
  </div>
</div>
</div>
{/*  ── LOGS ──  */}
<div className="admin-panel" id="apLogs">
<div className="admin-filter-bar">
<select className="admin-filter-select" id="logTypeFilter" onChange={() => window.renderAdminLogs?.()} >
<option value="all">All Activity</option>
<option value="login">Logins</option>
<option value="service">Service Requests</option>
<option value="payment">Payments</option>
<option value="admin">Admin Actions</option>
</select>
<button className="admin-btn view" onClick={() => window.clearAdminLogs?.()} >🗑 Clear</button>
</div>
<div className="admin-section-hd">
<div className="admin-section-title">Activity Log</div>
<div className="admin-section-count" id="logCount">0 entries</div>
</div>
<div className="admin-section-body">
  <div id="adminLogList"></div>
</div>
</div>
{/*  ── INTEGRITY ──  */}
<div className="admin-panel" id="apIntegrity">
  <div className="admin-stats-grid">
    <div className="admin-stat-card orange">
      <div className="asc-ic">🚩</div>
      <div className="asc-val" id="statGpsMismatch">0</div>
      <div className="asc-lbl">GPS Mismatches</div>
    </div>
    <div className="admin-stat-card red">
      <div className="asc-ic">⚠️</div>
      <div className="asc-val" id="statStateConflicts">0</div>
      <div className="asc-lbl">State Conflicts</div>
    </div>
    <div className="admin-stat-card blue">
      <div className="asc-ic">💸</div>
      <div className="asc-val" id="statFinancialAlerts">0</div>
      <div className="asc-lbl">Financial Alerts</div>
    </div>
  </div>
  <div className="admin-section-hd">
    <div className="admin-section-title">System Integrity Oversight</div>
  </div>
  <div className="integrity-table-wrap">
    <table className="integrity-table">
      <thead>
        <tr>
          <th>Job ID</th>
          <th>User Data</th>
          <th>Mechanic Data</th>
          <th>Integrity</th>
          <th>Status</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody id="adminIntegrityList"></tbody>
    </table>
  </div>
  <div className="admin-section-hd" style={{marginTop: "30px"}}>
    <div className="admin-section-title">God-View: Live Correlation Map</div>
  </div>
  <div className="god-map-wrap">
    <div id="godMapView" className="god-map-placeholder">Initializing Global Controller Map...</div>
    <div className="map-legend">
      <div className="leg-item"><span className="leg-ic user">📍</span> User</div>
      <div className="leg-item"><span className="leg-ic mech">🔧</span> Mechanic</div>
    </div>
  </div>
</div>
</div>{/*  /sb  */}
</div>
</>
);
}
