import jwt from 'jsonwebtoken'
import Task from './models/taskModel.js'
import Project from './models/projectModel.js'
export const generateToken = (user) => {
  return jwt.sign(
    {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN,
    }
  )
}
export const isAuth = (req, res, next) => {
  const authorization = req.headers.authorization
  if (authorization) {
    const token = authorization.slice(7, authorization.length)
    jwt.verify(token, process.env.JWT_SECRET, (err, decode) => {
      if (err) {
        res.status(401).send({ message: 'Invalid Token' })
      } else {
        req.user = decode
        next()
      }
    })
  } else {
    res.status(401).send({ message: 'No Token' })
  }
}
export const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'Admin') {
    next()
  } else {
    res.status(401).send({ message: 'Invalid Admin Token' })
  }
}
export const isPM = async (req, res, next) => {
  const project = await Project.findById(req.params.id)
  if (req.user._id === project.pmID) {
    next()
  } else {
    res.status(401).send({ message: 'Invalid Staff Token' })
  }
}
export const isAssignee = async (req, res, next) => {
  const task = await Task.findById(req.params.id)
  if (req.user && req.user._id === task.assigneeID) {
    next()
  } else {
    res.status(401).send({ message: 'Invalid Staff Token' })
  }
}
