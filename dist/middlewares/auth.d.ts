import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../types";
export declare const authenticate: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
export default authenticate;
//# sourceMappingURL=auth.d.ts.map