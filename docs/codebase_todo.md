# Codebase Gatyába Rázás - TO-DO Lista

Ezeket a feladatokat javasolt elvégezni, mielőtt a Nyelvvizsga feature fejlesztésébe belekezdünk, hogy a kódbázis könnyebben bővíthető legyen.

## Backend (A "jobb állapotú" rész)
- [ ] **Mapping refaktor:** Cseréld le a szervizekben lévő manuális `.Select` hívásokat AutoMapper-re (különösen a `StudentService` és `CompetitionService` esetén).
- [ ] **Globális hibakezelés:** Hozz létre egy `ExceptionMiddleware`-t, és távolítsd el a felesleges `try-catch` blokkokat a kontrollerekből.
- [x] **Program.cs tisztítás:** Szervezd ki a Swagger konfigurációt és a szerviz regisztrációkat külön extension metódusokba.
- [/] **Tracking vizsgálat:** Nézd át, miért van szükség a manuális `Detached` állapotra a `DataContext`-ben, és javítsd az okot (valószínűleg több kontextus ütközés vagy hibás update logika). -> *Research completed, see tracking_investigation.md*

## Frontend (A "spagetti" rész)
- [ ] **Editor komponens bontása:** Szedd szét a `CompetitionEditorComponent`-et több kisebb komponensre. [#111](https://github.com/david2242/student-competition/issues/111)
- [ ] **Szerviz refaktor:** Mozgasd a `ParticipantService`-t és a hozzá kapcsolódó modelleket egy központi helyre (pl. `src/app/core/services` vagy `src/app/features/`).
- [ ] **Form logika egyszerűsítés:** Használd a `FormGroup.disable()` / `enable()` metódusokat a manuális kontroll kapcsolgatás helyett.
- [ ] **Shared modul/komponensek:** A közös UI elemeket (pl. gombok, inputok a formban) emeld ki a `shared` mappába.

## Tényfeltárás a jövőbeli Nyelvvizsga feature-höz
- **Adatmodell:** A `Student` entitás bővítése szükséges egy `LanguageExams` kollekcióval.
- **Backend végpont:** Új kontroller metódus vagy külön `LanguageExamController` a vizsgák rögzítéséhez.
- **Frontend felület:** Egy új fül vagy szekció a `StudentDetail` oldalon, ahol látszanak a vizsgák, illetve az Editorban egy lehetőség a vizsgák hozzáadására (hasonlóan a versenyekhez).
- **Strukturális előny:** Ha a fenti refaktorok (szerviz központosítás, komponens bontás) megtörténnek, a nyelvvizsga feature-t már egy tiszta, jól definiált helyre lehet beilleszteni, nem pedig a meglévő spagettit fogja hizlalni.
