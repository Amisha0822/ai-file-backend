interface EnvConfig {
    port: number;
    nodeEnv: string;
    mongodbUri: string;
    jwtSecret: string;
    frontendUrl: string;
    groqApiKey: string;
    aws: {
        accessKeyId: string | undefined;
        secretAccessKey: string | undefined;
        region: string | undefined;
        s3Bucket: string | undefined;
    };
    storage: {
        type: "auto" | "local" | "s3";
        maxFileSize: number;
    };
}
declare const config: EnvConfig;
export default config;
//# sourceMappingURL=env.d.ts.map