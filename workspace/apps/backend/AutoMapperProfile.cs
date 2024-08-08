using AutoMapper;
using Microsoft.AspNetCore.Identity;
using Workspace.Backend.Dtos.Competition;
using Workspace.Backend.Dtos.User;
using Workspace.Backend.Models;

namespace Workspace.Backend;

public class AutoMapperProfile : Profile
{
  public AutoMapperProfile()
  {
    CreateMap<Competition, GetCompetitionResponseDto>();
    CreateMap<AddCompetitionRequestDto, Competition>();
    CreateMap<UpdateCompetitionRequestDto, Competition>();
    CreateMap<IdentityUser, GetUserResponseDto>()
      .ForMember(dest => dest.Email, opt => opt.MapFrom(src => src.UserName));
  }
}
