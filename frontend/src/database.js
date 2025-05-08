import { isOnline } from './index.js';

const db_name = "task-manager";
const db_version = 1;
export const maxIds = {};
export const STATUS_TABLE_NAME = "statuses";
export const TASK_TABLE_NAME = "tasks";

export let maxStatusId = null;
export let maxTaskId = null;

export function fetchDbServer() {
    fetchDbServer(TASK_TABLE_NAME);
    fetchUnitDbServer(STATUS_TABLE_NAME);
}

async function fetchUnitDbServer(tableName) {
    let requestParams = {
        method: 'GET',
        mode: 'cors',
        headers: {
            'Content-Type': 'application/json'
        }
    }

    const res = await fetch(`http://localhost:3000/${tableName}/getList`, requestParams);
    let unitList = res.json();
}

function openDb() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(db_name, db_version);

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

/*
async function getMaxId(tableName) {
    const db = await openDb();

    return new Promise((resolve, reject) => {
        const transaction = db.transaction(tableName, "readonly");
        const store = transaction.objectStore(tableName);
        const request = store.openCursor();

        let maxId = null;

        request.onsuccess = (event) => {
            const cursor = event.target.result;

            if (!cursor) {
                resolve(maxId);
            }

            const record = cursor.value;
            if (record.id != null && (maxId == null || record.id > maxId)) {
                maxId = record.id;
            }
            cursor.continue();
        };

        request.onerror = () => reject(request.error);
    });
}
*/

export async function checkDb() {
    const db = window.indexedDB.open(db_name, db_version);

    db.onupgradeneeded = (event) => {
        const innerdb = event.target.result;

        const statuses = innerdb.createObjectStore(STATUS_TABLE_NAME, {
            keyPath: "dbid",
            autoIncrement: true
        })

        statuses.createIndex("id", "id", { unique: false });
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

/*
export function addStatusDb(status) {
    if (!isOnline) {
        status.offlineAction = "create";
    }

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
*/

export function addUnitDb(tableName, unit) {
    unit.offlineAction = isOnline ? 'null' : 'create';

    const db = window.indexedDB.open(db_name, db_version);

    db.onsuccess = (event) => {
        const innerdb = event.target.result;

        const transaction = innerdb.transaction(tableName, "readwrite");
        const store = transaction.objectStore(tableName);
        const request = store.add(unit);

        request.onsuccess = () => { console.log(`added unit to table ${tableName}:`, unit); };
        request.onerror = () => { console.log(`failed to add unit to table ${tableName}:`); };
    }
}

export function getNextId(tableName) {
    maxIds[tableName]++;
    return maxIds[tableName];
}

function readMaxIdDb(tableName, unitList) {
    console.log('[readMaxIdDb]', unitList);

    if (!unitList.length) {
        maxIds[tableName] = 0;
        return;
    }

    let maxId = unitList[unitList.length - 1].id;
    maxIds[tableName] = maxId;
}

export function getDataListDb(tableName) {
    return new Promise( async (resolve, reject) => {
        let db = await openDb();
        const transaction = db.transaction(tableName, "readwrite");
        const store = transaction.objectStore(tableName);
        const request = store.getAll();

        request.onsuccess = () => {
            readMaxIdDb(tableName, request.result);
            resolve(request.result)
        };

        request.onerror = () => reject(request.error);
    })
}

export function deleteUnitDb(tableName, id) {
    return new Promise( async (resolve, reject) => {
        const db = await openDb();
        const transaction = db.transaction(tableName, "readwrite");
        const store = transaction.objectStore(tableName);
        const request = store.openCursor();
    
        request.onsuccess = (event) => {
            const cursor = event.target.result;

            if (!cursor) {
                resolve(false);
                return;
            }

            if (cursor.value.id === id) {
                store.delete(cursor.value.dbid);
                resolve(true);
                return;
            }

            cursor.continue();
        }

        request.onerror = (event) => {
            reject();
        }
    })
}

export function updateUnitDb(tableName, unit) {
    return new Promise( async (resolve, reject) => {
        const db = await openDb();
        const transaction = db.transaction(tableName, "readwrite");
        const store = transaction.objectStore(tableName);
        const request = store.openCursor();
    
        request.onsuccess = (event) => {
            const cursor = event.target.result;

            if (!cursor) {
                resolve(false);
                return;
            }

            if (cursor.value.id === unit.id) {
                const updateUnit = cursor.value;
                unit.id = updateUnit.id;
                unit.dbid = updateUnit.dbid;
                unit.userId = updateUnit.userId;
                unit.offlineAction = 'update';

                const updateReq = cursor.update(unit);

                updateReq.onerror = () => {console.log('failed to update')}
                updateReq.onsuccess = () => {console.log('updated')}

                resolve(true);
                return;
            }

            cursor.continue();
        }

        request.onerror = (event) => {
            reject();
        }
    })
}