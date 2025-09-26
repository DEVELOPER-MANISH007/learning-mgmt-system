import React from "react";
import { assets } from "../../assets/assets";

const Footer = () => {
  return (
    <footer className=" flex flex-col-reverse md:flex-row items-start md:items-center justify-between text-left w-full px-8 border-t">
      <div className="flex items-center gap-4">
        <img src={assets.logo} alt="" className="hidden md:block w-20" />
        <div className="hidden md:block h-7 w-px bg-gray-500/60"></div>
        <p className="py-4 text-center text-xs md:text-sm text-gray-500">CopyRight 2025 @ futureitcollege. All RightReserved </p>
      </div>
      <div className="flex items-center gap-3 max-md:mt-4 md:ml-auto self-end mb-2">
        <a href="#">
          <img src={assets.facebook_icon} alt="faceabook icon" />
        </a>
        <a href="#">
          <img src={assets.twitter_icon} alt=" twiter icon" />
        </a>
        <a href="#">
          <img src={assets.instagram_icon} alt="insta icon" />
        </a>
      </div>
    </footer>
  );
};

export default Footer;
