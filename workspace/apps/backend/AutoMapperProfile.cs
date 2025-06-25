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
      .ForMember(dest => dest.Forms, opt => opt.MapFrom(src => src.Forms ?? Array.Empty<string>()))
      .ForMember(dest => dest.CreatorId, opt => opt.MapFrom(src => src.CreatorId));
    CreateMap<AddCompetitionRequestDto, Competition>();
    CreateMap<UpdateCompetitionRequestDto, Competition>();

    CreateMap<IdentityUser, GetUserResponseDto>()
      .ForMember(dest => dest.Email, opt => opt.MapFrom(src => src.UserName));

    CreateMap<AddStudentRequestDto, Student>()
      .ForMember(dest => dest.FirstName, opt => opt.MapFrom(src => src.FirstName.Trim()))
      .ForMember(dest => dest.LastName, opt => opt.MapFrom(src => src.LastName.Trim()));

    CreateMap<CompetitionParticipant, ParticipantDto>()
      .ForMember(dest => dest.StudentId, opt => opt.MapFrom(src => src.StudentId))
      .ForMember(dest => dest.FirstName, opt => opt.MapFrom(src => src.Student != null ? src.Student.FirstName : null))
      .ForMember(dest => dest.LastName, opt => opt.MapFrom(src => src.Student != null ? src.Student.LastName : null))
      .ForMember(dest => dest.ClassYear, opt => opt.MapFrom(src => src.ClassYear))
      .ForMember(dest => dest.ClassLetter, opt => opt.MapFrom(src => src.ClassLetter))
      .ForMember(dest => dest.SchoolYear, opt => opt.MapFrom(src => src.SchoolYear));
  }
}
