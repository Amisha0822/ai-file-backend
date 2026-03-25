import mongoose, { Document, Types } from "mongoose";
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
declare const File: mongoose.Model<IFile, {}, {}, {}, mongoose.Document<unknown, {}, IFile, {}, {}> & IFile & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
}, any>;
export default File;
//# sourceMappingURL=File.d.ts.map