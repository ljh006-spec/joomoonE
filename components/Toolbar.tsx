import React, { useRef } from 'react';
import { Download, FileText, Terminal, BookOpen, Upload, FileSpreadsheet, HelpCircle, Key } from 'lucide-react';
import { EvaluationTone } from '../types';

interface ToolbarProps {
  onExport: () => void;
  tone: EvaluationTone;
  setTone: (tone: EvaluationTone) => void;
  showPrompt: boolean;
  onTogglePrompt: () => void;
  showReference: boolean;
  onToggleReference: () => void;
  onDownloadTemplate: () => void;
  onFileUpload: (file: File) => void;
  showUsage: boolean;
  onToggleUsage: () => void;
  onOpenApiKeySettings: () => void;
}

export const Toolbar: React.FC<ToolbarProps> = ({ 
  onExport, 
  tone, 
  setTone,
  showPrompt,
  onTogglePrompt,
  showReference,
  onToggleReference,
  onDownloadTemplate,
  onFileUpload,
  showUsage,
  onToggleUsage,
  onOpenApiKeySettings
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileUpload(file);
    }
    // Reset value so same file can be selected again if needed
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-4 p-4 bg-white border-b border-slate-200 sticky top-0 z-10 shadow-sm">
      <div className="flex items-center gap-4">
         <div className="flex items-center gap-2">
            <div className="bg-indigo-600 p-2 rounded-lg">
                <FileText className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold text-slate-800">
                <span className="bg-gradient-to-r from-indigo-500 to-purple-500 text-transparent bg-clip-text font-extrabold mr-1">'주문진 빼밀리'</span>
                탈모 예방용 생기부 비서_<span className="bg-gradient-to-r from-indigo-500 to-purple-500 text-transparent bg-clip-text font-extrabold mr-1">'주문이'</span>(ver_1.0)
            </h1>
         </div>
         <div className="flex items-center gap-2">
            <button
              onClick={onToggleUsage}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full transition-all text-sm font-bold shadow-sm hover:shadow-md transform active:scale-95 border ${
                showUsage
                  ? 'bg-red-100 text-red-700 border-red-300 ring-2 ring-red-200 ring-offset-1'
                  : 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100'
              }`}
              title="사용 방법 보기"
            >
              <HelpCircle className="w-4 h-4" />
              <span>사용법(필독)</span>
            </button>
            <button
              onClick={onOpenApiKeySettings}
              className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 text-slate-600 border border-slate-200 rounded-full hover:bg-slate-200 transition-all text-sm font-medium"
              title="API Key 설정"
            >
              <Key className="w-4 h-4" />
              <span className="hidden sm:inline">Key 설정</span>
            </button>
         </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
        {/* Tone Selector */}
        <div className="flex bg-slate-100 p-1 rounded-lg">
          <button
            onClick={() => setTone(EvaluationTone.DESCRIPTIVE)}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
              tone === EvaluationTone.DESCRIPTIVE
                ? 'bg-white text-indigo-600 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            ~함/임 체
          </button>
          <button
            onClick={() => setTone(EvaluationTone.FORMAL)}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
              tone === EvaluationTone.FORMAL
                ? 'bg-white text-indigo-600 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            ~습니다 체
          </button>
        </div>

        <div className="h-6 w-px bg-slate-300 mx-1 hidden sm:block"></div>

        <button
          onClick={onTogglePrompt}
          className={`flex items-center gap-2 px-3 py-2 border rounded-lg transition-all text-sm font-bold shadow-sm ${
            showPrompt 
              ? 'bg-amber-700 border-amber-700 text-white hover:bg-amber-800' 
              : 'bg-white border-amber-200 text-amber-800 hover:bg-amber-50'
          }`}
          title="특별한 요구사항 입력"
        >
          <Terminal className="w-4 h-4" />
          <span className="hidden sm:inline">생성 규칙 입력</span>
        </button>

        <button
          onClick={onToggleReference}
          className={`flex items-center gap-2 px-3 py-2 border rounded-lg transition-all text-sm font-bold shadow-sm ${
            showReference 
              ? 'bg-amber-700 border-amber-700 text-white hover:bg-amber-800' 
              : 'bg-white border-amber-200 text-amber-800 hover:bg-amber-50'
          }`}
          title="참고할 문체/예시 입력"
        >
          <BookOpen className="w-4 h-4" />
          <span className="hidden sm:inline">생성 예시 입력</span>
        </button>

        <div className="h-6 w-px bg-slate-300 mx-1 hidden sm:block"></div>

        <button
            onClick={onDownloadTemplate}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-all text-sm font-medium shadow-sm"
            title="입력용 엑셀(CSV) 양식 다운로드"
        >
            <FileSpreadsheet className="w-4 h-4 text-green-600" />
            <span className="hidden sm:inline">양식 다운</span>
        </button>

        <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            accept=".csv" 
            className="hidden" 
        />
        
        <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-all text-sm font-medium shadow-sm"
            title="작성된 파일 업로드"
        >
            <Upload className="w-4 h-4 text-blue-600" />
            <span className="hidden sm:inline">파일 업로드</span>
        </button>

        <button
          onClick={onExport}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all text-sm font-medium shadow-md shadow-indigo-200"
        >
          <Download className="w-4 h-4" />
          <span className="hidden sm:inline">내보내기</span>
        </button>
      </div>
    </div>
  );
};