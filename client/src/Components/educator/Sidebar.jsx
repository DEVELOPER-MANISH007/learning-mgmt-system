import React, { useContext } from 'react'
import { assets } from '../../assets/assets'
import {AppContext} from '../../context/Appcontext'
import { NavLink } from 'react-router-dom'

const Sidebar = () => {

  const {isEducator}  = useContext(AppContext)

  const menuItems= [

    {name:"dashboard",icon:assets.home_icon,path:"/educator"},
    {name:"my courses",icon:assets.my_course_icon,path:"/educator/my-courses"},
    {name:"add course",icon:assets.add_icon,path:"/educator/add-course"},
    {name:"student enrolled",icon:assets.person_tick_icon,path:"/educator/student-enrolled"},
  ]


  return isEducator && (
    <div className='md:w-64 w-16 border-r min-h-screen text-base border-gray-500 py-2 flex flex-col'>
      {menuItems.map((item)=>(
        <NavLink
        to={item.path}
        key={item.name}
        end={item.path === "/educator"}
        className={({isActive}) => `flex items-center justify-center md:justify-start gap-3 md:gap-4 px-2 md:px-4 py-2 md:py-3 text-gray-600 hover:bg-gray-100/90 ${isActive ? ' bg-blue-100 border-r[6px] border-white text-black' : ''}`}
        >

        <img src={item.icon} alt="" className='w-6 h-6 shrink-0'/>
        <p className='md:block hidden capitalize'>{item.name}</p>

        </NavLink>

      ))}



      </div>


  )
}

export default Sidebar