# Frontend Elemzés - Student Competition

## Technológiai Stack
- **Keretrendszer:** Angular 17/18 (Standalone Components)
- **Stíluskezelés:** SCSS / CSS
- **Állapotkezelés:** RxJS (BehaviorSubjects), helyi szervizek
- **Workspace:** Nx

## Architektúra és Struktúra
A frontend egy meglehetősen mélyen tagolt, néhol kusza struktúrát mutat:
- **Core/Services:** Globális szervizek (Auth, Competition).
- **Components:** Itt található a logika nagy része, `pages` és `shared` bontásban.
- **Deep Nesting:** A komponenseken belül saját `components`, `services` és `models` mappák találhatók (pl. `competition-editor`), ami nehezíti az átláthatóságot.

## Erősségek
- **Modern Angular:** Standalone komponensek és `inject()` function használata.
- **Típusosság:** TypeScript interfészek használata szinte mindenhol.
- **Moduláris felépítés:** Próbálkozik a komponensek bontásával.

## Kritikai észrevételek (Miért "Spagetti"?)
1. **God Components:** A `CompetitionEditorComponent` túl sok feladatot lát el (~500 sor, 12KB HTML). Egyszerre kezeli a formot, a validációt, az adatok betöltését, a résztvevők kezelését és a UI állapotokat (show/edit).
2. **Inkonzisztens szerviz elhelyezés:** Olyan szervizek (pl. `ParticipantService`), amelyek `providedIn: 'root'` jelöléssel bírnak, mélyen elrejtve találhatók egy-egy lap (page) mappájában. Ez ellentmond az Angular architektúrális elveinek.
3. **Manuális Form Management:** A "nézet" (show) és "szerkesztés" (edit) módok közötti váltás manuálisan, egyesével kapcsolgatja a form kontrollokat (`toggleSelects` metódus). Ez hibafaktor és nehezen tesztelhető.
4. **Túlzott Fragmentáció vs. Monolit:** Miközben a mappaszerkezet nagyon mély, a fő komponensek mégis túl nagyok maradnak. A sub-komponensek (pl. `participant-editor`) közötti kommunikáció bonyolult.
5. **Logika a HTML-ben:** A nagy méretű HTML sablonok valószínűleg sok komplex `*ngIf` logikát tartalmaznak, ami nehezíti a debuggolást.

## Javaslatok a továbbfejlesztéshez
- **Komponensek bontása:** A `CompetitionEditorComponent`-et szét kell szedni kisebb, atomi komponensekre (pl. `CompetitionHeader`, `CompetitionDetails`, `CompetitionResults`).
- **Form State Management:** Reactive Forms hatékonyabb használata (pl. a teljes FormGroup disable/enable hívása).
- **Szervizek központosítása:** A globális logikát (résztvevők kezelése, diák keresés) ki kell mozgatni a `core/services` vagy egy dedikált `features/participants` rétegbe.
- **Smart/Dumb Component minta:** A "lap" komponensek csak az adatlekéréssel foglalkozzanak, a megjelenítést bízzák buta prezentációs komponensekre.
