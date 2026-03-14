import type { Request, Response } from 'express';
export declare const requestLocalAdmin: (req: Request, res: Response) => Promise<void>;
export declare const approveLocalAdmin: (req: Request, res: Response) => Promise<void>;
export declare const getLocalAdminRequests: (req: Request, res: Response) => Promise<void>;
export declare const getLocalExchanges: (req: Request, res: Response) => Promise<void>;
export declare const getAllExchanges: (req: Request, res: Response) => Promise<void>;
export declare const updateExchangeStatus: (req: Request, res: Response) => Promise<void>;
//# sourceMappingURL=AdminController.d.ts.map