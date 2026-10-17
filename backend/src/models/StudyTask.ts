import mongoose, { Document, Schema } from 'mongoose';

export interface IStudyTask extends Document {
  studyPlanId: mongoose.Types.ObjectId;
  day: string;
  subjectName: string;
  plannedMinutes: number;
  studiedMinutes: number;
  remainingMinutes: number;
  progressPercentage: number;
  studyTechnique: string;
  status: 'pending' | 'in_progress' | 'completed';
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const studyTaskSchema = new Schema<IStudyTask>(
  {
    studyPlanId: {
      type: Schema.Types.ObjectId,
      ref: 'StudyPlan',
      required: true,
    },
    day: {
      type: String,
      required: true,
    },
    subjectName: {
      type: String,
      required: true,
    },
    plannedMinutes: {
      type: Number,
      required: true,
      min: 1,
    },
    studiedMinutes: {
      type: Number,
      default: 0,
      min: 0,
    },
    remainingMinutes: {
      type: Number,
      default: 0,
      min: 0,
    },
    progressPercentage: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    studyTechnique: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'in_progress', 'completed'],
      default: 'pending',
    },
    completedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

export const StudyTask = mongoose.model<IStudyTask>('StudyTask', studyTaskSchema);
