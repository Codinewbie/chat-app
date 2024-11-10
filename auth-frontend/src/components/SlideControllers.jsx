import React from "react";

const SlideControllers = ({
  isTransitioning,
  setIsTransitioning,
  setCurrentIndex,
  usersLength,
  currentIndex,
}) => {
  const handleNext = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentIndex((prevIndex) => prevIndex + 1);
  };
  
  const handlePrev = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentIndex((prevIndex) => prevIndex - 1);
  };
  
  return (
    <div className="flex mt-6 space-x-4">
      <button
        onClick={handlePrev}
        className="px-2 py-2 bg-gray-500 text-white rounded-full hover:bg-gray-600"
      >
        <svg
          className="w-6 h-6 text-gray-800 dark:text-white"
          aria-hidden="true"
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          fill="none"
          viewBox="0 0 24 24"
        >
          <path
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="m15 19-7-7 7-7"
          />
        </svg>
      </button>
      <button
        onClick={handleNext}
        className="px-2 py-2 bg-gray-500 text-white rounded-full hover:bg-gray-600"
      >
        <svg
          className="w-6 h-6 text-gray-800 dark:text-white"
          aria-hidden="true"
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          fill="none"
          viewBox="0 0 24 24"
        >
          <path
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="m9 5 7 7-7 7"
          />
        </svg>
      </button>
    </div>
  );
};

export default SlideControllers;
