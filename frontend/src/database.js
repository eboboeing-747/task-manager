import { isOnline } from './index.js';

const db_name = "task-manager";
const db_version = 2;
const STATUS_TABLE_NAME = "statuses";
const TASK_TABLE_NAME = "tasks";

function openDb() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(db_name, db_version);

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

export function checkDb() {
    const db = window.indexedDB.open(db_name, db_version);

    db.onupgradeneeded = (event) => {
        const innerdb = event.target.result;

        const statuses = innerdb.createObjectStore(STATUS_TABLE_NAME, {
            keyPath: "dbid",
            autoIncrement: true
        })

        statuses.createIndex("userId", "userId", { unique: false });
        statuses.createIndex("name", "name", { unique: false });
        statuses.createIndex("color", "color", { unique: false });
        statuses.createIndex("offlineAction", "offlineAction", { unique: false });

        const tasks = innerdb.createObjectStore(TASK_TABLE_NAME, {
            keyPath: "dbid",
            autoIncrement: true
        })

        tasks.createIndex("id", "id", { unique: false });
        tasks.createIndex("userId", "userId", { unique: false });
        tasks.createIndex("title", "title", { unique: false });
        tasks.createIndex("contents", "contents", { unique: false });
        tasks.createIndex("deadline", "deadline", { unique: false });
        tasks.createIndex("tagIds", "tagIds", { unique: false });
        tasks.createIndex("statusId", "statusId", { unique: false });
        tasks.createIndex("offlineAction", "offlineAction", { unique: false });
    }
}

export function addStatusDb(status) {
    // status.offlineAction = "create";
    
    console.log(status);

    const db = window.indexedDB.open(db_name, db_version);

    db.onsuccess = (event) => {
        const innerdb = event.target.result;

        const transaction = innerdb.transaction(STATUS_TABLE_NAME, "readwrite");
        const store = transaction.objectStore(STATUS_TABLE_NAME);
        const request = store.add(status);

        request.onsuccess = () => { console.log(`added status: ${status}`); };
        request.onerror = () => { console.log(`failed to add status`); };
    }
}

export function getStatusListDb() {
    return new Promise( async (resolve, reject) => {
        let db = await openDb();
        const transaction = db.transaction(STATUS_TABLE_NAME, "readwrite");
        const store = transaction.objectStore(STATUS_TABLE_NAME);
        const request = store.getAll();

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    })
}