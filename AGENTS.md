# Jules Agent Guide

Jules is an AI code assistant integrated with this project to help automate code generation, review, and refactoring tasks.

## Where to Find Source Code
- **Backend Python code:**
  - `src/app/` — Main application logic, communication, and server configuration
  - `src/main.py` — Main entry point for the application
- **Frontend code:**
  - `src/view/` — HTML, JavaScript, CSS, and assets for the GUI
- **Tests:**
  - (Add your tests in a `tests/` directory or as appropriate for your project)

## Workflow for Using Jules

1. **Start with Testing**
   - Run the test suite to ensure the current codebase is working:
     ```sh
     make test
     ```
   - **If the tests fail:**
     - Review the error messages and try to fix the issues before proceeding.
     - Notify the user or team about the failure and your actions to resolve it.

2. **Make Requested Changes**
   - Use Jules to generate, refactor, or review code as needed.
   - Edit the relevant files in `src/app/`, `src/main.py`, or `src/view/`.

3. **Lint and Format**
   - Use Ruff to check and format your code:
     ```sh
     make lint
     make format
     ```

4. **Clean and Reinstall**
   - Clean the environment and reinstall dependencies to ensure a fresh setup:
     ```sh
     make clean
     make install
     ```

5. **Re-Test for Successful Runs**
   - Run the tests again to confirm your changes are correct:
     ```sh
     make test
     ```

## Coding Standards
- Follow PEP 8 for Python code style.
- Use descriptive variable and function names.
- Add docstrings to all public functions, classes, and modules.
- Keep functions and classes small and focused.
- Use type hints where appropriate.
- For JavaScript/TypeScript, follow standard ES6+ conventions and keep code modular.

## Commit Rules
- Follow Conventional Commits (`feat:`, `fix:`, `docs:`, …).
- Reference related issues or pull requests when applicable.
- Group related changes into a single commit; avoid large, unrelated changes in one commit.
- Run and pass `make lint` and `make test` before committing to ensure code quality and correctness.

## Pull Request Process
- Title: short summary
- Body:
  - Purpose of change. Can be up to 3-4 sentences
  - original Jules task description
  - key changes list
  - how Jules tested the changes
  - Any follow‑up TODOs.

---
