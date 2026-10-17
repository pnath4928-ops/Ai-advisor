import mongoose, { Document, Schema } from 'mongoose';

export interface IAssignment extends Document {
  teacherId: mongoose.Types.ObjectId;
  academicRecordId?: mongoose.Types.ObjectId;
  studentId?: mongoose.Types.ObjectId;
  title: string;
  description?: string;
  subjectName: string;
  dueDate: Date;
  marks: number;
  submitted: boolean;
  studentAnswer?: string;
  submittedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const assignmentSchema = new Schema<IAssignment>(
  {
    teacherId: {
      type: Schema.Types.ObjectId,
      ref: 'Teacher',
      required: true,
    },
    academicRecordId: {
      type: Schema.Types.ObjectId,
      ref: 'AcademicRecord',
    },
    studentId: {
      type: Schema.Types.ObjectId,
      ref: 'Student',
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    subjectName: {
      type: String,
      required: true,
    },
    dueDate: {
      type: Date,
      required: true,
    },
    marks: {
      type: Number,
      required: true,
      min: 0,
    },
    submitted: {
      type: Boolean,
      default: false,
    },
    studentAnswer: {
      type: String,
    },
    submittedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

export const Assignment = mongoose.model<IAssignment>('Assignment', assignmentSchema);
