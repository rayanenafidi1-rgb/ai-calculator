
import React, { useState, useRef, useCallback } from 'react';
import { AISolution } from '../types';
import { solveMathProblem, solveMathFromImage } from '../services/geminiService';
import { Brain, Send, Loader2, Sparkles, CheckCircle2, Camera, Image as ImageIcon, X, FlipHorizontal } from 'lucide-react';

const AISolver: React.FC = () => {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [solution, setSolution] = useState<AISolution | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Image states
  const [selectedImage, setSelectedImage] = useState<{ data: string, mimeType: string } | null>(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const startCamera = async () => {
    setIsCameraOpen(true);
    setSolution(null);
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      setError("Could not access camera. Please check permissions.");
      setIsCameraOpen(false);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsCameraOpen(false);
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      if (context) {
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
        context.drawImage(videoRef.current, 0, 0);
        const dataUrl = canvasRef.current.toDataURL('image/jpeg');
        const base64 = dataUrl.split(',')[1];
        setSelectedImage({ data: base64, mimeType: 'image/jpeg' });
        stopCamera();
      }
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        const base64 = result.split(',')[1];
        setSelectedImage({ data: base64, mimeType: file.type });
      };
      reader.readAsDataURL(file);
    }
  };

  const clearSelectedImage = () => {
    setSelectedImage(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSolve = async () => {
    if (!input.trim() && !selectedImage) return;
    
    setLoading(true);
    setError(null);
    try {
      let res: AISolution;
      if (selectedImage) {
        res = await solveMathFromImage(selectedImage.data, selectedImage.mimeType, input);
      } else {
        res = await solveMathProblem(input);
      }
      setSolution(res);
    } catch (err: any) {
      setError(err.message || 'Failed to solve problem. Check your internet or API key.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full p-8 overflow-y-auto max-h-[700px]">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Sparkles className="w-6 h-6 text-indigo-400" />
          <h2 className="text-xl font-bold text-white">Wlidat Mimi AI</h2>
        </div>
        <div className="flex gap-2">
           <button 
            onClick={() => fileInputRef.current?.click()}
            className="p-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-slate-300 transition-all"
            title="Upload PNG/Image"
          >
            <ImageIcon className="w-5 h-5" />
          </button>
          <button 
            onClick={isCameraOpen ? stopCamera : startCamera}
            className={`p-2 rounded-xl transition-all ${isCameraOpen ? 'bg-red-500/20 text-red-400' : 'bg-slate-800 hover:bg-slate-700 text-slate-300'}`}
            title="Use Camera"
          >
            <Camera className="w-5 h-5" />
          </button>
        </div>
      </div>

      <input 
        type="file" 
        ref={fileInputRef} 
        className="hidden" 
        accept="image/*" 
        onChange={handleFileUpload}
      />

      {isCameraOpen && (
        <div className="relative mb-6 rounded-2xl overflow-hidden border-2 border-indigo-500/50 bg-black aspect-video flex items-center justify-center">
          <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
          <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-4">
            <button 
              onClick={capturePhoto}
              className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full font-bold shadow-xl flex items-center gap-2"
            >
              <Camera className="w-5 h-5" /> CAPTURE
            </button>
            <button 
              onClick={stopCamera}
              className="px-6 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-full font-bold shadow-xl"
            >
              CANCEL
            </button>
          </div>
          <canvas ref={canvasRef} className="hidden" />
        </div>
      )}

      {selectedImage && !isCameraOpen && (
        <div className="relative mb-6 group">
          <img 
            src={`data:${selectedImage.mimeType};base64,${selectedImage.data}`} 
            className="w-full max-h-[300px] object-contain rounded-2xl border border-indigo-500/30 bg-slate-900/50" 
            alt="Math Problem"
          />
          <button 
            onClick={clearSelectedImage}
            className="absolute top-2 right-2 p-2 bg-red-500 hover:bg-red-400 text-white rounded-full shadow-lg"
          >
            <X className="w-4 h-4" />
          </button>
          <div className="absolute bottom-2 left-2 px-3 py-1 bg-black/50 backdrop-blur-md rounded-lg text-[10px] text-white font-mono uppercase">
            Image Ready for Analysis
          </div>
        </div>
      )}

      <div className="relative mb-8">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={selectedImage ? "Add extra context or instructions (optional)..." : "Type a word problem or paste equations here..."}
          className="w-full bg-slate-800/50 border border-slate-700 rounded-2xl p-4 pr-16 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 min-h-[120px] transition-all"
        />
        <button
          onClick={handleSolve}
          disabled={loading || (!input.trim() && !selectedImage)}
          className="absolute bottom-4 right-4 p-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl text-white shadow-lg transition-all"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
        </button>
      </div>

      {loading && (
        <div className="flex flex-col items-center justify-center py-12 gap-4">
          <Loader2 className="w-12 h-12 text-indigo-500 animate-spin" />
          <div className="text-center">
            <p className="text-slate-400 font-medium animate-pulse">
              {selectedImage ? "Analyzing image & solving problem..." : "Gemini is analyzing the context..."}
            </p>
            <span className="text-xs text-slate-600">This might take a few seconds...</span>
          </div>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm mb-6">
          {error}
        </div>
      )}

      {solution && !loading && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="bg-indigo-600/10 border border-indigo-500/20 rounded-2xl p-6 mb-6">
            <h3 className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-2">Detected Problem</h3>
            <p className="text-slate-200 font-medium">{solution.problem}</p>
          </div>

          <div className="space-y-4 mb-8">
            <h3 className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-4">Step-by-Step Breakdown</h3>
            {solution.steps.map((step, idx) => (
              <div key={idx} className="flex gap-4 items-start group">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-indigo-400 font-bold text-xs">
                  {idx + 1}
                </div>
                <div className="pt-1 text-slate-300 text-sm leading-relaxed group-hover:text-white transition-colors">
                  {step}
                </div>
              </div>
            ))}
          </div>

          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-6 mb-6">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              <h3 className="text-emerald-500 text-xs font-bold uppercase tracking-widest">Final Result</h3>
            </div>
            <p className="text-2xl font-bold text-emerald-400 mono">{solution.finalAnswer}</p>
          </div>

          <div className="p-6 bg-slate-800/30 rounded-2xl border border-slate-700/50">
            <h3 className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-2">Conceptual Summary</h3>
            <p className="text-slate-400 text-sm italic">"{solution.explanation}"</p>
          </div>
        </div>
      )}

      {!loading && !solution && !error && !isCameraOpen && (
        <div className="flex-grow flex flex-col items-center justify-center opacity-30 text-center py-12">
          <Brain className="w-20 h-20 mb-4" />
          <p className="max-w-sm text-sm">
            Use the camera to snap a photo of your homework or upload a PNG. Wlidat Mimi AI will extract the math and solve it instantly.
          </p>
        </div>
      )}
    </div>
  );
};

export default AISolver;
