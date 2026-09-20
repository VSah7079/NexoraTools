import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, CornerDownLeft, Sparkles, ArrowRight } from 'lucide-react';
import * as Icons from 'lucide-react';
import { ALL_TOOLS } from '../../data/toolsData';
import type { ToolItem } from '../../types/tools';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setQuery('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  const filteredTools = ALL_TOOLS.filter((tool) => {
    const q = query.toLowerCase();
    return (
      tool.name.toLowerCase().includes(q) ||
      tool.description.toLowerCase().includes(q) ||
      tool.category.toLowerCase().includes(q) ||
      (tool.shortName && tool.shortName.toLowerCase().includes(q))
    );
  });

  const handleSelect = (tool: ToolItem) => {
    onClose();
    navigate(tool.path);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % (filteredTools.length || 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filteredTools.length) % (filteredTools.length || 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredTools[selectedIndex]) {
        handleSelect(filteredTools[selectedIndex]);
      }
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-2xl bg-slate-900/95 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-2xl shadow-black/60 overflow-hidden flex flex-col max-h-[80vh]"
        onKeyDown={handleKeyDown}
      >
        <div className="flex items-center px-4 py-4 border-b border-white/10 bg-slate-950/60">
          <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400 mr-3 shrink-0">
            <Search className="w-5 h-5" />
          </div>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Search all photo, ID card, PDF & print utilities..."
            className="w-full bg-transparent text-sm sm:text-base text-white placeholder-slate-500 focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/5 mr-1"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-flex items-center px-2 py-0.5 text-[10px] font-mono text-slate-400 bg-slate-800 rounded-lg border border-white/10">
            ESC
          </kbd>
        </div>

        {/* Quick Suggestion Chips when empty */}
        {!query && (
          <div className="px-4 py-2.5 bg-slate-950/40 border-b border-white/5 flex items-center gap-1.5 overflow-x-auto text-[11px] text-slate-400">
            <span className="font-semibold text-slate-500 shrink-0">Quick jump:</span>
            <button
              onClick={() => setQuery('passport')}
              className="px-2 py-0.5 rounded-md bg-white/5 hover:bg-white/10 text-slate-300 transition-colors shrink-0"
            >
              Passport Photo
            </button>
            <button
              onClick={() => setQuery('id')}
              className="px-2 py-0.5 rounded-md bg-white/5 hover:bg-white/10 text-slate-300 transition-colors shrink-0"
            >
              Aadhaar / ID Card
            </button>
            <button
              onClick={() => setQuery('compress')}
              className="px-2 py-0.5 rounded-md bg-white/5 hover:bg-white/10 text-slate-300 transition-colors shrink-0"
            >
              20KB Compress
            </button>
            <button
              onClick={() => setQuery('pdf')}
              className="px-2 py-0.5 rounded-md bg-white/5 hover:bg-white/10 text-slate-300 transition-colors shrink-0"
            >
              PDF Tools
            </button>
          </div>
        )}

        <div className="overflow-y-auto p-2 space-y-1.5 flex-1">
          {filteredTools.length === 0 ? (
            <div className="py-16 text-center text-slate-400 space-y-2">
              <Sparkles className="w-8 h-8 text-slate-600 mx-auto" />
              <p className="text-sm font-semibold">No tools matching "{query}"</p>
              <p className="text-xs text-slate-500">Try searching for "Passport", "Merge", "Compress", or "Scanner"</p>
            </div>
          ) : (
            filteredTools.map((tool, index) => {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              const Icon = (Icons as any)[tool.iconName] || Icons.FileText;
              const isSelected = index === selectedIndex;

              return (
                <button
                  key={tool.id}
                  onClick={() => handleSelect(tool)}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={`w-full flex items-center justify-between p-3 rounded-2xl text-left transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-lg shadow-indigo-600/30 translate-x-1'
                      : 'text-slate-300 hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div
                      className={`p-2.5 rounded-xl transition-all ${
                        isSelected
                          ? 'bg-white/20 text-white scale-105'
                          : `bg-gradient-to-br ${tool.color} text-white shadow-xs`
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="truncate">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm truncate">{tool.name}</span>
                        {tool.badge && (
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                              isSelected
                                ? 'bg-white/20 text-white'
                                : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                            }`}
                          >
                            {tool.badge}
                          </span>
                        )}
                      </div>
                      <span
                        className={`text-xs block truncate mt-0.5 ${
                          isSelected ? 'text-indigo-100' : 'text-slate-400'
                        }`}
                      >
                        {tool.description}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 ml-3">
                    <span
                      className={`text-[11px] capitalize px-2 py-0.5 rounded-md font-medium ${
                        isSelected ? 'bg-indigo-800 text-white' : 'bg-slate-800/80 text-slate-400 border border-white/5'
                      }`}
                    >
                      {tool.category}
                    </span>
                    {isSelected ? (
                      <CornerDownLeft className="w-4 h-4 text-white" />
                    ) : (
                      <ArrowRight className="w-4 h-4 text-slate-600" />
                    )}
                  </div>
                </button>
              );
            })
          )}
        </div>

        <div className="px-4 py-3 bg-slate-950/80 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-500">
          <div className="flex items-center gap-3">
            <span>↑↓ to navigate</span>
            <span>↵ to select</span>
            <span>ESC to dismiss</span>
          </div>
          <span className="font-semibold text-indigo-400">Nexora Command Palette</span>
        </div>
      </div>
    </div>
  );
};
