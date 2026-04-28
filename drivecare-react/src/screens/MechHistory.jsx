import React from 'react';

export default function MechHistory() {
  React.useEffect(() => {
    window.renderMechHistory?.();
  }, []);

  return (
    <>
      <div className="screen active" id="mechHistory" >
<nav className="top-nav"><div className="logo" onClick={() => window.goHome?.()}><div className="logo-icon">🚗</div>DRIVE<em>CARE</em></div></nav>
<div className="sb sb-pad-top"><div className="slbl">Service history</div><div id="mechHistList"></div></div>
</div>
    </>
  );
}
