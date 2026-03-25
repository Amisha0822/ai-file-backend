import { Request } from "express";

export interface UserPayload {
  id: string;
  email: string;
  name: string;
  googleId: string;
}

export interface AuthenticatedRequest extends Request {
  user?: UserPayload;
}


export interface FileMetadata {
  filename: string;
  originalName: string;
  size: number;
  mimeType: string;
  storageType: "local" | "s3";
  path?: string;
  s3Key?: string;
}


export interface ShareFileRequest {
  fileId: string;
  userEmail: string;
}
