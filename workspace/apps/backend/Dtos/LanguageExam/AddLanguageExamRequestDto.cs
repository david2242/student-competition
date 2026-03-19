using System.ComponentModel.DataAnnotations;

namespace Workspace.Backend.Dtos.LanguageExam;

public class AddLanguageExamRequestDto
{
  [Required(ErrorMessage = "Tanuló megadása kötelező")]
  public int StudentId { get; set; }

  [Required(ErrorMessage = "Nyelv megadása kötelező")]
  public string Language { get; set; } = string.Empty;

  [Required(ErrorMessage = "Szint megadása kötelező")]
  public string Level { get; set; } = string.Empty;

  [Required(ErrorMessage = "Típus megadása kötelező")]
  public string Type { get; set; } = string.Empty;

  [Required(ErrorMessage = "Tanár megadása kötelező")]
  public string Teacher { get; set; } = string.Empty;

  [Required(ErrorMessage = "Dátum megadása kötelező")]
  public DateOnly Date { get; set; }

  [Required(ErrorMessage = "Vizsgaszervező megadása kötelező")]
  public string ExamBody { get; set; } = string.Empty;
}
