# Inventory Master

A modern inventory management system built with React, Tailwind CSS, shadcn/ui, and Framer Motion.

## Features

- 🎨 Beautiful, modern UI with Tailwind CSS and shadcn/ui components
- ✨ Smooth animations powered by Framer Motion
- 📊 Manage Products, Suppliers, Transactions, and Users
- 🔍 Search functionality (needs refining)
- ➕ Add, Edit, and Delete records
- 🔐 Login authentication
- 📱 Responsive design

## Tech Stack

- **React 18** - UI framework
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **shadcn/ui** - Component library
- **Framer Motion** - Animations
- **React Router** - Navigation
- **Supabase** - Backend/Database

## Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

1. Install dependencies:

```bash
npm install
```

2. Start the development server:

```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

### Build for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## Project Structure

```
src/
├── components/
│   ├── ui/          # shadcn/ui components
│   ├── Dashboard.jsx
│   ├── Login.jsx
│   ├── Sidebar.jsx
│   ├── TopBar.jsx
│   ├── DataTable.jsx
│   └── Modal.jsx
├── contexts/
│   └── SupabaseContext.jsx
├── lib/
│   └── utils.js
├── styles.css
├── App.jsx
└── main.jsx
```

## Configuration

The Supabase configuration is in `src/contexts/SupabaseContext.jsx`. Update the URL and API key with your Supabase project credentials.

## License

See LICENSE file for details.
