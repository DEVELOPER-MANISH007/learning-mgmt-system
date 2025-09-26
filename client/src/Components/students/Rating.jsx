import React, { useEffect, useState } from "react";

const Rating = ({ initialRating = 0, onRate }) => {
  const [rating, setRating] = useState(initialRating);

  const handleSetRating = (value) => {
    setRating(value);
    if (onRate) onRate(value);
  };

  useEffect(() => {
    if (initialRating) {
      setRating(initialRating);
    }
  }, [initialRating]);
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }, (_, index) => {
        const starValue = index + 1;

        return (
          <span
            key={index}
            onClick={() => handleSetRating(starValue)}
            className={`text-xl sm:text-2xl cursor-pointer transition-colors ${
              starValue <= rating ? "text-yellow-500" : "text-gray-400"
            } `}
          >
            &#9733;
          </span>
        );
      })}
    </div>
  );
};

export default Rating;
