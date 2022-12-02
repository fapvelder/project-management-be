import express from 'express'
import path from 'path'
import mongoose from 'mongoose'
import userRouter from './routes/userRoutes.js'
import projectRouter from './routes/projectRoutes.js'
import taskRouter from './routes/taskRoutes.js'
import cors from 'cors'
import morgan from 'morgan'
import fileUpload from 'express-fileupload'
import { PORT, MONGODB_URI } from './src/config/index.js'
import multer from 'multer'
import { fileURLToPath } from 'url'
import { v2 as cloudinary } from 'cloudinary'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// import module from 'module-alias/register'
// process.on('uncaughtException', (error) => {
//   console.log(`Uncaught Exception: ${error}`)
// })
// process.on('unhandledRejection', (error) => {
//   console.log(`Unhandled Rejection: ${error}`)
// })

const main = async () => {
  mongoose
    .connect(MONGODB_URI)
    .then(() => {
      console.log('Connected to database')
    })
    .catch((err) => {
      console.log(err.message)
    })
  const app = express()

  app.use(cors())
  app.use(express.json({ limit: '50mb' }))
  app.use(express.urlencoded({ limit: '50mb', extended: true }))
  app.use(morgan('combined'))
  app.use(fileUpload())

  app.use('/api/users', userRouter)
  app.use('/api/projects', projectRouter)
  app.use('/api/tasks', taskRouter)

  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  })

  app.use((err, req, res) => {
    res.status(500).send({ message: err.message })
  })

  app.listen(PORT || 5000, () => {
    console.log(`Server at Http://localhost:${PORT}`)
  })
}

main()
