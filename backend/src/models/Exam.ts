import mongoose, { Document, Schema } from 'mongoose';

export interface IExam extends Document {
  studentId: mongoose.Types.ObjectId;
  subjectName: string;
  examType: string;
  examDate: Date;
  preparationLevel: number;
  createdAt: Date;
  updatedAt: Date;
}

const examSchema = new Schema<IExam>(
  {
    studentId: {
      type: Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
    },
    subjectName: {
      type: String,
      required: true,
    },
    examType: {
      type: String,
      required: true,
    },
    examDate: {
      type: Date,
      required: true,
    },
    preparationLevel: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
  },
  {
    timestamps: true,
  }
);

export const Exam = mongoose.model<IExam>('Exam', examSchema);
