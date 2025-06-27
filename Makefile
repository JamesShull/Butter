# Makefile for the butter project

PYTHON_VERSION := 3.9
VENV_DIR := .venv
PYTHON := $(VENV_DIR)/bin/python
UV := uv

# Phony targets
.PHONY: all install run lint format clean test help

all: install

install: $(VENV_DIR)/pyvenv.cfg
	@echo "Installing dependencies..."
	$(UV) pip install .[dev,docs,test] --python $(PYTHON)

$(VENV_DIR)/pyvenv.cfg:
	@echo "Creating virtual environment using Python $(PYTHON_VERSION)..."
	$(UV) venv $(VENV_DIR) -p $(PYTHON_VERSION)

run: install
	@echo "Running the application..."
	$(PYTHON) src/main.py

lint: install
	@echo "Linting with ruff..."
	$(PYTHON) -m ruff check .

format: install
	@echo "Formatting with ruff..."
	$(PYTHON) -m ruff format .

clean:
	@echo "Cleaning up..."
	rm -rf $(VENV_DIR)
	find . -type f -name '*.py[co]' -delete -o -type d -name __pycache__ -delete
	rm -rf .ruff_cache

test:
	@echo "No tests configured yet. Please add your test command."
	# Example: $(PYTHON) -m pytest

help:
	@echo "Available commands:"
	@echo "  make install    - Creates a virtual environment and installs dependencies."
	@echo "  make run        - Runs the main application."
	@echo "  make lint       - Lints the codebase using ruff."
	@echo "  make format     - Formats the codebase using ruff."
	@echo "  make clean      - Removes the virtual environment and cache files."
	@echo "  make test       - Placeholder for running tests."
	@echo "  make help       - Shows this help message."
