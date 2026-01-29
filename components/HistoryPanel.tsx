
import React from 'react';
import { HistoryItem } from '../types';
import { Trash2, Clock } from 'lucide-react';

interface Props {
  history: HistoryItem[];
  onClear: () => void;
}

const HistoryPanel: React.FC<Props> = ({ history, onClear }) => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl flex flex-col max-h-[600px]">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <Clock className="w-5 h-5 text-indigo-400" /> History
        </h2>
        {history.length > 0 && (
          <button
            onClick={onClear}
            className="text-slate-500 hover:text-red-400 transition-colors"
            title="Clear History"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        )}
      </div>

      <div className="flex-grow overflow-y-auto space-y-4 pr-2">
        {history.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-slate-600 text-sm">
            <div className="w-12 h-12 border-2 border-dashed border-slate-800 rounded-full flex items-center justify-center mb-4">
              !
            </div>
            No calculations yet
          </div>
        ) : (
          history.map((item) => (
            <div 
              key={item.id} 
              className="p-4 bg-slate-800/30 rounded-2xl border border-slate-800 hover:border-slate-700 transition-all group"
            >
              <div className="mono text-slate-500 text-xs mb-1 group-hover:text-slate-400 truncate">
                {item.expression}
              </div>
              <div className="mono text-indigo-400 font-bold text-xl text-right">
                {item.result}
              </div>
              <div className="text-[10px] text-slate-600 mt-2 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {new Date(item.timestamp).toLocaleTimeString()}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default HistoryPanel;
