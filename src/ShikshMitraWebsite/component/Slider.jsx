import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const Slider = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      title: "Student Management",
      subtitle: "Comprehensive Student Solutions",
      features: [
        "Student Admission",
        "Fee Management",
        "Student Attendance",
        "Transport",
        "Student Report Card",
        "Academic Performance"
      ],
      icon: "👨‍🎓"
    },
    {
      title: "Staff Management",
      subtitle: "Complete Staff Administration",
      features: [
        "Staff Master",
        "Staff Attendance",
        "Leave Apply",
        "Time Sheet",
        "Salary Process",
        "Staff Performance"
      ],
      icon: "👨‍🏫"
    },
    {
      title: "Institution Management",
      subtitle: "Smart School Operations",
      features: [
        "Library Management",
        "Inventory Control",
        "SMS Notifications",
        "Budget Planning",
        "Setup & Configuration",
        "Academic Calendar"
      ],
      icon: "🏫"
    }
  ];

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  useEffect(() => {
    const timer = setInterval(nextSlide, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative w-full max-w-6xl mx-auto overflow-hidden bg-gradient-to-r from-purple-900 to-purple-700 rounded-lg shadow-xl">
      {/* Header */}
      <div className="text-center p-8">
        <h1 className="text-4xl font-bold text-yellow-300 mb-2">
          School Management Software Solutions
        </h1>
        <p className="text-white text-xl">
          Go Digital | Save Paper | Work Smarter | Build a Smart School
        </p>
      </div>

      {/* Slider Content */}
      <div className="relative h-[500px] overflow-hidden">
        <div
          className="flex transition-transform duration-500 ease-in-out h-full"
          style={{ transform: `translateX(-${currentSlide * 100}%)` }}
        >
          {slides.map((slide, index) => (
            <div
              key={index}
              className="min-w-full px-8 py-6 flex flex-col items-center"
            >
              <div className="text-6xl mb-4">{slide.icon}</div>
              <h2 className="text-3xl font-bold text-yellow-300 mb-2">
                {slide.title}
              </h2>
              <p className="text-white text-xl mb-6">{slide.subtitle}</p>
              <div className="grid grid-cols-2 gap-4 w-full max-w-2xl">
                {slide.features.map((feature, idx) => (
                  <div
                    key={idx}
                    className="bg-white/10 p-4 rounded-lg backdrop-blur-sm"
                  >
                    <p className="text-white text-lg">{feature}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Buttons */}
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-yellow-300 p-2 rounded-full hover:bg-yellow-400 transition-colors"
      >
        <ChevronLeft className="w-6 h-6 text-purple-900" />
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-yellow-300 p-2 rounded-full hover:bg-yellow-400 transition-colors"
      >
        <ChevronRight className="w-6 h-6 text-purple-900" />
      </button>

      {/* Dots Navigation */}
      <div className="flex justify-center gap-2 p-4">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`w-3 h-3 rounded-full transition-colors ${
              currentSlide === index ? 'bg-yellow-300' : 'bg-white/50'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default Slider;