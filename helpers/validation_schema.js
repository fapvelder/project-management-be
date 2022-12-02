import joi from 'joi'

const userSchema = joi.object({
  name: joi.string().min(3).required(),
  email: joi.string().email().lowercase().required(),
  password: joi.string().min(3).required(),
})

const createTaskSchema = joi.object({
  _id: joi.string(),
  pID: joi.string(),
  taskPMID: joi.string(),
  assignee: joi.string(),
  assigneeID: joi.string(),
  taskDescription: joi.string().min(3).max(1000).required(),
  taskName: joi.string().min(3).max(100).required(),
  taskDeadline: joi.date().min('now').max('12-31-2025').required(),
})
const updateProjectSchema = joi.object({
  _id: joi.string(),
  name: joi.string().required(),
  pm: joi.string().required(),
  pmID: joi.string().required(),
  description: joi.string().min(3).max(1000).required(),
  deadline: joi.date().min('11-01-2022').max('12-31-2025').required(),
  status: joi.valid('New', 'In Progress', 'Done', 'Approved').required(),
})
const updateTaskSchema = joi.object({
  _id: joi.string(),
  taskPMID: joi.string(),
  taskName: joi.string().required(),
  assignee: joi.string().required(),
  assigneeID: joi.string().required(),
  taskDescription: joi.string().min(3).max(1000).required(),
  taskDeadline: joi.date().min('11-01-2022').max('12-31-2025').required(),

  taskStatus: joi.valid('New', 'In Progress', 'Done').required(),
})
export { userSchema, createTaskSchema, updateProjectSchema, updateTaskSchema }
