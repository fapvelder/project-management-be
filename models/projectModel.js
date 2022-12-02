import mongoose from 'mongoose'

const projectSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    pm: { type: String, required: true },
    pmID: { type: String, required: true },
    description: { type: String, required: true },
    deadline: { type: Date, required: true },
    status: { type: String, default: 'New', required: true },
  },
  {
    timestamps: true,
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  }
)

const Project = mongoose.model('Project', projectSchema)
export default Project
