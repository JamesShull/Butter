# Project Structure

The Butter App is organized as follows:

```
root/
├── src/
│   ├── main.py                # Main entry point for the application
│   ├── app/
│   │   ├── app.py             # Application logic and event loop
│   │   ├── background.py      # Background tasks
│   │   ├── comm.py            # Communication between GUI and App
│   │   ├── serverConfig.py    # Starlette server configuration and routes
│   │   └── state.py           # Application state management
│   ├── view/
│   │   ├── index.html         # Main HTML for the GUI
│   │   ├── assets/            # Static assets (favicon, CSS, etc.)
│   │   ├── lib/               # JavaScript/TypeScript libraries for the GUI
│   │   └── pages/             # Additional HTML pages
│   └── butter.egg-info/       # Packaging metadata
├── logs/                      # Log files
├── Makefile                   # Automation commands
├── pyproject.toml             # Python project configuration
└── readme.md                  # Project overview
```

- **src/app/**: Python backend logic and server configuration.
- **src/view/**: Frontend assets and GUI code.
- **logs/**: Application logs.
- **Makefile**: Common development commands.
