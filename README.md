# Hierarchical Todo Application

A full-stack todo application that supports hierarchical tasks with drag-and-drop functionality. Built with React (Frontend) and Flask (Backend).

## Features

-   User authentication (login/signup)
-   Create, read, update, and delete tasks
-   Support for subtasks up to 3 levels deep
-   Drag and drop tasks between status columns
-   Real-time status updates
-   Responsive design

## Project Structure

```
hierarchical-todo/
├── backend/
│   ├── app/
│   ├── requirements.txt
│   └── run.py
└── frontend/
    ├── src/
    ├── package.json
└── README.md
```

## Backend Setup

1. Navigate to the backend directory:

```
cd backend
```

2. Create and activate a virtual environment:

```
python3 -m venv venv
```

```
source venv/bin/activate # On Windows use venv\Scripts\activate
```

3. Install dependencies:

```
pip install -r requirements.txt
```

4. Run the development server:

```
python run.py
```

The backend server will start at `http://127.0.0.1:5000`

## Frontend Setup

1. Navigate to the frontend directory:

```
cd frontend
```

2. Install dependencies:

```
npm install
```

3. Start the development server:

```
npm start
```

The frontend application will start at `http://localhost:3000`

## API Endpoints

-   `POST /signup` - Register a new user
-   `POST /login` - Login user
-   `GET /tasks` - Get all tasks
-   `POST /tasks` - Create a new task
-   `PUT /tasks/<id>` - Update a task
-   `DELETE /tasks/<id>` - Delete a task

## Troubleshooting

1. Backend server not starting:

-   Check if port 5000 is already in use
-   Ensure all dependencies are installed
-   Verify the virtual environment is activated

2. Frontend connection issues:

-   Verify the backend server is running
-   Check if the API URL is correctly set in the environment variables
-   Clear browser cache and reload

3. Database issues:

-   Delete the existing database file and run migrations again
-   Check database connection string in environment variables
