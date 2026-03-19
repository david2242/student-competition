using Microsoft.AspNetCore.Identity;

namespace Workspace.Backend.Models;

public class LanguageExam
{
  public int Id { get; set; }
  public int StudentId { get; set; }
  public Student Student { get; set; } = null!;
  public string Language { get; set; } = string.Empty;
  public string Level { get; set; } = string.Empty;
  public string Type { get; set; } = string.Empty;
  public string Teacher { get; set; } = string.Empty;
  public DateOnly Date { get; set; }
  public string ExamBody { get; set; } = string.Empty;
  public DateTime CreatedAt { get; set; }
  public DateTime? UpdatedAt { get; set; }
  public string? CreatorId { get; set; }
  public virtual IdentityUser? Creator { get; set; }
}

public static class ExamLanguage
{
  public const string Angol   = "Angol";
  public const string Nemet   = "Német";
  public const string Francia = "Francia";
  public const string Olasz   = "Olasz";
  public const string Spanyol = "Spanyol";
  public const string Orosz   = "Orosz";
  public const string Egyeb   = "Egyéb";

  public static readonly string[] All =
  {
    Angol, Nemet, Francia, Olasz, Spanyol, Orosz, Egyeb
  };
}

public static class ExamLevel
{
  public const string A1 = "A1";
  public const string A2 = "A2";
  public const string B1 = "B1";
  public const string B2 = "B2";
  public const string C1 = "C1";
  public const string C2 = "C2";

  public static readonly string[] All = { A1, A2, B1, B2, C1, C2 };
}

public static class ExamType
{
  public const string Komplex  = "Komplex";
  public const string Irasbeli = "Írásbeli";
  public const string Szobeli  = "Szóbeli";

  public static readonly string[] All = { Komplex, Irasbeli, Szobeli };
}

public static class ExamBodyConstants
{
  public const string ECL   = "ECL";
  public const string Origo = "ORIGÓ";
  public const string TELC  = "TELC";
  public const string BME   = "BME";
  public const string Egyeb = "Egyéb";

  public static readonly string[] All = { ECL, Origo, TELC, BME, Egyeb };
}
