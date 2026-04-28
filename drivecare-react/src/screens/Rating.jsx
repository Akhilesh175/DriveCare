import React from 'react';

export default function Rating() {
  return (
    <>
      <div className="screen active" id="rating" >
<nav className="top-nav"><div className="logo" onClick={() => window.goHome?.()}><div className="logo-icon">🚗</div>DRIVE<em>CARE</em></div></nav>
<div className="sb">
<div >
<div >✓</div>
<div >SERVICE DONE!</div>
<div >How was your experience with<br/><strong id="ratingMech">Mechanic</strong>?</div>
<div id="starRow" >
<span className="star-r" onClick={() => window.rateStar?.(1)} onMouseOut={() => window.unhoverStar?.()} onMouseOver={() => window.hoverStar?.(1)}>☆</span>
<span className="star-r" onClick={() => window.rateStar?.(2)} onMouseOut={() => window.unhoverStar?.()} onMouseOver={() => window.hoverStar?.(2)}>☆</span>
<span className="star-r" onClick={() => window.rateStar?.(3)} onMouseOut={() => window.unhoverStar?.()} onMouseOver={() => window.hoverStar?.(3)}>☆</span>
<span className="star-r" onClick={() => window.rateStar?.(4)} onMouseOut={() => window.unhoverStar?.()} onMouseOver={() => window.hoverStar?.(4)}>☆</span>
<span className="star-r" onClick={() => window.rateStar?.(5)} onMouseOut={() => window.unhoverStar?.()} onMouseOver={() => window.hoverStar?.(5)}>☆</span>
</div>
<div id="starLbl" >Tap a star to rate</div>
<div >
<div className="tag" onClick={(e) => e.currentTarget.classList.toggle('on')}>⚡ Fast</div>
<div className="tag" onClick={(e) => e.currentTarget.classList.toggle('on')}>👍 Professional</div>
<div className="tag" onClick={(e) => e.currentTarget.classList.toggle('on')}>💰 Fair price</div>
<div className="tag" onClick={(e) => e.currentTarget.classList.toggle('on')}>🔧 Quality fix</div>
</div>
<textarea id="feedbackTa" placeholder="Feedback? (optional)" rows="3" ></textarea>
<button className="btn" onClick={() => window.submitRating?.()} >SUBMIT RATING</button>
<button onClick={() => window.skipRating?.()} >Skip</button>
</div>
</div>
</div>
    </>
  );
}
