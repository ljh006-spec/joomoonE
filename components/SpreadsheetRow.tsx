import React, { useCallback, useState } from 'react';
import { RecordStatus, StudentRecord } from '../types';
import { Sparkles, Trash2, Copy, CheckCircle, RefreshCw, AlertCircle } from 'lucide-react';

interface SpreadsheetRowProps {
  record: StudentRecord;
  onUpdate: (id: string, field: keyof StudentRecord, value: string | number) => void;
  onDelete: (id: string) => void;
  onGenerate: (id: string) => void;
}

export const SpreadsheetRow: React.FC<SpreadsheetRowProps> = ({ 
  record, 
  onUpdate, 
  onDelete, 
  onGenerate 
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    if (record.generatedContent) {
      try {
        await navigator.clipboard.writeText(record.generatedContent);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error('Failed to copy', err);
      }
    }
  }, [record.generatedContent]);

  const getStatusIcon = () => {
    switch (record.status) {
      case RecordStatus.GENERATING:
        return <RefreshCw className="w-5 h-5 text-blue-500 animate-spin" />;
      case RecordStatus.COMPLETED:
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case RecordStatus.ERROR:
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Sparkles className="w-5 h-5 text-slate-400 hover:text-indigo-500 transition-colors" />;
    }
  };

  return (
    <tr className="group border-b border-slate-200 hover:bg-slate-50 transition-colors">
      {/* Name Input */}
      <td className="p-2 border-r border-slate-100 align-top w-[120px]">
        <input
          type="text"
          value={record.name}
          onChange={(e) => onUpdate(record.id, 'name', e.target.value)}
          placeholder="이름"
          className="w-full bg-transparent p-2 rounded border border-transparent hover:border-slate-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none transition-all text-sm font-medium"
        />
      </td>

      {/* Category Input */}
      <td className="p-2 border-r border-slate-100 align-top w-[150px]">
        <input
          type="text"
          value={record.category}
          onChange={(e) => onUpdate(record.id, 'category', e.target.value)}
          placeholder="과세특, 행발, 진로..."
          className="w-full bg-transparent p-2 rounded border border-transparent hover:border-slate-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none transition-all text-sm"
        />
      </td>

      {/* Target Length Input */}
      <td className="p-2 border-r border-slate-100 align-top w-[90px]">
        <div className="relative">
            <input
            type="number"
            value={record.targetLength}
            onChange={(e) => onUpdate(record.id, 'targetLength', Number(e.target.value))}
            placeholder="500"
            step={50}
            min={10}
            className="w-full bg-transparent p-2 pr-1 rounded border border-transparent hover:border-slate-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none transition-all text-sm text-right"
            />
            <span className="absolute right-2 top-2 text-[10px] text-slate-400 pointer-events-none mt-0.5">자</span>
        </div>
      </td>

      {/* Keywords Input (TextArea) */}
      <td className="p-2 border-r border-slate-100 align-top w-[30%]">
        <textarea
          value={record.keywords}
          onChange={(e) => onUpdate(record.id, 'keywords', e.target.value)}
          placeholder="학생의 특징, 활동 내용, 성취기준, 성취수준 등을 키워드나 문장으로 입력하세요...'생성규칙'과 '생성예시'는 접속할 때마다 초기화 됩니다. 입력상태를 확인하세요"
          className="w-full min-h-[80px] bg-transparent p-2 rounded border border-transparent hover:border-slate-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none transition-all resize-y text-sm leading-relaxed"
        />
      </td>

      {/* Generated Content (TextArea) */}
      <td className="p-2 border-r border-slate-100 align-top relative">
        <textarea
          value={record.generatedContent}
          onChange={(e) => onUpdate(record.id, 'generatedContent', e.target.value)}
          placeholder="AI 생성 결과가 여기에 표시됩니다. 직접 수정도 가능합니다."
          className={`w-full min-h-[80px] bg-white p-3 pr-8 rounded border ${record.status === RecordStatus.COMPLETED ? 'border-green-200 ring-1 ring-green-100' : 'border-slate-200'} focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none transition-all resize-y text-sm leading-relaxed shadow-sm`}
        />
        <div className="flex items-center gap-2 absolute top-3 right-3">
             {record.generatedContent && (
                 <span className="text-[10px] text-slate-400 font-mono bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100">
                     {record.generatedContent.length}자
                 </span>
             )}
             {record.generatedContent && (
                 <button
                 onClick={handleCopy}
                 className="p-1 rounded-md hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                 title="복사하기"
               >
                 {copied ? <CheckCircle className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
               </button>
            )}
        </div>
      </td>

      {/* Actions */}
      <td className="p-2 align-top w-[100px] text-center">
        <div className="flex flex-col gap-2 items-center pt-1">
          <button
            onClick={() => onGenerate(record.id)}
            disabled={record.status === RecordStatus.GENERATING || !record.keywords.trim()}
            className={`p-2 rounded-full transition-all duration-200 ${
              record.status === RecordStatus.GENERATING 
                ? 'bg-blue-50 cursor-not-allowed' 
                : 'hover:bg-indigo-50 text-slate-500 hover:text-indigo-600'
            }`}
            title="AI 생성/재생성"
          >
            {getStatusIcon()}
          </button>
          
          <button
            onClick={() => onDelete(record.id)}
            className="p-2 rounded-full text-slate-300 hover:text-red-500 hover:bg-red-50 transition-colors"
            title="삭제"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </td>
    </tr>
  );
};