# Go Struct Mapping Visualizer

A visual web application for creating and managing mappings between Go struct fields with automatic code generation.

## Features

- **Visual Mapping**: Drag-and-drop interface for connecting struct fields
- **Code Generation**: Generate Go transformation functions from visual mappings  
- **Monaco Editor**: Built-in Go code editor with syntax highlighting
- **Flow Diagrams**: Interactive diagrams using React Flow
- **Transformer Nodes**: Custom transformation logic between fields

## Live Demo

🔗 **[https://thitiph0n.github.io/go-struct-mapping-visualizer/](https://thitiph0n.github.io/go-struct-mapping-visualizer/)**

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production  
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

## Tech Stack

- **Frontend**: React 19 + TypeScript + Vite
- **UI**: shadcn/ui components with Tailwind CSS
- **Diagrams**: React Flow for visual mapping
- **Editor**: Monaco Editor for Go code editing
- **Icons**: Lucide React

## Deployment

Automatically deployed to GitHub Pages on push to `main` branch. Manual deployment: `npm run build` → push to `main`.
