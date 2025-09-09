import { commonFilterReport } from "./common-filter.js";
import { Op } from "sequelize";

export function kunjunganReportFilter({faskesUuid, args = {}, options = {}}) {
    const filter = commonFilterReport({
        faskesUuid, 
        args, 
        options: {
            ...options,
            dischargeDate: {
                [Op.between]: [args.start_date, args.end_date],
            },
            status: true
        }
    });

        //* Filter Jenis Kunjungan
    if (args.jenis_kunjungan) filter.jenisKunjungan = args.jenis_kunjungan;

        //* Filter Dokter
    if (args.practitioner_uuid) filter.practitionerUuid = args.practitioner_uuid;

    return filter;
}