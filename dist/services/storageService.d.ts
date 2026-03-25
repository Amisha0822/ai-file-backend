export interface UploadResult {
    storageType: "local" | "s3";
    path?: string;
    s3Key?: string;
    url?: string;
}
export declare const uploadFile: (userId: string, filename: string, buffer: Buffer, mimeType: string) => Promise<UploadResult>;
export declare const deleteFile: (storageType: "local" | "s3", pathOrKey: string) => Promise<void>;
export declare const getDownloadUrl: (storageType: "local" | "s3", pathOrKey: string, filename: string) => Promise<string>;
export declare const validateFileSize: (size: number) => void;
export declare const validateFileType: (mimeType: string) => void;
declare const _default: {
    uploadFile: (userId: string, filename: string, buffer: Buffer, mimeType: string) => Promise<UploadResult>;
    deleteFile: (storageType: "local" | "s3", pathOrKey: string) => Promise<void>;
    getDownloadUrl: (storageType: "local" | "s3", pathOrKey: string, filename: string) => Promise<string>;
    validateFileSize: (size: number) => void;
    validateFileType: (mimeType: string) => void;
};
export default _default;
//# sourceMappingURL=storageService.d.ts.map