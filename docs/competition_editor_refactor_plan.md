# Refaktorálási Terv: CompetitionEditorComponent

Ez a dokumentum részletezi a `CompetitionEditorComponent` szétbontásának lépéseit kisebb, fókuszált komponensekre. A cél a karbantarthatóság javítása anélkül, hogy a felhasználói felület (UI) megjelenése változna.

## Célkitűzések
1.  **Single Responsibility**: Minden új komponens csak egy logikai egységért feleljen.
2.  **Kód tisztaság**: A fő komponens méretének drasztikus csökkentése.
3.  **Változatlan Design**: A refaktorálás során a vizuális megjelenés nem módosulhat.

## Javasolt Új Komponensek

A komponenst az alábbi egységekre bontjuk (mindegyik standalone komponens lesz a `competition-editor/components` mappában):

1.  **`CompetitionHeaderComponent`**: Vezérlőgombok (Törlés, Szerkesztés, Mentés, Mégse) és állapotjelzők.
2.  **`CompetitionBasicInfoComponent`**: Alapadatok (Név, OKTV pipa, Helyszín, Dátum).
3.  **`CompetitionClassificationComponent`**: Besorolás (Tantárgyak, Tanárok, Típus, Szint).
4.  **`CompetitionFormatComponent`**: Verseny formája (Írásbeli, Szóbeli, stb.).
5.  **`CompetitionResultsComponent`**: Eredmények szekció (Helyezés, Különdíj, stb.).
6.  **`CompetitionNotesComponent`**: Megjegyzés mező.

## Refaktorálási Szakaszok

### 0. Fázis: Átfogó Egység- és Integrációs Tesztek
- [ ] Szerviz mockok (Auth, Router, Notification, Participant) kiegészítése a meglévő spec fájlban.
- [ ] Form validációs szabályok tesztelése.
- [ ] OKTV toggle és szűrési logika tesztelése.
- [ ] Mentési flow tesztelése (szerviz hívás + navigáció).
- [ ] **Cél**: A manuális validáció teljes kiváltása automatizált tesztekkel.

### 1. Fázis: Előkészítés és Header
- [ ] Új komponensek vázának létrehozása.
- [ ] A `CompetitionHeaderComponent` kiszervezése.
- [ ] Input/Output definiálása a gombok és jogosultságok kezeléséhez.

### 2. Fázis: Alapadatok és Form kezelés
- [ ] `CompetitionBasicInfoComponent` létrehozása.
- [ ] A `FormGroup` megfelelő részeinek átadása a child komponensnek.
- [ ] Design ellenőrzése (Bootstrap rács megtartása).

### 3. Fázis: Besorolás és Listák
- [ ] `CompetitionClassificationComponent` implementálása.
- [ ] A `FormArray` (tantárgyak, tanárok) kezelésének kiszervezése.
- [ ] A dinamikus szűrés (szintek/fordulók) logikájának átgondolása (maradjon a szülőben vagy kerüljön a gyerekbe).

### 4. Fázis: Eredmények és Egyéb
- [ ] `CompetitionResultsComponent` és `CompetitionFormatComponent` kiszervezése.
- [ ] `CompetitionNotesComponent` implementálása.

### 5. Fázis: Tisztítás és Finomhangolás
- [ ] A fő `CompetitionEditorComponent` TS fájljából a felesleges segédmetódusok törlése.
- [ ] Unit tesztek frissítése/javítása.

## Technikai Megvalósítás Részletei

- **Komponens Kommunikáció**: A szülő komponensben marad a fő `FormGroup`. A gyerek komponensek megkapják a számukra releváns `FormControl`-okat vagy a teljes `FormGroup`-ot `[formGroup]` inputként.
- **Standalone**: Minden új komponens `standalone: true` lesz.
- **CSS**: A globális stílusokat (Bootstrap) használjuk továbbra is. Ha egy komponensnek saját specifikus stílusa van, az a saját `.css` fájljába kerül.

## Ellenőrzési Terv

### Vizuális Ellenőrzés
- [ ] A refaktorálás előtt és után készült képernyőképek összehasonlítása.
- [ ] Validációs üzenetek megjelenésének tesztelése minden szekcióban.
- [ ] Responsivity (mobilnézet) ellenőrzése.

### Funkcionális Tesztelés
- [ ] Új verseny létrehozása minden mező kitöltésével.
- [ ] Meglévő verseny szerkesztése és mentése.
- [ ] OKTV mód ki/be kapcsolása és a szintek változásának ellenőrzése.
- [ ] Törlés funkció ellenőrzése (admin és jogosult felhasználó esetén).
