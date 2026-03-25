import { IUser } from "../models/User";
export interface CreateUserData {
    googleId: string;
    email: string;
    name: string;
    avatar?: string;
}
export declare const findOrCreateUser: (userData: CreateUserData) => Promise<IUser>;
export declare const findUserById: (userId: string) => Promise<IUser | null>;
export declare const findUserByEmail: (email: string) => Promise<IUser | null>;
export declare const findUserByGoogleId: (googleId: string) => Promise<IUser | null>;
declare const _default: {
    findOrCreateUser: (userData: CreateUserData) => Promise<IUser>;
    findUserById: (userId: string) => Promise<IUser | null>;
    findUserByEmail: (email: string) => Promise<IUser | null>;
    findUserByGoogleId: (googleId: string) => Promise<IUser | null>;
};
export default _default;
//# sourceMappingURL=userService.d.ts.map