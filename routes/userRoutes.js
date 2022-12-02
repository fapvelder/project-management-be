import express from 'express'
import User from '../models/userModel.js'
import bcrypt from 'bcryptjs'
import expressAsyncHandler from 'express-async-handler'
import { isAuth, isAdmin, generateToken } from '../utils.js'
import path from 'path'
import { fileURLToPath } from 'url'
import { userSchema } from '../helpers/validation_schema.js'
import { v2 as cloudinary } from 'cloudinary'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const userRouter = express.Router()
userRouter.get(
  '/',
  isAuth,
  expressAsyncHandler(async (req, res) => {
    const users = await User.find({})
    res.send(users)
  })
)
userRouter.post(
  '/signin',
  expressAsyncHandler(async (req, res) => {
    const user = await User.findOne({ email: req.body.email })
    if (user) {
      if (bcrypt.compareSync(req.body.password, user.password)) {
        res.send({
          _id: user._id,
          // name: user.name,
          // email: user.email,
          role: user.role,
          // avatar: user.avatar,
          token: generateToken(user),
        })
        return
      }
    }
    res.status(401).send({ message: 'Invalid email or password' })
  })
)

userRouter.post(
  '/create',
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res, next) => {
    try {
      const result = await userSchema.validateAsync(req.body)
      console.log(result)
      const newUser = new User({
        name: req.body.name,
        email: req.body.email,
        password: bcrypt.hashSync(req.body.password),
      })
      const user = await newUser.save()
      res.send({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        token: generateToken(user),
      })
    } catch (error) {
      if (error.isJoi === true) {
        res.status(422).send({ message: `${error.details[0].message}` })
      }
      next(error)
    }
  })
)

userRouter.get(
  '/:id',
  isAuth,
  expressAsyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id)
    if (user) {
      res.send(user)
    } else {
      res.status(404).send({ message: 'User Not Found' })
    }
  })
)

userRouter.put(
  '/:id',
  isAuth,
  expressAsyncHandler(async (req, res) => {
    const userId = req.params.id
    const user = await User.findById(userId)
    if (user) {
      const fileStr = req.body.data || req.data
      if (fileStr) {
        user.publicID = req.body.publicID || user.publicID
        if (user.publicID) {
          await cloudinary.uploader.destroy(user.publicID)
        }
        const uploadedResponse = await cloudinary.uploader.upload(fileStr)
        user.avatar = uploadedResponse.url
        user.publicID = uploadedResponse.public_id
      }
      user.name = req.body.name || user.name
      user.email = req.body.email || user.email
      await user.save()
      res.send({ message: 'User Updated' })
    } else {
      res.status(404).send({ message: 'User Not Found' })
    }
  })
)
userRouter.put(
  '/deleteImage/:id',
  isAuth,
  expressAsyncHandler(async (req, res) => {
    const userId = req.params.id
    const user = await User.findById(userId)
    if (user) {
      user.publicID = req.body.publicID || user.publicID
      if (user.publicID) {
        await cloudinary.uploader.destroy(user.publicID)
        res.send({ message: 'User Updated' })
        res.json({ msg: 'Image uploaded' })
      }
      user.avatar = process.env.img
      user.publicID = ''
      await user.save()
    } else {
      res.status(404).send({ message: 'User Not Found' })
    }
  })
)

userRouter.delete(
  '/:id',
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id)
    if (user) {
      if (user.email === 'admin@gmail.com') {
        res.status(400).send({ message: 'Can Not Delete Admin User' })
        return
      }
      await user.remove()
      res.send({ message: 'User Deleted' })
    } else {
      res.status(404).send({ message: 'User Not Found' })
    }
  })
)
export default userRouter
