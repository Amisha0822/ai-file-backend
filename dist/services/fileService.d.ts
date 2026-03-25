import { IFile } from "../models/File";
export interface CreateFileData {
    userId: string;
    filename: string;
    originalName: string;
    buffer: Buffer;
    size: number;
    mimeType: string;
}
export declare const uploadFile: (data: CreateFileData) => Promise<IFile>;
export declare const getUserFiles: (userId: string) => Promise<IFile[]>;
export declare const getSharedFiles: (userId: string) => Promise<IFile[]>;
export declare const getRecentFiles: (userId: string, limit?: number) => Promise<IFile[]>;
export declare const getStarredFiles: (userId: string) => Promise<IFile[]>;
export declare const getTrashedFiles: (userId: string) => Promise<IFile[]>;
export declare const getStorageStats: (userId: string) => Promise<{
    usedBytes: number;
    totalBytes: number;
    fileCount: number;
}>;
export declare const toggleStar: (fileId: string, userId: string) => Promise<IFile>;
export declare const trashFile: (fileId: string, userId: string) => Promise<IFile>;
export declare const restoreFile: (fileId: string, userId: string) => Promise<IFile>;
export declare const deleteFilePermanently: (fileId: string, userId: string) => Promise<void>;
export declare const deleteFile: (fileId: string, userId: string) => Promise<void>;
export declare const getFileById: (fileId: string, userId: string) => Promise<IFile>;
export declare const renameFile: (fileId: string, userId: string, newFilename: string) => Promise<IFile>;
export declare const searchFiles: (userId: string, query: string) => Promise<IFile[]>;
export declare const getFileDownloadUrl: (fileId: string, userId: string) => Promise<string>;
declare const _default: {
    uploadFile: (data: CreateFileData) => Promise<IFile>;
    getUserFiles: (userId: string) => Promise<IFile[]>;
    getSharedFiles: (userId: string) => Promise<IFile[]>;
    getRecentFiles: (userId: string, limit?: number) => Promise<IFile[]>;
    getStarredFiles: (userId: string) => Promise<IFile[]>;
    getTrashedFiles: (userId: string) => Promise<IFile[]>;
    toggleStar: (fileId: string, userId: string) => Promise<IFile>;
    trashFile: (fileId: string, userId: string) => Promise<IFile>;
    restoreFile: (fileId: string, userId: string) => Promise<IFile>;
    deleteFilePermanently: (fileId: string, userId: string) => Promise<void>;
    deleteFile: (fileId: string, userId: string) => Promise<void>;
    getFileById: (fileId: string, userId: string) => Promise<IFile>;
    renameFile: (fileId: string, userId: string, newFilename: string) => Promise<IFile>;
    searchFiles: (userId: string, query: string) => Promise<IFile[]>;
    getFileDownloadUrl: (fileId: string, userId: string) => Promise<string>;
};
export default _default;
//# sourceMappingURL=fileService.d.ts.map