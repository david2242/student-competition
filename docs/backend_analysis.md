# Backend Elemzés - Student Competition

## Technológiai Stack
- **Keretrendszer:** ASP.NET Core 8.0 (Web API)
- **Adatbázis:** PostgreSQL (Npgsql)
- **ORM:** Entity Framework Core
- **Azonosítás:** ASP.NET Core Identity (Cookie-alapú)
- **Leképezés:** AutoMapper (regisztrálva van, de nem mindenhol használt)
- **Dokumentáció:** Swagger / OpenAPI

## Architektúra és Struktúra
A backend egy klasszikus többrétegű architektúrát követ egy Nx workspace-en belül:
- **Controllers:** Az API végpontok definíciói.
- **Services:** Az üzleti logika helye (IStudentService, ICompetitionService stb.).
- **Data:** Az adatbázis kontextus (DataContext) és migrációk.
- **Models:** Az adatbázis entitások.
- **Dtos:** Adatátviteli objektumok.

## Erősségek
- **Tiszta alapok:** A projekt jól strukturált, követi a standard .NET mintákat (Dependency Injection, Interface-alapú szervizek).
- **ServiceResponse wrapper:** Konzisztens API válaszformátumot biztosít a frontend számára.
- **Validáció:** A kontrollerekben explicit validáció és hibakezelés történik.
- **EF Core konfiguráció:** A `DataContext`-ben explicit módon kezelve van a kapcsolatok definiálása és a speciális típusok (pl. `string[]` konverzió) kezelése.

## Kritikai észrevételek (Clean Code problémák)
1. **Manuális Mapping:** Bár az AutoMapper be van állítva, a `StudentService`-ben és más helyeken manuális `.Select(s => new Dto { ... })` hívások találhatók. Ez kódismétléshez és nehezebb karbantarthatósághoz vezet.
2. **Ismétlődő hibakezelés:** Minden kontroller metódusban hasonló `try-catch` blokkok vannak. Célszerűbb lenne egy **Global Exception Middleware** használata.
3. **Program.cs zsúfoltság:** A konfiguráció, szerviz regisztráció és az adatbázis seedelés mind egy fájlban van. Nagyobb projekteknél ezt érdemes lenne `ServiceExtensions`-be kiszervezni.
4. **Hardcoded CORS:** A CORS szabályok részben beégetettek a `Program.cs`.
5. **DataContext hack:** A `SaveChangesAsync` felüldefiniálása (`Detached` állapot használata a követési hibák elkerülésére) egyfajta "tüneti kezelés", ami mögött rejtett tracking problémák lehetnek.

## Javaslatok a továbbfejlesztéshez (Nyelvvizsga feature előtt)
- Az AutoMapper aktívabb használata a szerviz rétegben.
- Globális hibakezelő központosítása.
- Az üzleti logika (pl. "ki az aktuális osztálya a tanulónak") kiszervezése dedikált segédmetódusokba az entitás modellen belül vagy egy külön logikába.
- Unit tesztek bevezetése a szerviz rétegre.
