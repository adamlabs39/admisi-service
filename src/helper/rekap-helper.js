import { differenceInDays, format, addDays } from "date-fns";

//* Parse tanggal dari format Unix
function parseUnixDate(unix) {
    return unix.toString().length === 10 ? new Date(unix * 1000) : new Date(unix);
}

//* Generate rentang tanggal
function generateDateRange(startUnix, endUnix) {
    const start = parseUnixDate(startUnix);
    const end = parseUnixDate(endUnix);
    const days = differenceInDays(end, start) + 1;
    const result = Array.from({ length: days }, (_, i) => format(addDays(start, i), "yyyy-MM-dd"));
    return result;
}

function buildRekap(rows, groupKey, allDates) {

    //* Grouping data
    const grouped = {};
    rows.forEach((row) => {
        const key = row[groupKey];
        if (!grouped[key]) grouped[key] = {};
        grouped[key][row.tanggal] = parseInt(row.total_harian);
    });

    //* Array per kategori data
    const dataByGroup = {};
    Object.keys(grouped).forEach((key) => {
        dataByGroup[key] = allDates.map((tgl) => ({
        tanggal: tgl,
        total: grouped[key][tgl] || 0,
        }));
    });

    //* Total harian semua kategori
    const totalHarian = allDates.map((tgl) => {
        const total = Object.values(grouped).reduce((sum, kategori) => sum + (kategori[tgl] || 0), 0);
        return { tanggal: tgl, total };
    });

    //* Total per kategori
    const totalPerGroup = Object.entries(grouped).map(([key, data]) => ({
        [groupKey]: key,
        total: Object.values(data).reduce((a, b) => a + b, 0),
    }));

    return { dataByGroup, totalHarian, totalPerGroup };
}

export {
    generateDateRange,
    buildRekap
};
