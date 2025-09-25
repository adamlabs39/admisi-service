import { Op } from "sequelize";
import { commonFilterPelayanan } from "./common-filter.js";

export default function rawatJalanFilter({faskesUuid, args = {}, options = {}}) {
    const filter = commonFilterPelayanan({
        faskesUuid,
        args,
        options: {
            ...options,
            deletedAt: { [Op.is]: null },
            statusRj: { [Op.not]: 0 },
            jadwalPeriksa: {
                [Op.between]: [args.start_date, args.end_date],
            },
        },
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
    if (args.status_antrian) {
        const statusAntrianArray = args.status_antrian.split(',').map(item => item.trim());
        let statusAntrian = [];
        
        statusAntrianArray.forEach(status => {
            if (status === "antri") {
                statusAntrian.push(1, 2, 3);
            } else if (status === "proses") {
                statusAntrian.push(4);
            } else if (status === "selesai") {
                statusAntrian.push(5);
            }
        });

        if (statusAntrian.length > 0) {
            filter.statusRj = { [Op.in]: statusAntrian };
        }
    }

    if (args.dpjp) filter.practitionerUuid = args.dpjp;
    
    return filter;
}