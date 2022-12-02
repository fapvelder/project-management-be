import mongoose from 'mongoose'

const taskSchema = new mongoose.Schema(
  {
    pID: { type: 'string', required: true },
    taskPMID: { type: 'string', required: true },
    taskName: { type: String, required: true },
    assignee: { type: String, required: true },
    assigneeID: { type: String, required: true },
    taskDescription: { type: String, required: true },
    taskDeadline: { type: Date, required: true },
    taskStatus: { type: String, default: 'New', required: true },
  },
  {
    timestamps: true,
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
    },
  }
)

const Task = mongoose.model('Task', taskSchema)
export default Task
