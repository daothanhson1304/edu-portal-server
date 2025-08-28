// models/Rule.ts
import { Schema, model, Types } from 'mongoose';

const RuleSchema = new Schema(
  {
    number: { type: String, required: true },
    issuedDate: { type: Date, required: true },
    effectiveDate: { type: Date, required: true },
    summary: { type: String, required: true },
    type: { type: String, required: true },
    agency: { type: String, required: true },
    attachments: [{ type: Types.ObjectId, ref: 'File' }],
  },
  { timestamps: true }
);

export default model('Rule', RuleSchema);
