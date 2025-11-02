import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getAllLessons } from "../lib/content";

export default function PracticeIndex() {
  const navigate = useNavigate();
  const allLessons = getAllLessons();

  useEffect(() => {
    // Redirect to first lesson automatically
    if (allLessons.length > 0) {
      navigate(`/practice/${allLessons[0].id}`, { replace: true });
    }
  }, [allLessons, navigate]);

  return (
    <div className="flex items-center justify-center h-full">
      <div className="text-center">
        <div className="animate-spin w-8 h-8 border-4 border-teal-600 border-t-transparent rounded-full mx-auto mb-4"></div>
        <p className="text-gray-600">Loading practice...</p>
      </div>
    </div>
  );
}
