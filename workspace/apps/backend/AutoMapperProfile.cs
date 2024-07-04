using AutoMapper;
using Workspace.Backend.Dtos.Competition;
using Workspace.Backend.Models;

namespace Workspace.Backend;

public class AutoMapperProfile : Profile
{
  public AutoMapperProfile()
  {
    CreateMap<Competition, GetCompetitionResponseDto>();
    CreateMap<AddCompetitionRequestDto, Competition>();
    CreateMap<UpdateCompetitionRequestDto, Competition>();
  }
}
