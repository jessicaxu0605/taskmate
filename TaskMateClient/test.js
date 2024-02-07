const date = new Date("2024-02-04T09:00:00Z");

console.log(date);
console.log(date.toLocaleString());
const year = date.getFullYear().toString();
const month = (date.getMonth() + 1).toString().padStart(2, "0");
const day = date.getDate().toString().padStart(2, "0");
console.log(year + "-" + month + "-" + day);
