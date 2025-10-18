# Network Traffic Analyzer - Frontend

This is the frontend component of the Network Traffic Analyzer application built with React and Tailwind CSS.

## Features

- Real-time dashboard with traffic statistics
- Live packet table display
- Protocol distribution pie chart
- Network traffic line chart
- Network interface selection
- WebSocket communication with backend

## Requirements

- Node.js 16+
- npm or yarn

## Installation

1. Install dependencies:
   ```
   npm install
   ```

## Development

To run the development server:
```
npm run dev
```

The frontend will start on http://localhost:3000

## Building for Production

To create a production build:
```
npm run build
```

To preview the production build:
```
npm run preview
```

## Project Structure

- `src/App.jsx` - Main application component
- `src/components/` - React components
- `src/index.css` - Tailwind CSS imports
- `vite.config.js` - Vite configuration with proxy setup