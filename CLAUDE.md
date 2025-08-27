# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- `pnpm dev` - Start development server with hot reload
- `pnpm build` - Build for production (runs TypeScript compiler then Vite build)
- `pnpm lint` - Run ESLint on TypeScript/React files
- `pnpm preview` - Preview production build locally

## Project Architecture

This is a **Go Struct Mapping Visualizer** - a React-based web application for visualizing and generating mappings between Go struct fields.

### Core Concept
The application provides a visual flow-based interface where users can:
1. Input Go struct definitions
2. Create visual connections between struct fields
3. Add transformation logic via transformer nodes
4. Generate Go mapping code from visual flows

### Technology Stack
- **Frontend**: React 19 + TypeScript + Vite
- **UI Components**: shadcn/ui (Tailwind CSS-based component library)
- **Dependencies**: React Flow (visual diagrams), Monaco Editor (code editing), Lucide React (icons)
- **Build System**: Vite with TypeScript compilation
- **Linting**: ESLint with TypeScript and React rules

### Key Architecture Concepts

**Data Models** (from PRD):
- `StructDefinition`: Represents parsed Go structs with fields and validation
- `FlowConfig`: Complete mapping configuration with nodes, edges, transformers
- `TransformerNode`: Custom transformation logic between struct fields

**UI Layout Structure**:
- Header: Project controls, save/load, export
- Sidebar: Struct input panel, transformer library  
- Main Canvas: React Flow diagram area
- Properties Panel: Node/connection configuration
- Footer: Status and validation messages

**State Management**: Planned to use React Context + useReducer for complex application state

### Current State
This is an early-stage project with basic Vite + React + TypeScript setup. The core struct mapping visualization features are not yet implemented.

## Code Style & Conventions

- TypeScript strict mode enabled
- ESLint configuration includes React Hooks and React Refresh rules
- Modern React patterns (hooks, function components)
- File structure follows standard Vite React template