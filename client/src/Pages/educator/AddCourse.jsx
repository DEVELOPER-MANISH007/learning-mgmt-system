import React, { useEffect, useRef, useState } from "react";
import uniqid from "uniqid";
import Quill from "quill";
import { assets } from "../../assets/assets";

const AddCourse = () => {
  const quillRef = useRef(null);
  const editorRef = useRef(null);

  const [courseTitle, setCourseTitle] = useState("");
  const [, setCrousePrice] = useState(0);
  const [, setDiscunt] = useState(0);
  const [image, setImage] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [currentChapterId, setCurrentChapterId] = useState(false);
  const [lectureDetails, setLectureDetails] = useState({
    lectureTitle: "",
    lectureDuratin: "",
    lectureUrl: "",
    isPreviewFree: false,
  });


  const handleChapter = (action,chapterId)=>{
    if(action==='add'){
      const title = prompt("enter Chapter Name:")
      if(title){
        const newchapter = {
          chapterId:uniqid(),
          chapterTitle:title,
          chapterContent:[],
          collapsed:false,
          chapterOrder:chapters.length > 0 ?chapters.slice(-1)[0].chapterOrder+1:1,
    };
    setChapters([...chapters,newchapter])
      }
    }else if(action === 'remove'){
      setChapters((prevChapters) => {
        const nextChapters = [...prevChapters];
        const indexToRemove = nextChapters.findIndex((chapter) => chapter.chapterId === chapterId);
        if (indexToRemove !== -1) {
          nextChapters.splice(indexToRemove, 1);
        }
        return nextChapters;
      })
    } else if(action === 'toggle'){
      setChapters(
        chapters.map((chapter)=>chapter.chapterId===chapterId?{...chapter,collapsed:!chapter.collapsed}:chapter)
      )
    }
    
      }


const handleLecture = (action,chapterId,lectureIndex)=>{

  if(action==='add'){
    setCurrentChapterId(chapterId)
    setShowPopup(true)

  }else if(action==='remove'){
    setChapters((prevChapters) => {
      const nextChapters = prevChapters.map((chapter) => ({ ...chapter }));
      const chapterIndex = nextChapters.findIndex((c) => c.chapterId === chapterId);
      if (chapterIndex !== -1) {
        const chapter = nextChapters[chapterIndex];
        const nextLectures = [...chapter.chapterContent];
        if (lectureIndex > -1 && lectureIndex < nextLectures.length) {
          nextLectures.splice(lectureIndex, 1);
          nextChapters[chapterIndex] = { ...chapter, chapterContent: nextLectures };
        }
      }
      return nextChapters;
    })
  }
}

const addLecture=()=>{
  setChapters((prevChapters) =>
    prevChapters.map((chapter)=>{
      if(chapter.chapterId===currentChapterId){
        const newLecture = {
          ...lectureDetails,
          lectureOrder: chapter.chapterContent.length > 0 ? chapter.chapterContent.slice(-1)[0].lectureOrder + 1 : 1,
          lectureId: uniqid(),
        };
        return { ...chapter, chapterContent: [...chapter.chapterContent, newLecture] };
      }
      return chapter;
    })
  )
  setShowPopup(false);
  setLectureDetails({
    lectureTitle:'',
    lectureDuratin:'',
    lectureUrl:"",
    isPreviewFree:false,
  })
}

const handleSubmit = async(e)=>{
  e.preventDefault()
}


  // Initiate Quill only once
  useEffect(() => {
    if (!quillRef.current && editorRef.current) {
      quillRef.current = new Quill(
        editorRef.current,
        {
          theme: "snow",
        },
        []
      );
    }
  });




  return (
    <div className="h-screen overflow-sroll flex flex-col items-start     justify-between md:p-8 md:pb-0 p-4 pt-8 pb-0">
      <form onSubmit ={handleSubmit} className="flex flex-col gap-4 max-w-md w-full text-gray-500">
        <div className="flex flex-col gap-1">
          <p>Course Title</p>
          <input
            onChange={(e) => setCourseTitle(e.target.value)}
            value={courseTitle}
            type="text"
            placeholder="Type Here!"
            className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500"
            required
          />
        </div>
        <div className="flex flex-col gap-1">
          <p>Course Description</p>
          <div ref={editorRef}></div>
        </div>

        <div className="flex items-center justify-between flex-wrap">
          <div className="flex flex-col gap-1">
            <p>Course Pirce</p>
            <input
              onChange={(e) => setCrousePrice(e.target.value)}
              type="number"
              placeholder="0"
              className="outline-none md:py-2.5 py-2 w-28 px-3 rounded border border-gray-500 "
              required
            />
          </div>

          <div className="flex md:flex-row fflex-col items-center gapp-3">
            <p>Course Thumbnail</p>
            <label htmlFor="thumbnailImage" className="flex items-center gap-3">
              <img
                src={assets.file_upload_icon}
                alt=""
                className="p-3 bg-blue-500 rounded"
              />
              <input
                type="file"
                id="thumbnailImage"
                onChange={(e) => setImage(e.target.files[0])}
                accept="image/*"
                hidden
              />
              <img
                src={image ? URL.createObjectURL(image) : " "}
                className="max-h-10"
                alt=""
              />
            </label>
          </div>
        </div>
        <div className="flex flex-col gap-1">
          <p>Discount %</p>
          <input onChange={e=>setDiscunt(e.target.value)} type="number" placeholder="0" min={0} max={100} className="outline-none md:py-2.5 py-2 w-28 px-3 rounded border border-gray-500" required />
        </div>


    {/* Adding chapters and Lecutre */}
   
   
    <div>
      {chapters.map((chapter,chapterIndex)=>(

        <div key={chapterIndex} className="bg-white rounded-lg mb-4">
          <div className="flex justify-between items-center p-4 border-b">
            <div className="flex items-center">
              <img onClick={()=>handleChapter('toggle',chapter.chapterId)} src={assets.dropdown_icon} width={14} alt="" className={`mr-2 cursor-pointer transition-all ${chapter.collapsed && "-rotate-90"}`} />
              <span className="font-semibold">{chapterIndex+1}{chapter.chapterTitle}</span>
            </div>
            <span className="text-gray-500">{chapter.chapterContent.length}Lecutres</span>
            <img onClick={()=> handleChapter('remove',chapter.chapterId)} src={assets.cross_icon} alt="" className="cursor-pointer" />
          </div>
          {!chapter.collapsed&&(
            <div className="p-4">
              {chapter.chapterContent.map((lecture,lectureIndex)=>(
                <div key={lectureIndex} className="flex justify-between items-center mb-2">
                  <span>{lectureIndex+1}{lecture.lectureTitle}-{lecture.lectureDuratin} mins - <a href={lecture.lectureUrl} target="_blank" className="text-blue-500">Link</a>-{lecture.isPreviewFree?"Free Priview":"Paid"}  </span>
                  <img onClick={()=>handleLecture('remove',chapter.chapterId,lectureIndex)} src={assets.cross_icon} alt="" className="cursor-pointer" />
                </div>
              ))}
              <div onClick={()=>handleLecture('add',chapter.chapterId)} className="inline-flex bg-blue-200 p-2 rounded cursor-pointer">+Add Lecture</div>
            </div>
          )}
        </div>
      ))}
      <div onClick={()=>{handleChapter('add')}} className="flex justify-center items-center bg-blue-100 p-2 rounded-lg cursor-pointer" >+Add Chapter</div>
      {showPopup &&(
        <div className="fixed inset-0 flex items-center justify-center z-50 animate-fadeIn">
          <div className="bg-white text-gray-700 p-6 rounded-xl shadow-2xl relative w-full max-w-md mx-4 transform transition-all duration-300 ease-out animate-slideUp border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-800">Add New Lecture</h2>
              <button 
                onClick={()=>setShowPopup(false)} 
                className="p-1 hover:bg-gray-100 rounded-full transition-colors duration-200"
              >
                <img src={assets.cross_icon} className="w-5 h-5" alt="Close" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Lecture Title</label>
                <input 
                  type="text" 
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 outline-none" 
                  value={lectureDetails.lectureTitle} 
                  onChange={(e)=>setLectureDetails({...lectureDetails,lectureTitle:e.target.value})}
                  placeholder="Enter lecture title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Duration (minutes)</label>
                <input 
                  type="number" 
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 outline-none" 
                  value={lectureDetails.lectureDuratin}  
                  onChange={(e) =>setLectureDetails({...lectureDetails,lectureDuratin:e.target.value})}
                  placeholder="Enter duration"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Lecture URL</label>
                <input 
                  type="url" 
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 outline-none" 
                  value={lectureDetails.lectureUrl}  
                  onChange={(e) =>setLectureDetails({...lectureDetails,lectureUrl:e.target.value})}
                  placeholder="https://example.com/video"
                />
              </div>
              
              <div className="flex items-center space-x-3">
                <input 
                  type="checkbox" 
                  id="previewFree"
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" 
                  checked={lectureDetails.isPreviewFree}  
                  onChange={(e) =>setLectureDetails({...lectureDetails,isPreviewFree:e.target.checked})} 
                />
                <label htmlFor="previewFree" className="text-sm font-medium text-gray-700">
                  Free Preview Available
                </label>
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button 
                type="button" 
                onClick={()=>setShowPopup(false)}
                className="flex-1 px-4 py-3 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200 font-medium"
              >
                Cancel
              </button>
              <button 
                type="button" 
                onClick={addLecture}
                className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-3 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                Add Lecture
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
    <button type="submit" className="bg-black text-white w-max py-2.5 px-8 rounded my-4">
      ADD

    </button>
      </form>
    </div>
  );
};

export default AddCourse;
