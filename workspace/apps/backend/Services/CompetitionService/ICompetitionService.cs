using Workspace.Backend.Dtos.Competition;
using Workspace.Backend.Models;

namespace Workspace.Backend.Services.CompetitionService;

public interface ICompetitionService
{
  Task<List<GetCompetitionResponseDto>> GetAll();
  Task<GetCompetitionResponseDto> GetSingle(int id);
  Task<List<GetCompetitionResponseDto>> AddCompetition(AddCompetitionRequestDto newCompetition, string currentUserId);
  Task<GetCompetitionResponseDto> UpdateCompetition(int id, UpdateCompetitionRequestDto updatedCompetition, string currentUserId);
  Task<List<GetCompetitionResponseDto>> DeleteCompetition(int id, string currentUserId);
}
