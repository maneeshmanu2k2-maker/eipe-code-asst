import React, { useState } from 'react';
import { Copy, Check, Code as CodeIcon } from 'lucide-react';

interface CodeViewerProps {
  code: string;
  language?: string;
  title?: string;
  maxHeight?: string;
  showLineNumbers?: boolean;
  highlightLines?: number[];
  badgeText?: string;
}

export const CodeViewer: React.FC<CodeViewerProps> = ({
  code,
  language = 'python',
  title,
  maxHeight = 'max-h-96',
  showLineNumbers = true,
  highlightLines = [],
  badgeText,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const lines = code.trim().split('\n');

  return (
    <div className="rounded-xl border border-slate-700/80 bg-slate-950 text-slate-100 overflow-hidden shadow-sm font-mono text-xs md:text-sm">
      <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900/90 border-b border-slate-800 text-xs">
        <div className="flex items-center gap-2 text-slate-300">
          <CodeIcon className="w-4 h-4 text-indigo-400" />
          <span className="font-medium">{title || `${language.toUpperCase()} Snippet`}</span>
          {badgeText && (
            <span className="ml-2 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              {badgeText}
            </span>
          )}
        </div>
        <button
          id={`copy-code-btn-${title ? title.toLowerCase().replace(/\s+/g, '-') : 'default'}`}
          onClick={handleCopy}
          className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors text-xs cursor-pointer"
          title="Copy code"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-400 font-sans text-xs">Copied</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span className="font-sans text-xs">Copy</span>
            </>
          )}
        </button>
      </div>

      <div className={`overflow-x-auto overflow-y-auto p-4 ${maxHeight} leading-relaxed`}>
        <table className="w-full border-collapse">
          <tbody>
            {lines.map((line, idx) => {
              const lineNum = idx + 1;
              const isHighlighted = highlightLines.includes(lineNum);
              return (
                <tr
                  key={idx}
                  className={`${isHighlighted ? 'bg-indigo-950/60 border-l-2 border-indigo-400' : 'hover:bg-slate-900/40'}`}
                >
                  {showLineNumbers && (
                    <td className="w-10 pr-4 text-right text-slate-600 select-none font-mono text-xs align-top">
                      {lineNum}
                    </td>
                  )}
                  <td className="text-slate-200 whitespace-pre font-mono">
                    {formatSyntax(line)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

function formatSyntax(line: string): React.ReactNode {
  // Simple syntax colorizer for Python keywords
  if (line.trim().startsWith('#')) {
    return <span className="text-slate-500 italic">{line}</span>;
  }

  const parts = line.split(/(\b(?:def|class|if|elif|else|while|for|return|import|from|in|and|or|not|None|True|False|assert|pass|self)\b|"[^"]*"|'[^']*'|[0-9]+)/g);

  return (
    <>
      {parts.map((part, i) => {
        if (/^(def|class|if|elif|else|while|for|return|import|from|in|and|or|not|assert|pass)$/.test(part)) {
          return <span key={i} className="text-purple-400 font-semibold">{part}</span>;
        }
        if (/^(None|True|False|self)$/.test(part)) {
          return <span key={i} className="text-amber-400 font-semibold">{part}</span>;
        }
        if (/^("[^"]*"|'[^']*')$/.test(part)) {
          return <span key={i} className="text-emerald-300">{part}</span>;
        }
        if (/^[0-9]+$/.test(part)) {
          return <span key={i} className="text-sky-300">{part}</span>;
        }
        return <span key={i}>{part}</span>;
      })}
    </>
  );
}
