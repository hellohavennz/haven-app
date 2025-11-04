import React from 'react';

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

const LessonContent: React.FC<LessonContentProps> = ({ sections, overview, key_facts, study_sections }) => {
  // Handle new structure (study_sections + global key_facts)
  if (study_sections) {
    return (
      <div className="space-y-12">
        {/* Overview Section */}
        {overview && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
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

        {/* Study Sections */}
        {study_sections.map((section, index) => (
          <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            {section.heading && (
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
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
        ))}

        {/* Global Key Facts */}
        {key_facts && key_facts.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-green-600 to-green-700 px-6 py-4">
              <h2 className="text-2xl font-bold text-white">Key Facts to Remember</h2>
            </div>
            <div className="p-6">
              <div className="bg-green-50 rounded-lg p-6 border-l-4 border-green-600">
                <ul className="space-y-3">
                  {key_facts.map((fact, factIndex) => (
                    <li key={factIndex} className="flex items-start">
                      <span className="flex-shrink-0 w-2 h-2 bg-green-600 rounded-full mt-2 mr-3"></span>
                      <span className="text-gray-800">{fact}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Handle old structure (sections with embedded key_facts)
  if (sections) {
    return (
      <div className="space-y-12">
        {sections.map((section, index) => (
          <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
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
              {section.key_facts && section.key_facts.length > 0 && (
                <div className="mt-6 bg-blue-50 rounded-lg p-6 border-l-4 border-blue-600">
                  <h3 className="text-lg font-bold text-blue-900 mb-4 flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"/>
                      <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd"/>
                    </svg>
                    Key Facts to Remember
                  </h3>
                  <ul className="space-y-2">
                    {section.key_facts.map((fact, factIndex) => (
                      <li key={factIndex} className="flex items-start">
                        <span className="flex-shrink-0 w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3"></span>
                        <span className="text-gray-800">{fact}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
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
