import moment from 'moment-timezone';

export function formatDateTime(date: string, time: string) {
    const inputAsDateObject = new Date(date + 'T' + time + 'Z');
        
    const dateFormatOptions: Intl.DateTimeFormatOptions = {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    };

    const timeFormatOptions: Intl.DateTimeFormatOptions = {
        hour: 'numeric',
        minute: '2-digit',
    };
    const formattedDate = inputAsDateObject.toLocaleString('en-US', dateFormatOptions);
    const formattedTime = inputAsDateObject.toLocaleString('en-US', timeFormatOptions);

    return {date: formattedDate, time: formattedTime}
}

export function formatTime(time: string) {
    const timeParts = time.split(":")
    return {hour: parseInt(timeParts[0]), minute: timeParts[1]} //ignore seconds (timeParts[2])
}

export function dateToLocalTimeZoneISOString (date: Date) {
    const localeStringParts = date.toLocaleString('en-US', { timeZoneName: 'short' }).split(" ");
    const timeZone = localeStringParts[3];
    return moment(date).tz(timeZone).format();
}
    