import { isOnline, userId } from './index.js';

const db_name = 'task-manager';
const db_version = 1;
export const maxIds = {};
export const STATUS_TABLE_NAME = 'statuses';
export const TASK_TABLE_NAME = 'tasks';
const CREATE_ACTION = 'create';
const UPDATE_ACTION = 'update';
const NULL_ACTION = 'null';

export let maxStatusId = null;
export let maxTaskId = null;

function cloneUnit(unitToCopy) {
    const excludeProps = ['offlineAction', 'dbid'];
    let unitClone = {};
    let keys = Object.keys(unitToCopy);

    for (let i = 0; i < keys.length; i++) {
        let key = keys[i];

        if (excludeProps.includes(key)) {
            continue;
        }

        unitClone[key] = unitToCopy[key];
    }

    return unitClone;
}

/*
export async function fetchUnitTypeDbServer(tableName, unitList) {
    let requestParams = {
        method: 'POST',
        mode: 'cors',
        headers: {
            'Content-Type': 'application/json'
        },
        body: null
    }

    for (let i = 0; i < unitList.length; i++) {
        let unit = unitList[i];

        if (unit.offlineAction === NULL_ACTION) {
            continue;
        }

        let res;

        if (unit.offlineAction === CREATE_ACTION) {
            requestParams.body = JSON.stringify(cloneUnit(unit));
            res = await fetch(`http://localhost:3000/${tableName}/create`, requestParams);
        } else if (unit.offlineAction === UPDATE_ACTION) {
            requestParams.body = JSON.stringify(cloneUnit(unit));
            res = await fetch(`http://localhost:3000/${tableName}/update`, requestParams);
        }

        // UPDATE statusId in task

        let body = await res.json();
        let db = await openDb();
        const objectStore = db
            .transaction(tableName, "readwrite")
            .objectStore(tableName);

        unit.id = body.id;
        unit.offlineAction = NULL_ACTION;
        objectStore.put(unit);
    }
}
*/

export async function fetchStatusesDbServer(statusList) {
    let requestParams = {
        method: 'POST',
        mode: 'cors',
        headers: {
            'Content-Type': 'application/json'
        },
        body: null
    }

    let statusIdMutations = {};

    for (let i = 0; i < statusList.length; i++) {
        let status = statusList[i];

        if (status.offlineAction === NULL_ACTION) {
            continue;
        }

        let res;

        if (status.offlineAction === CREATE_ACTION) {
            requestParams.body = JSON.stringify(cloneUnit(status));
            res = await fetch(`http://localhost:3000/statuses/create`, requestParams);
        } else if (status.offlineAction === UPDATE_ACTION) {
            requestParams.body = JSON.stringify(cloneUnit(status));
            res = await fetch(`http://localhost:3000/statuses/update`, requestParams);
        }

        let body = await res.json();
        let db = await openDb();
        const statusesDb = db
            .transaction(STATUS_TABLE_NAME, "readwrite")
            .objectStore(STATUS_TABLE_NAME);

        statusIdMutations[status.id] = body.id;
        status.id = body.id;
        status.offlineAction = NULL_ACTION;
        statusesDb.put(status);
    }

    return statusIdMutations;
}

export async function fetchTasksDbServer(taskList, statusIdMutations) {
    let requestParams = {
        method: 'POST',
        mode: 'cors',
        headers: {
            'Content-Type': 'application/json'
        },
        body: null
    }

    for (let i = 0; i < taskList.length; i++) {
        let task = taskList[i];
        task.statusId = statusIdMutations[task.statusId];

        if (task.offlineAction === NULL_ACTION) {
            continue;
        }

        if (task.offlineAction === CREATE_ACTION) {
            requestParams.body = JSON.stringify(cloneUnit(task));
            let res = await fetch(`http://localhost:3000/tasks/create`, requestParams);
            let body = await res.json();
            task.id = body.id;
        } else if (task.offlineAction === UPDATE_ACTION) {
            requestParams.body = JSON.stringify(cloneUnit(task));
            await fetch(`http://localhost:3000/tasks/update`, requestParams);
        }

        let db = await openDb();
        const tasksDb = db
            .transaction(TASK_TABLE_NAME, "readwrite")
            .objectStore(TASK_TABLE_NAME);

        task.offlineAction = NULL_ACTION;
        tasksDb.put(task);
    }
}

function getTaskListFromStatusId(statusId) {
    return new Promise( async (resolve, reject) => {
        const db = await openDb();
        const transaction = db.transaction(TASK_TABLE_NAME, "readwrite");
        const store = transaction.objectStore(TASK_TABLE_NAME);
        const request = store.openCursor();
        const tasks = [];

        request.onsuccess = (event) => {
            const cursor = event.target.result;

            if (!cursor) {
                resolve(false);
                return;
            }

            if (cursor.value.statusId === statusId && cursor.value.offlineAction !== NULL_ACTION) {
                tasks.push(cursor.value);
            }

            cursor.continue();
        }

        request.onerror = (event) => {
            reject();
        }

        resolve(tasks);
    })
}

function openDb() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(db_name, db_version);

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

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

export function addUnitDb(tableName, unit) {
    unit.offlineAction = isOnline ?  NULL_ACTION : CREATE_ACTION;

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
                unit.offlineAction = updateUnit.offlineAction === NULL_ACTION ? UPDATE_ACTION : updateUnit.offlineAction;

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