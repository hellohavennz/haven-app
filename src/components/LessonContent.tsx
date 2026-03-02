import React, { useState } from 'react';

interface Section {
  title: string;
  content: string;
  key_facts: string[];
}

interface StudySection {
  heading: string;
  content: string;
}

interface LessonContentProps {
  sections?: Section[];
  overview?: string;
  key_facts?: string[];
  study_sections?: StudySection[];
}

// ── Content renderer ──────────────────────────────────────────────────────────
// Splits on double-newlines to get blocks, then further parses each block for
// bullet lines (•) and numbered lines (1. 2. 3.) so they render as proper lists
// instead of collapsing onto a single line in HTML.

const isBulletLine = (line: string) => line.trim().startsWith('•');
const isNumberedLine = (line: string) => /^\s*\d+\./.test(line);

function renderContent(text: string): React.ReactNode {
  const blocks = text.split('\n\n');

  return (
    <div className="space-y-4">
      {blocks.map((block, blockIdx) => {
        const lines = block.split('\n').filter(l => l.trim() !== '');
        if (lines.length === 0) return null;

        const allBullets = lines.every(isBulletLine);
        const allNumbered = lines.every(isNumberedLine);

        // ── Pure bullet list ────────────────────────────────────────────────
        if (allBullets) {
          return (
            <ul key={blockIdx} className="space-y-2">
              {lines.map((line, i) => (
                <li key={i} className="flex items-start gap-2 text-slate-700 dark:text-slate-200">
                  <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-teal-500" />
                  <span className="leading-relaxed">{line.trim().replace(/^•\s*/, '')}</span>
                </li>
              ))}
            </ul>
          );
        }

        // ── Pure numbered list ──────────────────────────────────────────────
        if (allNumbered) {
          return (
            <ol key={blockIdx} className="space-y-2">
              {lines.map((line, i) => (
                <li key={i} className="flex items-start gap-3 text-slate-700 dark:text-slate-200">
                  <span className="flex-shrink-0 min-w-[1.4rem] font-semibold text-teal-600 dark:text-teal-400 leading-relaxed">
                    {line.match(/^\s*(\d+)\./)?.[1]}.
                  </span>
                  <span className="leading-relaxed">{line.trim().replace(/^\d+\.\s*/, '')}</span>
                </li>
              ))}
            </ol>
          );
        }

        // ── Mixed block: prose text + bullets/numbers interleaved ───────────
        if (lines.some(l => isBulletLine(l) || isNumberedLine(l))) {
          // Group consecutive lines of the same type into segments
          type SegType = 'text' | 'bullet' | 'numbered';
          const segments: { type: SegType; lines: string[] }[] = [];

          for (const line of lines) {
            const type: SegType = isBulletLine(line)
              ? 'bullet'
              : isNumberedLine(line)
              ? 'numbered'
              : 'text';

            if (segments.length === 0 || segments[segments.length - 1].type !== type) {
              segments.push({ type, lines: [line] });
            } else {
              segments[segments.length - 1].lines.push(line);
            }
          }

          return (
            <div key={blockIdx} className="space-y-2">
              {segments.map((seg, sIdx) => {
                if (seg.type === 'bullet') {
                  return (
                    <ul key={sIdx} className="space-y-2">
                      {seg.lines.map((line, i) => (
                        <li key={i} className="flex items-start gap-2 text-slate-700 dark:text-slate-200">
                          <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-teal-500" />
                          <span className="leading-relaxed">{line.trim().replace(/^•\s*/, '')}</span>
                        </li>
                      ))}
                    </ul>
                  );
                }
                if (seg.type === 'numbered') {
                  return (
                    <ol key={sIdx} className="space-y-2">
                      {seg.lines.map((line, i) => (
                        <li key={i} className="flex items-start gap-3 text-slate-700 dark:text-slate-200">
                          <span className="flex-shrink-0 min-w-[1.4rem] font-semibold text-teal-600 dark:text-teal-400 leading-relaxed">
                            {line.match(/^\s*(\d+)\./)?.[1]}.
                          </span>
                          <span className="leading-relaxed">{line.trim().replace(/^\d+\.\s*/, '')}</span>
                        </li>
                      ))}
                    </ol>
                  );
                }
                // Plain text lines within a mixed block
                return seg.lines.map((line, i) => (
                  <p key={`${sIdx}-${i}`} className="text-slate-700 leading-relaxed dark:text-slate-200">
                    {line}
                  </p>
                ));
              })}
            </div>
          );
        }

        // ── Plain paragraph ─────────────────────────────────────────────────
        return (
          <p key={blockIdx} className="text-slate-700 leading-relaxed dark:text-slate-200">
            {lines.join(' ')}
          </p>
        );
      })}
    </div>
  );
}

// ── Key Facts tile ────────────────────────────────────────────────────────────

const KeyFactTile: React.FC<{ facts: string[] }> = ({ facts }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (facts.length === 0) return null;

  const nextFact = () => setCurrentIndex((prev) => (prev + 1) % facts.length);

  return (
    <div
      onClick={nextFact}
      className="bg-gradient-to-br from-teal-50 via-emerald-50 to-teal-50 rounded-xl p-6 border-2 border-teal-300 cursor-pointer hover:border-teal-400 hover:shadow-md transition-all duration-300 my-8 dark:bg-gradient-to-br dark:from-gray-900 dark:via-gray-900 dark:to-gray-900 dark:border-teal-500/40"
    >
      <div className="flex items-start justify-between mb-3">
        <h3 className="font-semibold text-teal-900 dark:text-teal-100">
          Key Fact
        </h3>
        {facts.length > 1 && (
          <span className="text-sm text-teal-700 dark:text-teal-100 font-medium bg-teal-100 dark:bg-teal-500/10 px-2.5 py-0.5 rounded-full">
            {currentIndex + 1} / {facts.length}
          </span>
        )}
      </div>

      <div className="relative overflow-hidden">
        <p className="text-slate-800 dark:text-gray-100 text-base leading-relaxed animate-fadeIn">
          {facts[currentIndex]}
        </p>
      </div>

      {facts.length > 1 && (
        <div className="mt-4 flex items-center justify-center">
          <button className="text-teal-700 dark:text-teal-200 hover:text-teal-800 dark:hover:text-teal-100 text-sm font-medium flex items-center group">
            <span>Click for next fact</span>
            <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
};

// ── Main component ────────────────────────────────────────────────────────────

const LessonContent: React.FC<LessonContentProps> = ({ sections, overview, key_facts, study_sections }) => {
  const factsPerSection = study_sections && key_facts ? Math.ceil(key_facts.length / study_sections.length) : 0;

  if (study_sections) {
    return (
      <div className="space-y-8">
        {/* Overview */}
        {overview && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden dark:bg-slate-900 dark:border-slate-800">
            <div className="bg-[#0D9488] px-6 py-4">
              <h2 className="font-semibold text-white">Overview</h2>
            </div>
            <div className="p-6">
              {renderContent(overview)}
            </div>
          </div>
        )}

        {/* Study sections with key facts interleaved */}
        {study_sections.map((section, index) => {
          const startIdx = index * factsPerSection;
          const endIdx = Math.min(startIdx + factsPerSection, key_facts?.length || 0);
          const sectionFacts = key_facts?.slice(startIdx, endIdx) || [];

          return (
            <div key={index}>
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden dark:bg-slate-900 dark:border-slate-800">
                {section.heading && (
                  <div className="bg-[#0D9488] px-6 py-4">
                    <h2 className="font-semibold text-white">{section.heading}</h2>
                  </div>
                )}
                <div className="p-6">
                  {renderContent(section.content)}
                </div>
              </div>

              {sectionFacts.length > 0 && <KeyFactTile facts={sectionFacts} />}
            </div>
          );
        })}

        {/* Overflow key facts */}
        {key_facts && key_facts.length > study_sections.length * factsPerSection && (
          <KeyFactTile facts={key_facts.slice(study_sections.length * factsPerSection)} />
        )}
      </div>
    );
  }

  if (sections) {
    return (
      <div className="space-y-8">
        {sections.map((section, index) => (
          <div key={index}>
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden dark:bg-slate-900 dark:border-slate-800">
              <div className="bg-[#0D9488] px-6 py-4">
                <h2 className="font-semibold text-white">{section.title}</h2>
              </div>
              <div className="p-6">
                {renderContent(section.content)}
              </div>
            </div>
            {section.key_facts && section.key_facts.length > 0 && (
              <KeyFactTile facts={section.key_facts} />
            )}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="text-center text-slate-500 py-8 dark:text-slate-300">
      No content available for this lesson.
    </div>
  );
};

export default LessonContent;
