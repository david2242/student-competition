using AutoMapper;
using Microsoft.AspNetCore.Identity;
using Workspace.Backend.Dtos.Competition;
using Workspace.Backend.Dtos.Student;
using Workspace.Backend.Dtos.User;
using Workspace.Backend.Models;

namespace Workspace.Backend;

public class AutoMapperProfile : Profile
{
  public AutoMapperProfile()
  {
    CreateMap<Competition, GetCompetitionResponseDto>()
      .ForMember(dest => dest.Students, opt => opt.MapFrom(src => src.CompetitionStudents.Select(cs => cs.Student).ToArray()))
      .ForMember(dest => dest.Forms, opt => opt.MapFrom(src => src.CompetitionForms.Select(cf => cf.Form.Name).ToArray()));
    CreateMap<AddCompetitionRequestDto, Competition>();
    CreateMap<UpdateCompetitionRequestDto, Competition>();
    CreateMap<IdentityUser, GetUserResponseDto>()
      .ForMember(dest => dest.Email, opt => opt.MapFrom(src => src.UserName));
    CreateMap<AddStudentRequestDto, Student>()
      .ForMember(dest => dest.Name, opt => opt.MapFrom(src => src.Name))
      .ForMember(dest => dest.Class, opt => opt.MapFrom(src => src.Class));
  }
}
