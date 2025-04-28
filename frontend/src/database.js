const db_name = "task-manager";
const db_version = 1;
const STATUS_TABLE_NAME = "statuses";
const TASK_TABLE_NAME = "tasks";

function fetchDb(statuslist, taskList) {
    const db = window.indexedDB.open(db_name, db_version);

    db.onupgradeneeded = (event) => {
        const innerdb = event.target.result;

        const statuses = innerdb.createObjectStore(STATUS_TABLE_NAME, {
            keyPath: "id",
            autoIncrement: true
        })

        statuses.createIndex("userId", "userId", { unique: false });
        statuses.createIndex("name", "name", { unique: false });
        statuses.createIndex("color", "color", { unique: false });

        const tasks = innerdb.createObjectStore(TASK_TABLE_NAME, {
            keyPath: "id"
        })

        statuses.createIndex("userId", "userId", { unique: false });
        statuses.createIndex("title", "title", { unique: false });
        statuses.createIndex("contents", "contents", { unique: false });
        statuses.createIndex("deadline", "deadline", { unique: false });
        statuses.createIndex("tagIds", "tagIds", { unique: false });
        statuses.createIndex("statusId", "statusId", { unique: false });
    }

    db.onsuccess = (event) => {
        const innerdb = event.target.result;

        // fetchRecords
    }
}

function fetchRecord(record, databaseName) {

}