import mongoose, { Document, Schema } from 'mongoose';

export interface IStudyTopic extends Document {
  studyTaskId: mongoose.Types.ObjectId;
  topicName: string;
  plannedMinutes: number;
  studiedMinutes: number;
  remainingMinutes: number;
  progressPercentage: number;
  status: 'pending' | 'in_progress' | 'completed';
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const studyTopicSchema = new Schema<IStudyTopic>(
  {
    studyTaskId: {
      type: Schema.Types.ObjectId,
      ref: 'StudyTask',
      required: true,
    },
    topicName: {
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

export const StudyTopic = mongoose.model<IStudyTopic>('StudyTopic', studyTopicSchema);
