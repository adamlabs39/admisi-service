import { Op } from "sequelize";
import { commonFilterPelayanan } from "./common-filter.js";
import sequelizeInstance from "../../configurations/sequelize-instance.js";

export default function rawatInapFilter({faskesUuid, args = {}, options = {}}) {
    const filter = commonFilterPelayanan({
        faskesUuid,
        args,
        options: {
            ...options,
            status_ri: { [Op.not]: 0 },
            tanggalDaftar: {
                [Op.between]: [args.start_date, args.end_date],
            },
        },
    });

    //* filter untuk modul pelayanan RI
    if(args.status){
        if(parseInt(args.status) === 1){
                //* Dirawat
            filter.statusRi = {[Op.in]: [0, 1, 3]};
        }else if(parseInt(args.status) === 0){
                //* Discharge
            filter.statusRi = {[Op.in]: [4]};
        }else if (parseInt(args.status) === 2){
                //* Semua status
            filter.statusRi = {[Op.in]: [0, 1, 3, 4]};
        }
    }

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