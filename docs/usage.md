# Usage Examples

## Running the Application

1. Install dependencies and set up the virtual environment:
   ```sh
   make install
   ```
2. Start the application:
   ```sh
   make run
   ```
3. Open your browser and go to [http://localhost:5000](http://localhost:5000)

## Sending a Message from the GUI

Example JavaScript (frontend):
```js
fetch('/api/v0.0.1/message', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ action: 'startTest', params: { testId: 123 } })
});
```

## Receiving Updates in the GUI

Example JavaScript (frontend):
```js
const eventSource = new EventSource('/api/v0.0.1/subscribe');
eventSource.onmessage = function(event) {
  const data = JSON.parse(event.data);
  // Handle update from backend
};
```
