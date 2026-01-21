
import React, { useEffect, useRef, useState } from 'react';
import { GoogleGenAI, Modality, LiveServerMessage } from '@google/genai';

interface LiveScienceChatProps {
  onBack: () => void;
}

const LiveScienceChat: React.FC<LiveScienceChatProps> = ({ onBack }) => {
  const [isActive, setIsActive] = useState(false);
  const [status, setStatus] = useState('Ready to chat!');
  const sessionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());

  // Function to decode audio bytes (PCM 24kHz)
  const decodeAudioData = async (data: Uint8Array, ctx: AudioContext): Promise<AudioBuffer> => {
    const dataInt16 = new Int16Array(data.buffer);
    const frameCount = dataInt16.length;
    const buffer = ctx.createBuffer(1, frameCount, 24000);
    const channelData = buffer.getChannelData(0);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i] / 32768.0;
    }
    return buffer;
  };

  const decodeBase64 = (base64: string) => {
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  };

  const encodeBase64 = (bytes: Uint8Array) => {
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  };

  const startSession = async () => {
    try {
      setStatus('Connecting...');
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Charon' } },
          },
          systemInstruction: 'You are Professor Spark, a fun and enthusiastic science teacher for kids. Keep your answers short, exciting, and full of science wonder. Use a warm tone.',
        },
        callbacks: {
          onopen: () => {
            setIsActive(true);
            setStatus('Talking with Professor Spark!');
            
            // Input processing
            const inputContext = new AudioContext({ sampleRate: 16000 });
            const source = inputContext.createMediaStreamSource(stream);
            const scriptProcessor = inputContext.createScriptProcessor(4096, 1, 1);
            
            scriptProcessor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              const int16 = new Int16Array(inputData.length);
              for (let i = 0; i < inputData.length; i++) {
                int16[i] = inputData[i] * 32768;
              }
              const pcmBase64 = encodeBase64(new Uint8Array(int16.buffer));
              sessionPromise.then(s => {
                s.sendRealtimeInput({ media: { data: pcmBase64, mimeType: 'audio/pcm;rate=16000' } });
              });
            };
            
            source.connect(scriptProcessor);
            scriptProcessor.connect(inputContext.destination);
          },
          onmessage: async (message: LiveServerMessage) => {
            const audioData = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (audioData && audioContextRef.current) {
              const ctx = audioContextRef.current;
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);
              const buffer = await decodeAudioData(decodeBase64(audioData), ctx);
              const source = ctx.createBufferSource();
              source.buffer = buffer;
              source.connect(ctx.destination);
              source.start(nextStartTimeRef.current);
              nextStartTimeRef.current += buffer.duration;
              sourcesRef.current.add(source);
              source.onended = () => sourcesRef.current.delete(source);
            }

            if (message.serverContent?.interrupted) {
              sourcesRef.current.forEach(s => s.stop());
              sourcesRef.current.clear();
              nextStartTimeRef.current = 0;
            }
          },
          onclose: () => {
            setIsActive(false);
            setStatus('Chat ended.');
          },
          onerror: (e) => {
            console.error(e);
            setStatus('Connection error.');
          }
        }
      });

      sessionRef.current = await sessionPromise;
    } catch (err) {
      console.error(err);
      setStatus('Failed to start chat.');
    }
  };

  useEffect(() => {
    return () => {
      if (sessionRef.current) sessionRef.current.close();
      if (audioContextRef.current) audioContextRef.current.close();
    };
  }, []);

  return (
    <div className="flex flex-col h-full bg-sky-600 p-8 items-center justify-center text-center text-white animate-in fade-in duration-500">
      <div className="absolute top-4 left-4">
        <button onClick={onBack} className="bg-white/20 p-2 rounded-full w-10 h-10 flex items-center justify-center font-bold">✕</button>
      </div>

      <div className={`w-48 h-48 bg-white/10 rounded-full flex items-center justify-center relative mb-8 ${isActive ? 'animate-pulse' : ''}`}>
        <div className="text-8xl">🎓</div>
        {isActive && (
          <div className="absolute inset-0 border-4 border-white rounded-full animate-ping opacity-20"></div>
        )}
      </div>

      <h2 className="text-3xl font-bold mb-2">Professor Spark Live</h2>
      <p className="text-sky-100 font-medium mb-12 max-w-xs">{status}</p>

      {!isActive ? (
        <button 
          onClick={startSession}
          className="bg-white text-sky-600 px-8 py-4 rounded-3xl font-bold text-xl shadow-xl active:scale-95 transition-all"
        >
          Start Talking! 🎙️
        </button>
      ) : (
        <button 
          onClick={() => { sessionRef.current?.close(); onBack(); }}
          className="bg-red-500 text-white px-8 py-4 rounded-3xl font-bold text-xl shadow-xl active:scale-95 transition-all"
        >
          End Chat 🛑
        </button>
      )}

      {isActive && (
        <div className="mt-12 flex gap-1 items-end h-8">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="w-1 bg-white/40 rounded-full animate-bounce" style={{ height: `${20 + Math.random() * 80}%`, animationDelay: `${i * 0.1}s` }}></div>
          ))}
        </div>
      )}
    </div>
  );
};

export default LiveScienceChat;
