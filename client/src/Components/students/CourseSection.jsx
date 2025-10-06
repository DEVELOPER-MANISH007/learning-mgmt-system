import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { AppContext } from "../../context/Appcontext";
import CourseCard from "./CourseCard";

const CourseSection  = () => {
  const {allCourses} = useContext(AppContext)
  return (
    <div className="py-16 md:px-40 px-8">
      <h2 className="text-3xl font-medium text-gray-800">Learn from the best</h2>
      <p className="text-sm md:text-base text-gray-500 mt-3">
        {" "}
        discover our top-rated course across various vategories. From coding and<br/>
        desgin to business and wellness, our course are crafted to deliver
        results.
      </p>
<div className="grid grid-cols-auto px-4 md:px-0 md:my-16 my-10 gap-4">
  {allCourses && allCourses.length > 0 ? allCourses.slice(0,4).map((course,index)=> <CourseCard key={course._id || index} course={course} /> ) : <p>Loading courses...</p>}
</div>
      <Link
        className="text-gray-500 border border-gray-500/300 px-10 py-3 rounded inline-block mt-6"
        to={"/course-list"}
        onClick={() => scrollTo(0, 0)}
      >
        Show all courses
      </Link>
    </div>
  );
};

export default CourseSection