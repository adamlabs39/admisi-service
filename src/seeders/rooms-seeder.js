import KategoriRuanganModel from "../models/kategori-ruangan-model.js";
import RuanganModel from "../models/ruangan-model.js";
import RoomMonitoringModel from "../models/room-monitoring-model.js";

export default class RoomsSeeder{
    static async seed(transaction){
        const faskesUuid = "9d403ufjh43ufh3uf8430ihf";

        const kategori = [
            {
                "faskesUuid": faskesUuid,
                "uuid": "0191690f-1cb3-7884-afeb-6ad62f0e0a1a",
                "code": "VIP",
                "name": "VIP",
            },
            {
                "uuid": "0191690f-1cb3-73d5-89a4-92e2ac2c5fce",
                "faskesUuid": faskesUuid,
                "code": "VVIP",
                "name": "VVIP",
            }
        ]

        const ruangan = [
            {
                "uuid": "0191690f-1cb3-7a48-8bad-b21700bd19f4",
                "faskesUuid": faskesUuid,
                "code": "VIP-1",
                "name": "VIP 1",
                "noRoom": "101",
                "kategoriRuanganUuid": "0191690f-1cb3-7884-afeb-6ad62f0e0a1a",
                "kelasRuangan": "VVIP",
                "status": true,
            },
            {
                "uuid": "0191690f-1cb3-7a48-8bad-b21700bd19f5",
                "faskesUuid": faskesUuid,
                "code": "VIP-2",
                "name": "VIP 2",
                "noRoom": "102",
                "kategoriRuanganUuid": "0191690f-1cb3-7884-afeb-6ad62f0e0a1a",
                "kelasRuangan": "VIP",
                "status": true,
            },
        ]

        const monitoring = [
            {
                "uuid": "0191696e-5a95-7928-b2aa-4a1cf58aee69",
                "faskesUuid": faskesUuid,
                "roomUuid": "0191690f-1cb3-7a48-8bad-b21700bd19f4",
                "roomCategory": "VIP",
                "roomClass": "1",
                "room": "101",
                "bedName": "Kasur 1",
                "noBed": "1",
                "status": true,
            },
            {
                "uuid": "0191696e-5a95-7fbc-ae6f-c1730ef77b79",
                "faskesUuid": faskesUuid,
                "roomUuid": "0191690f-1cb3-7a48-8bad-b21700bd19f4",
                "roomCategory": "VIP",
                "roomClass": "1",
                "room": "101",
                "bedName": "Kasur 2",
                "noBed": "2",
                "status": true,
            },
            {
                "uuid": "0191696e-5a95-7965-8381-acf76b03879b",
                "faskesUuid": faskesUuid,
                "roomUuid": "0191690f-1cb3-7a48-8bad-b21700bd19f5",
                "roomCategory": "VIP",
                "roomClass": "1",
                "room": "102",
                "bedName": "Kasur 1",
                "noBed": "1",
                "status": true,
            },
            {
                "uuid": "0191696e-5a95-7965-8381-acf76b03876b",
                "faskesUuid": faskesUuid,
                "roomUuid": "0191690f-1cb3-7a48-8bad-b21700bd19f5",
                "roomCategory": "VIP",
                "roomClass": "1",
                "room": "102",
                "bedName": "Kasur 2",
                "noBed": "2",
                "status": true,
            }
        ]

        await KategoriRuanganModel.bulkCreate(kategori, { transaction });
        await RuanganModel.bulkCreate(ruangan, { transaction});
        await RoomMonitoringModel.bulkCreate(monitoring, {transaction});
    }
}