import { createContext, useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import humanizeDuration from "humanize-duration";
import { useAuth, useUser } from "@clerk/clerk-react";
import axios from  'axios'
import { toast } from "react-toastify";


// eslint-disable-next-line react-refresh/only-export-components
export const AppContext = createContext();

export const AppContextProvider = (props) => {
  const currency = import.meta.env.VITE_CURRENCY;
  const navigate = useNavigate();
  const { getToken } = useAuth();
  const { user } = useUser();
  const backendUrl  = import.meta.env.VITE_BACKEND_URL

  const [allCourses, setAllCourses] = useState([]);
  const [isEducator, setIsEducator] = useState(false);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [userData,setUserData] = useState(null)

  // Fetch all  courses

  const fetchAllCourses = useCallback(async () => {
    try {
      const { data } = await axios.get(backendUrl + '/api/course/all');
      if (data.success) {
        setAllCourses(data.courses || []);
      } else {
        toast.error(data.message || 'Failed to fetch courses');
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
      toast.error(error.response?.data?.message || error.message || 'Failed to fetch courses');
    }
  }, [backendUrl]);

  //todo fetch user data

  const fetchUserData = useCallback(async () => {
    if (!user) return;
    if (user?.publicMetadata?.role === 'educator') {
      setIsEducator(true);
    } else {
      setIsEducator(false);
    }
    try {
      const token = await getToken();
      if (!token) return;
      const { data } = await axios.get(
        backendUrl + '/api/user/data',
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (data.success) {
        setUserData(data.user);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  }, [backendUrl, getToken, user]);

  // * functin to calculate average rating of course
  const calclulaterating = (course) => {
    const ratings = Array.isArray(course?.courseRatings)
      ? course.courseRatings
      : [];
    if (ratings.length === 0) {
      return 0;
    }
    let totalRating = 0;
    ratings.forEach((rating) => {
      totalRating += Number(rating?.rating) || 0;
    });
    return Math.floor(totalRating / ratings.length);
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
    if (Array.isArray(course?.courseContent)) {
      course.courseContent.forEach((chapter) => {
        if (Array.isArray(chapter?.chapterContent)) {
          chapter.chapterContent.forEach((singleLecture) => {
            time += Number(singleLecture?.lectureDuration) || 0;
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
    if (Array.isArray(course?.courseContent)) {
      course.courseContent.forEach((chapter) => {
        if (Array.isArray(chapter?.chapterContent)) {
          totalLectures += chapter.chapterContent.length;
        }
      });
    }
    return totalLectures;
  };
  // ------------------------------------------------------------------------>

  //todo Fetch User Enrolled Course---------------------------------------------->

  const fetchUserEnrolledCourse = useCallback(async () => {
   try {
    const token = await  getToken()
     const {data} = await axios.get(backendUrl + '/api/user/enrolled-courses',{
      headers:{Authorization:`Bearer ${token}`}
    })
    if(data.success){
      setEnrolledCourses(data.enrolledCourses.reverse())
    }
    else{
      toast.error(data.message);
    }
   } catch (error) {
    toast.error(error.message)
   }
  }, [backendUrl, getToken]);

  useEffect(() => {
    fetchAllCourses();
   
  }, [fetchAllCourses]);
//* ---------------------------------------------------------------->

  useEffect(() => {
    if (user) {
      fetchUserData()
      fetchUserEnrolledCourse();
    }
  },[user, fetchUserData, fetchUserEnrolledCourse]);
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
    userData,
    setUserData,
    setAllCourses,
    backendUrl,
    getToken,

    

  };
  return (
    <AppContext.Provider value={value}> {props.children}</AppContext.Provider>
  );
};
