import { Course } from "../Models/Course.js";
//get all courses

export const getAllCourses = async (req, res) => {
  try {
    const courses = await Course
      .find({ isPublished: true })
      .select("-courseContent -enrolledStudents")
      .populate({ path: "educator" });
    res.json({ success: true, courses });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

//GET COURSE BY ID
export const getCourseId = async (req, res) => {
  const { id } = req.params;
  try {
    const courseDetails = await Course
      .findById(id)
      .populate({ path: "educator" });
    
    //remove lecture url if is preview is false
    courseDetails.courseContent.forEach((chapter) => {
      chapter.chapterContent.forEach((lecture) => {
        if (!lecture.isPreviewFree) {
            lecture.lectureUrl = "";
        }
      });
    });
    res.json({ success: true, courseDetails });


  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

