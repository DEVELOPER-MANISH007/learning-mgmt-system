import { createContext, useEffect, useState } from "react";
import { dummyCourses } from "../assets/assets";
import { useNavigate } from "react-router-dom";
import humanizeDuration from "humanize-duration";
import { useAuth, useUser } from "@clerk/clerk-react";

// eslint-disable-next-line react-refresh/only-export-components
export const AppContext = createContext();

export const AppContextProvider = (props) => {
  const currency = import.meta.env.VITE_CURRENCY;
  const navigate = useNavigate();
  const { getToken } = useAuth();
  const { user } = useUser();

  const [allCourses, setAllCourses] = useState([]);
  const [isEducator, setIsEducator] = useState(true);
  const [enrolledCourses, setEnrolledCourses] = useState([]);

  // Fetch all  courses

  const fetchAllCourses = async () => {
    setAllCourses(dummyCourses);
  };

  // * functin to calculate average rating of course
  const calclulaterating = (course) => {
    const ratings =
      course && Array.isArray(course.courseRatings) ? course.courseRatings : [];
    if (ratings.length === 0) {
      return 0;
    }
    let totalRating = 0;
    ratings.forEach((rating) => {
      totalRating += Number(rating.rating) || 0;
    });
    return totalRating / ratings.length;
  };
  // * ---------------------------------------------------------------->

  // todo Fucntion to calculate course chapter time---------------->

  const calculateChapterTime = (chapter) => {
    if (!chapter || !Array.isArray(chapter.chapterContent))
      return humanizeDuration(0);
    let time = 0;
    chapter.chapterContent.forEach((singleLecture) => {
      time += Number(singleLecture.lectureDuration) || 0;
    });
    return humanizeDuration(time * 60 * 1000, {
      units: ["h", ["m"]],
    });
  };
  //todo-------------------------------------------------------------------------------->

  //* Fuctnion to calculate course durtion-------->
  const calculateCourseDuration = (course) => {
    let time = 0;
    if (course && Array.isArray(course.courseContent)) {
      course.courseContent.forEach((chapter) => {
        if (Array.isArray(chapter.chapterContent)) {
          chapter.chapterContent.forEach((singleLecture) => {
            time += Number(singleLecture.lectureDuration) || 0;
          });
        }
      });
    }

    return humanizeDuration(time * 60 * 1000, {
      units: ["h", ["m"]],
    });
  };
  // * ------------------------------------------------------------>.

  // Function to calculate to no of lecture in the courese------->

  const CalculateNOofLecutres = (course) => {
    let totalLectures = 0;
    course.courseContent.forEach((chapter) => {
      if (Array.isArray(chapter.chapterContent)) {
        totalLectures += chapter.chapterContent.length;
      }
    });
    return totalLectures;
  };
  // ------------------------------------------------------------------------>

  //todo Fetch User Enrolled Course---------------------------------------------->

  const fetchUserEnrolledCourse = async () => {
    setEnrolledCourses(dummyCourses);
  };

  useEffect(() => {
    fetchAllCourses();
    fetchUserEnrolledCourse();
  }, []);
//* ---------------------------------------------------------------->
  const logToken = async () => {
    console.log(await getToken());
  };

  useEffect(() => {
    if (user) {
      logToken();
    }
  });
//* ---------------------------------------------------------------->
  const value = {
    currency,
    allCourses,
    navigate,
    calclulaterating,
    isEducator,
    setIsEducator,
    CalculateNOofLecutres,
    calculateChapterTime,
    calculateCourseDuration,
    enrolledCourses,
    fetchUserEnrolledCourse,
  };
  return (
    <AppContext.Provider value={value}> {props.children}</AppContext.Provider>
  );
};
