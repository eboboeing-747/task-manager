const MONTHS = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'feb'];
const calendar = document.getElementById('calendar-main');
const currentDate = new Date();
const focusMonthDisplay = document.getElementById('focus-month-display');
let focusYear = currentDate.getFullYear();
let focusMonth = currentDate.getMonth();
const scrollLeftButton = document.getElementById('scroll-left');
const scrollRightButton = document.getElementById('scroll-right');
scrollLeftButton.addEventListener('click', scrollLeft, true);
scrollRightButton.addEventListener('click', scrollRight, true);

/*
class Day {
    constructor(monthDay) {
        this.day = document.createElement('div');
        this.day.classList.add('day');
        this.day.innerText = monthDay;

        calendar.appendChild(day);
    }
}
*/

function createDay(year, month, day, isOffset=false) {
    let cell = document.createElement('div');
    cell.id = `${year}${month}${day}`;
    cell.classList.add('day');

    if (isOffset)
        cell.classList.add('offset');

    cell.innerText = day;
    calendar.appendChild(cell);
}

function getDaysAmount(year, month) {
    let date = new Date(year, month + 1, 0);
    return date.getDate();
}

function getOffset(date) {
    let firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
    let offset = firstDay.getDay();

    return offset === 0 ? 6 : offset - 1;
}

function fillCalendar(year, month) {
    calendar.replaceChildren();
    let monthToFill = new Date(year, month, 1);
    daysAmount = new Date(monthToFill.getFullYear(), monthToFill.getMonth() + 1, 0).getDate();
    let upperBorder = 0;

    let daysInPrevMonth = getDaysAmount(year, month - 1);
    
    let prevMonthYear = month > 0 ? year : year - 1;
    let nextMonthYear = month < 11 ? year : year + 1;

    for (let i = daysInPrevMonth - getOffset(monthToFill); i < daysInPrevMonth; i++) {
        upperBorder++;
        createDay(prevMonthYear, month, i + 1, true);
    }

    for (let i = 0; i < daysAmount; i++) {
        upperBorder++;
        createDay(year, month, i + 1);
    }

    for (let i = 0; i + upperBorder < 42; i++) {
        createDay(nextMonthYear, month, i + 1, true);
    }

    if (year == currentDate.getFullYear() && month == currentDate.getMonth()) {
        let currentDayId = `${currentDate.getFullYear()}${currentDate.getMonth()}${currentDate.getDate()}`;
        let currentDay = document.getElementById(currentDayId);
        currentDay.classList.add('current');
    }

    focusMonthDisplay.innerText = `${MONTHS[focusMonth]}, ${focusYear}`;
}

function scrollLeft() {
    if (focusMonth < 1)
        focusYear--;
    else
        focusMonth--;


    fillCalendar(focusYear, focusMonth);
}

function scrollRight() {
    if (focusMonth > 11)
        focusYear++;
    else
        focusMonth++;


    fillCalendar(focusYear, focusMonth);
}

fillCalendar(focusYear, focusMonth);

window.addEventListener("keypress", (event) => {
    if (event.key == 'h')
        scrollRight();
    else if (event.key == 'l')
        scrollLeft();
});
