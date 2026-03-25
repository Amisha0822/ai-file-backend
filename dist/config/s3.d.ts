import { S3Client } from "@aws-sdk/client-s3";
export declare const initializeS3: () => S3Client | null;
export declare const getS3Client: () => S3Client | null;
export declare const isS3Available: () => boolean;
declare const _default: {
    initializeS3: () => S3Client | null;
    getS3Client: () => S3Client | null;
    isS3Available: () => boolean;
};
export default _default;
//# sourceMappingURL=s3.d.ts.map