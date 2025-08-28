// models/File.ts
import { Schema, model, Types } from 'mongoose';

const FileSchema = new Schema(
  {
    ruleId: { type: Types.ObjectId, ref: 'Rule', required: true },
    originalName: { type: String, required: true },
    storedName: { type: String, required: true },
    mime: { type: String, required: true },
    size: { type: Number, required: true },
    path: { type: String, required: true },
  },
  { timestamps: true }
);

export default model('File', FileSchema);
