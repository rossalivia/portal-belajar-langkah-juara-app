/**
 * Utilitas pemformatan tanggal yang aman untuk Cloud Firestore Timestamp,
 * ISO String, maupun objek Date JavaScript biasa.
 */
export function formatDateTime(val, includeTime = true) {
  if (!val) return "-";
  
  let d;
  try {
    if (typeof val?.toDate === "function") {
      d = val.toDate();
    } else if (val?.seconds != null) {
      d = new Date(val.seconds * 1000);
    } else if (val instanceof Date) {
      d = val;
    } else {
      d = new Date(val);
    }

    if (isNaN(d.getTime())) return "-";

    const options = {
      day: "numeric",
      month: "short",
      year: "numeric",
    };

    if (includeTime) {
      options.hour = "2-digit";
      options.minute = "2-digit";
    }

    return d.toLocaleDateString("id-ID", options);
  } catch {
    return "-";
  }
}

export function formatDateOnly(val) {
  return formatDateTime(val, false);
}

export function isPastDate(val) {
  if (!val) return false;
  try {
    let d;
    if (typeof val?.toDate === "function") {
      d = val.toDate();
    } else if (val?.seconds != null) {
      d = new Date(val.seconds * 1000);
    } else {
      d = new Date(val);
    }
    return !isNaN(d.getTime()) && new Date() > d;
  } catch {
    return false;
  }
}
