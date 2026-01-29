
import React, { useState, useEffect, useCallback } from 'react';
import { CalculatorMode } from '../types';
import { Delete, RotateCcw, Equal } from 'lucide-react';

interface Props {
  mode: CalculatorMode;
  onCalculate: (expr: string, res: string) => void;
}

const CalculatorBody: React.FC<Props> = ({ mode, onCalculate }) => {
  const [expression, setExpression] = useState('');
  const [result, setResult] = useState('');
  const [isError, setIsError] = useState(false);

  const handleInput = (val: string) => {
    setIsError(false);
    setExpression(prev => prev + val);
  };

  const handleClear = () => {
    setExpression('');
    setResult('');
    setIsError(false);
  };

  const handleBackspace = () => {
    setExpression(prev => prev.slice(0, -1));
  };

  const handleCalculate = useCallback(() => {
    try {
      if (!expression) return;
      
      // Basic math parsing
      // Note: In a production environment, use a robust math library like mathjs.
      // For this prototype, we handle basic replacement for scientific ops.
      let safeExpr = expression
        .replace(/×/g, '*')
        .replace(/÷/g, '/')
        .replace(/π/g, 'Math.PI')
        .replace(/e/g, 'Math.E')
        .replace(/sin\(/g, 'Math.sin(')
        .replace(/cos\(/g, 'Math.cos(')
        .replace(/tan\(/g, 'Math.tan(')
        .replace(/log\(/g, 'Math.log10(')
        .replace(/ln\(/g, 'Math.log(')
        .replace(/√\(/g, 'Math.sqrt(');

      // Handle square/cube etc if needed
      
      // Simple eval usage for demonstration within a sandbox. 
      // Functional but limited for complex nested parens in a basic string replace.
      const calcResult = eval(safeExpr);
      const formattedResult = Number.isInteger(calcResult) 
        ? calcResult.toString() 
        : parseFloat(calcResult.toFixed(8)).toString();
      
      setResult(formattedResult);
      onCalculate(expression, formattedResult);
    } catch (err) {
      setIsError(true);
      setResult('Error');
    }
  }, [expression, onCalculate]);

  const buttons = mode === 'scientific' ? [
    { label: 'sin', val: 'sin(', type: 'sci' },
    { label: 'cos', val: 'cos(', type: 'sci' },
    { label: 'tan', val: 'tan(', type: 'sci' },
    { label: 'π', val: 'π', type: 'sci' },
    { label: 'log', val: 'log(', type: 'sci' },
    { label: 'ln', val: 'ln(', type: 'sci' },
    { label: '(', val: '(', type: 'sci' },
    { label: ')', val: ')', type: 'sci' },
    { label: '√', val: '√(', type: 'sci' },
    { label: '^', val: '**', type: 'sci' },
  ] : [];

  const standardButtons = [
    { label: '7', val: '7', type: 'num' },
    { label: '8', val: '8', type: 'num' },
    { label: '9', val: '9', type: 'num' },
    { label: '÷', val: '÷', type: 'op' },
    { label: '4', val: '4', type: 'num' },
    { label: '5', val: '5', type: 'num' },
    { label: '6', val: '6', type: 'num' },
    { label: '×', val: '×', type: 'op' },
    { label: '1', val: '1', type: 'num' },
    { label: '2', val: '2', type: 'num' },
    { label: '3', val: '3', type: 'num' },
    { label: '-', val: '-', type: 'op' },
    { label: '.', val: '.', type: 'num' },
    { label: '0', val: '0', type: 'num' },
    { label: '%', val: '/100', type: 'op' },
    { label: '+', val: '+', type: 'op' },
  ];

  return (
    <div className="flex flex-col h-full">
      {/* Display Area */}
      <div className="p-8 bg-slate-900/80 border-b border-slate-800 flex flex-col items-end justify-center min-h-[160px]">
        <div className={`mono text-slate-500 text-lg mb-2 truncate w-full text-right ${isError ? 'text-red-400' : ''}`}>
          {expression || '0'}
        </div>
        <div className={`mono text-5xl font-bold transition-all ${isError ? 'text-red-500' : 'text-white'}`}>
          {result || '0'}
        </div>
      </div>

      {/* Controls */}
      <div className="p-6 grid grid-cols-4 gap-3 bg-slate-900/40">
        <button
          onClick={handleClear}
          className="col-span-2 p-4 rounded-2xl bg-slate-800/50 hover:bg-slate-800 text-red-400 font-bold transition-all flex items-center justify-center gap-2"
        >
          <RotateCcw className="w-4 h-4" /> CLEAR
        </button>
        <button
          onClick={handleBackspace}
          className="p-4 rounded-2xl bg-slate-800/50 hover:bg-slate-800 text-slate-300 transition-all flex items-center justify-center"
        >
          <Delete className="w-6 h-6" />
        </button>
        <button
          onClick={handleCalculate}
          className="p-4 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/20 transition-all flex items-center justify-center"
        >
          <Equal className="w-6 h-6" />
        </button>

        {buttons.map((btn) => (
          <button
            key={btn.label}
            onClick={() => handleInput(btn.val)}
            className="p-4 rounded-2xl bg-slate-800/30 hover:bg-slate-700/50 text-indigo-300 font-medium transition-all text-sm uppercase tracking-wider"
          >
            {btn.label}
          </button>
        ))}

        {standardButtons.map((btn) => (
          <button
            key={btn.label}
            onClick={() => handleInput(btn.val)}
            className={`p-4 rounded-2xl font-bold text-xl transition-all shadow-sm ${
              btn.type === 'op' 
                ? 'bg-slate-800/80 text-indigo-400 hover:bg-slate-700' 
                : 'bg-slate-800/40 text-white hover:bg-slate-800'
            }`}
          >
            {btn.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default CalculatorBody;
