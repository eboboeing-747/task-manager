require('dotenv').config();

const express = require('express');
const jwt = require('jsonwebtoken');

const app = express();
app.use(express.json());
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "http://127.0.0.1:5500");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.header("Access-Control-Allow-Methods", "*");
    next();
});

class Container {
    constructor () {
        this.amount = 0;
        this.contents = new Map();
    }

    add(element) {
        element.id = this.amount;
        this.contents.set(this.amount, element);
        this.amount++;
        return element.id;
    }
}

class User {
    constructor (user) {
        this.id = user.id;
        this.name = user.name;
        this.password = user.password;
    }
}

class Task {
    constructor (task) {
        this.id = task.id;
        this.userId = task.userId;
        this.title = task.title;
        this.contents = task.contents;
        this.deadline = task.deadline;
        this.tagIds = [];
        this.statusId = task.statusId;
    }
}

class Status {
    constructor (status) {
        this.userId = status.userId;
        this.name = status.name;
        this.color = status.color;
    }
}

class Tag {
    constructor (tag) {
        this.id = tag.id;
        this.name = tag.name;
    }
}

const users = new Container();
const tasks = new Container();
const statuses = new Container();
const tags = new Container();

// resolves username to User
function resolveUsername(username) {
    let user = null;

    users.contents.forEach(function(value, key) {
        if (value.name == username) {
            user = value;
            return;
        }
    })

    return user;
}

app.options('', (req, res) => {
    return res.status(200).end();
})

app.post('/register', (req, res) => {
    console.log(req.body);

    if (resolveUsername(req.body.name) != null) {
        return res.status(400).send({'error': 'this username is already taken'});
    }

    let user = new User(req.body);
    users.add(user);
    return res.status(201).send({
        'id': user.id,
        'name': user.name,
        'password': null
    });
})

app.post('/login', (req, res) => {
    let user = resolveUsername(req.body.name);

    if (user == null) {
        return res.status(401).send({'error': 'no user with such username'});
    }

    if (req.body.password != user.password) {
        return res.status(401).send({'error': 'incorrect password'});
    }

    return res.status(200).send({
        'id': user.id,
        'name': user.name,
        'password': null
    });
})

app.post('/tasks', (req, res) => {
    let userId = req.body.userId;
    let taskList = [];

    tasks.contents.forEach(function(value, key) {
        if (value.userId == userId) {
            taskList.push(value);
        }
    })

    return res.status(200).send(taskList);
})

app.post('/tasks/create', (req, res) => {
    if (!users.contents.has(req.body.userId)) {
        return res.status(404).send({'error': 'no user with such id'});
    }

    let task = new Task(req.body);
    let newId = tasks.add(task);
    console.log(task);

    return res.status(201).send({
        'id': newId
    });
})

app.put('/tasks/update', (req, res) => {
    let id = req.body.id;
    if (!tasks.contents.has(id)) {
        return res.status(404).send({'error': 'no task with such id'});
    }

    tasks.contents.set(id, new Task(req.body));
    return res.status(200).end();
})

app.delete('/tasks/delete', (req, res) => {
    let id = req.body.id;

    if (!tasks.contents.has(id)) {
        return res.status(404).send({'error': 'no task with such id'});
    }

    tasks.contents.delete(id);
    return res.status(200).end();
})

app.post('/statuses/create', (req, res) => {
    if (!users.contents.has(req.body.userId)) {
        return res.status(404).send({'error': 'no user with such id'});
    }

    let status = new Status(req.body);
    let newId = statuses.add(status);

    return res.status(201).send({
        'id': newId
    });
})

app.post('/statuses', (req, res) => {
    let userId = req.body.userId;
    let statusList = [];

    statuses.contents.forEach(function(value, key) {
        if (value.userId == userId) {
            statusList.push(value);
        }
    })

    return res.status(200).send(statusList);
})

app.post('tags/create', (req, res) => {
    if (!users.contents.has(req.body.userId)) {
        return res.status(404).send({'error': 'no user with such id'});
    }

    let tag = new Tag(req.body);
    tags.add(tag);

    return res.status(201).end();
})

app.post('tags', (req, res) => {
    let userId = req.body.userId;
    let tagList = [];

    tags.contents.forEach(function(value, key) {
        if (value.userId == userId) {
            tagList.push(value);
        }
    })

    return res.status(200).send(tagList);
})

app.listen(process.env.PORT);
