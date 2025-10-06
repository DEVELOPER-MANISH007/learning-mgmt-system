import React, { useCallback, useContext, useEffect, useState } from "react";
import { AppContext } from "../../context/Appcontext";
import { useParams } from "react-router-dom";
import { assets } from "../../assets/assets";
import humanizeDuration from "humanize-duration";
import YouTube from "react-youtube";
import Footer from "../../Components/students/Footer";
import Rating from "../../Components/students/Rating";
import axios from "axios";
import { toast } from "react-toastify";
import Loading from '../../Components/students/Loading'
const Player = () => {
  const {
    calculateChapterTime,
    backendUrl,
    userData,
    getToken,
  } = useContext(AppContext);
  const { courseid } = useParams();
  const [courseData, setCourseData] = useState(null);
  const [openSection, setOpenSection] = useState({});
  const [playerData, setPlayerData] = useState(null);
  const [progressData, setProgressData] = useState(null);
  const [initialRating, setInitialRating] = useState(0);

  const toggleSection = (index) => {
    setOpenSection((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  const fetchCourseData = useCallback(async () => {
    try {
      const token = await getToken();
      const { data } = await axios.get(
        `${backendUrl}/api/user/enrolled-courses/${courseid}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (data.success) {
        const course = data.course;
        setCourseData(course);
        if (Array.isArray(course.courseRating)) {
          const mine = course.courseRating.find(
            (r) => r.userId === userData?._id
          );
          setInitialRating(mine?.rating || 0);
        }
      } else {
        toast.error(data.message || "Failed to load course");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  }, [backendUrl, courseid, getToken, userData]);

  useEffect(() => {
    fetchCourseData();
  }, [fetchCourseData]);


  const markLectureAsComplete = async () => {
    try {
      const token = await getToken();
      console.log('Marking lecture complete:', playerData.lectureId); // Debug log
      const {data} = await axios.post(`${backendUrl}/api/user/update-course-progress`,{courseId:courseid,lectureId:playerData.lectureId},{headers:{Authorization:`Bearer ${token}`}})
      if(data.success){
        toast.success(data.message)
        getCourseProgress()
      }
      else{
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    }
  }


const getCourseProgress = useCallback(async () => {
  try {
    const token = await getToken();
    const {data} = await axios.post(`${backendUrl}/api/user/get-course-progress`,{courseId:courseid},{headers:{Authorization:`Bearer ${token}`}})
    if(data.success){
      console.log('Progress data received:', data.progressData); // Debug log
      setProgressData(data.progressData)
    }else{
      toast.error(data.message)
    }
  }
  catch (error) {
    toast.error(error.message)
  }
}, [backendUrl, courseid, getToken])

const handleRate = async(rating)=>{
  try {
    const token = await getToken()
    const {data} = await axios.post(backendUrl+'/api/user/add-rating',{courseId:courseid,rating},{headers:{Authorization:`Bearer ${token}`}})
    if(data.success){
      toast.success(data.message)
    }else{
      toast.error(data.message)
    }
  } catch (error) {
    toast.error(error.message)
    
  }
}
useEffect(()=>{
  getCourseProgress()
},[getCourseProgress])

  // Helper: extract YouTube video id from multiple URL formats
  const extractYouTubeId = (url) => {
    if (!url || typeof url !== 'string') return null;
    try {
      const u = new URL(url);
      // youtu.be short link
      if (u.hostname === 'youtu.be') return u.pathname.slice(1);
      // youtube.com watch?v=ID
      if (u.searchParams.has('v')) return u.searchParams.get('v');
      // fallback to last path segment
      const parts = u.pathname.split('/').filter(Boolean);
      return parts.length ? parts[parts.length - 1] : null;
    } catch (e) {
      // If it's not a valid URL, try heuristics
      const match = url.match(/(?:v=|youtu\.be\/)([A-Za-z0-9_-]{11})/);
      return match ? match[1] : null;
    }
  };

  return courseData? (
    <>
      <div className="p-4 sm:p-10 flex flex-col-reverse md:grid md:grid-cols-2 gap-10 md:px-36">
        {/* Left colum */}
        <div className="text-gray-800">
          <h2 className="text-xl font-semibold"> Course Strucutre</h2>

          <div className="pt-5">
            {courseData &&
              Array.isArray(courseData.courseContent) &&
              courseData.courseContent.map((chapter, chapterIndex) => (
                <div
                  key={chapterIndex}
                  className="border border-gray-300 bg-white mb-2 rounded"
                >
                  <div
                    onClick={() => toggleSection(chapterIndex)}
                    className="flex items-center justify-between px-4 py-3 cursor-pointer select-none"
                  >
                    <div className="flex items-center gap-2">
                      <img
                        src={assets.down_arrow_icon}
                        alt="arrow icon"
                          className={`transition-transform ${
                          openSection[chapterIndex] ? "rotate-180" : "rotate-0"
                        }`}
                      />
                      <p className="font-medium md:text-base text-sm">
                        {chapter.chapterTitle}
                      </p>
                    </div>
                    <p className="text-sm md:text-default  ">
                      {Array.isArray(chapter.chapterContent)
                        ? chapter.chapterContent.length
                        : 0}{" "}
                      lectures - {calculateChapterTime(chapter)}
                    </p>
                  </div>
                  <div
                    className={`overflow-hidden transition-all duration-300 ${
                      openSection[chapterIndex] ? "max-h-96" : "max-h-0"
                    }`}
                  >
                    <ul className="list-disc md:pl-10 pl-4 pr-4 py-2 text-gray-600 border-t border-gray-300">
                      {Array.isArray(chapter.chapterContent) &&
                        chapter.chapterContent.map((lecture, lectureIndex) => (
                          <li
                            key={lectureIndex}
                            className="flex items-center gap-2 py-1"
                          >
                            <img
                              src={progressData && progressData.lectureCompleted.includes(lecture.lectureId)?assets.blue_tick_icon:assets.play_icon}
                              alt="play_icon"
                              className="w-4 h-4 mt-1"
                            />
                            <div className="flex items-center justify-between w-full text-gray-800 text-xs md:text-default">
                              <p> {lecture.lectureTitle}</p>
                              <div className="flex gap-2">
                                {lecture.lectureUrl && (
                                  <p
                                    onClick={() =>
                                      setPlayerData({
                                        ...lecture,
                                        chapter: chapterIndex + 1,
                                        lecture: lectureIndex + 1,
                                      })
                                    }
                                    className="text-blue-500 cursor-pointer"
                                  >
                                    Watch
                                  </p>
                                )}
                                <p>
                                  {humanizeDuration(
                                    lecture.lectureDuration * 60 * 1000,
                                    {
                                      units: ["h", "m"],
                                    }
                                  )}
                                </p>
                              </div>
                            </div>
                          </li>
                        ))}
                    </ul>
                  </div>
                </div>
              ))}
          </div>
          <div className="flex items-center gap-2 py-3 mt-10 ">
            <h1 className="text-xl font-bold">Rate this course</h1>
            <Rating initialRating={initialRating} onRate={handleRate} />
          </div>
        </div>

        {/* right column */}
        <div className="md:mt-10">
          {playerData ? (
            <div>
              <YouTube
                videoId={extractYouTubeId(playerData.lectureUrl)}
                opts={{
                  playerVars: {
                    autoplay: 1,
                  },
                }}
                iframeClassName="w-full aspect-video"
              />
              <div className="flex justify-between items-center mt-1">
                <p>
                  {playerData.chapter}.{playerData.lecture}.
                  {playerData.lectureTitle}
                </p>
                <button onClick={()=>markLectureAsComplete()} className="text-blue-600">
                  {progressData && playerData && progressData.lectureCompleted.includes(playerData.lectureId)
                    ? "Completed"
                    : "Mark Complete"}
                </button>
              </div>
            </div>
          ) : (
            <img src={courseData ? courseData.courseThumbnail : ""} alt="" />
          )}
        </div>
      </div>
      <Footer />
    </>
  ):<Loading/>
};

export default Player;
