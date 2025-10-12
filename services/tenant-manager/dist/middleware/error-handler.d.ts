import { Request, Response, NextFunction } from 'express';
export interface CustomError extends Error {
    statusCode?: number;
    code?: string;
}
export declare function errorHandler(error: CustomError, req: Request, res: Response, next: NextFunction): void;
//# sourceMappingURL=error-handler.d.ts.map