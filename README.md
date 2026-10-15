# Employee Records Dashboard

A responsive employee management dashboard built with React, TypeScript and Vite. The project focuses on practical CRUD workflows, client-side persistence, filtering, reporting and clean state management.

## Live demo

https://employee-records-dashboard.vercel.app

## Features

- Create, view, edit and delete employee records
- Persistent browser storage with `localStorage`
- Search across name, email, role and department
- Filter by employee status and department
- Sort by name, role, department or status
- Pagination for employee records
- Employee profile/details view
- Workforce summary metrics
- Department distribution analytics
- Active/inactive workforce reporting
- CSV export of the current filtered dataset
- Responsive desktop and mobile layout

## Stack

- React
- TypeScript
- Vite
- Lucide React
- CSS
- Browser LocalStorage API

## Application structure

```text
Employee Records Dashboard
        │
        ├── Dashboard metrics
        ├── Employee directory
        │     ├── Search
        │     ├── Filters
        │     ├── Sorting
        │     ├── Pagination
        │     └── CRUD actions
        ├── Department analytics
        ├── Workforce reports
        └── CSV export
               │
               ▼
          LocalStorage
```

## Engineering decisions

### Derived state instead of duplicated state
Search, filtering, sorting, pagination and department statistics are calculated from the employee dataset rather than maintained as separate copies.

### Persistent client-side data
Employee changes are written to `localStorage`, allowing the dashboard to behave like a persistent application without requiring a backend for this portfolio scope.

### Reusable interaction patterns
Employee creation and editing share the same form workflow, while view/edit/delete actions operate on the same typed employee model.

### Export from the active view
CSV export uses the filtered dataset, so exported records match what the user is currently reviewing.

## Local development

```bash
npm install
npm run dev
```

## Production build

```bash
npm run build
npm run preview
```

## What this project demonstrates

- React state and derived-state management
- Type-safe CRUD workflows
- Search / filter / sort / pagination logic
- Browser persistence
- Basic data visualization and reporting
- Responsive UI implementation
- CSV data export

## Scope

This project intentionally uses browser persistence rather than a server database. For backend architecture, authentication, PostgreSQL and role-based access control, see the Workgrid project.

---

Built by Mohammed Al-Obaido as a full-stack/frontend engineering portfolio project.
