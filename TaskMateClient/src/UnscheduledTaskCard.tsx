import { formatDateTime, formatTime } from './FormattingFunctions';

type TaskData = {
    id: number,
    name: string,
    dueTime: string,
    dueDate: string,
    duration: string,
}

type FormattedTaskData = {
    id: number,
    name: string,
    dueDateTime: string,
    duration: string,
    // eventType: string | null,
    // properties: JSON | null
}

export default function UnscheduledTaskCard({  id, name, dueTime, dueDate, duration }: TaskData) {
    const formattedDueDateTime = formatDateTime(dueDate, dueTime);
    const formattedDuration = formatTime(duration);
    
    return (
        <div>
            <h3>{name}</h3>
            <p>{`${formattedDueDateTime.date} | ${formattedDueDateTime.time}`}</p>
            <p>{`${formattedDuration.hour} | ${formattedDuration.minute}`}</p>
        </div>
    );
}