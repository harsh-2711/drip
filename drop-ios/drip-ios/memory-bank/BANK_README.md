# Cline's Memory Bank for Drip Backend

This Memory Bank contains all the essential context and documentation for the Drip backend project. It serves as Cline's persistent memory between sessions, ensuring continuity and consistency in development.

## Core Files

### 1. [projectbrief.md](./projectbrief.md)
Foundation document that defines core requirements and goals for the Drip project. This is the source of truth for project scope.

### 2. [productContext.md](./productContext.md)
Explains why this project exists, the problems it solves, how it should work, and user experience goals.

### 3. [activeContext.md](./activeContext.md)
Contains the current work focus, recent changes, next steps, active decisions, and important patterns and preferences.

### 4. [systemPatterns.md](./systemPatterns.md)
Documents the system architecture, key technical decisions, design patterns in use, component relationships, and critical implementation paths.

### 5. [techContext.md](./techContext.md)
Details the technologies used, development setup, technical constraints, dependencies, and tool usage patterns.

### 6. [progress.md](./progress.md)
Tracks what works, what's left to build, current status, known issues, and the evolution of project decisions.

## Usage Guidelines

- All files should be kept up-to-date as the project evolves
- When making significant changes to the codebase, update the relevant memory bank files
- Use the `update memory bank` command to trigger a comprehensive review of all files
- Focus particularly on activeContext.md and progress.md as they track the current state

## Memory Bank Structure

```
flowchart TD
    PB[projectbrief.md] --> PC[productContext.md]
    PB --> SP[systemPatterns.md]
    PB --> TC[techContext.md]
    
    PC --> AC[activeContext.md]
    SP --> AC
    TC --> AC
    
    AC --> P[progress.md]
```

This structure ensures that all documentation builds upon the foundation of the project brief, with each file providing more specific context in different areas, ultimately informing the current active context and progress tracking.
