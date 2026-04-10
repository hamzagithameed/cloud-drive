import mongoose, { Schema, Document, Model } from "mongoose";

export interface IFile extends Document {
  name: string;
  originalName: string;
  s3Key: string;
  s3Url: string;
  mimeType: string;
  size: number;
  owner: mongoose.Types.ObjectId;
  folderId: mongoose.Types.ObjectId | null;
  shareToken: string | null;
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const FileSchema = new Schema<IFile>(
  {
    name: { type: String, required: true, trim: true },
    originalName: { type: String, required: true },
    s3Key: { type: String, required: true, unique: true },
    s3Url: { type: String, required: true },
    mimeType: { type: String, required: true },
    size: { type: Number, required: true },
    owner: { type: Schema.Types.ObjectId, ref: "User", required: true },
    folderId: { type: Schema.Types.ObjectId, ref: "Folder", default: null },
    shareToken: { type: String, default: null },
    isPublic: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const File: Model<IFile> =
  mongoose.models.File || mongoose.model<IFile>("File", FileSchema);

export default File;
