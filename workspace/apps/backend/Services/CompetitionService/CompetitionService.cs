using AutoMapper;
using Workspace.Backend.Dtos.Competition;
using Workspace.Backend.Models;

namespace Workspace.Backend.Services.CompetitionService;

public class CompetitionService : ICompetitionService
{
  private static List<Competition> _competitions = new List<Competition>
  {
    new Competition { Id = 1, Name = "Competition 1" },
    new Competition { Id = 2, Name = "Competition 2" }
  };

  private readonly IMapper _mapper;
  public CompetitionService(IMapper mapper)
  {
    _mapper = mapper;
  }
  public async Task<List<GetCompetitionResponseDto>> GetAll()
  {
      return _competitions.Select(c => _mapper.Map<GetCompetitionResponseDto>(c)).ToList();
  }

  public async Task<GetCompetitionResponseDto> GetSingle(int id)
  {
    var competition = _competitions.FirstOrDefault(x => x.Id == id);
    if (competition == null)
    {
      throw new KeyNotFoundException($"Competition with id '{id}' was not found");
    }
    return _mapper.Map<GetCompetitionResponseDto>(competition);
  }

  public async Task<List<GetCompetitionResponseDto>> AddCompetition(AddCompetitionRequestDto newCompetition)
  {
    var competition = _mapper.Map<Competition>(newCompetition);
    competition.Id = _competitions.Max(x => x.Id) + 1;
    _competitions.Add(competition);
    return _competitions.Select(c => _mapper.Map<GetCompetitionResponseDto>(c)).ToList();
  }

  public async Task<GetCompetitionResponseDto> UpdateCompetition(int id, UpdateCompetitionRequestDto updatedCompetition)
  {
    var index = _competitions.FindIndex(x => x.Id == id);
    if (index == -1)
    {
      throw new KeyNotFoundException($"Competition with id '{id}' was not found");
    }
    var updatedCompetitionModel = _mapper.Map<Competition>(updatedCompetition);
    updatedCompetitionModel.Id = id;
    _competitions[index] = updatedCompetitionModel;
    return _mapper.Map<GetCompetitionResponseDto>(_competitions[index]);
  }

  public async Task<List<GetCompetitionResponseDto>> DeleteCompetition(int id)
  {
    var index = _competitions.FindIndex(x => x.Id == id);
    if (index == -1)
    {
      throw new KeyNotFoundException($"Competition with id '{id}' was not found");
    }
    _competitions.RemoveAt(index);
    return _competitions.Select(c => _mapper.Map<GetCompetitionResponseDto>(c)).ToList();
  }
}
