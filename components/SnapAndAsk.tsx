
import React, { useState, useRef, useEffect } from 'react';
import { identifyObject, chatWithObject, predictTransformation } from '../geminiService';
import { ScienceDiscovery, ChatMessage } from '../types';

interface SnapAndAskProps {
  onDiscovery: (d: ScienceDiscovery) => void;
  onBack: () => void;
}

const SnapAndAsk: React.FC<SnapAndAskProps> = ({ onDiscovery, onBack }) => {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [permissionError, setPermissionError] = useState<boolean>(false);
  const [discoveryName, setDiscoveryName] = useState('');
  
  // Interactive States
  const [mode, setMode] = useState<'IDLE' | 'CHAT' | 'FUTURE'>('IDLE');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [futureText, setFutureText] = useState('');
  const [arStage, setArStage] = useState<'START' | 'ANIMATING' | 'END'>('START');

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    startCamera();
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const startCamera = async () => {
    setPermissionError(false);
    try {
      const s = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' }, 
        audio: false 
      });
      setStream(s);
      if (videoRef.current) videoRef.current.srcObject = s;
    } catch (err) {
      setPermissionError(true);
    }
  };

  const captureAndIdentify = async () => {
    if (!videoRef.current || !canvasRef.current) return;
    setLoading(true);
    const canvas = canvasRef.current;
    const video = videoRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const imageData = canvas.toDataURL('image/jpeg', 0.8);
      setCapturedImage(imageData);
      try {
        const idResult = await identifyObject(imageData);
        setResult(idResult.text);
        setDiscoveryName(idResult.name);
        
        let category: any = 'other';
        const lowerRes = idResult.text.toLowerCase();
        if (lowerRes.includes('plant') || lowerRes.includes('leaf')) category = 'plant';
        else if (lowerRes.includes('bug') || lowerRes.includes('animal')) category = 'animal';
        else if (lowerRes.includes('rock')) category = 'rock';

        onDiscovery({
          id: Date.now().toString(),
          name: idResult.name,
          description: idResult.text,
          category,
          timestamp: Date.now(),
          imageUrl: imageData,
          rarity: idResult.rarity,
          points: idResult.points
        });
      } catch (err) {
        setResult("I couldn't quite see that. Try again!");
      } finally {
        setLoading(false);
      }
    }
  };

  const handleChat = async () => {
    if (!chatInput.trim()) return;
    const userMsg = chatInput;
    setChatInput('');
    setChatMessages(p => [...p, { role: 'user', text: userMsg }]);
    const reply = await chatWithObject(discoveryName, userMsg, chatMessages);
    setChatMessages(p => [...p, { role: 'model', text: reply }]);
  };

  const handleFuture = async () => {
    setLoading(true);
    setMode('FUTURE');
    setArStage('ANIMATING');
    const transformation = await predictTransformation(discoveryName);
    setFutureText(transformation);
    setLoading(false);
    
    // Simulate AR animation duration
    setTimeout(() => {
      setArStage('END');
    }, 3000);
  };

  const getAREmoji = () => {
    const name = discoveryName.toLowerCase();
    if (name.includes('caterpillar')) return '🦋';
    if (name.includes('seed') || name.includes('acorn') || name.includes('bud')) return '🌳';
    if (name.includes('egg')) return '🐣';
    if (name.includes('cloud')) return '⛈️';
    if (name.includes('kitten')) return '🐈';
    return '✨';
  };

  if (permissionError) {
    return (
      <div className="flex-1 bg-sky-50 flex flex-col items-center justify-center p-8 text-center">
        <h2 className="text-xl font-bold">Camera needed!</h2>
        <button onClick={startCamera} className="mt-4 bg-sky-500 text-white p-3 rounded-xl">Try Again</button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-black relative overflow-hidden">
      <button onClick={onBack} className="absolute top-4 left-4 z-50 bg-black/40 text-white p-2 rounded-full w-10 h-10">✕</button>

      {!capturedImage ? (
        <div className="flex-1 relative overflow-hidden flex items-center justify-center">
          <video ref={videoRef} autoPlay playsInline muted className="h-full w-full object-cover" />
          <div className="absolute inset-x-0 bottom-12 flex flex-col items-center gap-4">
            <button onClick={captureAndIdentify} className="w-20 h-20 bg-white border-8 border-white/30 rounded-full shadow-2xl active:scale-90 transition-all flex items-center justify-center">
              <div className="w-14 h-14 bg-orange-500 rounded-full"></div>
            </button>
          </div>
        </div>
      ) : (
        <div className="flex-1 bg-sky-50 overflow-y-auto pb-20">
          <div className="w-full aspect-square relative shadow-inner bg-gray-200 overflow-hidden">
             <img src={capturedImage} alt="Captured" className="w-full h-full object-cover" />
             
             {/* AR Overlay Layer */}
             {mode === 'FUTURE' && arStage !== 'START' && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  {arStage === 'ANIMATING' && (
                    <div className="flex flex-col items-center animate-pulse">
                      <div className="text-8xl animate-bounce mb-4">{getAREmoji()}</div>
                      <div className="bg-white/80 backdrop-blur px-4 py-2 rounded-full text-purple-600 font-bold text-sm shadow-lg">
                        TIME TRAVELING...
                      </div>
                    </div>
                  )}
                  {arStage === 'END' && (
                    <div className="absolute inset-0 flex items-center justify-center bg-purple-500/20 animate-in fade-in duration-1000">
                      <div className="text-[12rem] drop-shadow-2xl animate-in zoom-in spin-in duration-700">
                        {getAREmoji()}
                      </div>
                    </div>
                  )}
                </div>
             )}

             {loading && (
               <div className="absolute inset-0 bg-sky-600/60 backdrop-blur-sm flex items-center justify-center text-white text-center p-6">
                 <div className="animate-bounce text-6xl">🔬</div>
               </div>
             )}
          </div>
          
          <div className="p-6 space-y-4">
            {mode === 'IDLE' && result && !loading && (
              <div className="animate-in slide-in-from-bottom duration-500 space-y-4">
                <div className="bg-white rounded-3xl p-6 shadow-xl border-t-8 border-orange-400">
                  <div className="prose prose-sky whitespace-pre-wrap text-gray-700 font-medium">{result}</div>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <button onClick={() => setMode('CHAT')} className="bg-blue-500 text-white p-4 rounded-2xl font-bold shadow-md flex flex-col items-center">
                    <span>💬</span> Talk to Me
                  </button>
                  <button onClick={handleFuture} className="bg-purple-500 text-white p-4 rounded-2xl font-bold shadow-md flex flex-col items-center">
                    <span>⏳</span> AR Time Travel
                  </button>
                </div>
                <button onClick={() => {setCapturedImage(null); setMode('IDLE'); setResult(null); startCamera();}} className="w-full bg-gray-200 text-gray-600 p-4 rounded-2xl font-bold">New Snap 📸</button>
              </div>
            )}

            {mode === 'CHAT' && (
              <div className="bg-white rounded-3xl p-4 shadow-xl border-t-8 border-blue-400 flex flex-col h-[400px]">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-bold text-blue-600">Chatting with {discoveryName}</h3>
                  <button onClick={() => setMode('IDLE')} className="text-gray-400">✕</button>
                </div>
                <div className="flex-1 overflow-y-auto space-y-4 p-2">
                  {chatMessages.length === 0 && <p className="text-center text-gray-400 italic">"Go ahead, ask me anything! How's my day going?"</p>}
                  {chatMessages.map((m, i) => (
                    <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[80%] p-3 rounded-2xl ${m.role === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-100'}`}>
                        {m.text}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 flex gap-2">
                  <input value={chatInput} onChange={e => setChatInput(e.target.value)} placeholder="Type a question..." className="flex-1 p-3 bg-gray-50 rounded-xl outline-none" />
                  <button onClick={handleChat} className="bg-blue-500 text-white px-4 rounded-xl">Send</button>
                </div>
              </div>
            )}

            {mode === 'FUTURE' && arStage === 'END' && !loading && (
              <div className="bg-white rounded-3xl p-6 shadow-xl border-t-8 border-purple-400 animate-in slide-in-from-bottom duration-500">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-bold text-purple-600">Future Discovery ⏳</h3>
                  <button onClick={() => {setMode('IDLE'); setArStage('START');}} className="text-gray-400">✕</button>
                </div>
                <p className="text-gray-700 leading-relaxed font-medium">{futureText}</p>
                <div className="mt-6 p-4 bg-purple-50 rounded-2xl border border-purple-100 text-center">
                  <span className="text-xs font-bold text-purple-400 uppercase tracking-widest">Scientific Prediction</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};

export default SnapAndAsk;
