BHAI STRIPE MENE MANISH***41@GMAIL.COM SE BANAYA HAI
BAAKI SAB LIKE ATLAS   JO HAI MEMERY BOY SE BANAYA HAI USE KIYA HA OKAY



in [userController] line no 138-192 tk ka code jo likha haii vo strope payment gateway kaam nahi kr rah tha to temp jugad kiya hai baad me vo delte krna hai 

or in UserRouter me ek route hai 
<!-- UserRouter.get('/confirm-checkout', confirmCheckout);        --> ye delte krna hai temp route banaya hai stripe ke liye 


<!-- import { getUserData, userEnrolledCourses, PurchaseCourse, updateUserCourseProgress, getUserCourseProgress, addUserRating, confirmCheckout } from '../controllers/userController.js';  -->

ye bhi delte krna hai
