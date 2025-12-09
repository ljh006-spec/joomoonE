import React, { useState, useEffect } from 'react';
import { Key, Save, Wifi, X, AlertCircle, CheckCircle, Eye, EyeOff, ExternalLink } from 'lucide-react';
import { testConnection, updateApiKey } from '../services/geminiService';

interface ApiKeySettingsProps {
  onClose: () => void;
}

const STORAGE_KEY = 'gh_smart_saenggibu_key_enc';
const SALT = 'GH_SMART_SECRET_SALT_2025';

// Simple XOR obfuscation + Base64 (Not military grade, but prevents plain text storage)
const encryptKey = (key: string): string => {
  try {
    const chars = key.split('');
    const saltChars = SALT.split('');
    const encrypted = chars.map((c, i) => 
      c.charCodeAt(0) ^ saltChars[i % saltChars.length].charCodeAt(0)
    );
    return btoa(String.fromCharCode(...encrypted));
  } catch (e) {
    console.error("Encryption failed", e);
    return '';
  }
};

const decryptKey = (encrypted: string): string => {
  try {
    const decoded = atob(encrypted);
    const chars = decoded.split('');
    const saltChars = SALT.split('');
    const decrypted = chars.map((c, i) => 
      String.fromCharCode(c.charCodeAt(0) ^ saltChars[i % saltChars.length].charCodeAt(0))
    );
    return decrypted.join('');
  } catch (e) {
    console.error("Decryption failed", e);
    return '';
  }
};

export const loadSavedApiKey = (): string => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
        return decryptKey(saved);
    }
    return '';
}

export const ApiKeySettings: React.FC<ApiKeySettingsProps> = ({ onClose }) => {
  const [apiKey, setApiKey] = useState('');
  const [status, setStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [showKey, setShowKey] = useState(false);

  useEffect(() => {
    const savedKey = loadSavedApiKey();
    if (savedKey) {
        setApiKey(savedKey);
    }
  }, []);

  const handleTest = async () => {
    if (!apiKey.trim()) {
        setStatus('error');
        setMessage('API 키를 입력해주세요.');
        return;
    }
    
    setStatus('testing');
    setMessage('연결 테스트 중...');
    
    const isConnected = await testConnection(apiKey);
    
    if (isConnected) {
        setStatus('success');
        setMessage('연결 성공!');
    } else {
        setStatus('error');
        setMessage('연결 실패. API 키를 확인해주세요.');
    }
  };

  const handleSave = () => {
    if (!apiKey.trim()) {
        setStatus('error');
        setMessage('저장할 API 키가 없습니다.');
        return;
    }

    try {
        const encrypted = encryptKey(apiKey);
        localStorage.setItem(STORAGE_KEY, encrypted);
        updateApiKey(apiKey);
        setStatus('success');
        setMessage('암호화되어 안전하게 저장되었습니다.');
        setTimeout(() => onClose(), 1500);
    } catch (e) {
        setStatus('error');
        setMessage('저장 중 오류가 발생했습니다.');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden">
        <div className="bg-indigo-600 p-4 flex items-center justify-between">
            <div className="flex items-center gap-2 text-white">
                <Key className="w-5 h-5" />
                <h2 className="font-bold text-lg">API Key 설정</h2>
            </div>
            <button onClick={onClose} className="text-white/80 hover:text-white transition-colors">
                <X className="w-5 h-5" />
            </button>
        </div>
        
        <div className="p-6">
            {/* Guide Section */}
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 mb-5">
                <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2 mb-2">
                    <span className="bg-indigo-100 text-indigo-600 p-1 rounded">TIP</span> 
                    무료 API Key 발급 방법
                </h3>
                <ol className="list-decimal list-inside space-y-2 text-xs text-slate-600 ml-1">
                    <li>
                        <a 
                            href="https://aistudio.google.com/app/apikey" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-indigo-600 font-bold hover:underline inline-flex items-center gap-1"
                        >
                            Google AI Studio 접속 <ExternalLink className="w-3 h-3" />
                        </a>
                    </li>
                    <li>구글 계정으로 로그인 후 <strong>[Create API key]</strong> 버튼 클릭</li>
                    <li>생성된 키를 복사하여 아래 입력창에 붙여넣기</li>
                </ol>
            </div>

            <div className="mb-4">
                <label className="block text-sm font-semibold text-slate-700 mb-2">Google Gemini API Key</label>
                <div className="relative">
                    <input 
                        type={showKey ? "text" : "password"}
                        value={apiKey}
                        onChange={(e) => {
                            setApiKey(e.target.value);
                            setStatus('idle');
                            setMessage('');
                        }}
                        placeholder="AI Studio에서 발급받은 키 입력"
                        className="w-full pl-3 pr-10 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all font-mono text-sm"
                    />
                    <button 
                        onClick={() => setShowKey(!showKey)}
                        className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                    >
                        {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                </div>
                <p className="text-xs text-slate-500 mt-2">
                    * 입력된 키는 브라우저 로컬 저장소에 암호화되어 저장됩니다.
                </p>
            </div>

            {message && (
                <div className={`mb-4 p-3 rounded-lg text-sm flex items-center gap-2 ${
                    status === 'success' ? 'bg-green-50 text-green-700' : 
                    status === 'error' ? 'bg-red-50 text-red-700' : 
                    'bg-blue-50 text-blue-700'
                }`}>
                    {status === 'success' && <CheckCircle className="w-4 h-4" />}
                    {status === 'error' && <AlertCircle className="w-4 h-4" />}
                    {status === 'testing' && <Wifi className="w-4 h-4 animate-pulse" />}
                    {message}
                </div>
            )}

            <div className="flex gap-2 pt-2">
                <button
                    onClick={handleTest}
                    disabled={status === 'testing' || !apiKey}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 border border-slate-300 text-slate-700 font-semibold rounded-lg hover:bg-slate-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <Wifi className="w-4 h-4" />
                    연결 테스트
                </button>
                <button
                    onClick={handleSave}
                    disabled={status === 'testing' || !apiKey}
                    className="flex-[1.5] flex items-center justify-center gap-2 py-2.5 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-all shadow-md shadow-indigo-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <Save className="w-4 h-4" />
                    저장 및 적용
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};