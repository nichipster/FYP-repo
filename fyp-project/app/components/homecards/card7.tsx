import { useRef } from "react";
import type { Testimonial } from "../../utils/api";
import TestimonialCard from "../testimonials/testcard";
import { testimonials as hardcodedTestimonials } from "../testimonials/data";

interface Props {
  testimonials?: Testimonial[] | null;
}

export default function Seventh({ testimonials }: Props) {
  const displayTestimonials = testimonials ?? hardcodedTestimonials;
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: direction === "left" ? -340 : 340, behavior: "smooth" });
    }
  };

  return (
    <div className="py-16 px-4 bg-white">
      <div className="text-center mb-10">
        <h2 className="text-4xl font-bold text-gray-900 mb-4">What Our Users Say</h2>
      </div>

      <div className="relative max-w-5xl mx-auto">
        <button
          onClick={() => scroll("left")}
          className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-5 z-10 bg-white border border-gray-200 shadow-md rounded-full w-10 h-10 flex items-center justify-center hover:bg-green-50 transition-colors"
        >
          <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <div
          ref={scrollRef}
          className="flex gap-6 overflow-x-auto scroll-smooth pb-4 px-2"
          style={{ scrollbarWidth: "none" }}
        >
          {displayTestimonials.map((t) => (
            <TestimonialCard key={t.name} {...t} />
          ))}
        </div>

        <button
          onClick={() => scroll("right")}
          className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-5 z-10 bg-white border border-gray-200 shadow-md rounded-full w-10 h-10 flex items-center justify-center hover:bg-green-50 transition-colors"
        >
          <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
}
