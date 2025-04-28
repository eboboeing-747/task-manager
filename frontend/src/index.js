const userName = localStorage.getItem('userName');
const userPassword = localStorage.getItem('userPassword');
const userId = Number(localStorage.getItem('userId'));

const tasksView = document.getElementById('tasks-view');

let generalTaskList = [];
let statusList = [];

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const currentDate = new Date();
let focusYear = currentDate.getFullYear();
let focusMonth = currentDate.getMonth();

class Day {
    static currentDayId = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate()).getTime();
    static selectedDay = null;

    constructor(year, month, day, isOffset=false) {
        this.date = new Date(year, month, day);
        this.id = this.date.getTime();

        this.cell = document.createElement('div');
        this.cell.classList.add('day');
        this.cell.textContent = this.date.getDate();

        if (isOffset)
            this.cell.classList.add('offset');

        if (this.id == Day.currentDayId)
            this.cell.classList.add('current');

        if (Day.selectedDay != null) {
            if (this.id == Day.selectedDay.id) {
                this.select();
            }
        }

        this.cell.addEventListener('click', () => { this.toggleSelection(); }, true);
        calendarMain.appendChild(this.cell);
    }

    toggleSelection() {
        if (Day.selectedDay === null) { // nothing is selected
            this.select();
            return;
        }

        if (Day.selectedDay.id === this.id) { // this is selected
            Day.selectedDay = null;

            taskView.replaceChildren();
            for (let i = 0; i < generalTaskList.length; i++) {
                new Task(generalTaskList[i]);
            }

            this.deselect();
            return;
        }

        Day.selectedDay.deselect();
        this.select();
    }

    select() {
        Day.selectedDay = this;
        this.cell.classList.add('selected');

        let tasksOfDay = generalTaskList.filter((task) => {
            let nextDayMs = this.date.getTime() + 86400000;
            return (task.deadline > this.date.getTime()) && (task.deadline < nextDayMs);
        });

        tasksView.replaceChildren();

        for (let i = 0; i < tasksOfDay.length; i++) {
            new Task(tasksOfDay[i]);
        }
    }

    deselect() {
        this.cell.classList.remove('selected');
    }
}

class Task {
    /*
    * taskObject:
    * id:         int
    * userId:     int
    * title:      string
    * contents:   string
    * dateTime:   Date
    * tagIds:     array
    * statusId:   int
    */
    constructor(taskObject) {
        this.taskClone = this.cloneTask();

        this.id = taskObject.id;

        this.title = this.taskClone.querySelector('#template-title');
        this.title.id = `title-${this.id}`;
        this.title.value = taskObject.title;

        this.contents = this.taskClone.querySelector('#template-contents');
        this.contents.id = `contents-${this.id}`;
        this.contents.textContent = taskObject.contents;

        this.deleteTaskButton = this.taskClone.querySelector('#template-delete');
        this.deleteTaskButton.id = `delete-${this.id}`;
        this.deleteTaskButton.addEventListener('click', () => { this.delete(); }, true);

        this.saveTaskButton = this.taskClone.querySelector('#template-save');
        this.saveTaskButton.id = `delete-${this.id}`;
        this.saveTaskButton.addEventListener('click', () => { this.save(); }, true);

        let status = resolveStatus(taskObject.statusId);
        this.statusSelector = this.taskClone.querySelector('#template-status');
        this.statusSelector.id = `status-${this.id}`;
        this.addStatusOptions();
        this.statusSelector.value = status.name;
        this.taskClone.style.borderColor = status.color;

        this.dateSelector = this.taskClone.querySelector('#template-datetime');
        this.dateSelector.id = `datetime-${this.id}`;
        this.dateSelector.valueAsNumber = taskObject.deadline ? taskObject.deadline : new Date();

        this.taskClone.style.display = 'flex';
        tasksView.appendChild(this.taskClone);
    }

    cloneTask() {
        let taskTemplateParent = document.getElementById('parent');
        let taskTemplate = taskTemplateParent.querySelector('.task-wrapper');
        let taskClone = taskTemplate.cloneNode(true);
        return taskClone;
    }

    addStatusOptions() {
        for (let i = 0; i < statusList.length; i++) {
            let taskStatus = document.createElement('option');
            taskStatus.textContent = statusList[i].name;
            taskStatus.id = statusList[i].id;
            this.statusSelector.appendChild(taskStatus);
        }
    }

    async delete() {
        let requestParams = {
            method: 'DELETE',
            mode: 'cors',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                'id': this.id
            })
        }

        let res = await fetch('http://localhost:3000/tasks/delete', requestParams);
        tasksView.removeChild(this.taskClone);
    }

    async save() {
        let requestParams = {
            method: 'PUT',
            mode: 'cors',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(this.object())
        }

        let res = await fetch('http://localhost:3000/tasks/update', requestParams);
    }

    object() {
        let status = this.statusSelector.options[this.statusSelector.selectedIndex];
        let deadline =  this.dateSelector.valueAsNumber;

        return {
            'id': this.id,
            'userId': userId,
            'title': this.title.value,
            'contents': this.contents.value,
            'deadline': deadline,
            'tagIds': [],
            'statusId': Number(status.id)
        }
    }
}

const calendarMain = document.getElementById('calendar-main');
const focusMonthDisplay = document.getElementById('focus-month-display');
const taskView = document.getElementById('tasks-view');

const createTaskFormBackground = document.getElementById('create-task-form-background');
const createTaskForm = document.getElementById('create-task-form');
const createTaskFormWrapper = document.getElementById('create-task-form-wrapper');
const createTaskFormStatusSelector = document.getElementById('create-task-form-status');

const createStatusForm = document.getElementById('create-status-form');
const createStatusFormWrapper = document.getElementById('create-status-form-wrapper');
const createStatusFormBackground = document.getElementById('create-status-form-background');

const scrollLeftButton = document.getElementById('scroll-left');
const scrollRightButton = document.getElementById('scroll-right');
const locateCurrentMonthButton = document.getElementById('locate-current-month');
const createStatusButton = document.getElementById('create-status');
const createTaskButton = document.getElementById('create-task');
const cancelFormButton = document.getElementById('cancel-form');

scrollLeftButton.addEventListener('click', scrollLeft, true);
scrollRightButton.addEventListener('click', scrollRight, true);
locateCurrentMonthButton.addEventListener('click', locateCurrentMonth, true);
createStatusButton.addEventListener('click', displayCreateStatusForm, true);
createTaskButton.addEventListener('click', displayCreateTaskForm, true);
createStatusFormBackground.addEventListener('click', (event) => { hideForm(event, createStatusFormWrapper, createStatusFormBackground); }, true);
createTaskFormBackground.addEventListener('click', (event) => { hideForm(event, createTaskFormWrapper, createTaskFormBackground); }, true);
// cancelFormButton.addEventListener('click', (event) => { hideForm(event) }, true);

createStatusForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const errorDisplay = document.getElementById('create-task-status-error-display');

    let newStatusName = document.getElementById('create-status-form-name');
    let newStatusColorPicker = document.getElementById('create-status-form-color-picker');

    let requestParams = {
        method: 'POST',
        mode: 'cors',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            'userId': userId,
            'name': newStatusName.value,
            'color': newStatusColorPicker.value
        })
    }

    console.log(requestParams);

    const res = await fetch('http://localhost:3000/statuses/create', requestParams);
    
    if (!res.ok) {
        const body = await res.json();
        errorDisplay.textContent = body.error;
    }
    
    hideForm(null, createStatusFormWrapper, createStatusFormBackground);
    return;
});

createTaskForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const errorDisplay = document.getElementById('create-task-form-error-display');

    let newTaskTitle = document.getElementById('create-task-form-title').value;
    let newTaskContents = document.getElementById('create-task-form-contents').value;
    let newTaskDeadline = document.getElementById('create-task-form-date').valueAsNumber;
    let newTaskStatusSelector = document.getElementById('create-task-form-status');
    let newTaskStatus = newTaskStatusSelector.options[newTaskStatusSelector.selectedIndex];

    let requestParams = {
        method: 'POST',
        mode: 'cors',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            'userId': userId,
            'title': newTaskTitle,
            'contents': newTaskContents,
            'deadline': newTaskDeadline,
            'tagIds': [],
            'statusId': newTaskStatus.id
        })
    }

    const res = await fetch('http://localhost:3000/tasks/create', requestParams);
    
    if (!res.ok) {
        const body = await res.json();
        errorDisplay.textContent = body.error;
    }
    
    hideForm(null, createTaskFormWrapper, createTaskFormBackground);
    return;
})



/* resolves statusId to status object */
function resolveStatus(statusId) {
    return statusList.find((elem) => elem.id == statusId);
}

function hideForm(event, formWrapper, formBackground) {
    if (event === null) {
        formBackground.style.display = 'none';
        return;
    }

    if (!formWrapper.contains(event.target)) {
        formBackground.style.display = 'none';
    }
}

function displayCreateStatusForm() {
    createStatusFormBackground.style.display = 'flex';
}

function displayCreateTaskForm() {
    let newTaskDeadline = document.getElementById('create-task-form-date');
    let now = new Date();
    let nowTruncated = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours(), now.getMinutes());
    newTaskDeadline.valueAsNumber = nowTruncated;
    createTaskFormBackground.style.display = 'flex';
}

function locateCurrentMonth() {
    fillCalendar(currentDate.getFullYear(), currentDate.getMonth());
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
        new Day(prevMonthYear, month, i + 1, true);
    }

    for (let i = 0; i < daysAmount; i++) {
        upperBorder++;
        new Day(year, month, i + 1);
    }

    for (let i = 0; i + upperBorder < 42; i++) {
        new Day(nextMonthYear, month, i + 1, true);
    }

    focusMonthDisplay.textContent = `${MONTHS[month]}, ${year}`;
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

async function main() {
    const pingResponse = await fetch('http://localhost:3000');
    let isOnline = pingResponse.ok;

    if (!isOnline) {
        // read indexeddb
    } else {
        // fetch with server
    }

    if (userName === null || userPassword === null) {
        window.location.href = './auth.html';
    }

    let requestParams = {
        method: 'POST',
        mode: 'cors',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            'name': userName,
            'password': userPassword
        })
    }

    const authRes = await fetch('http://localhost:3000/login', requestParams);

    if (!authRes.ok) {
        window.location.href = './auth.html';
    }

    const authBody = await authRes.json();
    let userId = authBody.id;
    localStorage.setItem('userId', userId);

    requestParams.body = JSON.stringify({
        'userId': userId
    })

    const taskRes = await fetch('http://localhost:3000/tasks', requestParams);
    generalTaskList = await taskRes.json();

    const statusRes = await fetch('http://localhost:3000/statuses', requestParams);
    statusList = await statusRes.json();

    for (let i = 0; i < generalTaskList.length; i++) {
        new Task(generalTaskList[i]);
    }

    for (let i = 0; i < statusList.length; i++) {
        let taskStatus = document.createElement('option');
        taskStatus.textContent = statusList[i].name;
        taskStatus.id = statusList[i].id;
        createTaskFormStatusSelector.appendChild(taskStatus);
    }
}

main();
