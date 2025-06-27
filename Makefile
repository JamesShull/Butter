# Makefile for the butter project

# OS detection
ifeq (,$(findstring Windows_NT,$(OS)))
	PYTHON_LAUNCH := python3
	PYTHON_BIN := python3
	ACTIVATE := source $(VENV_DIR)/bin/activate
else
	PYTHON_LAUNCH := py
	PYTHON_BIN := python
	ACTIVATE := $(VENV_DIR)\\Scripts\\activate.bat
endif

PYTHON_VERSION := 3.9
VENV_DIR := .venv
UV := uv

# Phony targets
.PHONY: all install run lint format clean test help docs

all: install

install: $(VENV_DIR)/pyvenv.cfg
	@echo "Installing dependencies..."
ifeq (,$(findstring Windows_NT,$(OS)))
	. $(VENV_DIR)/bin/activate && $(UV) pip install .[dev,docs,test]
else
	call $(VENV_DIR)\Scripts\activate.bat && $(UV) pip install .[dev,docs,test]
endif

$(VENV_DIR)/pyvenv.cfg:
	@echo "Creating virtual environment using the latest available Python..."
	$(UV) venv $(VENV_DIR) -p "$(PYTHON_LAUNCH)"

run: install
	@echo "Running the application from the build directory..."
	cd build && $(PYTHON_BIN) ../src/main.py

dev: install
	@echo "Running the application in development mode..."
	$(PYTHON_BIN) src/main.py

lint: install
	@echo "Linting with ruff..."
	$(PYTHON_BIN) -m ruff check .

format: install
	@echo "Formatting with ruff..."
	$(PYTHON_BIN) -m ruff format .

clean:
	@echo "Cleaning up..."
ifeq (,$(findstring Windows_NT,$(OS)))
	rm -rf $(VENV_DIR)
	find . -type f -name '*.py[co]' -delete -o -type d -name __pycache__ -delete
else
	-@rmdir /S /Q $(VENV_DIR) 2>nul
	-for /r %%i in (*.pyc) do del %%i 2>nul
	-for /r %%i in (*.pyo) do del %%i 2>nul
	-for /r %%d in (__pycache__) do rmdir /S /Q %%d 2>nul
endif
	-@rm -rf .ruff_cache 2>nul

test:
	@echo "No tests configured yet. Please add your test command."
	# Example: $(PYTHON_BIN) -m pytest

docs:
	@echo "Building documentation with mkdocs..."
	$(PYTHON_BIN) -m mkdocs build

help:
	@echo "Available commands:"
	@echo "  make install    - Creates a virtual environment and installs dependencies."
	@echo "  make run        - Runs the main application."
	@echo "  make lint       - Lints the codebase using ruff."
	@echo "  make format     - Formats the codebase using ruff."
	@echo "  make clean      - Removes the virtual environment and cache files."
	@echo "  make test       - Placeholder for running tests."
	@echo "  make help       - Shows this help message."
	@echo "  make docs       - Builds the documentation using mkdocs."

uv-build:
	@echo "Building project with uv..."
	$(UV) build
