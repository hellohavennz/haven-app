import { useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2, BookOpen } from 'lucide-react';
import { getModules, getLessonsForModule, getAllLessons } from '../lib/content';
import { usePageTitle } from '../hooks/usePageTitle';

const MODULE_DESCRIPTIONS: Record<string, string> = {
  'values-and-principles':    'The rights, responsibilities, and principles that shape British society.',
  'what-is-uk':               'The nations, regions, and identity of the United Kingdom.',
  'history':                  'From early settlers to the present day — Britain\'s long history.',
  'modern-society':           'Culture, customs, sport, religion, and daily life in modern Britain.',
  'government-law-community': 'How the UK is governed, how laws work, and your role as a citizen.',
};

export default function ModuleComplete() {
  const { moduleSlug } = useParams<{ moduleSlug: string }>();
  const modules = useMemo(() => getModules(), []);
  const allLessons = useMemo(() => getAllLessons(), []);

  const currentModuleIndex = modules.findIndex(m => m.slug === moduleSlug);
  const currentModule = modules[currentModuleIndex] ?? null;
  const nextModule = currentModuleIndex >= 0 ? modules[currentModuleIndex + 1] ?? null : null;

  usePageTitle(
    currentModule ? `${currentModule.title} complete` : 'Module complete'
  );

  const nextLesson = useMemo(() => {
    if (!nextModule) return null;
    const lessons = getLessonsForModule(nextModule.slug);
    return lessons[0] ?? null;
  }, [nextModule]);

  const lessonCount = useMemo(() => {
    if (!currentModule) return 0;
    return getLessonsForModule(currentModule.slug).length;
  }, [currentModule]);

  const totalModules = modules.length;

  if (!currentModule) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-slate-500">Module not found.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-gray-950 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">

        {/* Completion card */}
        <div className="bg-teal-600 dark:bg-teal-700 rounded-3xl p-8 text-white text-center shadow-lg">
          <div className="flex justify-center mb-5">
            <div className="bg-white/20 rounded-full p-4">
              <CheckCircle2 className="h-10 w-10 text-white" />
            </div>
          </div>

          <p className="text-sm uppercase tracking-[0.35em] text-teal-100 mb-2">
            Module {currentModuleIndex + 1} of {totalModules} complete
          </p>
          <h1 className="text-2xl font-semibold mb-3">{currentModule.title}</h1>
          <p className="text-teal-100 text-sm">
            You've worked through all {lessonCount} lessons in this module.
          </p>
        </div>

        {/* Next module card */}
        {nextModule && nextLesson ? (
          <div className="mt-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-1">
              Up next
            </p>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-gray-100 mb-1">
              {nextModule.title}
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-5">
              {MODULE_DESCRIPTIONS[nextModule.slug] ?? `${nextModule.count} lessons`}
            </p>

            <Link
              to={`/content/${nextLesson.id}`}
              className="group flex items-center justify-between w-full bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-2xl px-5 py-3.5 transition-colors"
            >
              <span>Start {nextModule.title}</span>
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        ) : (
          /* Final module — all done */
          <div className="mt-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm text-center">
            <p className="text-slate-600 dark:text-slate-300 mb-5">
              You've worked through all {totalModules} modules. Time to put it all together.
            </p>
            <Link
              to="/exam"
              className="group inline-flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-2xl px-6 py-3.5 transition-colors"
            >
              Take a mock exam
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        )}

        {/* Secondary actions */}
        <div className="mt-4 flex items-center justify-center gap-6 text-sm">
          <Link
            to="/content"
            className="inline-flex items-center gap-1.5 text-slate-500 hover:text-teal-600 dark:text-slate-400 dark:hover:text-teal-400 font-medium transition-colors"
          >
            <BookOpen className="h-4 w-4" />
            Back to study dashboard
          </Link>
        </div>

      </div>
    </div>
  );
}
