import {z} from "zod";

export default class AsuransiValidator {
    static ASURANSI_VALIDATOR = z.object({
        penjamin_uuid: z.string().max(255).uuid(),
        account_number: z.string().max(255),
        class_entitle: z.string().max(255),
    });

}