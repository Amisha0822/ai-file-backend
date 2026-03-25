import mongoose, { Schema, Document, Types } from "mongoose";

export interface IFile extends Document {
  owner: Types.ObjectId;
  filename: string;
  originalName: string;
  size: number;
  mimeType: string;
  storageType: "local" | "s3";
  path?: string;
  s3Key?: string;
  sharedWith: Types.ObjectId[];
  starred: boolean;
  trashedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const FileSchema = new Schema<IFile>(
  {
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    filename: {
      type: String,
      required: true,
      trim: true,
    },
    originalName: {
      type: String,
      required: true,
      trim: true,
    },
    size: {
      type: Number,
      required: true,
      min: 0,
    },
    mimeType: {
      type: String,
      required: true,
    },
    storageType: {
      type: String,
      enum: ["local", "s3"],
      required: true,
    },
    path: {
      type: String,
      default: null,
    },
    s3Key: {
      type: String,
      default: null,
    },
    sharedWith: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    starred: {
      type: Boolean,
      default: false,
    },
    trashedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

FileSchema.index({ owner: 1, createdAt: -1 });
FileSchema.index({ sharedWith: 1 });
FileSchema.index({ owner: 1, starred: 1 });
FileSchema.index({ owner: 1, trashedAt: 1 });

FileSchema.index({ owner: 1, filename: 1 }, { unique: true });

const File = mongoose.model<IFile>("File", FileSchema);

export default File;
