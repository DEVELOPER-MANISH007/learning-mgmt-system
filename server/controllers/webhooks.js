import { Webhook } from "svix";
import UserModel from "../Models/userModel.js";
import Stripe from "stripe";
import Purchase from "../Models/Purchase.js";
import { Course } from "../Models/Course.js";



//Api controller function to manage clerk user with database

 export const clerkWebhook = async (req, res) => {

    try {
        const whook = new Webhook(process.env.CLERK_WEBHOOK_SECRET);

        await whook.verify(JSON.stringify(req.body),{
            'svix-id':req.headers['svix-id'],
            'svix-timestamp':req.headers['svix-timestamp'],
            'svix-signature':req.headers['svix-signature']  
        })
        const {data,type} = req.body

        switch(type){
            case "user.created":{
                const userData = {
                    _id:data.id,
                    email:data.email_addresses[0].email_address,
                    name:data.first_name + " " + data.last_name,
                    imageUrl:data.image_url
                }
                await UserModel.create(userData)
                return res.json({})
                break;
            }
           
            case "user.updated":{
                const userData = {
                    email:data.email_addresses[0].email_address,
                    name:data.first_name + " " + data.last_name,
                    imageUrl:data.image_url
                }
                await UserModel.findByIdAndUpdate(data.id,userData)
                return res.json({})
                break;
            }
             case "user.deleted":{
                await UserModel.findByIdAndDelete(data.id)
                return res.json({})
                break;
            }
            default:break;  
        }
        
    } catch (error) {
        res.json({success:false, error: error.message})
    }
}

 const stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY)

export const stripeWebhooks  = async(req,res)=>{

const sig = req.headers['stripe-signature']
let event;
try {
    // req.body is a Buffer because of express.raw()
    event = Stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET)
    console.log('Webhook received:', event.type)
} catch (error) {
    console.log('Webhook Error:', error.message)
    res.status(400).send(`Webhook Error:${error.message}`)
    return
}


//todo handle event
switch(event.type){

    case 'payment_intent.succeeded':{
        console.log('Payment succeeded, processing...')
        const paymentIntent = event.data.object
        const paymentIntentId = paymentIntent.id

        try {
            const sessionList =  await stripeInstance.checkout.sessions.list({
                payment_intent:paymentIntentId,
                limit: 1
            })
            const session = sessionList.data?.[0]
            if (!session) {
                console.log('No session found for intent:', paymentIntentId)
                break
            }
            console.log('Session data:', session)
            const {purchaseId} = session.metadata || {}
            console.log('Purchase ID:', purchaseId)
            
            const purchaseData = await Purchase.findById(purchaseId)
            if (!purchaseData) {
                console.log('Purchase not found:', purchaseId)
                break
            }
            if (purchaseData.status === 'completed') {
                console.log('Purchase already completed, skipping')
                break
            }
            
            const userData = await UserModel.findById(purchaseData.userId)
            const courseData = await Course.findById(purchaseData.courseId.toString())
            
            // Update course enrollment
            courseData.enrolledStudents.push(userData._id)
            await courseData.save()
            
            // Update user enrollment
            userData.enrolledCourses.push(courseData._id)
            await userData.save()
            
            // Update purchase status
            purchaseData.status = "completed"
            await purchaseData.save()
            
            console.log('Payment processing completed successfully')
        } catch (error) {
            console.log('Error processing payment:', error.message)
        }

        break;
    }
    case 'payment_intent.payment_failed':{

         const paymentIntent = event.data.object
         const paymentIntentId = paymentIntent.id

         const sessionList =  await stripeInstance.checkout.sessions.list({
            payment_intent:paymentIntentId,
            limit: 1
        })
        const session = sessionList.data?.[0]
        if (session?.metadata?.purchaseId) {
            const {purchaseId} = session.metadata
            const purchaseData = await Purchase.findById(purchaseId)
            if (purchaseData) {
                purchaseData.status = 'failed'
                await purchaseData.save()
            }
        }
           break;
    }
        default:
            console.log(`Unhandled event type ${event.type}`)


}
res.json({received:true})

}