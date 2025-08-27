import {z} from "zod";

export default class GeneralConsentValidation{
    static CREATE = z.object({
        family_data: z.union([
            z.object({
                name: z.string().max(255),
                gender: z.string().max(15),
                relationship: z.string().max(150),
                address: z.string().max(255).optional(),
            }),
            z.null(),
        ]),
        name: z.string().max(255),
        general_consent: z.string(),
    });
}