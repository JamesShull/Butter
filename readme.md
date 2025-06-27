# App 
An template for desktop test sequencing apps with web based GUIs and a Python backend.


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

This project uses `uv` for package management and `ruff` for linting and formatting. A `Makefile` is provided to streamline common tasks.

**Prerequisites:**
*   Python 3.9 or higher
*   `uv` (can be installed with `pip install uv`)

**Setup and Running:**

1.  **Install dependencies and set up the virtual environment:**
    ```bash
    make install
    ```
    This command will create a virtual environment in a `.venv` directory and install all necessary dependencies listed in `pyproject.toml`.

2.  **Run the application:**
    ```bash
    make run
    ```
    This will start the application using `src/main.py`. By default, you should be able to access the GUI at http://localhost:5000.

3.  **Navigate to GUI:** Open your web browser and go to the URL provided by the application (typically http://localhost:5000).

4.  **Customize:** Modify the contents of the `src/view/` folder to update the GUI and the Python files in `src/app/` or `src/main.py` to change backend logic.

## Development

The following `make` commands are available for development:

*   `make install`: Sets up the virtual environment and installs dependencies.
*   `make run`: Runs the main application.
*   `make lint`: Checks the codebase for linting errors using Ruff.
*   `make format`: Formats the codebase using Ruff.
*   `make clean`: Removes the virtual environment, `__pycache__` directories, and Ruff cache.
*   `make test`: (Placeholder) Intended for running automated tests.
*   `make help`: Shows a list of all available `make` commands.

To activate the virtual environment manually (for example, to run commands not covered by the Makefile):
```bash
# On macOS/Linux
source .venv/bin/activate

# On Windows (Command Prompt)
.venv\Scripts\activate.bat

# On Windows (PowerShell)
.venv\Scripts\Activate.ps1
```
Once activated, you can run `python src/main.py` directly or use other Python tools. Remember to `deactivate` when you're done.
