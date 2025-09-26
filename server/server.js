import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv/config'
import { connect } from 'mongoose'
import conntectDB from './config/mongodb.js'
import UserModel from './Models/userModel.js'
import { clerkWebhook } from './controllers/webhooks.js'



// Initiallze express

const app = express()

//conntect to database
 await conntectDB()


//middleware

app.use(cors())
app.use(express.json())



//routes


app.get('/', (req, res) => {
    res.send('Welcome to the home page')
})
 app.post("/clerk",express.json(),clerkWebhook)

//listen to server

const PORT = process.env.PORT || 5000

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
})

