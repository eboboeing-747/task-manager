## Deployment
### By hand
copy repository

```bash
git clone https://github.com/eboboeing-747/task-manager.git
cd task-manager
```

start frontend
```bash
cd <your-path>/task-manager/frontend
npm install
npm run build
http-server .
```

start backend
```bash
cd <your-path>/task-manager/backend
npm install
npm run dev
```

### Using Docker

```bash
docker-compose up --build
```
