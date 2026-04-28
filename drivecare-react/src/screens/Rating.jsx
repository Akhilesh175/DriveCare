import React from 'react';

export default function Rating() {
  return (
    <>
      <div className="screen active" id="rating" >
<nav className="top-nav"><div className="logo" onClick={() => window.goHome?.()}><div className="logo-icon">🚗</div>DRIVE<em>CARE</em></div></nav>
<div className="sb">
<div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '80vh', padding: '20px', textAlign: 'center' }}>
<div style={{ fontSize: '48px', color: 'var(--grn)', marginBottom: '10px' }}>✓</div>
<div style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '8px' }}>SERVICE DONE!</div>
<div style={{ fontSize: '16px', color: 'var(--tx2)', marginBottom: '24px' }}>How was your experience with<br/><strong id="ratingMech" style={{ color: 'var(--tx)', fontSize: '20px' }}>Mechanic</strong>?</div>

<div id="starRow" style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginBottom: '12px' }}>
<span className="star-r" onClick={() => window.rateStar?.(1)} onMouseOut={() => window.unhoverStar?.()} onMouseOver={() => window.hoverStar?.(1)}>☆</span>
<span className="star-r" onClick={() => window.rateStar?.(2)} onMouseOut={() => window.unhoverStar?.()} onMouseOver={() => window.hoverStar?.(2)}>☆</span>
<span className="star-r" onClick={() => window.rateStar?.(3)} onMouseOut={() => window.unhoverStar?.()} onMouseOver={() => window.hoverStar?.(3)}>☆</span>
<span className="star-r" onClick={() => window.rateStar?.(4)} onMouseOut={() => window.unhoverStar?.()} onMouseOver={() => window.hoverStar?.(4)}>☆</span>
<span className="star-r" onClick={() => window.rateStar?.(5)} onMouseOut={() => window.unhoverStar?.()} onMouseOver={() => window.hoverStar?.(5)}>☆</span>
</div>

<div id="starLbl" style={{ fontSize: '14px', color: 'var(--tx3)', marginBottom: '24px', minHeight: '20px' }}>Tap a star to rate</div>

<div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '24px', maxWidth: '300px' }}>
<div className="tag" onClick={(e) => e.currentTarget.classList.toggle('on')}>⚡ Fast</div>
<div className="tag" onClick={(e) => e.currentTarget.classList.toggle('on')}>👍 Professional</div>
<div className="tag" onClick={(e) => e.currentTarget.classList.toggle('on')}>💰 Fair price</div>
<div className="tag" onClick={(e) => e.currentTarget.classList.toggle('on')}>🔧 Quality fix</div>
</div>

<textarea id="feedbackTa" placeholder="Feedback? (optional)" rows="3" style={{ width: '100%', maxWidth: '320px', background: 'var(--bg3)', border: '1px solid var(--b2)', borderRadius: '12px', padding: '16px', color: 'var(--tx)', fontSize: '15px', marginBottom: '24px', resize: 'none', outline: 'none' }} onFocus={(e) => e.target.style.borderColor = 'var(--acc)'} onBlur={(e) => e.target.style.borderColor = 'var(--b2)'}></textarea>

<button className="btn" onClick={() => window.submitRating?.()} style={{ width: '100%', maxWidth: '320px', background: 'var(--acc)', color: '#fff', marginBottom: '12px' }}>SUBMIT RATING</button>
<button onClick={() => window.skipRating?.()} style={{ background: 'transparent', border: 'none', color: 'var(--tx3)', fontSize: '15px', fontWeight: '500', cursor: 'pointer', padding: '10px' }}>Skip</button>
</div>
</div>
</div>
    </>
  );
}
