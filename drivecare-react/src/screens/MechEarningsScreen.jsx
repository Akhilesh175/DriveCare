import React from 'react';

export default function MechEarningsScreen() {
  React.useEffect(() => {
    window.renderMechEarnings?.();
  }, []);

  return (
    <>
      <div className="screen active" id="mechEarningsScreen" >
<nav className="top-nav"><div className="logo" onClick={() => window.goHome?.()}><div className="logo-icon">🚗</div>DRIVE<em>CARE</em></div></nav>
<div className="sb sb-pad-top">
<div className="wallet-hero"><div className="wh-label">Available earnings</div><div className="wh-bal" id="mechWalBal">₹0</div><div className="wh-sub">After 20% platform commission</div></div>
<div className="commission-info"><div className="ci-row"><span className="ci-label">Gross earnings (all time)</span><span className="ci-val" id="mechGross">₹0</span></div><div className="ci-row"><span className="ci-label">Commission (20%)</span><span className="ci-val org" id="mechComm">-₹0</span></div><div className="ci-row"><span className="ci-label">Net payable</span><span className="ci-val grn" id="mechNet">₹0</span></div><div className="ci-row" ><span className="ci-label">Paid out</span><span className="ci-val" id="mechPaidOut">₹0</span></div></div>
<button className="btn-grn" onClick={() => window.openPayoutModal?.()} >🏦 REQUEST PAYOUT</button>
<div className="slbl">Payout history</div><div id="payoutList"></div>
<div className="slbl" >Earnings breakdown</div><div id="mechEarnTxns"></div>
<div ></div>
</div>
</div>
    </>
  );
}
