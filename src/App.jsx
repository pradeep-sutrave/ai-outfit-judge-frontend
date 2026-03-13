import React, { useState, useRef, useCallback, useEffect } from 'react';
import Webcam from 'react-webcam';
import './App.css';

function App() {
  const [image, setImage] = useState(null);
  const [useWebcam, setUseWebcam] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [verdict, setVerdict] = useState(null);
  const [displayScore, setDisplayScore] = useState(0);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [dragOver, setDragOver] = useState(false);
  const webcamRef = useRef(null);

  // Parallax mouse tracking
  useEffect(() => {
    const handleMouse = (e) => {
      setMousePos({
        x: (e.clientX / window.innerWidth - 0.5) * 20,
        y: (e.clientY / window.innerHeight - 0.5) * 20,
      });
    };
    window.addEventListener('mousemove', handleMouse);
    return () => window.removeEventListener('mousemove', handleMouse);
  }, []);

  // Score count-up animation
// Score count-up animation (BULLETPROOF VERSION)
  useEffect(() => {
    if (!verdict || verdict.score === undefined) return;
    
    setDisplayScore(0);
    let current = 0;
    // Force the score to be a number, fallback to 0 if it fails
    const target = Number(verdict.score) || 0; 
    
    // Prevent division by zero if the AI gives them a harsh 0!
    if (target === 0) {
        setDisplayScore(0);
        return;
    }

    const steps = target * 10;
    const interval = 1200 / steps;
    const timer = setInterval(() => {
      current += 0.1;
      setDisplayScore(parseFloat(Math.min(current, target).toFixed(1)));
      if (current >= target) clearInterval(timer);
    }, interval);
    
    return () => clearInterval(timer);
  }, [verdict]);

  // Score color
  const scoreColor =
    displayScore <= 4 ? '#ff4444' :
    displayScore <= 7 ? '#ffcc00' :
    '#39ff14';

  // --- API CALL ---
  const judgeOutfit = async (imageData) => {
    setIsAnalyzing(true);
    setVerdict(null);
    try {
      const response = await fetch('https://ai-outfit-judge-backend.onrender.com/api/judge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: imageData }),
      });
      if (!response.ok) throw new Error('Server responded with an error');
      const data = await response.json();
      setVerdict(data);
    } catch (error) {
      console.error('Error communicating with backend:', error);
      alert("Oops! The Hype-Judge is taking a coffee break. Make sure your backend server is running!");
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Capture from webcam
  const capture = useCallback(() => {
    const imageSrc = webcamRef.current.getScreenshot();
    setImage(imageSrc);
    judgeOutfit(imageSrc);
  }, [webcamRef]);

  // Handle file upload
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setImage(reader.result);
      judgeOutfit(reader.result);
    };
    reader.readAsDataURL(file);
  };

  // Handle drag and drop
  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setImage(reader.result);
      judgeOutfit(reader.result);
    };
    reader.readAsDataURL(file);
  };

  // Reset
  const reset = () => {
    setImage(null);
    setVerdict(null);
    setIsAnalyzing(false);
    setDisplayScore(0);
  };

  return (
    <div className="hj-root">
      {/* Animated background */}
      <div className="hj-bg">
        <div
          className="hj-orb hj-orb-1"
          style={{ transform: `translate(${mousePos.x * 0.5}px, ${mousePos.y * 0.5}px)` }}
        />
        <div
          className="hj-orb hj-orb-2"
          style={{ transform: `translate(${-mousePos.x * 0.3}px, ${-mousePos.y * 0.3}px)` }}
        />
        <div className="hj-grid-lines" />
      </div>

      {/* ── HEADER ── */}
      <header className="hj-header">
        <div className="hj-header-tag">AI FASHION CRITIC · SS 2025</div>
        <h1 className="hj-title">
          <span className="hj-title-top">THE</span>
          <span className="hj-title-main">HYPE</span>
          <span className="hj-title-sub">JUDGE</span>
        </h1>
        <p className="hj-subtitle">Drop your fit. Get roasted. No mercy.</p>
        <div className="hj-header-line" />
      </header>

      {/* ── MAIN ── */}
      <main className="hj-main">

        {/* ── STATE: INPUT ── */}
        {!image && (
          <div className="hj-input-panel">
            <div className="hj-mode-switcher">
              <button
                className={`hj-mode-btn ${!useWebcam ? 'active' : ''}`}
                onClick={() => setUseWebcam(false)}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                  <polyline points="17 8 12 3 7 8"/>
                  <line x1="12" y1="3" x2="12" y2="15"/>
                </svg>
                Upload
              </button>
              <button
                className={`hj-mode-btn ${useWebcam ? 'active' : ''}`}
                onClick={() => setUseWebcam(true)}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M23 7l-7 5 7 5V7z"/>
                  <rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
                </svg>
                Camera
              </button>
            </div>

            {/* Upload dropzone */}
            {!useWebcam && (
              <label
                className={`hj-dropzone ${dragOver ? 'drag-over' : ''}`}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
              >
                <div className="hj-dz-inner">
                  <div className="hj-dz-icon">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="3" width="18" height="18" rx="2"/>
                      <circle cx="8.5" cy="8.5" r="1.5"/>
                      <polyline points="21 15 16 10 5 21"/>
                    </svg>
                  </div>
                  <p className="hj-dz-primary">Drop your fit here</p>
                  <p className="hj-dz-secondary">or click to browse · JPG, PNG, WEBP</p>
                  <div className="hj-dz-btn">Choose File</div>
                </div>
                <input type="file" accept="image/*" onChange={handleFileUpload} style={{ display: 'none' }} />
                <div className="hj-dz-corner hj-dz-corner-tl" />
                <div className="hj-dz-corner hj-dz-corner-tr" />
                <div className="hj-dz-corner hj-dz-corner-bl" />
                <div className="hj-dz-corner hj-dz-corner-br" />
              </label>
            )}

            {/* Webcam */}
            {useWebcam && (
              <div className="hj-cam-panel">
                <div className="hj-cam-frame">
                  <Webcam
                    audio={false}
                    ref={webcamRef}
                    screenshotFormat="image/jpeg"
                    className="hj-webcam"
                  />
                  <div className="hj-cam-overlay">
                    <div className="hj-scan-line" />
                  </div>
                  <div className="hj-cam-corner hj-cam-corner-tl" />
                  <div className="hj-cam-corner hj-cam-corner-tr" />
                  <div className="hj-cam-corner hj-cam-corner-bl" />
                  <div className="hj-cam-corner hj-cam-corner-br" />
                </div>
                <button className="hj-snap-btn" onClick={capture}>
                  <span className="hj-snap-ring" />
                  <span className="hj-snap-core" />
                </button>
                <p className="hj-cam-hint">Click to snap &amp; judge</p>
              </div>
            )}
          </div>
        )}

        {/* ── STATE: ANALYZING ── */}
        {image && isAnalyzing && (
          <div className="hj-analyzing">
            <div className="hj-analyzing-img-wrap">
              <img src={image} alt="Your fit" className="hj-analyzing-img" />
              <div className="hj-scan-overlay">
                <div className="hj-scan-bar" />
              </div>
            </div>
            <div className="hj-analyzing-text">
              <span className="hj-analyzing-label">Analyzing the drip</span>
              <span className="hj-dots">
                <span /><span /><span />
              </span>
            </div>
            <div className="hj-analyzing-steps">
              <div className="hj-step hj-step-1">Scanning silhouette...</div>
              <div className="hj-step hj-step-2">Reading color theory...</div>
              <div className="hj-step hj-step-3">Judging your life choices...</div>
            </div>
          </div>
        )}

        {/* ── STATE: VERDICT ── */}
        {image && verdict && !isAnalyzing && (
          <div className="hj-verdict-layout">
            {/* Top — image */}
            <div className="hj-verdict-img-col">
              <div className="hj-verdict-img-frame">
                <img src={image} alt="Judged fit" className="hj-verdict-img" />
                <div className="hj-verdict-img-tag">SUBMITTED FIT</div>
              </div>
            </div>

            {/* Bottom — verdict card */}
            <div className="hj-verdict-col">

              {/* Score row with circle + bar */}
              <div className="hj-score-block">
                <div className="hj-score-circle">
                  <svg viewBox="0 0 96 96">
                    <circle className="hj-score-circle-bg" cx="48" cy="48" r="42" />
                    <circle
                      className="hj-score-circle-fill"
                      cx="48" cy="48" r="42"
                      stroke={scoreColor}
                      strokeDashoffset={264 - (displayScore / 10) * 264}
                    />
                  </svg>
                  <div className="hj-score-circle-text">
                    <span className="hj-score-num" style={{ color: scoreColor }}>
                      {Math.floor(displayScore)}
                      <span className="hj-score-decimal">.{Math.round((displayScore % 1) * 10)}</span>
                    </span>
                  </div>
                </div>
                <div className="hj-score-right">
                  <span className="hj-score-label">Style Score</span>
                  <span className="hj-score-tagline">
                    {verdict.score <= 3 ? 'Needs Work 💀' : verdict.score <= 7 ? 'Not Bad 👀' : 'Fire Fit 🔥'}
                  </span>
                  <div className="hj-score-bar-wrap">
                    <div
                      className="hj-score-bar-fill"
                      style={{ width: `${(displayScore / 10) * 100}%`, background: scoreColor }}
                    />
                  </div>
                </div>
              </div>

              {/* Vibe + emojis */}
              <div className="hj-vibe-emoji-row">
                <div className="hj-vibe-badge">
                  <span className="hj-vibe-dot" style={{ background: scoreColor }} />
                  {verdict.vibe_check}
                </div>
                <div className="hj-emoji-row">
                  {(verdict.score <= 3
                    ? ['💀', '🚨', '😭']
                    : verdict.score <= 7
                    ? ['👀', '📉', '🤔']
                    : ['🔥', '👑', '✨']
                  ).map((e, i) => (
                    <span key={i} className="hj-emoji" style={{ animationDelay: `${i * 0.1}s` }}>
                      {e}
                    </span>
                  ))}
                </div>
              </div>

              {/* Review */}
              <div className="hj-review-box">
                <div className="hj-review-label">// VERDICT</div>
                <p className="hj-review-text">"{verdict.review}"</p>
              </div>

              {/* Reset */}
              <div className="hj-reset-row">
                <button className="hj-reset-btn" onClick={reset}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="1 4 1 10 7 10"/>
                    <path d="M3.51 15a9 9 0 1 0 .49-4.73"/>
                  </svg>
                  Judge Another Fit
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ── FOOTER ── */}
      <footer className="hj-footer">
        <span>Powered by AI · No fits are safe</span>
      </footer>
    </div>
  );
}

export default App;