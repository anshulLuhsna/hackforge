import mongoose, { Schema, Document } from 'mongoose';

// Define the Project interface
export interface IProject extends Document {
  hackathonName: string;
  theme: string;
  duration: string;
  teamSize: string;
  projectIdea: string;
  techStack: string;
  userId: string;
  createdAt: Date;
}

// Define the Project schema
const ProjectSchema: Schema = new Schema({
  hackathonName: { type: String, required: true },
  theme: { type: String, required: true },
  duration: { type: String, required: true },
  teamSize: { type: String, required: true },
  projectIdea: { type: String, required: true, minlength: 10 },
  techStack: { type: String, required: true },
  userId: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

// Create and export the Project model
export default mongoose.models.Project || mongoose.model<IProject>('Project', ProjectSchema); 