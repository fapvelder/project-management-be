import express from 'express'
import Task from '../models/taskModel.js'
import Project from '../models/projectModel.js'
import expressAsyncHandler from 'express-async-handler'
import { isAuth } from '../utils.js'
import {
  createTaskSchema,
  updateTaskSchema,
} from '../helpers/validation_schema.js'

const taskRouter = express.Router()
const ITEMS_PER_PAGE = 5
taskRouter.get(
  '/',
  isAuth,
  expressAsyncHandler(async (req, res) => {
    const tasks = await Task.find({})
    res.send(tasks)
  })
)
taskRouter.get(
  '/pagination',
  isAuth,
  expressAsyncHandler(async (req, res) => {
    const page = req.query.page || 1
    try {
      const skip = (page - 1) * ITEMS_PER_PAGE
      const countPromise = await Task.countDocuments({
        pID: req.headers.id,
      })
      const tasksPromise = await Task.find({ pID: req.headers.id })
        .limit(ITEMS_PER_PAGE)
        .skip(skip)
      const [count, tasks] = await Promise.all([countPromise, tasksPromise])
      const pageCount = Math.ceil(count / ITEMS_PER_PAGE)

      res.send({ pagination: { count, pageCount }, tasks })
    } catch (err) {
      console.error(err)
      return err
    }
  })
)

taskRouter.post(
  '/create',
  isAuth,
  expressAsyncHandler(async (req, res, next) => {
    try {
      const result = await createTaskSchema.validateAsync(req.body)
      console.log(result)
      const newTask = new Task({
        pID: req.body.pID,
        taskPMID: req.body.taskPMID,
        taskName: req.body.taskName,
        assignee: req.body.assignee,
        assigneeID: req.body.assigneeID,
        taskDescription: req.body.taskDescription,
        taskDeadline: req.body.taskDeadline,
        taskStatus: req.body.taskStatus,
      })
      const task = await newTask.save()
      res.send({
        _id: task._id,
        pID: task.pID,
        taskPMID: task.taskPMID,
        taskName: task.taskName,
        assignee: task.assignee,
        assigneeID: task.assigneeID,
        taskDescription: task.taskDescription,
        taskDeadline: task.taskDeadline,
        taskStatus: task.taskStatus,
      })
    } catch (err) {
      if (err.isJoi === true) {
        res.status(422).send({ message: `${err.details[0].message}` })
      }
      next(err)
    }
  })
)
taskRouter.get(
  '/:id',
  isAuth,
  expressAsyncHandler(async (req, res) => {
    const task = await Task.findById(req.params.id)
    if (task) {
      res.send(task)
    } else {
      res.status(404).send({ message: 'Task Not Found' })
    }
  })
)
taskRouter.delete(
  '/:id',
  isAuth,
  expressAsyncHandler(async (req, res) => {
    const task = await Task.findById(req.params.id)
    if (task) {
      await task.remove()
      res.send({ message: 'Task Deleted' })
    } else {
      res.status(404).send({ message: 'Task Not Found' })
    }
  })
)

taskRouter.put(
  '/:id',
  isAuth,
  expressAsyncHandler(async (req, res, next) => {
    try {
      const result = await updateTaskSchema.validateAsync(req.body)
      console.log(result)
      const task = await Task.findById(req.params.id)
      if (task) {
        const project = await Project.findById(task.pID)
        if (req.user._id === project.pmID) {
          task.taskName = req.body.taskName || task.taskName
          task.taskDescription =
            req.body.taskDescription || task.taskDescription
          task.taskDeadline = req.body.taskDeadline || task.taskDeadline
          task.assignee = req.body.assignee || task.assignee
          task.assigneeID = req.body.assigneeID || task.assigneeID
          const updatedTask = await task.save()
          res.status(200).send({ message: 'Task Updated', task: updatedTask })
        } else if (req.user._id === task.assigneeID) {
          task.taskStatus = req.body.taskStatus || task.taskStatus
          const updatedTask = await task.save()
          res.status(200).send({ message: 'Task Updated', task: updatedTask })
        } else {
          res
            .status(403)
            .send({ message: 'You do not have permission to edit this task' })
        }
      } else {
        res.status(404).send({ message: 'Task Not Found' })
      }
    } catch (err) {
      if (err.isJoi === true) {
        res.status(422).send({ message: `${err.details[0].message}` })
      }
      next(err)
    }
  })
)

export default taskRouter
