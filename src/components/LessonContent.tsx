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

const KeyFactTile: React.FC<{ facts: string[] }> = ({ facts }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextFact = () => {
    setCurrentIndex((prev) => (prev + 1) % facts.length);
  };

  if (facts.length === 0) return null;

  return (
    <div 
      onClick={nextFact}
      className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border-2 border-blue-200 cursor-pointer hover:border-blue-300 hover:shadow-md transition-all duration-300 my-8"
    >
      <div className="flex items-start justify-between mb-3">
        <h3 className="text-base font-semibold text-blue-900 flex items-center">
          <svg className="w-5 h-5 mr-2 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"/>
            <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd"/>
          </svg>
          Key Fact
        </h3>
        {facts.length > 1 && (
          <span className="text-sm text-blue-700 font-medium bg-blue-100 px-2.5 py-0.5 rounded-full">
            {currentIndex + 1} / {facts.length}
          </span>
        )}
      </div>
      
      <div className="relative overflow-hidden">
        <p className="text-gray-800 text-base leading-relaxed animate-fadeIn">
          {facts[currentIndex]}
        </p>
      </div>
      
      {facts.length > 1 && (
        <div className="mt-4 flex items-center justify-center">
          <button className="text-blue-700 hover:text-blue-800 text-sm font-medium flex items-center group">
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

const LessonContent: React.FC<LessonContentProps> = ({ sections, overview, key_facts, study_sections }) => {
  const factsPerSection = study_sections && key_facts ? Math.ceil(key_facts.length / study_sections.length) : 0;

  if (study_sections) {
    return (
      <div className="space-y-8">
        {/* Overview Section */}
        {overview && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-teal-400 to-cyan-400 px-6 py-4">
              <h2 className="text-2xl font-bold text-white">Overview</h2>
            </div>
            <div className="p-6">
              <div className="prose prose-lg max-w-none">
                {overview.split('\n\n').map((paragraph, pIndex) => (
                  <p key={pIndex} className="mb-4 text-gray-700 leading-relaxed">
                    {paragraph}
                  </p>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Study Sections with Key Facts after each */}
        {study_sections.map((section, index) => {
          const startIdx = index * factsPerSection;
          const endIdx = Math.min(startIdx + factsPerSection, key_facts?.length || 0);
          const sectionFacts = key_facts?.slice(startIdx, endIdx) || [];

          return (
            <div key={index}>
              {/* Study Section */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                {section.heading && (
                  <div className="bg-gradient-to-r from-teal-400 to-cyan-400 px-6 py-4">
                    <h2 className="text-2xl font-bold text-white">{section.heading}</h2>
                  </div>
                )}
                <div className="p-6">
                  <div className="prose prose-lg max-w-none">
                    {section.content.split('\n\n').map((paragraph, pIndex) => (
                      <p key={pIndex} className="mb-4 text-gray-700 leading-relaxed">
                        {paragraph}
                      </p>
                    ))}
                  </div>
                </div>
              </div>

              {/* Key Facts Tile after this section */}
              {sectionFacts.length > 0 && <KeyFactTile facts={sectionFacts} />}
            </div>
          );
        })}

        {/* Remaining Key Facts if any */}
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
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-r from-teal-400 to-cyan-400 px-6 py-4">
                <h2 className="text-2xl font-bold text-white">{section.title}</h2>
              </div>
              <div className="p-6">
                <div className="prose prose-lg max-w-none mb-6">
                  {section.content.split('\n\n').map((paragraph, pIndex) => (
                    <p key={pIndex} className="mb-4 text-gray-700 leading-relaxed">
                      {paragraph}
                    </p>
                  ))}
                </div>
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
    <div className="text-center text-gray-500 py-8">
      No content available for this lesson.
    </div>
  );
};

export default LessonContent;
