let userId = null;
let userPassword = null;

const MONTHS = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
const currentDate = new Date();
let focusYear = currentDate.getFullYear();
let focusMonth = currentDate.getMonth();

const calendarMain = document.getElementById('calendar-main');
const focusMonthDisplay = document.getElementById('focus-month-display');
const taskView = document.getElementById('tasks-view');

const scrollLeftButton = document.getElementById('scroll-left');
const scrollRightButton = document.getElementById('scroll-right');
const locateCurrentMonthButton = document.getElementById('locate-current-month');

scrollLeftButton.addEventListener('click', scrollLeft, true);
scrollRightButton.addEventListener('click', scrollRight, true);
locateCurrentMonthButton.addEventListener('click', locateCurrentMonth, true);



function locateCurrentMonth() {
    fillCalendar(currentDate.getFullYear(), currentDate.getMonth());
}

function createDay(year, month, day, isOffset=false) {
    let cell = document.createElement('div');
    cell.id = `${year}${month}${day}`;
    cell.classList.add('day');

    if (isOffset)
        cell.classList.add('offset');

    cell.innerText = day;
    calendarMain.appendChild(cell);
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
    calendarMain.replaceChildren();
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
    if (focusMonth < 1) {
        focusYear--;
        focusMonth = 11;
    }
    else
        focusMonth--;

    fillCalendar(focusYear, focusMonth);
}

function scrollRight() {
    if (focusMonth > 10) {
        focusMonth = 0;
        focusYear++;
    }
    else
        focusMonth++;


    fillCalendar(focusYear, focusMonth);
}

fillCalendar(focusYear, focusMonth);

window.addEventListener('keypress', (event) => {
    if (event.key == 'h')
        scrollLeft();
    else if (event.key == 'l')
        scrollRight();
});

function main() {
    if (userId == null) {
        window.location.href = "./auth.html";
    }
}

main();