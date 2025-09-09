import { commonFilterPelayanan, commonFilterReport } from "./common-filter.js";
import { Op } from "sequelize";
import sequelizeInstance from "../../configurations/sequelize-instance.js";

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

export function cancelReportFilter({faskesUuid, args = {}, options = {}}) {
    const filter = commonFilterReport({
        faskesUuid,
        args,
        options: {
            ...options,
            cancelDate: {
                [Op.between]: [args.start_date, args.end_date],
            },
            status: false
        }
    });

        //* Filter Jenis Kunjungan
    if (args.jenis_kunjungan) filter.jenisKunjungan = args.jenis_kunjungan;

    return filter;
}

export function statusKamarFilter({ faskesUuid, args = {}, options = {} }) {
    const filter = {
        faskesUuid,
        deletedAt: { [Op.is]: null },
        [Op.or]: [
                //* Filter Tanggal Daftar
            sequelizeInstance.where(sequelizeInstance.col("rawat_inap.tanggal_daftar"), {
                [Op.between]: [args.start_date, args.end_date],
            }),
        ],
        ...options,
    };

        //* Filter Ruangan
    if (args.room) filter.room = sequelizeInstance.where(sequelizeInstance.col("room.name"), args.room);

    return filter;
}

export function keperawatanInapFilter({ faskesUuid, args = {}, options = {} }) {
    const filter = commonFilterPelayanan({
        faskesUuid,
        args,
        options: {
            ...options,
            status_ri: { [Op.not]: 0 },
            dischargeDate: {
                [Op.between]: [args.start_date, args.end_date]
            }
        }
    });

    if (args.room) filter.room = sequelizeInstance.where(sequelizeInstance.col("monitoring_room.room.name"), { [Op.iLike]: `${args.room}` });

    return filter;
}

export function newBornFilter({ faskesUuid, args = {}, options = {} }) {
    const filter = {
        faskesUuid,
        deletedAt: null,
        [Op.and]: [
            sequelizeInstance.where(
                sequelizeInstance.col("birth_detail.patient.log_pelayanan.discharge_date"), 
                { [Op.not]: null },
                { [Op.between]: [args.start_date, args.end_date] }
            ),
        ],
        [Op.or]: [
            {noRmBaby: {[Op.iLike]: `%${args.q}%`}},
            {nameBaby: {[Op.iLike]: `%${args.q}%`}},
            sequelizeInstance.where(
                sequelizeInstance.col('address.full_address'),
                {[Op.iLike]: `%${args.q || ''}%`}
            ),
        ],
        ...options,
    };
    
        //* Filter Jenis Kunjungan
    if (args.jenis_kunjungan) filter.jenis_kunjungan = sequelizeInstance.where(
        sequelizeInstance.col('birth_detail.patient.log_pelayanan.jenis_kunjungan'),
        { [Op.eq]: `${args.jenis_kunjungan}` }
    );

    return filter;
}