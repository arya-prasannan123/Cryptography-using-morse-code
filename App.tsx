import React, { useState, useEffect, useRef } from 'react';
import { textToMorse, morseToText } from './utils/morse';
import { encryptFile, decryptFile } from './utils/crypto';
import { Lock, Unlock, Send, AlertTriangle, FileVideo, ShieldCheck, RefreshCw, Upload, FileLock2, X, ArrowLeftRight } from 'lucide-react';

export default function App() {
  return (
    <div className="min-h-screen bg-white text-neutral-800 p-4 md:p-8 flex flex-col items-center">
      <header className="w-full max-w-2xl mb-8 flex flex-col items-center text-center border-b border-red-200 pb-6">
        <div className="flex items-center gap-4 mb-2">
          <div className="flex items-center gap-2 bg-neutral-100 p-3 rounded-xl border border-red-100 shadow-[0_0_15px_rgba(220,38,38,0.1)]">
            <Lock className="w-6 h-6 text-red-600" />
            <ArrowLeftRight className="w-4 h-4 text-neutral-500" />
            <Unlock className="w-6 h-6 text-red-600" />
          </div>
          <h1 className="text-4xl font-bold tracking-widest text-red-600 neon-text">ZOE</h1>
        </div>
        <div className="text-xs text-red-800/60 font-mono tracking-[0.3em] font-bold">SECURE.TRANSMISSION.PROTOCOL</div>
      </header>

      <main className="w-full max-w-2xl flex flex-col gap-8">
        {/* Section 1: Merged Crypto Processor */}
        <UnifiedCryptoCard />

        {/* Section 2: Translator Tool */}
        <section className="bg-white rounded-xl border border-red-100 overflow-hidden shadow-xl shadow-red-900/5">
          <div className="bg-neutral-50 p-4 border-b border-red-100 flex items-center gap-2">
            <RefreshCw className="text-red-500" size={18} />
            <h2 className="font-mono text-sm font-bold text-red-500 tracking-wider">UTILITY // MORSE TRANSLATOR</h2>
          </div>
          <div className="p-6">
            <TranslatorView />
          </div>
        </section>
      </main>
      
      <footer className="mt-12 mb-4 text-neutral-400 text-[10px] text-center font-mono">
        SYSTEM.VERSION: 2.1.2 // CRYPTO.LEVEL: AES-256-GCM // RED.PROTOCOL
      </footer>
    </div>
  );
}

function UnifiedCryptoCard() {
  const [file, setFile] = useState<File | null>(null);
  const [password, setPassword] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [outputUrl, setOutputUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Determine mode based on file extension
  const mode = file?.name.endsWith('.enc') ? 'DECRYPT' : 'ENCRYPT';
  const isEncrypt = mode === 'ENCRYPT';
  // Both modes use Red in this theme, but we can subtly vary logic if needed.
  
  // Derived state
  const morsePreview = isEncrypt ? textToMorse(password) : '';

  // Cleanup
  useEffect(() => {
    return () => {
      if (outputUrl) URL.revokeObjectURL(outputUrl);
    };
  }, [outputUrl]);

  const handleFileReset = () => {
    setFile(null);
    setPassword('');
    setOutputUrl(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      // Reset state for new file
      setPassword('');
      setOutputUrl(null);
      setError(null);
    }
  };

  const processFile = async () => {
    if (!file || !password) return;
    setIsProcessing(true);
    setError(null);
    setOutputUrl(null);

    try {
      let resultBlob: Blob;
      if (isEncrypt) {
        resultBlob = await encryptFile(file, password);
      } else {
        // For decryption, handle Morse or Text input
        const isMorse = /^[.\- /]+$/.test(password);
        const passwordKey = isMorse ? morseToText(password) : password;
        resultBlob = await decryptFile(file, passwordKey);
      }
      
      const url = URL.createObjectURL(resultBlob);
      setOutputUrl(url);
    } catch (err) {
      console.error(err);
      setError(isEncrypt ? "ENCRYPTION FAILED" : "DECRYPTION FAILED: CHECK PASSWORD");
      setTimeout(() => setError(null), 3000);
    }
    setIsProcessing(false);
  };

  const handleGmailShare = () => {
    const subject = encodeURIComponent("ZOE // SECURE FILE TRANSMISSION");
    const body = encodeURIComponent(
      `I have sent you a secured video file.\n\n` +
      `SECURITY KEY (MORSE CODE):\n${morsePreview}\n\n` +
      `1. Download the attached file.\n` +
      `2. Use the ZOE app.\n` +
      `3. Decrypt using the key above.`
    );
    window.open(`https://mail.google.com/mail/?view=cm&fs=1&su=${subject}&body=${body}`, '_blank');
    
    // Auto-restart page after 1.5s to clear session data
    setTimeout(() => {
      window.location.reload();
    }, 1500);
  };

  return (
    <div className="bg-white rounded-xl shadow-xl overflow-hidden border border-red-100 transition-all duration-500 hover:border-red-600/30">
      {/* Header Bar */}
      <div className="p-4 flex items-center justify-between border-b bg-neutral-50 border-red-100 text-red-600">
        <div className="flex items-center gap-2">
          {isEncrypt ? <Lock size={20} /> : <Unlock size={20} />}
          <span className="font-mono font-bold tracking-widest">{mode} PROTOCOL</span>
        </div>
        {file && (
          <button onClick={handleFileReset} className="text-neutral-400 hover:text-red-500 transition-colors">
            <X size={18} />
          </button>
        )}
      </div>

      <div className="p-6 md:p-8 space-y-6">
        {/* File Uploader */}
        {!file ? (
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-neutral-200 rounded-xl p-10 flex flex-col items-center justify-center cursor-pointer hover:bg-neutral-50 hover:border-red-200 transition-all group"
          >
            <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mb-4 group-hover:bg-red-50 group-hover:scale-110 transition-all">
              <Upload className="text-neutral-400 group-hover:text-red-500" size={28} />
            </div>
            <p className="text-neutral-700 font-medium">Click to Upload File</p>
            <p className="text-neutral-400 text-xs mt-2 font-mono">SUPPORTS: VIDEO FILES (ENCRYPT) OR .ENC FILES (DECRYPT)</p>
            <input 
              type="file" 
              ref={fileInputRef}
              className="hidden" 
              onChange={handleFileChange}
            />
          </div>
        ) : (
          <div className="bg-neutral-50 p-4 rounded-lg border border-neutral-200 flex items-center gap-4 animate-fade-in">
            <div className="p-3 rounded-full bg-red-50 text-red-600">
              {isEncrypt ? <FileVideo size={24} /> : <FileLock2 size={24} />}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-neutral-800 truncate">{file.name}</p>
              <p className="text-xs text-neutral-500 font-mono">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
            </div>
            <button 
              onClick={handleFileReset}
              className="px-3 py-1 text-xs bg-neutral-100 hover:bg-red-50 hover:text-red-600 rounded text-neutral-500 border border-neutral-200 hover:border-red-200 transition-all"
            >
              CHANGE
            </button>
          </div>
        )}

        {/* Input & Actions (Only visible if file selected) */}
        {file && (
          <div className="space-y-6 animate-fade-in">
            <div>
              <label className="block text-xs font-bold font-mono mb-2 tracking-wider text-red-600">
                {isEncrypt ? 'SET ENCRYPTION PASSWORD' : 'ENTER DECRYPTION KEY (MORSE/TEXT)'}
              </label>
              <div className="relative">
                <input 
                  type="text" 
                  value={password}
                  onChange={(e) => {
                     setPassword(e.target.value.toUpperCase());
                     setOutputUrl(null);
                     setError(null);
                  }}
                  placeholder={isEncrypt ? "CREATE SECRET KEY..." : "PASTE KEY HERE..."}
                  className="w-full bg-white border border-neutral-200 text-red-600 rounded-lg p-4 font-mono text-lg focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-200 uppercase transition-all placeholder-neutral-300"
                />
              </div>
              
              {/* Dynamic Morse Preview (Encrypt Only) */}
              {isEncrypt && password && (
                <div className="mt-2 bg-neutral-50 p-3 rounded border border-red-100">
                  <p className="text-[10px] text-red-600 font-mono mb-1">MORSE REPRESENTATION:</p>
                  <p className="font-mono text-sm text-red-500 break-all">{morsePreview}</p>
                </div>
              )}
            </div>

            {error && (
              <div className="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded border border-red-200 animate-pulse">
                <AlertTriangle size={18} />
                <span className="text-sm font-bold font-mono">{error}</span>
              </div>
            )}

            <button 
              onClick={processFile}
              disabled={!password || isProcessing}
              className={`w-full py-4 rounded-lg font-bold tracking-widest transition-all transform active:scale-95 shadow-lg shadow-red-900/5
                ${!password 
                  ? 'bg-neutral-100 text-neutral-400 cursor-not-allowed' 
                  : 'bg-red-600 hover:bg-red-700 text-white'
                }`}
            >
              {isProcessing ? 'PROCESSING...' : (isEncrypt ? 'ENCRYPT FILE' : 'UNLOCK FILE')}
            </button>

            {/* Output Area */}
            {outputUrl && (
              <div className="mt-6 p-5 rounded-lg border-2 bg-red-50 border-red-200 animate-fade-in">
                <div className="flex items-center gap-2 mb-4">
                  {isEncrypt ? <ShieldCheck className="text-red-600" /> : <Unlock className="text-red-600" />}
                  <span className="font-bold font-mono text-red-600">
                    {isEncrypt ? 'FILE SECURED' : 'FILE UNLOCKED'}
                  </span>
                </div>

                {isEncrypt ? (
                  <div className="flex flex-col gap-3">
                    <div className="flex gap-3">
                      <a 
                        href={outputUrl} 
                        download={`secure_${file.name}.enc`}
                        className="flex-1 flex items-center justify-center bg-neutral-100 hover:bg-neutral-200 text-neutral-800 py-3 rounded-lg font-medium transition-colors border border-neutral-200"
                      >
                        DOWNLOAD .ENC
                      </a>
                      <button 
                        onClick={handleGmailShare}
                        className="flex-1 flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg font-medium transition-colors"
                      >
                        <Send size={18} /> GMAIL KEY
                      </button>
                    </div>
                    <p className="text-[10px] text-neutral-500 text-center italic">Download the file first, then use the Gmail button to send the key.</p>
                  </div>
                ) : (
                  <div className="rounded-lg overflow-hidden bg-white shadow-xl border border-neutral-200">
                    <video 
                      key={outputUrl}
                      controls 
                      autoPlay 
                      className="w-full aspect-video"
                      src={outputUrl}
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function TranslatorView() {
  const [text, setText] = useState('');
  const [morse, setMorse] = useState('');

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setText(val);
    setMorse(textToMorse(val));
  };

  const handleMorseChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setMorse(val);
    setText(morseToText(val));
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="space-y-2">
        <label className="text-xs font-mono text-neutral-400">PLAIN TEXT INPUT</label>
        <textarea
          value={text}
          onChange={handleTextChange}
          placeholder="TYPE MESSAGE..."
          className="w-full bg-white p-3 rounded-lg border border-neutral-200 text-neutral-800 font-mono text-sm h-32 focus:border-red-600 focus:ring-1 focus:ring-red-200 outline-none uppercase resize-none placeholder-neutral-300"
        />
      </div>
      <div className="space-y-2">
        <label className="text-xs font-mono text-neutral-400">MORSE OUTPUT</label>
        <textarea
          value={morse}
          onChange={handleMorseChange}
          placeholder="... --- ..."
          className="w-full bg-white p-3 rounded-lg border border-neutral-200 text-red-600 font-mono text-sm h-32 focus:border-red-600 focus:ring-1 focus:ring-red-200 outline-none resize-none placeholder-neutral-300"
        />
      </div>
    </div>
  );
}