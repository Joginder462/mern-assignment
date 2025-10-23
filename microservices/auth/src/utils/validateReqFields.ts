import { z } from "zod";
import { ErrorHandler } from "./errorHandler";

export const validateReqFields = (body: any, fields: any) => {
    const schema = z.object(fields);
    const response = schema.safeParse(body);

    if (!response.success) {
        const { issues } = response.error;
        let errorMessage = "Validation failed";
        
        if (issues?.length) {
            const firstError = issues[0];
            errorMessage = `${firstError.path.join('.')}: ${firstError.message}`;
        }
        
        throw ErrorHandler.create(errorMessage, 400);
    }
    
    return response.data;
};

export const dateCheck = (arg: any) =>
    arg.match(
        /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}(?:\.\d*)?)((-(\d{2}):(\d{2})|Z)?)$/
    );