const getMySqlFormatedDate = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0'); // months are zero-based
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};

const getUtcDateTime = () => getMySqlFormatedDate(new Date());

const convertLocalTimeToUtc = (localTimeString: string, timezoneOffset: number) => {
  // Create a date object from the local time string
  const localTime = new Date(localTimeString);

  // Convert timezone offset from hours to milliseconds
  // The offset format should be in hours, e.g., -5 for EST or +1 for CET
  const offsetMs = timezoneOffset * 60 * 60 * 1000;

  // Convert local time to UTC by subtracting the timezone offset
  const utcTime = new Date(localTime.getTime() - offsetMs);

  return getMySqlFormatedDate(utcTime);
};

export {
  getUtcDateTime,
  convertLocalTimeToUtc,
};
