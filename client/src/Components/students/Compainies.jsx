import React from 'react'
import { assets } from '../../assets/assets'

const Compainies = () => {
  return (
   <div className='pt-16'>
<p className='text-base text-gray-500'>Truested by learners from</p>
<div className='flex flex-wrap items-center justify-center gap-6 md:gap-16 md:mt-10 mt-5'>
  <img src={assets.microsoft_logo} alt="microsoft"  className='w010 md:w-28'/>
  <img src={assets.walmart_logo} alt="walmart"  className='w010 md:w-28'/>
  <img src={assets.accenture_logo } alt="accenture"  className='w010 md:w-28'/>
  <img src={assets.adobe_logo} alt="adobe"  className='w010 md:w-28'/>
  <img src={assets.paypal_logo} alt="papay"  className='w010 md:w-28'/>
</div>




   </div>
  )
}

export default Compainies