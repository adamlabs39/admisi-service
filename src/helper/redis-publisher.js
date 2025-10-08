import redis from "../configurations/redis-instance.js";

export async function publishAppointmentCheckin({ faskesUuid, kodeBooking, noRm }) {
    try {
        await redis.xadd("admisi:mobile:appointment:checkin","*","data",JSON.stringify({
            faskes_uuid: faskesUuid,
            kode_booking: kodeBooking,
            no_rm: noRm,
            status: 2,
        }));
    } catch (err) {
        console.error("[Redis] Failed to publish appointment checkin:", err.message);
    }
}

export async function publishAppointmentCancel({ faskesUuid, kodeBooking, noRm }) {
    try {
        await redis.xadd("admisi:mobile:appointment:cancel","*","data",JSON.stringify({
            faskes_uuid: faskesUuid,
            kode_booking: kodeBooking,
            no_rm: noRm,
            status: 0,
        }));
    } catch (err) {
        console.error("[Redis] Failed to publish appointment cancel:", err.message);
    }
}
