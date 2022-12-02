import express from 'express'
import Project from '../models/projectModel.js'
import Task from '../models/taskModel.js'
import expressAsyncHandler from 'express-async-handler'
import { isAuth, isAdmin, isPM } from '../utils.js'
import { updateProjectSchema } from '../helpers/validation_schema.js'

const projectRouter = express.Router()
const ITEMS_PER_PAGE = 4

projectRouter.get(
  '/admin',
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    const page = req.query.page || 1
    const query = {}
    try {
      const skip = (page - 1) * ITEMS_PER_PAGE
      const countPromise = await Project.estimatedDocumentCount(query)
      const projectsPromise = await Project.find(query)
        .limit(ITEMS_PER_PAGE)
        .skip(skip)
      const [count, projects] = await Promise.all([
        countPromise,
        projectsPromise,
      ])
      const pageCount = Math.ceil(count / ITEMS_PER_PAGE)

      res.send({ pagination: { count, pageCount }, projects })
    } catch (err) {
      console.error(err)
      return err
    }
  })
)
projectRouter.get(
  '/',
  isAuth,
  expressAsyncHandler(async (req, res) => {
    const projects = await Project.find()
    res.send(projects)
  })
)

projectRouter.post(
  '/create',
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    const newProject = new Project({
      name: req.body.name,
      pm: req.body.pm,
      pmID: req.body.pmID,
      description: req.body.description,
      deadline: req.body.deadline,
      status: req.body.status,
    })
    const project = await newProject.save()
    res.send({
      _id: project._id,
      name: project.name,
      pm: project.pm,
      description: project.description,
      deadline: project.deadline,
      status: project.status,
    })
  })
)

projectRouter.get(
  '/:id',
  isAuth,
  expressAsyncHandler(async (req, res) => {
    const project = await Project.findById(req.params.id)
    if (project) {
      res.send(project)
    } else {
      res.status(404).send({ message: 'Project Not Found' })
    }
  })
)

projectRouter.put(
  '/:id',
  isAuth,
  expressAsyncHandler(async (req, res, next) => {
    try {
      const result = await updateProjectSchema.validateAsync(req.body)
      console.log(result)
      const project = await Project.findById(req.params.id)
      if (project) {
        const task = await Task.find({ pID: req.params.id })
        if (req.user.role === 'Admin') {
          project.name = req.body.name || project.name
          project.pm = req.body.pm || project.pm
          project.pmID = req.body.pmID || project.pmID
          project.description = req.body.description || project.description
          project.deadline = req.body.deadline || project.deadline
          const updatedProject = await project.save()
          res.send({ message: 'Project Updated', project: updatedProject })
        } else if (req.user._id === project.pmID) {
          project.status = req.body.status || project.status
          project.deadline = req.body.deadline || project.deadline
          const updatedProject = await project.save()
          res.send({ message: 'Project Updated', project: updatedProject })
        } else {
          res.status(403).send({
            message: 'You do not have permission to edit this project',
          })
        }

        if (project.pmID) {
          for (let i = 0; i < task.length; i++) {
            task[i].taskPMID = project.pmID
            const updatedTask = await task[i].save()
            res.send({ task: updatedTask })
          }
        }
      } else {
        res.status(404).send({ message: 'Project Not Found' })
      }
    } catch (err) {
      if (err.isJoi === true) {
        res.status(422).send({ message: `${err.details[0].message}` })
      }
      next(err)
    }
  })
)

projectRouter.delete(
  '/:id',
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    const project = await Project.findById(req.params.id)
    if (project) {
      await project.remove()
      res.send({ message: 'Project Deleted' })
    } else {
      res.status(404).send({ message: 'Project Not Found' })
    }
  })
)

export default projectRouter
