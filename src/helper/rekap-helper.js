import dayJs from "dayjs";


function generateUnixRange(startUnix, endUnix) {
    const result = [];
    for (let ts = startUnix; ts <= endUnix; ts += 86400) { 
        result.push(ts);
    }
    return result;
}


function buildRekap(rows, groupKey, allDates, allGroups = []) {
  const grouped = {};
  rows.forEach((row) => {
    const key = row[groupKey];
    if (!grouped[key]) grouped[key] = {};

    const ts = dayJs(row.tanggal, "YYYY-MM-DD").startOf("day").unix();
    grouped[key][ts] = parseInt(row.total_harian);
  });

  const dataByGroup = {};
  const allKeys = [...new Set([...Object.keys(grouped), ...allGroups])];

  allKeys.forEach((key) => {
    dataByGroup[key] = allDates.map((ts) => ({
      tanggal: dayJs.unix(ts).format("YYYY-MM-DD"),
      total: grouped[key]?.[ts] || 0,
    }));
  });

  const totalHarian = allDates.map((ts) => {
    const total = allKeys.reduce((sum, k) => sum + (grouped[k]?.[ts] || 0), 0);
    return { tanggal: dayJs.unix(ts).format("YYYY-MM-DD"), total };
  });

  const totalPerGroup = allKeys.map((key) => ({
    [groupKey]: key,
    total: Object.values(grouped[key] || {}).reduce((a, b) => a + b, 0),
  }));

  return { dataByGroup, totalHarian, totalPerGroup };
}



export {
    generateUnixRange,
    buildRekap
};
