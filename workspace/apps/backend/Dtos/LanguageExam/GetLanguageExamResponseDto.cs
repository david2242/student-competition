namespace Workspace.Backend.Dtos.LanguageExam;

public class GetLanguageExamResponseDto
{
  public int Id { get; set; }
  public int StudentId { get; set; }
  public string StudentFirstName { get; set; } = string.Empty;
  public string StudentLastName { get; set; } = string.Empty;
  public string Language { get; set; } = string.Empty;
  public string Level { get; set; } = string.Empty;
  public string Type { get; set; } = string.Empty;
  public string Teacher { get; set; } = string.Empty;
  public DateOnly Date { get; set; }
  public string ExamBody { get; set; } = string.Empty;
  public string? CreatorId { get; set; }
  public DateTime CreatedAt { get; set; }
  public DateTime? UpdatedAt { get; set; }
}
