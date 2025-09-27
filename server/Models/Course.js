import mongoose from "mongoose";

// Define the lecture schema first
const lectureSchema = new mongoose.Schema(
  {
    lectureId: { type: String, required: true },
    lectureTitle: { type: String, required: true },
    lectureDuration: { type: Number, required: true }, // duration in minutes
    lectureUrl: { type: String, required: true },
    isPreviewFree: { type: Boolean, required: true },
    lectureOrder: { type: Number, required: true },
  },
  { _id: false }
);

// Define the chapter schema after lecture schema
const chapterSchema = new mongoose.Schema(
  {
    chapterId: { type: String, required: true },
    ChapterOrder: { type: Number, required: true },
    chapterTitle: { type: String, required: true },
    chapterContent: [lectureSchema],
  },
  { _id: false }
);


// Now define the course schema
const courseSchema = new mongoose.Schema(
  {
    courseTitle: { type: String, required: true },
    courseDescription: { type: String, required: true },
    courseThumbnail: { type: String, required: true },
    courPrice: { type: Number, required: true },
    isPublished: { type: Boolean, default: true },
    discount: { type: Number, default: 0, min: 0, max: 100, required: true },
    courseContent: [],
    courseRating: [
      { userId: { type: String }, rating: { type: Number, min: 1, max: 5 } },
    ],
    educator: { type: String, ref: "User", required: true },
    enrolledStudents: [{ type: String, ref: "User" }],
  },
  { timestamps: true, minimize: false }
);

export const Course = mongoose.model("Course", courseSchema);
export const Chapter = mongoose.model("Chapter", chapterSchema);
export const Lecture = mongoose.model("Lecture", lectureSchema);
