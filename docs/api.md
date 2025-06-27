# API Overview

The Butter App backend exposes a simple HTTP API for communication between the frontend (GUI) and backend (Python).

## Main Endpoints

- **GET /api/v<version>/subscribe**
  - Server-Sent Events (SSE) endpoint for the GUI to receive real-time updates from the backend.

- **POST /api/v<version>/message**
  - The GUI sends messages/events to the backend using standard HTTP POST requests (typically via `fetch`).
  - Payload: JSON object describing the event or command.

- **Static Files**
  - The server hosts static assets (HTML, JS, CSS) for the GUI at the root URL (`/`).

## Example Message Flow

1. The GUI sends a POST request to `/api/v0.0.1/message` with a JSON payload.
2. The backend processes the message and, if needed, pushes updates to the GUI via the SSE `/subscribe` endpoint.

## Notes
- API versioning is supported via the URL path (e.g., `/api/v0.0.1/`).
- All communication is asynchronous and thread-safe.
