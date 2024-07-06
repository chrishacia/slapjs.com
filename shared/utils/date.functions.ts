const PAD_START = 2;
const TIMEZONE_OFFSET_MS = 3600000;

export const getMySqlFormatedDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(PAD_START, '0'); // months are zero-based
  const day = String(date.getDate()).padStart(PAD_START, '0');
  const hours = String(date.getHours()).padStart(PAD_START, '0');
  const minutes = String(date.getMinutes()).padStart(PAD_START, '0');
  const seconds = String(date.getSeconds()).padStart(PAD_START, '0');

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};

export const getUtcDateTime = (): string => getMySqlFormatedDate(new Date());

export const convertLocalTimeToUtc = (
  localTimeString: string,
  timezoneOffset: number
): string => {
  // Create a date object from the local time string
  const localTime = new Date(localTimeString);

  // Convert timezone offset from hours to milliseconds
  // The offset format should be in hours, e.g., -5 for EST or +1 for CET
  const offsetMs = timezoneOffset * TIMEZONE_OFFSET_MS;

  // Convert local time to UTC by subtracting the timezone offset
  const utcTime = new Date(localTime.getTime() - offsetMs);

  return getMySqlFormatedDate(utcTime);
};

export const humanDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
    timeZone: 'UTC',
  };
  return date.toLocaleString(undefined, options);
};

export const humanDateShort = (dateStr: string): string => {
  const date = new Date(dateStr);
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  };
  return date.toLocaleString(undefined, options);
};

export const humanDateShorter = (dateStr: string): string => {
  const date = new Date(dateStr);
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    timeZone: 'UTC',
  };
  return date.toLocaleString(undefined, options);
};

export const humanDateShortest = (dateStr: string): string => {
  const date = new Date(dateStr);
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    timeZone: 'UTC',
  };
  return date.toLocaleString(undefined, options);
};

export const humanDateShortestNoTime = (dateStr: string): string => {
  const date = new Date(dateStr);
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    timeZone: 'UTC',
  };
  return date.toLocaleString(undefined, options);
};
