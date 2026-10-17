import mongoose, { Document, Schema } from 'mongoose';

export interface IAISuggestion extends Document {
  studyPlanId: mongoose.Types.ObjectId;
  suggestionType: string;
  targetDay: string;
  reasoning: string;
  recommendedAction: string;
  accepted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const aiSuggestionSchema = new Schema<IAISuggestion>(
  {
    studyPlanId: {
      type: Schema.Types.ObjectId,
      ref: 'StudyPlan',
      required: true,
    },
    suggestionType: {
      type: String,
      required: true,
    },
    targetDay: {
      type: String,
      required: true,
    },
    reasoning: {
      type: String,
      required: true,
    },
    recommendedAction: {
      type: String,
      required: true,
    },
    accepted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

export const AISuggestion = mongoose.model<IAISuggestion>('AISuggestion', aiSuggestionSchema);
