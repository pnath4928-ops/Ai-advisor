import mongoose, { Document, Schema } from 'mongoose';

export interface IStudent extends Document {
  userId: mongoose.Types.ObjectId;
  studentId: string;
  gradeLevel: string;
  section: string;
  learningPreference: 'visual' | 'auditory' | 'reading' | 'kinesthetic';
  preferredStudyTime: string;
  preferredStudyTechnique: string;
  academicGoal: string;
  createdAt: Date;
  updatedAt: Date;
}

const studentSchema = new Schema<IStudent>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    studentId: {
      type: String,
      required: true,
      unique: true,
    },
    gradeLevel: {
      type: String,
      required: true,
    },
    section: {
      type: String,
      required: true,
    },
    learningPreference: {
      type: String,
      enum: ['visual', 'auditory', 'reading', 'kinesthetic'],
      default: 'visual',
    },
    preferredStudyTime: {
      type: String,
      default: 'morning',
    },
    preferredStudyTechnique: {
      type: String,
      default: 'active recall',
    },
    academicGoal: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

export const Student = mongoose.model<IStudent>('Student', studentSchema);
