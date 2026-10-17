import mongoose, { Document, Schema } from 'mongoose';

export interface IStudyProgress extends Document {
  studentId: mongoose.Types.ObjectId;
  studyTaskId: mongoose.Types.ObjectId;
  actualMinutes: number;
  focusScore: number;
  notes: string;
  completedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const studyProgressSchema = new Schema<IStudyProgress>(
  {
    studentId: {
      type: Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
    },
    studyTaskId: {
      type: Schema.Types.ObjectId,
      ref: 'StudyTask',
      required: true,
    },
    actualMinutes: {
      type: Number,
      required: true,
      min: 0,
    },
    focusScore: {
      type: Number,
      required: true,
      min: 0,
      max: 10,
    },
    notes: {
      type: String,
      default: '',
    },
    completedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

export const StudyProgress = mongoose.model<IStudyProgress>('StudyProgress', studyProgressSchema);
