namespace Workspace.Backend.Dtos.LanguageExam;

public class LanguageExamSearchRequestDto
{
  public int? StudentId { get; set; }
  public string? StudentName { get; set; }
  public string? Language { get; set; }
  public string? Level { get; set; }
  public string? Type { get; set; }
  public string? Teacher { get; set; }
  public string? ExamBody { get; set; }
  public DateOnly? DateFrom { get; set; }
  public DateOnly? DateTo { get; set; }
  public string? SchoolYear { get; set; }
}
