import mongoose, { Document, Schema } from 'mongoose';

export interface ISubjectTopic extends Document {
  academicRecordId: mongoose.Types.ObjectId;
  topicName: string;
  rating: 'excellent' | 'good' | 'average' | 'needs_improvement';
  remarks: string;
  createdAt: Date;
  updatedAt: Date;
}

const subjectTopicSchema = new Schema<ISubjectTopic>(
  {
    academicRecordId: {
      type: Schema.Types.ObjectId,
      ref: 'AcademicRecord',
      required: true,
    },
    topicName: {
      type: String,
      required: true,
    },
    rating: {
      type: String,
      enum: ['excellent', 'good', 'average', 'needs_improvement'],
      default: 'average',
    },
    remarks: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

export const SubjectTopic = mongoose.model<ISubjectTopic>('SubjectTopic', subjectTopicSchema);
