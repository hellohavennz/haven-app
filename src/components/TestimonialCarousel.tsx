import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";

type Testimonial = {
  name: string;
  location: string;
  country: string;
  rating: number;
  text: string;
  result: string;
};

const testimonials: Testimonial[] = [
  {
    name: "Amara Okonkwo",
    location: "Manchester",
    country: "Nigeria",
    rating: 5,
    text: "I was so nervous about the test, but Haven made everything clear and simple. The plain-English explanations helped me understand British history and culture properly. I passed on my first attempt with 22/24!",
    result: "Passed first try with 22/24",
  },
  {
    name: "Rajesh Patel",
    location: "Birmingham",
    country: "India",
    rating: 5,
    text: "The practice questions were exactly like the real test. I studied for just two weeks using Haven, 30 minutes each day during my commute. The flashcards were perfect for quick revision. Highly recommend!",
    result: "Passed after 2 weeks of study",
  },
  {
    name: "Maria Santos",
    location: "London",
    country: "Philippines",
    rating: 5,
    text: "As a working mum with two children, I didn't have much time to study. Haven's mobile-friendly design meant I could practice during my lunch break. The progress tracker kept me motivated. Thank you!",
    result: "Passed while working full-time",
  },
  {
    name: "Chen Wei",
    location: "Edinburgh",
    country: "China",
    rating: 5,
    text: "I failed my first test using another study guide. Haven was different - the questions felt more realistic and the explanations actually helped me understand, not just memorize. Passed the second time with confidence.",
    result: "Passed on second attempt",
  },
  {
    name: "Andrei Popescu",
    location: "Bristol",
    country: "Romania",
    rating: 5,
    text: "The mock exams were brilliant for building confidence. I kept scoring 80%+ on Haven's tests, so I knew I was ready for the real thing. The £9.99 was the best money I've spent on my UK journey.",
    result: "Scored 23/24 on real test",
  },
];

export default function TestimonialCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [direction, setDirection] = useState<'left' | 'right'>('right');

  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      setDirection('right');
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, 10000);

    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  const goToNext = () => {
    setIsAutoPlaying(false);
    setDirection('right');
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const goToPrevious = () => {
    setIsAutoPlaying(false);
    setDirection('left');
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const goToSlide = (index: number) => {
    setIsAutoPlaying(false);
    setDirection(index > currentIndex ? 'right' : 'left');
    setCurrentIndex(index);
  };

  return (
    <div className="relative mx-auto max-w-4xl">
      <div className="relative overflow-hidden rounded-3xl border bg-[var(--bg)]">
        <div className="relative" style={{ minHeight: '400px' }}>
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className={`absolute inset-0 p-8 md:p-12 transition-all duration-700 ease-in-out ${
                index === currentIndex
                  ? 'translate-x-0 opacity-100'
                  : index < currentIndex
                  ? direction === 'right' ? '-translate-x-full opacity-0' : 'translate-x-full opacity-0'
                  : direction === 'right' ? 'translate-x-full opacity-0' : '-translate-x-full opacity-0'
              }`}
            >
              <div className="mb-6 flex items-center gap-1">
                {Array.from({ length: testimonial.rating }).map((_, i) => (
                  <Star key={i} className="h-5 w-5 text-[var(--accent-secondary)]" />
                ))}
              </div>

              <blockquote className="mb-6 text-lg leading-relaxed text-[var(--text-secondary)] md:text-xl">
                "{testimonial.text}"
              </blockquote>

              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[var(--accent-secondary)]/30 px-4 py-2 text-sm font-semibold text-[var(--text-primary)]">
                ✓ {testimonial.result}
              </div>

              <div className="flex items-center justify-between border-t pt-6">
                <div>
                  <div className="font-semibold text-[var(--text-primary)]">{testimonial.name}</div>
                  <div className="text-sm text-[var(--text-secondary)]">
                    {testimonial.location} • From {testimonial.country}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={goToPrevious}
                    className="flex h-10 w-10 items-center justify-center rounded-full border text-[var(--text-secondary)] transition-all hover:bg-[var(--bg-section)]"
                    aria-label="Previous testimonial"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    onClick={goToNext}
                    className="flex h-10 w-10 items-center justify-center rounded-full border text-[var(--text-secondary)] transition-all hover:bg-[var(--bg-section)]"
                    aria-label="Next testimonial"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 flex justify-center gap-2">
        {testimonials.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`h-2 rounded-full transition-all ${
              index === currentIndex
                ? "w-8 bg-[var(--accent-primary)]"
                : "w-2 bg-[var(--bg-section-alt)] hover:bg-[var(--accent-secondary)]/60"
            }`}
            aria-label={`Go to testimonial ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
