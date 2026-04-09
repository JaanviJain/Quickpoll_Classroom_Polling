# QuickPoll

A real-time classroom polling system and event RSVP platform.

## Architecture

```
quick_poll/
  frontend/          Next.js 16 + TypeScript + Tailwind CSS
  backend/           Node.js + Express + Socket.io
  python-service/    Python Flask + OpenCV (QR code scanning)
  selenium-tests/    Selenium WebDriver + Mocha + Chai
  docker-compose.yml Full-stack container orchestration
```

## Quick Start

### With Docker (recommended)

```bash
docker-compose up --build
```

This starts all services:
- Frontend: http://localhost:3000
- Backend API: http://localhost:4000
- Python CV Service: http://localhost:5001
- PostgreSQL: localhost:5432

### Without Docker

#### Frontend

```bash
cd frontend
npm install
npm run dev
```

#### Backend

```bash
cd backend
cp .env.example .env
npm install
npm run dev
```

#### Python Service

```bash
cd python-service
pip install -r requirements.txt
python app.py
```

## Features

### Real-Time Polling
- Multiple choice and open text question types
- Live response streaming via WebSocket
- Anonymous response toggle
- Poll results with bar chart visualization
- CSV export of results

### RSVP and QR Code Check-In
- Event creation and management
- RSVP form with QR code generation
- Simulated email delivery
- QR code scanning via Python CV service
- Real-time check-in status updates

### DevOps
- Docker Compose for full-stack containerization
- Prometheus metrics endpoint at `/metrics`
- Selenium automated test suites for polls and voting flows

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/health` | Health check |
| POST | `/api/polls` | Create a poll |
| GET | `/api/polls/room/:code` | Get polls by room |
| GET | `/api/polls/:id/results` | Get poll results |
| PATCH | `/api/polls/:id/close` | Close a poll |
| POST | `/api/polls/respond` | Submit a response |
| GET | `/api/polls/:id/export` | Export results (CSV) |
| POST | `/api/events` | Create an event |
| GET | `/api/events` | List events |
| POST | `/api/rsvp` | Submit RSVP |
| POST | `/api/rsvp/checkin` | Check in via QR |
| GET | `/metrics` | Prometheus metrics |

## Tech Stack

- **Frontend**: Next.js 16, TypeScript, Tailwind CSS v4
- **Backend**: Node.js, Express, Socket.io
- **Database**: PostgreSQL 16
- **CV Service**: Python 3.12, Flask, OpenCV, pyzbar
- **DevOps**: Docker, Prometheus
- **Testing**: Selenium WebDriver, Mocha, Chai
