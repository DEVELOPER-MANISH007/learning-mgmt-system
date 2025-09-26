import React from "react";
import { Routes, Route, useMatch } from "react-router-dom";
import Home from "./Pages/students/Home";
import CourseList from "./Pages/students/CourseList";
import CourseDetails from "./Pages/students/CourseDetails";
import Myenrollements from "./Pages/students/Myenrollements";
import Player from "./Pages/students/Player";
import Loading from "./Components//students/Loading";
import Educator from "./Pages/educator/Educator";
import Dashboard from "./Pages/educator/Dashboard";
import Mycourse from "./Pages/educator/Mycourse";
import AddCourse from "./Pages/educator/AddCourse";
import StudentsEnrolled from "./Pages/educator/StudentsEnrolled";
import Navbar from "./Components/students/Navbar";
import "quill/dist/quill.snow.css";

const App = () => {
  const isEducatorRoute = useMatch('/educator/*')
  return (
    <div className="text-default min-h-screen bg-white">
      {!isEducatorRoute &&
      <Navbar/>
      }
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/course-list" element={<CourseList />} />
        <Route path="/course-list/:input" element={<CourseList />} />
        <Route path="/course/:id" element={<CourseDetails />} />
        <Route path="/my-enrollments" element={<Myenrollements />} />
        <Route path="/player/:courseid" element={<Player />} />
        <Route path="/loading/:path" element={<Loading />} />{" "}
        {/* Educator Routes */}
        <Route path="/educator" element={<Educator />}>
          <Route path="/educator" element={<Dashboard />} />
          <Route path="add-course" element={<AddCourse />} />
          <Route path="my-courses" element={<Mycourse />} />
          <Route path="student-enrolled" element={<StudentsEnrolled />} />
        </Route>
      </Routes>
    </div>
  );
};

export default App;
