using Workspace.Backend.Dtos.LanguageExam;

namespace Workspace.Backend.Services.LanguageExamService;

public interface ILanguageExamService
{
  Task<List<GetLanguageExamResponseDto>> GetAllAsync();
  Task<List<GetLanguageExamResponseDto>> SearchAsync(LanguageExamSearchRequestDto request);
  Task<GetLanguageExamResponseDto> GetSingleAsync(int id);
  Task<GetLanguageExamResponseDto> AddAsync(AddLanguageExamRequestDto dto, string userId);
  Task<GetLanguageExamResponseDto> UpdateAsync(int id, UpdateLanguageExamRequestDto dto, string userId);
  Task<bool> DeleteAsync(int id, string userId);
}
