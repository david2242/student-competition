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

Ez a repozitória a **Student Competition** projekt frontend alkalmazását tartalmazza. Az alkalmazás célja a diákversenyek, résztvevők és eredmények hatékony kezelése egy modern, reszponzív felületen keresztül.

## 🚀 Technológiai Stack

A projekt a legmodernebb eszközöket használja a kiváló fejlesztői élmény és teljesítmény érdekében:

- **Keretrendszer:** [Angular 18](https://angular.io/) (Standalone Components)
- **Monorepo Management:** [Nx](https://nx.dev/)
- **Stílus & UI:** [Bootstrap 5](https://getbootstrap.com/) & [Bootstrap Icons](https://icons.getbootstrap.com/)
- **Adattáblák:** [ag-Grid Angular](https://www.ag-grid.com/)
- **Dátumválasztó:** [Flatpickr](https://flatpickr.js.org/)
- **Értesítések:** [ngx-toastr](https://github.com/Siren-Development/ngx-toastr)
- **Állapotkezelés:** [RxJS](https://rxjs.dev/)

## ✨ Főbb Funkciók

- **Versenykezelés:** Versenyek listázása, létrehozása és szerkesztése.
- **Résztvevők kezelése:** Versenyzők hozzárendelése, pontszámok és adatok követése.
- **Felhasználói adminisztráció:** Teljes körű felhasználókezelés az adminisztrátorok számára.
- **Profilkezelés:** Saját adatok megtekintése és jelszómódosítás.
- **Hitelesítés:** JWT alapú bejelentkezés és jogosultságkezelés (Guards).

## 📂 Projekt Felépítése

```text
apps/frontend/src/app/
├── components/          # UI komponensek
│   ├── pages/           # Oldal szintű komponensek (Competition, User, Welcome)
│   ├── login/           # Bejelentkezés
│   ├── navbar/          # Navigációs sáv
│   └── shared/          # Újrafelhasználható komponensek
├── core/                # Alapvető logikák (Interceptors, core services)
├── guards/              # Útvonalvédelem (adminGuard, stb.)
├── models/              # TypeScript interface-ek és típusok
├── services/            # API kommunikáció és üzleti logika
└── app.routes.ts        # Alkalmazás útvonalai
```

## 🛠️ Fejlesztői parancsok

A projektben az [Nx](https://nx.dev/) eszközkészletet használjuk:

### Fejlesztői szerver indítása
```bash
npx nx serve frontend
```

### Produkciós build készítése
```bash
npx nx build frontend
```

### Tesztelés (Unit Tests)
Futtasd az összes frontend tesztet:
```bash
npx nx test frontend
```

**Fejlesztői tippek (refaktoráláshoz ajánlott):**
- **Watch mód:** `npx nx test frontend --watch` (automatikusan újrafut, ha módosítasz egy fájlt)
- **Specifikus fájl:** `npx nx test frontend --testFile=competition-editor.component.spec.ts`
- **Lefedettség (Coverage):** `npx nx test frontend --codeCoverage`

### Linting (Kódminőség ellenőrzése)
```bash
npx nx lint frontend
```

### E2E Tesztelés (Cypress)
```bash
npx nx e2e frontend-e2e
```

---

<div align="center">
  <sub>Built with ❤️ using Angular and Nx</sub>
</div>
