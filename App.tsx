import React, { useState, useCallback, useEffect } from 'react';
import { StudentRecord, RecordStatus, EvaluationTone } from './types';
import { SpreadsheetRow } from './components/SpreadsheetRow';
import { Toolbar } from './components/Toolbar';
import { ApiKeySettings, loadSavedApiKey } from './components/ApiKeySettings';
import { generateStudentEvaluation, updateApiKey } from './services/geminiService';
import { Plus, Terminal, BookOpen, Check, FileText, Settings, HelpCircle, Users, BarChart3 } from 'lucide-react';

const DEFAULT_INSTRUCTION = `# 1. 역할(Role)

- **대한민국 중학교 교사**이자 학교생활기록부 기재 전문가로서의 페르소나를 수행함.
- **2025학년도 학교생활기록부 기재요령(중학교)**을 철저히 준수하며, '추가 작성 지침'이 있을 시 이를 최우선으로 반영함.
- 학생의 활동 결과물 자체에 대한 평가보다는 **활동 과정에서 드러난 학생의 역량과 태도를 교사의 관찰자 시점**에서 객관적이고 신뢰성 있게 기록함.
- 인공지능이 쓴 느낌을 배제하고, 학교 현장에서 실제 사용하는 자연스러운 어휘와 문장 구조를 사용하여 **사람(교사)이 직접 작성한 듯한 완성도 높은 글**을 작성함.

# 2. 핵심 작성 규칙(Core Rules)

- **철저한 관찰자 시점 유지**: 학생이 수행한 내용을 사실 그대로 나열하기보다, 그 활동을 통해 보인 모습(~함을 설명함, ~라고 서술함, ~한 점이 돋보임) 위주로 작성.
- **주어 생략**: '학생은', '이 학생은', 'OOO은', '위 학생' 등의 주어는 문맥상 이해 가능하므로 모두 생략함.
- **명사형 종결 필수**: 모든 문장은 '~함.', '~임.', '~보임.', '~드러냄.', '~제시함.' 등 명사형으로 깔끔하게 맺음.
- **금지 사항**:
  - LaTeX 문법 및 수식 기호 사용 금지 (한글로 풀어 쓰거나 복사 가능한 텍스트로 작성).
  - 학생 실명, 번호, 구체적 신상 정보 언급 금지.
  - 교외 수상 실적, 대회 참가 사실, '수행평가' 등의 단어 직접 언급 금지.
  - 부정적인 서술 지양 (부족한 점은 개선 노력과 성장 가능성으로 승화).
- **시제**: 과거형보다는 현재형 혹은 현재완료형 느낌(~함, ~보임)으로 생동감 있게 작성.

# 3. 작성 절차(Process)

1. **입력 자료 분석**: 제공된 수행평가 자료 및 교사 의견에서 학생의 핵심 역량, 태도, 활동 키워드를 추출.
2. **어조 및 분위기 설정**: 기계적인 나열을 피하고, 짧은 문장과 긴 문장을 적절히 혼합하여 리듬감 있고 자연스러운 줄글 형태 구상.
3. **초안 작성 (Step-by-Step)**:
   - 활동 동기 및 참여 태도 기술.
   - 구체적인 탐구 과정 및 문제 해결 노력(관찰 내용) 서술.
   - 활동을 통한 성장과 발전 가능성(정성 평가) 포함.
4. **자체 검수 및 수정(Self-Correction)**:
   - AI스러운 어색한 표현이나 번역투 문장을 학교 현장 용어로 순화.
   - 관찰자 시점이 아닌 부분(전지적 작가 시점 등)을 2인칭/3인칭 관찰자 시점으로 교정.
5. **최종 출력**: 미사여구 없이 생활기록부 입력란에 바로 붙여넣기 가능한 형태로 제공.

# 4. 관찰자 시점 작성 예시(Observation Examples)

- **[결과 중심(지양)]** → **[관찰 중심(지향)]**
- (X) 자율주행 차량의 경로 계획을 완벽하게 설계함.
  → (O) 자율주행 차량의 경로 계획 과정을 논리적으로 **서술함**. / 경로 계획을 주제로 심도 있게 **탐구함**.
- (X) 포물선 경로는 장애물 회피 시 안전한 전환을 가능하게 함. (단순 사실 나열)
  → (O) 포물선 경로가 장애물 회피 시 안전한 전환을 가능하게 함을 **설명함**. / 가능하다고 **발표하여 호응을 얻음**.
- (X) 힘든 과정 끝에 실험을 성공시킴.
  → (O) 수차례의 시행착오를 겪으면서도 끈기 있게 실험에 참여하여 유의미한 결과를 **도출해냄**.

# 5. 톤과 스타일(Tone & Style)

- **전문적이고 정중한 어조**: 교사의 권위와 애정이 동시에 느껴지는 따뜻하면서도 객관적인 어조.
- **서술어의 다양화**: 단순한 '함', '했음'의 반복을 피하고, 학생의 특성에 맞는 다채로운 서술어 활용.
- **자연스러운 연결**: 문단 구분 없이 하나의 긴 호흡으로 이어지되, 접속사(또한, 이를 통해, 나아가 등)를 적절히 활용하여 문장 간 유기적 연결 강화.
- **구체성 확보**: "열심히 함"보다는 "자료 수집 과정에서 도서관을 적극 활용하며"와 같이 구체적 행동 묘사.

# 6. 추천 서술어 및 어휘(Vocabulary)

- **탐구 및 사고**: 분석함, 추론함, 고찰함, 탐구함, 규명함, 통찰함, 이해함.
- **태도 및 인성**: 경청함, 조율함, 협력함, 주도함, 솔선수범함, 성실히 수행함, 끈기 있게 도전함.
- **표현 및 소통**: 발표함, 설명함, 설득함, 제안함, 시각화함, 체계적으로 정리함, 공유함.
- **성취 및 발전**: 도출함, 이끌어냄, 발휘함, 돋보임, 인상적임, 성장함, 확장함, 기여함.

# 7. 정성평가 및 긍정적 피드백 작성 팁

- **지적 호기심**: 단순 암기를 넘어 원리를 이해하려는 태도를 칭찬.
- **문제 해결력**: 결과의 성공 여부보다 난관을 극복하려는 의지와 과정을 높이 평가.
- **공동체 역량**: 개인의 우수성뿐만 아니라 동료와의 협업 및 나눔의 가치를 실천한 점 강조.
- **개별화**: 학생만의 고유한 에피소드나 특이점을 한 문장 이상 반드시 포함하여 '복사 붙여넣기' 느낌 배제.

# 8. **최종 출력 형태(Output Format)**

- 입력된 학생 정보를 바탕으로 작성된 **생활기록부 내용 한 문단(줄바꿈 없음)**을 출력.
- 글의 시작과 끝에 "작성된 내용은 다음과 같습니다" 등의 **불필요한 안내 문구 일체 생략**.
- 오직 생활기록부 시스템(NEIS)에 입력할 텍스트만 출력.`;

const DEFAULT_REFERENCE = `패시브 하우스의 단열 원리를 기반으로 친환경 주거 공간을 설계하는 과정에서 열전달 메커니즘인 전도, 대류, 복사의 개념을 명확히 이해하고 이를 건축 자재 선정에 적용하여 에너지 효율을 극대화하는 방안을 깊이 있게 탐구함. 지역별 기후 데이터와 태양의 남중 고도를 분석하여 차양 장치의 길이와 창문의 면적 비율을 수학적으로 계산해 냄으로써 냉난방 부하를 최소화하는 논리적인 설계 과정을 전개함. 특히 3D 모델링 프로그램을 활용해 가상의 주택을 구현하고 계절별 일조량 시뮬레이션을 수행하여 에너지 자립률을 예측하는 과정에서 기술적 데이터와 실생활 문제의 연관성을 구체적으로 설명하였으며, 단순한 구조적 설계를 넘어 지속 가능한 기술이 인간의 삶에 미치는 긍정적 영향을 강조함. 기술적 원리를 체계적으로 분석하고 이를 창의적인 아이디어로 구체화하는 능력이 뛰어나며 문제 해결 과정에서 공학적 사고와 인문학적 감수성을 융합하려는 시도가 돋보이는 학생임.`;

// Simple CSV parser that handles quotes
const parseCSV = (text: string) => {
  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentCell = '';
  let inQuotes = false;
  
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];
    
    if (inQuotes) {
      if (char === '"' && nextChar === '"') {
        currentCell += '"';
        i++; // Skip next quote
      } else if (char === '"') {
        inQuotes = false;
      } else {
        currentCell += char;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
      } else if (char === ',') {
        currentRow.push(currentCell.trim());
        currentCell = '';
      } else if (char === '\n' || char === '\r') {
        if (currentCell || currentRow.length > 0) {
            currentRow.push(currentCell.trim());
            rows.push(currentRow);
            currentRow = [];
            currentCell = '';
        }
        if (char === '\r' && nextChar === '\n') i++; // Handle CRLF
      } else {
        currentCell += char;
      }
    }
  }
  if (currentCell || currentRow.length > 0) {
    currentRow.push(currentCell.trim());
    rows.push(currentRow);
  }
  return rows;
};

const App: React.FC = () => {
  const [records, setRecords] = useState<StudentRecord[]>([]);
  const [tone, setTone] = useState<EvaluationTone>(EvaluationTone.DESCRIPTIVE);
  
  // Default Settings for new rows
  const [defaultCategory, setDefaultCategory] = useState('');
  const [defaultTargetLength, setDefaultTargetLength] = useState(500);
  const [rowCountInput, setRowCountInput] = useState(1);
  
  // Custom Instruction State
  const [showPrompt, setShowPrompt] = useState(false);
  const [customInstruction, setCustomInstruction] = useState(DEFAULT_INSTRUCTION); // Initialized with default

  // Reference Example State
  const [showReference, setShowReference] = useState(false);
  const [referenceExample, setReferenceExample] = useState('');

  // Usage Panel State
  const [showUsage, setShowUsage] = useState(false);
  
  // API Key Settings State
  const [showApiKeySettings, setShowApiKeySettings] = useState(false);

  // Initialize API Key from storage
  useEffect(() => {
    const savedKey = loadSavedApiKey();
    if (savedKey) {
        updateApiKey(savedKey);
    }
  }, []);

  // Ensures there's always at least one row, creating the initial state.
  useEffect(() => {
    if (records.length === 0) {
      handleAddRows(1);
    }
  }, [records.length]);

  const handleAddRows = useCallback((count: number) => {
    const newRecords = Array.from({ length: count }).map(() => ({
      id: crypto.randomUUID(),
      name: '',
      category: defaultCategory, // Use default setting
      keywords: '',
      targetLength: defaultTargetLength, // Use default setting
      generatedContent: '',
      status: RecordStatus.IDLE,
      lastUpdated: Date.now(),
    }));
    setRecords(prev => [...prev, ...newRecords]);
  }, [defaultCategory, defaultTargetLength]);


  const handleUpdateRecord = useCallback((id: string, field: keyof StudentRecord, value: string | number) => {
    setRecords(prev => prev.map(record => 
      record.id === id ? { ...record, [field]: value } : record
    ));
  }, []);

  const handleDeleteRecord = useCallback((id: string) => {
    setRecords(prev => {
      const filtered = prev.filter(record => record.id !== id);
      return filtered;
    });
  }, []);

  const handleGenerate = useCallback(async (id: string) => {
    const record = records.find(r => r.id === id);
    if (!record || !record.keywords.trim()) return;

    // Optimistic update to loading state
    setRecords(prev => prev.map(r => r.id === id ? { ...r, status: RecordStatus.GENERATING } : r));

    try {
      const generatedText = await generateStudentEvaluation(
        record.name || '학생', 
        record.category || '종합의견', 
        record.keywords, 
        tone,
        record.targetLength || 500,
        customInstruction,
        referenceExample
      );

      setRecords(prev => prev.map(r => 
        r.id === id ? { 
          ...r, 
          generatedContent: generatedText, 
          status: RecordStatus.COMPLETED 
        } : r
      ));
    } catch (error: any) {
      console.error(error);
      
      // Auto-open API settings if key is missing
      if (error.message && (error.message.includes("API Key") || error.message.includes("API key"))) {
          alert("API Key 설정이 필요합니다. 설정 창을 엽니다.");
          setShowApiKeySettings(true);
      }

      setRecords(prev => prev.map(r => 
        r.id === id ? { ...r, status: RecordStatus.ERROR } : r
      ));
    }
  }, [records, tone, customInstruction, referenceExample]);

  const handleExportCSV = useCallback(() => {
    const headers = ['이름', '영역', '목표 글자수', '키워드', '생성된 내용', '실제 글자수'];
    const csvContent = [
      headers.join(','),
      ...records.map(r => {
        const escape = (str: string) => `"${str.replace(/"/g, '""')}"`;
        return [
          escape(r.name),
          escape(r.category),
          r.targetLength,
          escape(r.keywords),
          escape(r.generatedContent),
          r.generatedContent.length
        ].join(',');
      })
    ].join('\n');

    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `saenggibu_export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [records]);

  const handleDownloadTemplate = useCallback(() => {
      const headers = ['이름', '영역', '목표 글자수', '키워드(활동내용)'];
      const exampleRow = ['홍길동', '진로활동', '500', '자율주행 자동차 탐구...'];
      const csvContent = [headers.join(','), exampleRow.join(',')].join('\n');
      
      const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'saenggibu_template.csv');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
  }, []);

  const handleFileUpload = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      if (!text) return;
      
      try {
        const rows = parseCSV(text);
        // Remove header row if it exists (check if first cell contains "이름" or "name")
        if (rows.length > 0 && (rows[0][0].includes('이름') || rows[0][0].includes('Name'))) {
            rows.shift();
        }

        const newRecords: StudentRecord[] = rows.filter(row => row.length >= 1 && row.some(cell => cell.trim())).map(row => ({
            id: crypto.randomUUID(),
            name: row[0] || '',
            category: row[1] || defaultCategory,
            targetLength: parseInt(row[2]) || defaultTargetLength,
            keywords: row[3] || '', // Assuming keywords is 4th column
            generatedContent: '',
            status: RecordStatus.IDLE,
            lastUpdated: Date.now()
        }));

        if (newRecords.length > 0) {
            setRecords(prev => {
                // Remove empty initial row if it exists and is untouched
                if (prev.length === 1 && !prev[0].name && !prev[0].keywords) {
                    return newRecords;
                }
                return [...prev, ...newRecords];
            });
            alert(`${newRecords.length}명의 학생 정보가 추가되었습니다.`);
        }
      } catch (err) {
        console.error("CSV Parse Error", err);
        alert("파일을 읽는 중 오류가 발생했습니다. 올바른 CSV 형식인지 확인해주세요.");
      }
    };
    reader.readAsText(file);
  }, [defaultCategory, defaultTargetLength]);

  const completedCount = records.filter(r => r.status === RecordStatus.COMPLETED).length;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Toolbar 
        onExport={handleExportCSV}
        tone={tone}
        setTone={setTone}
        showPrompt={showPrompt}
        onTogglePrompt={() => {
            setShowPrompt(prev => !prev);
            if (!showPrompt) { setShowReference(false); setShowUsage(false); setShowApiKeySettings(false); }
        }}
        showReference={showReference}
        onToggleReference={() => {
            setShowReference(prev => !prev);
            if (!showReference) { setShowPrompt(false); setShowUsage(false); setShowApiKeySettings(false); }
        }}
        onDownloadTemplate={handleDownloadTemplate}
        onFileUpload={handleFileUpload}
        showUsage={showUsage}
        onToggleUsage={() => {
            setShowUsage(prev => !prev);
            if (!showUsage) { setShowPrompt(false); setShowReference(false); setShowApiKeySettings(false); }
        }}
        onOpenApiKeySettings={() => setShowApiKeySettings(true)}
      />

      {/* API Key Settings Modal */}
      {showApiKeySettings && (
        <ApiKeySettings onClose={() => setShowApiKeySettings(false)} />
      )}

      {/* How to Use Panel */}
      {showUsage && (
        <div className="bg-sky-800/95 p-4 border-b border-sky-700 animate-in slide-in-from-top-2 duration-200">
          <div className="max-w-[1600px] mx-auto">
            <div className="flex items-start gap-4">
              <HelpCircle className="w-6 h-6 text-sky-300 mt-1 flex-shrink-0" />
              <div className="flex-1 text-sky-100">
                <h3 className="text-lg font-bold text-white mb-3">사용 방법 안내</h3>
                <ol className="list-decimal list-inside space-y-3 text-sm leading-relaxed">
                    <li>
                        <strong className="font-semibold text-white">API Key 설정:</strong> 상단 툴바의 <strong className="text-amber-300">'Key 설정'</strong> 버튼을 눌러 본인의 Gemini API Key를 저장하세요. 키는 로컬에 안전하게 저장됩니다.
                    </li>
                    <li>
                        <strong className="font-semibold text-white">'생성 규칙', '생성 예시' 설정:</strong> 툴바 상단의 해당 버튼을 클릭하고 규칙과 예시를 입력합니다.(선택 사항으로 필요 시 <strong className="text-amber-300">'자동 입력' </strong>버튼을 활용하여 내용 입력도 가능합니다. 규칙은 입력 강력 추천)
                    </li>
                    <li>
                        <strong className="font-semibold text-white">기본 설정:</strong> 테이블 상단의 '영역', '목표 글자수'에 적용할 내용을 입력합니다.(학생 추가 시 이 설정이 기본 적용됩니다.)
                    </li>
                    <li>
                        <strong className="font-semibold text-white">학생 추가:</strong> 테이블 상단의 <strong className="text-amber-300">'N 명 추가'</strong> 버튼이나 테이블 하단의 <strong className="text-amber-300">'학생 추가하기'</strong> 버튼으로 작업할 행을 만듭니다.
                    </li>
                    <li>
                        <strong className="font-semibold text-white">정보 입력:</strong> 학생 이름, 영역, 목표 글자수, 그리고 필수 요소인 <strong className="text-amber-300">'키워드 및 관찰 내용'</strong>을 각 행에 입력합니다. 키워드가 구체적일수록 AI가 더 좋은 결과를 생성합니다.
                    </li>
                    <li>
                        <strong className="font-semibold text-white">AI 생성:</strong> 개별 생성은 해당 행의 <strong className="text-amber-300">반짝이는 아이콘</strong>을 클릭하세요.
                    </li>
                    <li>
                        <strong className="font-semibold text-white">파일 관리:</strong> <strong className="text-amber-300">'양식 다운'</strong>으로 CSV 템플릿을 받고, <strong className="text-amber-300">'파일 업로드'</strong>로 여러 학생 정보를 한번에 불러올 수 있습니다. 작업이 끝나면 <strong className="text-amber-300">'내보내기'</strong>로 결과를 저장하세요.
                    </li>
                </ol>
                <div className="flex justify-end mt-4">
                     <button
                        onClick={() => setShowUsage(false)}
                        className="px-4 py-1.5 bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold rounded shadow-sm transition-all"
                    >
                        닫기
                    </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Command Prompt Input Area */}
      {showPrompt && (
        <div className="bg-slate-800 p-4 border-b border-slate-700 animate-in slide-in-from-top-2 duration-200">
          <div className="max-w-[1600px] mx-auto">
            <div className="flex items-start gap-3">
              <Terminal className="w-5 h-5 text-indigo-400 mt-2" />
              <div className="flex-1">
                <label className="block text-xs font-semibold text-slate-400 mb-1 uppercase tracking-wider">
                  커스텀 생성 기준 (모든 생성에 적용됨)
                </label>
                <textarea
                  value={customInstruction}
                  onChange={(e) => setCustomInstruction(e.target.value)}
                  placeholder="예: 구체적인 사례를 들어서 설명해줘. 리더십이 돋보이게 작성해줘. 너무 추상적인 표현은 피해줘."
                  className="w-full bg-slate-900/50 text-slate-200 p-3 rounded-lg border border-slate-700 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none transition-all text-sm leading-relaxed min-h-[160px]"
                />
                <div className="flex flex-wrap items-center justify-end gap-2 mt-2">
                    <button
                        onClick={() => setCustomInstruction(DEFAULT_INSTRUCTION)}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-700 rounded transition-colors"
                        title="권장되는 기본 작성 기준을 불러옵니다"
                    >
                        <FileText className="w-3.5 h-3.5" />
                        자동 입력
                    </button>
                    <button
                        onClick={() => setShowPrompt(false)}
                        className="flex items-center gap-1.5 px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded shadow-sm transition-all"
                    >
                        <Check className="w-3.5 h-3.5" />
                        적용
                    </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reference Example Input Area */}
      {showReference && (
        <div className="bg-emerald-900/90 p-4 border-b border-emerald-800 animate-in slide-in-from-top-2 duration-200">
          <div className="max-w-[1600px] mx-auto">
            <div className="flex items-start gap-3">
              <BookOpen className="w-5 h-5 text-emerald-300 mt-2" />
              <div className="flex-1">
                <label className="block text-xs font-semibold text-emerald-200/80 mb-1 uppercase tracking-wider">
                  작성 예시 (이 스타일을 따라 생성합니다)
                </label>
                <textarea
                  value={referenceExample}
                  onChange={(e) => setReferenceExample(e.target.value)}
                  placeholder="예시 텍스트를 붙여넣으세요. AI가 이 예시의 문체, 어휘, 구성 방식을 분석하여 비슷하게 생성합니다."
                  className="w-full bg-emerald-950/40 text-emerald-50 p-3 rounded-lg border border-emerald-700/50 focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 focus:outline-none transition-all text-sm leading-relaxed min-h-[120px]"
                />
                <div className="flex flex-wrap items-center justify-end gap-2 mt-2">
                    <button
                        onClick={() => setReferenceExample(DEFAULT_REFERENCE)}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-emerald-200 hover:text-white hover:bg-emerald-800 rounded transition-colors"
                        title="권장되는 기본 예시를 불러옵니다"
                    >
                        <FileText className="w-3.5 h-3.5" />
                        자동 입력
                    </button>
                    <button
                        onClick={() => setShowReference(false)}
                        className="flex items-center gap-1.5 px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded shadow-sm transition-all"
                    >
                        <Check className="w-3.5 h-3.5" />
                        적용
                    </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <main className="flex-1 p-4 sm:p-6 overflow-auto">
        <div className="max-w-[1600px] mx-auto bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          
          {/* Default Settings Bar */}
          <div className="bg-slate-50/80 border-b border-slate-200 p-3 px-4 flex flex-wrap items-center justify-between gap-4 text-sm">
            <div className="flex flex-wrap items-center gap-6">
                <div className="flex items-center gap-2 text-slate-700 font-semibold">
                <Settings className="w-4 h-4 text-slate-500" />
                <span>기본 설정 (새 행 추가 시 적용)</span>
                </div>
                
                <div className="flex items-center gap-2">
                <label className="text-slate-500">영역:</label>
                <input
                    type="text"
                    value={defaultCategory}
                    onChange={(e) => setDefaultCategory(e.target.value)}
                    placeholder="예: 과세특, 행발 등"
                    className="w-32 bg-white border border-slate-300 rounded px-2 py-1 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
                />
                </div>

                <div className="flex items-center gap-2">
                <label className="text-slate-500">목표 글자수:</label>
                <div className="relative w-24">
                    <input
                    type="number"
                    value={defaultTargetLength}
                    onChange={(e) => setDefaultTargetLength(Number(e.target.value))}
                    step={50}
                    min={100}
                    className="w-full bg-white border border-slate-300 rounded px-2 py-1 pr-6 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all text-right"
                    />
                    <span className="absolute right-2 top-1.5 text-[10px] text-slate-400 pointer-events-none">자</span>
                </div>
                </div>

                <div className="flex items-center gap-2 ml-2 pl-4 border-l border-slate-300">
                    <div className="flex items-center gap-1 bg-white border border-slate-300 rounded p-0.5 shadow-sm">
                        <Users className="w-4 h-4 text-slate-400 ml-2" />
                        <input
                            type="number"
                            min="1"
                            max="50"
                            value={rowCountInput}
                            onChange={(e) => setRowCountInput(Math.max(1, parseInt(e.target.value) || 0))}
                            className="w-12 text-sm outline-none text-right font-medium text-slate-700 py-1"
                        />
                        <span className="text-xs text-slate-500 mr-2">명</span>
                        <button
                            onClick={() => handleAddRows(rowCountInput)}
                            className="flex items-center gap-1 px-3 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-md text-sm font-medium transition-all"
                        >
                            <Plus className="w-3.5 h-3.5" />
                            추가
                        </button>
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-4 text-sm font-medium text-slate-600 bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm">
                <div className="flex items-center gap-1.5">
                    <span className="text-slate-400">총 인원:</span>
                    <span className="text-indigo-600 font-bold">{records.length}</span>
                    <span className="text-slate-400">명</span>
                </div>
                <div className="h-4 w-px bg-slate-300"></div>
                <div className="flex items-center gap-1.5">
                    <span className="text-slate-400">작성 완료:</span>
                    <span className="text-green-600 font-bold">{completedCount}</span>
                    <span className="text-slate-400">명</span>
                </div>
            </div>
            
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500 font-semibold">
                  <th className="p-3 border-r border-slate-200 w-[120px]">학생 이름<span className="ml-1 text-[10px] font-normal text-slate-400 lowercase">(선택)</span></th>
                  <th className="p-3 border-r border-slate-200 w-[150px]">영역<span className="ml-1 text-[10px] font-normal text-slate-400 lowercase">(선택)</span></th>
                  <th className="p-3 border-r border-slate-200 w-[90px]">글자수
                    <span className="ml-1 text-[10px] font-normal text-slate-400 lowercase">(내외)</span></th>
                  <th className="p-3 border-r border-slate-200 w-[30%]">
                    키워드 및 관찰 내용 
                    <span className="ml-1 text-[10px] font-normal text-slate-400 lowercase">(필수)</span>
                  </th>
                  <th className="p-3 border-r border-slate-200">생성 결과 (수정 가능)</th>
                  <th className="p-3 w-[100px] text-center">관리</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {records.map(record => (
                  <SpreadsheetRow
                    key={record.id}
                    record={record}
                    onUpdate={handleUpdateRecord}
                    onDelete={handleDeleteRecord}
                    onGenerate={handleGenerate}
                  />
                ))}
                {records.length === 0 && (
                    <tr>
                        <td colSpan={6} className="p-8 text-center text-slate-400">
                            상단 툴바에서 인원 수를 입력하고 [추가] 버튼을 눌러 시작하세요.
                        </td>
                    </tr>
                )}
              </tbody>
            </table>
          </div>
          
          {/* Quick Add Button Bottom */}
          <button 
            onClick={() => handleAddRows(1)}
            className="w-full p-3 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 border-t border-slate-200 transition-all flex items-center justify-center gap-2 text-sm font-medium"
          >
            <Plus className="w-4 h-4" />
            학생 추가하기
          </button>
          
        </div>

        {/* Footer info moved here */}
        <div className="max-w-[1600px] mx-auto mt-4 text-center text-slate-500 text-sm space-y-1">
            <p>
            </p>
            <p className="font-semibold text-slate-700">
                    <span className="text-red-600">'주문이'</span>는 주문진 빼밀리의 탈모 예방과 손목 보호를 위해 만들어졌습니다. 사용에 있어서 책임은 전적으로 사용자에게 있습니다. ^^; 
            </p>
            <p className="font-semibold text-slate-700"> <span className="text-red-600">외부 공유는 하지 말아주세요. 조금 열어뒀다 문닫겠습니다. 형님들을 위해 드립니다.</span>
            </p>
            <p className="font-semibold text-slate-700 mt-2"> <span className="text-red-600 text-3xl">특히 호건 형님은 사용법 피~일~~또~~옥~!! 해주세욧! ^^농담입니다.ㅋㅋ</span>
            </p>
            <p></p>
            <p> Google Gemini 2.5 Flash를 사용하여 생성됩니다. 생성된 내용은 반드시 검토 후 사용하세요.
            </p>
            <p>
                무료 API key를 사용하는 경우 할당량이 초과하여 응답이 제한될 수 있습니다.
            </p>
        </div>
      </main>
    </div>
  );
};

export default App;