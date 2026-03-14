import type { Request, Response } from 'express';
declare global {
    namespace Express {
        interface Request {
            user?: any;
        }
    }
}
export declare const register: (req: Request, res: Response) => Promise<void>;
export declare const login: (req: Request, res: Response) => Promise<void>;
//# sourceMappingURL=AuthController.d.ts.map