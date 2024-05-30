# App 
An application framework for web based GUIs with a Python backend.


## About
The python web server, Starlette, hosts static assets and API routes to support a modern GUI. There are established thread safe queues to send messages to the App logic (python) from the GUI (javascript) and vice versa. GUI messsages are sent with the web standard fetch API. App messages to the GUI are sent with server side events. 

### About App Structure
1. Main.py - main entry point for application. Will start the server and app on separate thread.
2. serverConfig.py - configuration and callbacks for the Starlette server. Configures routes and locates static web assets.
3. comm.py - communication handling between GUI and App. There is a queue for each direction of messages.
4. app.py - Applicaiton logic for initialization and the main event loop to handle events from the GUI
5. static - Folder of static assets that are accessible by the GUI
6. logs - folder where debug log files will be created

## Getting started
1. install dependencies: py -m pip install starlette sse_starlette uvicorn colorama
2. run main: py main.py
3. navigate to GUI (click link provided) or go to http://localhost:5000 by default
4. customize: modify static folder contents to update GUI and send messages to python (or vice versa)
