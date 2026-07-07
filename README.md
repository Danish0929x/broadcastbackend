# BGG Tempes Backend Server

Node.js + Express + MongoDB

## Setup

```bash
npm install
```

## Create .env file

```
MONGO_URI=your_mongodb_connection_string
PORT=3001
```

## Run

```bash
npm start
```

## API Endpoints

- POST /api/submit/access - Submit access request
- POST /api/submit/contact - Submit contact form
- GET /api/submissions - Get all submissions
- POST /api/admin/login - Admin login with password
- DELETE /api/submissions/:id - Delete submission

