import { clerkClient } from "@clerk/express";
import { v2 as Cloudinary } from "cloudinary";
import { Course } from "../Models/Course.js";
import UserModel from "../Models/userModel.js";
import Purchase from "../Models/Purchase.js";

const updateRoleToEducator = async (req, res) => {
  try {
    const userId = req.auth().userId;

    await clerkClient.users.updateUserMetadata(userId, {
      publicMetadata: {
        role: "educator",
      },
    });

    res.json({ success: true, message: "You can publish a course now" });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};

//Add new Course
export const addCourse = async (req, res) => {
  try {
    const { courseData } = req.body;
    const imageFile = req.file;
    const educatorId = req.auth().userId;

    // Validate required fields
    if (!imageFile) {
      return res
        .status(400)
        .json({ success: false, message: "Course thumbnail is required" });
    }

    if (!courseData) {
      return res
        .status(400)
        .json({ success: false, message: "Course data is required" });
    }

    // Parse course data
    let parsedCourseData;
    try {
      parsedCourseData = JSON.parse(courseData);
    } catch (parseError) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid course data format" });
    }

    // Upload image to Cloudinary
    let imageUploadResult;
    try {
      imageUploadResult = await Cloudinary.uploader.upload(imageFile.path, {
        folder: "course-thumbnails",
        resource_type: "image",
      });
    } catch (uploadError) {
      console.error("Cloudinary upload error:", uploadError);
      return res
        .status(500)
        .json({ success: false, message: "Failed to upload course thumbnail" });
    }

    // Add educator and thumbnail URL to course data
    parsedCourseData.educator = educatorId;
    parsedCourseData.courseThumbnail = imageUploadResult.secure_url;

    // Create new course
    const newCourse = await Course.create(parsedCourseData);

    res.status(201).json({
      success: true,
      message: "Course created successfully",
      course: newCourse,
    });
  } catch (error) {
    console.error("Add course error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export default updateRoleToEducator;

//get edutcaotr course

export const getEducatorCourses = async (req, res) => {
  try {
    const userId = req.auth().userId;
    const courses = await Course.find({ educator: userId });
    res.json({
      success: true,
      message: "Courses fetched successfully",
      courses,
    });
  } catch (error) {
    console.error("Get educator courses error:", error);
    res.json({ success: false, message: error.message });
  }
};

//* get Educator Dashboard Data(total earning,Enrolled students,no of  courses)

export const educatorDashboardData = async (req, res) => {
  try {
    const educatorId = req.auth().userId;
    const courses = await Course.find({ educator: educatorId });
    const totalCourses = courses.length;
    const CourseIds = courses.map((course) => course._id);

    //calculate total earnings from purchase
    const purchases = await Purchase.find({
      courseId: { $in: CourseIds },
      status: "completed",
    });
    const totalEarnings = purchases.reduce(
      (sum, purchase) => sum + purchase.amount,
      0
    );

    //collect unique  enrolled student ids with therir course title
    const enrolledStudentsData = [];
    for (const course of courses) {
      const students = await UserModel.find(
        {
          _id: { $in: course.enrolledStudents },
        },
        "name imageUrl"
      );

      students.forEach((student) => {
        enrolledStudentsData.push({
          courseTitle: course.courseTitle,
          student,
        });
      });
    }

    res.json({
      success: true,
      message: "Educator dashboard data fetched successfully",
      data: {
        totalCourses,
        totalEarnings,
        enrolledStudentsData,
      },
    });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

//todo get enrolled students datsa with purchase details

export const getEnrolledStudentsData = async (req, res) => {
  try {
    const educatorId = req.auth().userId;
    const courses = await Course.find({ educator: educatorId });
    const courseIds = courses.map((course) => course._id);
    const purchases = await Purchase.find({
      courseId: { $in: courseIds },
      status: "completed",
    })
      .populate("courseId", "courseTitle")
      .populate("userId", "name  imageUrl");
    
   
      const enrolledStudents = purchases.map(purchase=>({
        student:purchase.userId,
        courseTitle:purchase.courseId.courseTitle,
        purchaseDate:purchase.createdAt,  
      }))
      res.json({
        success: true,
        message: "Enrolled students data fetched successfully",
        enrolledStudents,
      });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};
