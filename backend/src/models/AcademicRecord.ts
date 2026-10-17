import mongoose, { Document, Schema } from 'mongoose';

export interface IAcademicRecord extends Document {
  teacherId: mongoose.Types.ObjectId;
  studentId: mongoose.Types.ObjectId;
  subjectName: string;
  term: string;
  totalClasses: number;
  attendedClasses: number;
  score: number;
  grade: string;
  teacherNotes: string;
  createdAt: Date;
  updatedAt: Date;
}

const academicRecordSchema = new Schema<IAcademicRecord>(
  {
    teacherId: {
      type: Schema.Types.ObjectId,
      ref: 'Teacher',
      required: true,
    },
    studentId: {
      type: Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
    },
    subjectName: {
      type: String,
      required: true,
    },
    term: {
      type: String,
      required: true,
    },
    totalClasses: {
      type: Number,
      required: true,
      min: 0,
    },
    attendedClasses: {
      type: Number,
      required: true,
      min: 0,
    },
    score: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    grade: {
      type: String,
      required: true,
    },
    teacherNotes: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

export const AcademicRecord = mongoose.model<IAcademicRecord>('AcademicRecord', academicRecordSchema);
