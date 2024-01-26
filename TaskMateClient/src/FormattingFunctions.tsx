function formatDateTime(date: string, time: string) {
    const inputDate = new Date(date + 'T' + time + 'Z');
        
    const dateOptions: Intl.DateTimeFormatOptions = {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    };

    // Options for formatting the time
    const timeOptions: Intl.DateTimeFormatOptions = {
        hour: 'numeric',
        minute: '2-digit',
    };
    const formattedDate = inputDate.toLocaleString('en-US', dateOptions);
    const formattedTime = inputDate.toLocaleString('en-US', timeOptions);

    return {date: formattedDate, time: formattedTime}
}

function formatTime(time: string) {
    const time_parts = time.split(":")
    return {hour: parseInt(time_parts[0]), minute: time_parts[1]}
}

export {formatDateTime, formatTime};