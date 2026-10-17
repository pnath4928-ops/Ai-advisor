import mongoose, { Document, Schema } from 'mongoose';

export interface ITeacher extends Document {
  userId: mongoose.Types.ObjectId;
  teacherId: string;
  department: string;
  designation: string;
  assignedSubjects: string[];
  assignedClasses: string[];
  createdAt: Date;
  updatedAt: Date;
}

const teacherSchema = new Schema<ITeacher>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    teacherId: {
      type: String,
      required: true,
      unique: true,
    },
    department: {
      type: String,
      required: true,
    },
    designation: {
      type: String,
      default: '',
    },
    assignedSubjects: [{
      type: String,
    }],
    assignedClasses: [{
      type: String,
    }],
  },
  {
    timestamps: true,
  }
);

export const Teacher = mongoose.model<ITeacher>('Teacher', teacherSchema);
