import React from 'react';

export default function MechSvcComplete() {
  React.useEffect(() => {
    window.renderMechSvcComplete?.();
  }, []);

  return (
    <>
      <div className="screen active" id="mechSvcComplete" >
<nav className="top-nav"><div className="logo" onClick={() => window.goHome?.()}><div className="logo-icon">🚗</div>DRIVE<em>CARE</em></div><div className="nav-r"><div className="av" id="mechSvcAv">?</div></div></nav>
<div className="sb sb-pad-top">
<div className="slbl">Active service</div>
<div id="mechSvcCompleteBody"></div>
</div>
</div>
    </>
  );
}
