# Zoom Clone

A full-stack video conferencing web application inspired by modern Zoom-style meeting platforms.

## Tech Stack

### Frontend
- Next.js
- React
- TypeScript
- Lucide React

### Backend
- Python
- FastAPI
- SQLAlchemy
- Pydantic

### Database
- SQLite

## Project Structure

frontend/
    Next.js application

backend/
    FastAPI application

docs/
    Project documentation

scripts/
    Development scripts

## Running the Project

### Backend

cd backend

python -m venv venv

Windows:

venv\Scripts\activate

Linux/macOS:

source venv/bin/activate

pip install -r requirements.txt

uvicorn app.main:app --reload

Backend:
http://localhost:8000

API documentation:
http://localhost:8000/docs

### Frontend

cd frontend

npm install

npm run dev

Frontend:
http://localhost:3000

## Features

- Dashboard
- Instant meetings
- Join meetings
- Schedule meetings
- Participant management
- Meeting history
- Camera and microphone controls
- Responsive design

## Development

The project is being developed from scratch and does not copy implementation code from existing repositories.
