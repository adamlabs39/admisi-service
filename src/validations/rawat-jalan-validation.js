import { z } from "zod";
import PatientValidation from "./patient-validation.js";
import AsuransiValidator from "./asuransi-validator.js";

export default class RawatJalanValidation {
    static RAJAL_VALIDATOR = z.object({
        patient_data: z.object({
            patient_uuid: z.optional(z.string().max(255).uuid()),
            ...PatientValidation.PATIENT_VALIDATOR.shape
        }),
        payment_method: z.enum(["TUNAI", "ASURANSI"]),
        jadwal_dokter_uuid: z.string().max(255).uuid(),
        complaint: z.string().max(255),
        no_antrian_admisi: z.string().max(255).optional(),
        no_antrian_poli: z.string().max(255).optional(),
        no_antrian_farmasi: z.string().max(255).optional(),
        kode_booking: z.string().max(255).optional(),
        note: z.string().max(255),
        maternity: z.boolean().default(false),
        platform: z.enum(["ADMISI", "APM", "MOBILE"]).default("ADMISI").optional(),
        insurance: AsuransiValidator.ASURANSI_VALIDATOR.optional(),
    }).refine((data) => {
        if (data.payment_method === "ASURANSI" && !data.insurance) {
            return false;
        }
        return true;
    }, {
        message: "Insurance information is required when payment method is ASURANSI",
        path: ["insurance"],
    });

    static RAJAL_APM_VALIDATOR = z.object({
        patient_data: z.object({
            patient_uuid: z.optional(z.string().max(255).uuid()),
            identity: z.string().max(255),
            no_identity: z.string().max(255),
        }),
        no_antrian_admisi: z.string().max(255).optional(),
        no_antrian_poli: z.string().max(255).optional(),
        no_antrian_farmasi: z.string().max(255).optional(),
        kode_booking: z.string().max(255).optional(),
        platform: z.enum(["ADMISI", "APM", "MOBILE"]).default("APM").optional(),
        jadwal_dokter_uuid: z.string().max(255).uuid(),
        is_pasien_baru: z.boolean().optional()
    })

    static RAJAL_MOBILE_VALIDATOR = z.object({
        patient_data: z.object({
            patient_uuid: z.optional(z.string().max(255).uuid()),
            // no_rm: z.string().max(255).optional(),
            ...PatientValidation.PATIENT_VALIDATOR.shape
        }),
        no_antrian_admisi: z.string().max(255).optional(),
        no_antrian_poli: z.string().max(255).optional(),
        no_antrian_farmasi: z.string().max(255).optional(),
        kode_booking: z.string().max(255).optional(),
        maternity: z.boolean().default(false),
        platform: z.enum(["ADMISI", "APM", "MOBILE"]).default("MOBILE").optional(),
        jadwal_dokter_uuid: z.string().max(255).uuid(),
    })

    static CHECK_KODE_BOOKING_VALIDATOR = z.object({
        kode_booking: z.string({ required_error: "Kode booking Perlu di isi" }).max(255)
    })

    static cancelVisit = z.object({
        list_uuid: z.array(z.string().max(255)),
        cancel_reason: z.string().max(255)
    })
}
