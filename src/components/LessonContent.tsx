import React from 'react';

interface Section {
  title: string;
  content: string;
  key_facts: string[];
}

interface LessonContentProps {
  sections: Section[];
}

const LessonContent: React.FC<LessonContentProps> = ({ sections }) => {
  return (
    <div className="space-y-12">
      {sections.map((section, index) => (
        <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {/* Section Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
            <h2 className="text-2xl font-bold text-white">{section.title}</h2>
          </div>

          {/* Section Content */}
          <div className="p-6">
            <div className="prose prose-lg max-w-none mb-6">
              {section.content.split('\n\n').map((paragraph, pIndex) => (
                <p key={pIndex} className="mb-4 text-gray-700 leading-relaxed">
                  {paragraph}
                </p>
              ))}
            </div>

            {/* Key Facts for this section */}
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
          </div>
        </div>
      ))}
    </div>
  );
};

export default LessonContent;
