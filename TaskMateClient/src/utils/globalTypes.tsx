export type rawTaskFormat = {
  id: number;
  name: string;
  dateCreated: string | null; //ISODateString
  dueDate: string;
  dueTime: string;
  duration: string;
  startDate: string | null;
  startTime: string | null;
  eventTypeID: string | null; //to be implemented
  properties: string | null; //to be implemented
  calendarID: number | null;
};

export type workingTaskFormat = {
  id: number;
  name: string;
  dueDateTime: Date;
  duration: string;
  startDateTime: Date | null;
};
