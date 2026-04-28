import React from 'react';

export default function UserHistory() {
  React.useEffect(() => {
    window.renderUserHistory?.();
  }, []);

  return (
    <>
      <div className="screen active" id="userHistory" >
<nav className="top-nav"><div className="logo" onClick={() => window.goHome?.()}><div className="logo-icon">🚗</div>DRIVE<em>CARE</em></div><div className="nav-r"><div className="av" id="uhAv">?</div></div></nav>
<div className="sb sb-pad-top"><div className="slbl">Service history</div><div id="userHistList"></div></div>

</div>
    </>
  );
}
