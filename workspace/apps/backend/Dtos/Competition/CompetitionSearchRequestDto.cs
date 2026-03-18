namespace Workspace.Backend.Dtos.Competition;

public class CompetitionSearchRequestDto
{
    public string? Name { get; set; }
    public string? Subject { get; set; }
    public string? Teacher { get; set; }
    public string? Level { get; set; }
    public string? Round { get; set; }
    public DateOnly? DateFrom { get; set; }
    public DateOnly? DateTo { get; set; }
    public string? StudentName { get; set; }
    public int? StudentId { get; set; }
    public bool? NextRound { get; set; }
    public bool? HasResult { get; set; }
    public bool? IsOktv { get; set; }
}
