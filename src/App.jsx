import React, { useState, useRef, useCallback } from 'react';
import Webcam from 'react-webcam';
import './App.css'; 

function App() {
  const [image, setImage] = useState(null);
  const [useWebcam, setUseWebcam] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [verdict, setVerdict] = useState(null);
  const webcamRef = useRef(null);

  // --- THE MAGIC CONNECTION TO THE BACKEND ---
  const judgeOutfit = async (imageData) => {
    setIsAnalyzing(true);
    setVerdict(null);

    try {
      const response = await fetch('https://ai-outfit-judge-backend.onrender.com/api/judge', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        // We send the base64 image string inside a JSON object
        body: JSON.stringify({ image: imageData }), 
      });

      if (!response.ok) {
        throw new Error('Server responded with an error');
      }

      // Parse the JSON returned by our backend
      const data = await response.json();
      setVerdict(data);

    } catch (error) {
      console.error("Error communicating with backend:", error);
      alert("Oops! The Hype-Judge is taking a coffee break. Make sure your backend server is running!");
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Capture photo from webcam
  const capture = useCallback(() => {
    const imageSrc = webcamRef.current.getScreenshot();
    setImage(imageSrc);
    judgeOutfit(imageSrc); // Immediately send it to be judged!
  }, [webcamRef]);

  // Handle file upload
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result);
        judgeOutfit(reader.result); // Immediately send it to be judged!
      };
      reader.readAsDataURL(file);
    }
  };

  // Reset everything to start over
  const reset = () => {
    setImage(null);
    setVerdict(null);
    setIsAnalyzing(false);
  };

  return (
    <div className="container" style={{ textAlign: 'center', padding: '20px', fontFamily: 'sans-serif', maxWidth: '800px', margin: '0 auto' }}>
      <h1>✨ The Hype-Judge ✨</h1>
      <p style={{ color: '#666', marginBottom: '30px' }}>Upload a fit or strike a pose for the AI.</p>

      {/* State 1: Show the Camera or Upload input */}
      {!image && (
        <div>
          <div style={{ marginBottom: '20px' }}>
             <button onClick={() => setUseWebcam(true)} style={{ marginRight: '10px', padding: '8px 16px', cursor: 'pointer' }}>📸 Use Camera</button>
             <button onClick={() => setUseWebcam(false)} style={{ padding: '8px 16px', cursor: 'pointer' }}>📁 Upload File</button>
          </div>

          {useWebcam ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Webcam
                audio={false}
                ref={webcamRef}
                screenshotFormat="image/jpeg"
                width={400}
                style={{ borderRadius: '10px', boxShadow: '0 4px 8px rgba(0,0,0,0.1)' }}
              />
              <button onClick={capture} style={{ marginTop: '20px', padding: '12px 24px', fontSize: '18px', cursor: 'pointer', backgroundColor: '#000', color: '#fff', border: 'none', borderRadius: '5px' }}>
                Snap Photo & Judge!
              </button>
            </div>
          ) : (
<div style={{ maxWidth: '400px', margin: '0 auto' }}>
  <label
    style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '50px 20px',
      backgroundColor: '#0a0a0a', 
      border: '1px solid #262626', 
      borderRadius: '12px',
      cursor: 'pointer',
      transition: 'border-color 0.3s ease',
    }}
    onMouseEnter={(e) => e.currentTarget.style.borderColor = '#525252'}
    onMouseLeave={(e) => e.currentTarget.style.borderColor = '#262626'}
  >
    {/* Minimalist Upload Icon (SVG) */}
    <svg 
      width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#737373" 
      strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" 
      style={{ marginBottom: '16px' }}
    >
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
      <polyline points="17 8 12 3 7 8"></polyline>
      <line x1="12" y1="3" x2="12" y2="15"></line>
    </svg>

    <span style={{ color: '#e5e5e5', fontSize: '16px', fontWeight: '500', marginBottom: '6px', letterSpacing: '0.5px' }}>
      Click to browse
    </span>
    <span style={{ color: '#737373', fontSize: '13px' }}>
      JPG, PNG or WEBP
    </span>
    
    {/* The hidden magic input */}
    <input 
      type="file" 
      accept="image/*" 
      onChange={handleFileUpload} 
      style={{ display: 'none' }} 
    />
  </label>
</div>
          )}
        </div>
      )}

      {/* State 2: Show the Image and Loading/Results */}
      {image && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <img src={image} alt="Captured fit" style={{ maxWidth: '300px', borderRadius: '10px', boxShadow: '0 4px 8px rgba(0,0,0,0.2)' }} />
          
          {isAnalyzing && (
            <div style={{ marginTop: '30px', padding: '20px' }}>
              <h2 className="animate-pulse">Analyzing the drip... 🧐🔥</h2>
            </div>
          )}


          {verdict && (
            <div style={{
              marginTop: '40px',
              padding: '40px 30px',
              backgroundColor: '#111827', // Deep dark background
              border: '1px solid #374151',
              borderRadius: '24px',
              maxWidth: '550px',
              width: '100%',
              boxShadow: '0 20px 40px -10px rgba(0, 0, 0, 0.7)',
              color: '#f9fafb',
              position: 'relative',
              overflow: 'hidden',
              animation: 'fadeIn 0.5s ease-in-out'
            }}>
              {/* Top Accent Gradient Line */}
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '6px', background: 'linear-gradient(to right, #ef4444, #f59e0b, #3b82f6)' }}></div>

              {/* Dynamic Score & Emoji */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginBottom: '20px' }}>
                <span style={{ 
                  fontSize: '5rem', 
                  fontWeight: '900', 
                  lineHeight: '1', 
                  color: verdict.score <= 4 ? '#ef4444' : verdict.score <= 7 ? '#f59e0b' : '#22c55e' 
                }}>
                  {verdict.score}
                </span>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'flex-end', paddingBottom: '10px' }}>
                  <span style={{ fontSize: '1.5rem', color: '#6b7280', fontWeight: 'bold' }}>/ 10</span>
                  <span style={{ fontSize: '2rem' }}>
                    {verdict.score <= 3 ? '💀🚨' : verdict.score <= 7 ? '👀📉' : '🔥👑'}
                  </span>
                </div>
              </div>

              {/* Minimalist Vibe Badge */}
              <div style={{ marginBottom: '30px' }}>
                <span style={{
                  backgroundColor: '#1f2937',
                  color: '#e5e7eb',
                  padding: '8px 18px',
                  borderRadius: '999px',
                  fontSize: '0.85rem',
                  fontWeight: '700',
                  letterSpacing: '1.5px',
                  textTransform: 'uppercase',
                  border: '1px solid #4b5563',
                  boxShadow: '0 4px 6px rgba(0,0,0,0.3)'
                }}>
                  🏷️ Vibe: {verdict.vibe_check}
                </span>
              </div>

              {/* The Roast Text Box */}
              <div style={{
                backgroundColor: '#1f2937',
                padding: '24px',
                borderRadius: '16px',
                borderLeft: '4px solid #ef4444', // Red accent for the roast
                textAlign: 'left'
              }}>
                <p style={{
                  fontSize: '1.1rem',
                  lineHeight: '1.7',
                  color: '#d1d5db',
                  margin: '0',
                  fontStyle: 'italic',
                  fontFamily: 'monospace' // Gives it a cool hacker/techfest feel
                }}>
                  "{verdict.review}"
                </p>
              </div>
            </div>
          )}

          <button onClick={reset} style={{ marginTop: '30px', padding: '10px 20px', fontSize: '16px', cursor: 'pointer' }}>
            🔄 Judge Another Outfit
          </button>
        </div>
      )}
    </div>
  );
}

export default App;