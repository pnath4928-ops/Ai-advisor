import mongoose, { Document, Schema } from 'mongoose';

export interface IStudySession extends Document {
  studentId: mongoose.Types.ObjectId;
  studyTaskId: mongoose.Types.ObjectId;
  studyTopicId?: mongoose.Types.ObjectId;
  startTime: Date;
  endTime?: Date;
  durationMinutes: number;
  status: 'active' | 'paused' | 'completed';
  pausedAt?: Date;
  resumedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const studySessionSchema = new Schema<IStudySession>(
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
    studyTopicId: {
      type: Schema.Types.ObjectId,
      ref: 'StudyTopic',
    },
    startTime: {
      type: Date,
      required: true,
      default: Date.now,
    },
    endTime: {
      type: Date,
    },
    durationMinutes: {
      type: Number,
      default: 0,
      min: 0,
    },
    status: {
      type: String,
      enum: ['active', 'paused', 'completed'],
      default: 'active',
    },
    pausedAt: {
      type: Date,
    },
    resumedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

export const StudySession = mongoose.model<IStudySession>('StudySession', studySessionSchema);
