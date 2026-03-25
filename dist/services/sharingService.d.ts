import { IFile } from "../models/File";
export declare const shareFile: (fileId: string, ownerId: string, recipientEmail: string) => Promise<IFile>;
export declare const unshareFile: (fileId: string, ownerId: string, recipientEmail: string) => Promise<IFile>;
export declare const getFileSharing: (fileId: string, userId: string) => Promise<any[]>;
declare const _default: {
    shareFile: (fileId: string, ownerId: string, recipientEmail: string) => Promise<IFile>;
    unshareFile: (fileId: string, ownerId: string, recipientEmail: string) => Promise<IFile>;
    getFileSharing: (fileId: string, userId: string) => Promise<any[]>;
};
export default _default;
//# sourceMappingURL=sharingService.d.ts.map