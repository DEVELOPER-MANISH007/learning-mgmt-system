import React from "react";
import { assets } from "../../assets/assets";
import Searchbar from "./Searchbar";

const Hero = () => {
  return (
    <div className="flex flex-col items-center justify-center w-full md:pt-36 pt-20 px-7 md:px-0 space-y-7 text-center bg-gradient-to-b from-cyan-600/30 ">
      <h1 className="md:text-home-heading-large text-home-heading-small relative font-bold text-gray-800 max-w-3xl mx-auto">
        {" "}
        Empower your future with the courses designed{" "}
        <span className="text-blue-600"> to fit your choice.</span>{" "}
        <img
          className="block absolute -bottom-7 right-0 w-24 md:w-36"
          src={assets.sketch}
          alt="sketch"
        />{" "}
      </h1>
      <p className="md:block hidden text-gray-500 max-w-2xl mx-auto">
        We brig together world-class instructors, inteeractive content, and a supportive community to help you achieve your personal and professional goals.
      </p>
      <p className="md:hidden text-gray-500 max-w-sm mx-auto"> We bring together world-class instrucotrs to hlep you achieve your professional goals.</p>
      <Searchbar/>
    </div>
  );
};

export default Hero;
