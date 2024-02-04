import moment from "moment-timezone";

export function dateTimeToDateAndTimeString(date: string, time: string) {
  const inputAsDateObject = new Date(date + "T" + time + "Z");

  const dateFormatOptions: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "short",
    day: "numeric",
  };

  const timeFormatOptions: Intl.DateTimeFormatOptions = {
    hour: "numeric",
    minute: "2-digit",
  };
  const formattedDate = inputAsDateObject.toLocaleString(
    "en-US",
    dateFormatOptions
  );
  const formattedTime = inputAsDateObject.toLocaleString(
    "en-US",
    timeFormatOptions
  );

  return formattedDate + ", " + formattedTime;
}

export function ISOStringToDateAndTimeString(ISOString: string) {
  const inputAsDateObject = new Date(ISOString);

  const dateFormatOptions: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "short",
    day: "numeric",
  };

  const timeFormatOptions: Intl.DateTimeFormatOptions = {
    hour: "numeric",
    minute: "2-digit",
  };
  const formattedDate = inputAsDateObject.toLocaleString(
    "en-US",
    dateFormatOptions
  );
  const formattedTime = inputAsDateObject.toLocaleString(
    "en-US",
    timeFormatOptions
  );

  return formattedDate + ", " + formattedTime;
}

export function YYYYMMDDtoDateString(date: string) {
  const IndexToMonth = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const dateParts = date.split("-");
  const year = dateParts[0];
  const month = IndexToMonth[parseInt(dateParts[1]) - 1];
  const day = dateParts[2];
  return month + " " + day + ", " + year;
}

export function HHMMSStoHourMinuteJSON(time: string) {
  const timeParts = time.split(":");
  return { hour: parseInt(timeParts[0]), minute: timeParts[1] }; //ignore seconds (timeParts[2])
}

export function dateToLocalTimeZoneISOString(date: Date) {
  const localeStringParts = date
    .toLocaleString("en-US", { timeZoneName: "short" })
    .split(" ");
  const timeZone = localeStringParts[3];
  return moment(date).tz(timeZone).format();
}

// export function getHourIntFromHHMMSSTime(time: string) {
//   const timeParts = time.split(":");
//   return parseInt(timeParts[0]);
// }
// export function getMinuteIntFromHHMMSSTime(time: string) {
//   const timeParts = time.split(":");
//   return parseInt(timeParts[1]);
// }

export function getTimeInNumOf15Mins(time: string) {
  const timeParts = time.split(":");
  return 4 * parseInt(timeParts[0]) + parseInt(timeParts[1]) / 15;
}
