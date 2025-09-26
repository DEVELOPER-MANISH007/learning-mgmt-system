import React from 'react'
import Hero from '../../Components/students/Hero'
import Searchbar from '../../Components/students/Searchbar'
import Compainies from '../../Components/students/Compainies'
import CourseCard from '../../Components/students/CourseCard'
import CourseSection  from '../../Components/students/CourseSection'
import TesimononialSection from '../../Components/students/TesimononialSection'
import CallToaction from '../../Components/students/CallToaction'
import Footer from '../../Components/students/Footer'

const Home = () => {
  return (
    <div className=' felx felx-col items-center space-y-7 text-center '>
      <Hero/>
      <Compainies/>
    <CourseSection/>
    <TesimononialSection/>
    <CallToaction  />
    <Footer/>
    </div>
  )
}

export default Home