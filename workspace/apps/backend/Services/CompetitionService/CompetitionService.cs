using AutoMapper;
using Workspace.Backend.Data;
using Workspace.Backend.Dtos.Competition;
using Workspace.Backend.Models;

namespace Workspace.Backend.Services.CompetitionService;

public class CompetitionService : ICompetitionService
{
  private readonly IMapper _mapper;
  private readonly DataContext _context;
  public CompetitionService(IMapper mapper, DataContext context)
  {
    _mapper = mapper;
    _context = context;
  }
  public async Task<List<GetCompetitionResponseDto>> GetAll()
  {
    var competitions = await _context.Competitions.ToListAsync();
    return competitions.Select(c => _mapper.Map<GetCompetitionResponseDto>(c)).ToList();
  }

  public async Task<GetCompetitionResponseDto> GetSingle(int id)
  {
    var competition = await _context.Competitions.FirstOrDefaultAsync(x => x.Id == id);
    if (competition == null)
    {
      throw new KeyNotFoundException($"Competition with id '{id}' was not found");
    }
    return _mapper.Map<GetCompetitionResponseDto>(competition);
  }

  public async Task<List<GetCompetitionResponseDto>> AddCompetition(AddCompetitionRequestDto newCompetition)
  {
    var competition = _mapper.Map<Competition>(newCompetition);
    competition.Date = DateTime.UtcNow;
    await _context.Competitions.AddAsync(_mapper.Map<Competition>(competition));
    await _context.SaveChangesAsync();
    var updatedCompetitions = await _context.Competitions.ToListAsync();
    return updatedCompetitions.Select(c => _mapper.Map<GetCompetitionResponseDto>(c)).ToList();
  }

  public async Task<GetCompetitionResponseDto> UpdateCompetition(int id, UpdateCompetitionRequestDto updatedCompetition)
  {
    var competition = await _context.Competitions.FirstOrDefaultAsync(x => x.Id == id);
    if (competition == null)
    {
      throw new KeyNotFoundException($"Competition with id '{id}' was not found");
    }
    _mapper.Map(updatedCompetition, competition);
    await _context.SaveChangesAsync();
    return _mapper.Map<GetCompetitionResponseDto>(competition);
  }

  public async Task<List<GetCompetitionResponseDto>> DeleteCompetition(int id)
  {
    var competition = await _context.Competitions.FirstOrDefaultAsync(x => x.Id == id);
    if (competition == null)
    {
      throw new KeyNotFoundException($"Competition with id '{id}' was not found");
    }
    _context.Competitions.Remove(competition);
    await _context.SaveChangesAsync();
    var competitions = await _context.Competitions.ToListAsync();
    return competitions.Select(c => _mapper.Map<GetCompetitionResponseDto>(c)).ToList();
  }
}
