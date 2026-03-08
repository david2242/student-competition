# 🏆 Student Competition - Frontend

<div align="center">
  <img src="https://raw.githubusercontent.com/nrwl/nx/master/images/nx-logo.png" width="100" alt="Nx Logo">
  <h3>Modern Angular Application for Competition Management</h3>
  
  [![Angular](https://img.shields.io/badge/Angular-18-DD0031?style=for-the-badge&logo=angular)](https://angular.io/)
  [![Nx](https://img.shields.io/badge/Nx-Smart%20Monorepo-143055?style=for-the-badge&logo=nx)](https://nx.dev/)
  [![Typescript](https://img.shields.io/badge/TypeScript-5.4-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
  [![Bootstrap](https://img.shields.io/badge/Bootstrap-5.3-7952B3?style=for-the-badge&logo=bootstrap)](https://getbootstrap.com/)
</div>

---

## 📖 Overview

This repository contains the frontend application for the **Student Competition** project. The application's goal is to efficiently manage student competitions, participants, and results through a modern, responsive interface.

## 🚀 Technology Stack

The project uses modern tools for an excellent developer experience and performance:

- **Framework:** [Angular 18](https://angular.io/) (Standalone Components)
- **Monorepo Management:** [Nx](https://nx.dev/)
- **Styling & UI:** [Bootstrap 5](https://getbootstrap.com/) & [Bootstrap Icons](https://icons.getbootstrap.com/)
- **Data Tables:** [ag-Grid Angular](https://www.ag-grid.com/)
- **Date Picker:** [Flatpickr](https://flatpickr.js.org/)
- **Notifications:** [ngx-toastr](https://github.com/Siren-Development/ngx-toastr)
- **State Management:** [RxJS](https://rxjs.dev/)

## ✨ Main Features

- **Competition Management:** Listing, creating, and editing competitions.
- **Participant Management:** Assigning competitors, tracking scores and data.
- **User Administration:** Full user management for administrators.
- **Profile Management:** Viewing own data and changing password.
- **Authentication:** JWT-based login and permission management (Guards).

## 📂 Project Structure

```text
apps/frontend/src/app/
├── components/          # UI components
│   ├── pages/           # Page-level components (Competition, User, Welcome)
│   ├── login/           # Login
│   ├── navbar/          # Navigation bar
│   └── shared/          # Reusable components
├── core/                # Core logic (Interceptors, core services)
├── guards/              # Route protection (adminGuard, etc.)
├── models/              # TypeScript interfaces and types
├── services/            # API communication and business logic
└── app.routes.ts        # Application routes
```

## 🛠️ Development Commands

The project uses the [Nx](https://nx.dev/) toolset:

### Start Development Server
```bash
npx nx serve frontend
```

### Create Production Build
```bash
npx nx build frontend
```

### Testing (Unit Tests)
Run all frontend tests:
```bash
npx nx test frontend
```

**Developer tips (recommended for refactoring):**
- **Watch mode:** `npx nx test frontend --watch` (automatically restarts when a file is modified)
- **Specific file:** `npx nx test frontend --testFile=competition-editor.component.spec.ts`
- **Coverage:** `npx nx test frontend --codeCoverage`

### Linting (Code Quality Check)
```bash
npx nx lint frontend
```

### E2E Testing (Cypress)
```bash
npx nx e2e frontend-e2e
```

---

<div align="center">
  <sub>Built with ❤️ using Angular and Nx</sub>
</div>

