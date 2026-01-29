
import React, { useState, useCallback, useEffect } from 'react';
import { CalculatorMode, HistoryItem } from './types';
import CalculatorBody from './components/CalculatorBody';
import AISolver from './components/AISolver';
import HistoryPanel from './components/HistoryPanel';
import { Calculator, Brain, History as HistoryIcon, Beaker } from 'lucide-react';

const App: React.FC = () => {
  const [mode, setMode] = useState<CalculatorMode>('standard');
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  const addToHistory = useCallback((expression: string, result: string) => {
    const newItem: HistoryItem = {
      id: Math.random().toString(36).substr(2, 9),
      expression,
      result,
      timestamp: Date.now()
    };
    setHistory(prev => [newItem, ...prev].slice(0, 50));
  }, []);

  const clearHistory = () => setHistory([]);

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 md:p-8">
      {/* Header / Navigation */}
      <div className="w-full max-w-4xl mb-8 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-indigo-600 rounded-2xl shadow-lg shadow-indigo-500/20">
            <Calculator className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
              Wlidat Mimi
            </h1>
            <p className="text-sm text-slate-500 font-medium">Next-gen mathematical interface</p>
          </div>
        </div>

        <nav className="flex bg-slate-900 p-1 rounded-xl border border-slate-800 shadow-xl">
          <button
            onClick={() => setMode('standard')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
              mode === 'standard' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Calculator className="w-4 h-4" />
            <span className="text-sm font-semibold">Standard</span>
          </button>
          <button
            onClick={() => setMode('scientific')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
              mode === 'scientific' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Beaker className="w-4 h-4" />
            <span className="text-sm font-semibold">Scientific</span>
          </button>
          <button
            onClick={() => setMode('ai-solver')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
              mode === 'ai-solver' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Brain className="w-4 h-4" />
            <span className="text-sm font-semibold">AI Solver</span>
          </button>
        </nav>

        <button
          onClick={() => setShowHistory(!showHistory)}
          className={`p-3 rounded-xl border transition-all ${
            showHistory 
              ? 'bg-slate-800 border-indigo-500 text-indigo-400' 
              : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
          }`}
        >
          <HistoryIcon className="w-5 h-5" />
        </button>
      </div>

      {/* Main Content Area */}
      <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className={`${showHistory ? 'lg:col-span-8' : 'lg:col-span-12'} transition-all duration-300 w-full`}>
          <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-3xl shadow-2xl overflow-hidden min-h-[500px] flex flex-col">
            {mode === 'ai-solver' ? (
              <AISolver />
            ) : (
              <CalculatorBody mode={mode} onCalculate={addToHistory} />
            )}
          </div>
        </div>

        {showHistory && (
          <div className="lg:col-span-4 w-full animate-in slide-in-from-right duration-300">
            <HistoryPanel history={history} onClear={clearHistory} />
          </div>
        )}
      </div>

      <footer className="mt-12 text-slate-600 text-xs text-center">
        &copy; 2024 Wlidat Mimi &bull; Advanced Scientific Engine powered by Gemini 3 Pro
      </footer>
    </div>
  );
};

export default App;
