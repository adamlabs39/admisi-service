import { Op } from "sequelize";
import sequelizeInstance from "../configurations/sequelize-instance.js";

export function commonFilter({faskesUuid, args = {}, options = {}}) {
    const filter = {
        faskesUuid,
        [Op.or]: [
                //* Filter No Rm Layanan
            // { no_rm: { [Op.iLike]: `%${args.q || ""}%` } },
                //* Filter Nama dan Title patient
            sequelizeInstance.where(sequelizeInstance.fn("concat", sequelizeInstance.col("patient.title"), " ", sequelizeInstance.col("patient.name")), { [Op.iLike]: `%${args.q || ""}%` }),
                //* Filter Alamat
            sequelizeInstance.where(sequelizeInstance.col("patient.address.full_address"), { [Op.iLike]: `%${args.q || ""}%` }),
                //* Filter No Rm Patient
            sequelizeInstance.where(sequelizeInstance.col("patient.no_rm"), { [Op.iLike]: `%${args.q || ""}%` }),
            ],
        ...options
    }

    return filter;
}

export function rawatJalanFilter({faskesUuid, args = {}, options = {}}) {
    const filter = commonFilter({
        faskesUuid, 
        args, 
        ...options, 
        deletedAt: { [Op.is]: null },
        statusRj: { [Op.not]: 0 },
        tanggalDaftar: {
            [Op.between]: [args.start_date, args.end_date]
        },
        dischargeDate: {
            [Op.is]: null
        }
    });

    if (args.poly) {
        const polyArray = args.poly.split(',').map(item => item.trim());
        filter.lokasiUuid = {[Op.in]: polyArray};
    }

    if (args.platform) {
        const platformArray = args.platform.split(',').map(item => item.trim());
        filter.platform = {[Op.in]: platformArray};
    }

    if (args.payment_method) {
        const paymentMethodArray = args.payment_method.split(',').map(item => item.trim());
        filter.paymentMethod = {[Op.in]: paymentMethodArray};
    }

    if(args.status){
        if(parseInt(args.status) === 1){
            filter.statusRj = {[Op.in]: [1, 2, 3, 4]};
        }else{
            filter.statusRj = {[Op.in]: [5]};
        }
    }

    //! Digunakan atau tidak?
    // if (args.status_antrian) {
    //     const statusAntrianArray = args.status_antrian.split(',').map(item => item.trim());
    //     let statusAntrian = [];
        
    //     statusAntrianArray.forEach(status => {
    //         if (status === "antri") {
    //             statusAntrian.push(1, 2, 3);
    //         } else if (status === "proses") {
    //             statusAntrian.push(4);
    //         } else if (status === "selesai") {
    //             statusAntrian.push(5);
    //         }
    //     });

    //     if (statusAntrian.length > 0) {
    //         filter.statusRj = { [Op.in]: statusAntrian };
    //     }
    // }

    if (args.dpjp) filter.practitionerUuid = args.dpjp;
    
    return filter;
}

export function rawatInapFilter({faskesUuid, args = {}, options = {}}) {
    const filter = commonFilter({
        faskesUuid,
        args,
        ...options,
        status_ri: {[Op.not]: 0},
        tanggalDaftar: {
            [Op.between]: [args.start_date, args.end_date]
        },
        dischargeDate: {[Op.is]: null},
        deletedAt: {[Op.is]: null}
    });

    if (args.payment_method) filter.paymentMethod = args.payment_method;
    if (args.dpjp) filter.practitionerUuid = args.dpjp;
    if (args.room) {
        const roomArray = args.room.split(',').map(item => item.trim());
        filter[Op.and] = {
            [Op.or]: roomArray.map(room =>
                sequelizeInstance.where(
                    sequelizeInstance.col('monitoring_room.room.name'),
                    { [Op.iLike]: `%${room}%` }
                )
            )
        };
    }

    return filter;
}

export default {
    commonFilter,
    rawatJalanFilter,
    rawatInapFilter
}