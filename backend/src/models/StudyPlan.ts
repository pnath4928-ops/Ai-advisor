import mongoose, { Document, Schema } from 'mongoose';

export interface IStudyPlan extends Document {
  studentId: mongoose.Types.ObjectId;
  weekStartDate: Date;
  status: 'active' | 'completed' | 'archived';
  createdAt: Date;
  updatedAt: Date;
}

const studyPlanSchema = new Schema<IStudyPlan>(
  {
    studentId: {
      type: Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
    },
    weekStartDate: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ['active', 'completed', 'archived'],
      default: 'active',
    },
  },
  {
    timestamps: true,
  }
);

export const StudyPlan = mongoose.model<IStudyPlan>('StudyPlan', studyPlanSchema);
