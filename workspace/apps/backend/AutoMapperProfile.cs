using AutoMapper;
using Microsoft.AspNetCore.Identity;
using Workspace.Backend.Dtos.Competition;
using Workspace.Backend.Dtos.LanguageExam;
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
      .ForMember(dest => dest.CreatorId, opt => opt.MapFrom(src => src.CreatorId))
      .ForMember(dest => dest.Participants, opt => opt.MapFrom(src => src.CompetitionParticipants));
    CreateMap<IdentityUser, GetUserResponseDto>()
      .ForMember(dest => dest.Email, opt => opt.MapFrom(src => src.UserName))
      .ForMember(dest => dest.FirstName, opt => opt.Ignore())
      .ForMember(dest => dest.LastName, opt => opt.Ignore())
      .ForMember(dest => dest.Role, opt => opt.Ignore());

    CreateMap<AddStudentRequestDto, Student>()
      .ForMember(dest => dest.FirstName, opt => opt.MapFrom(src => src.FirstName.Trim()))
      .ForMember(dest => dest.LastName, opt => opt.MapFrom(src => src.LastName.Trim()))
      .ForMember(dest => dest.Id, opt => opt.Ignore())
      .ForMember(dest => dest.CompetitionParticipants, opt => opt.Ignore())
      .ForMember(dest => dest.LanguageExams, opt => opt.Ignore());

    CreateMap<UpdateCompetitionRequestDto, Competition>()
      .ForMember(dest => dest.Id, opt => opt.Ignore())
      .ForMember(dest => dest.CompetitionParticipants, opt => opt.Ignore())
      .ForMember(dest => dest.Created, opt => opt.Ignore())
      .ForMember(dest => dest.UpdatedAt, opt => opt.Ignore())
      .ForMember(dest => dest.CreatorId, opt => opt.Ignore())
      .ForMember(dest => dest.Creator, opt => opt.Ignore());

    CreateMap<AddCompetitionRequestDto, Competition>()
      .ForMember(dest => dest.Id, opt => opt.Ignore())
      .ForMember(dest => dest.CompetitionParticipants, opt => opt.Ignore())
      .ForMember(dest => dest.Created, opt => opt.Ignore())
      .ForMember(dest => dest.UpdatedAt, opt => opt.Ignore())
      .ForMember(dest => dest.CreatorId, opt => opt.Ignore())
      .ForMember(dest => dest.Creator, opt => opt.Ignore());

    CreateMap<Student, StudentSearchResultDto>()
      .ForMember(dest => dest.CurrentClassYear, opt => opt.MapFrom(src => src.CompetitionParticipants
        .OrderByDescending(cp => cp.SchoolYear)
        .ThenByDescending(cp => cp.CreatedAt)
        .Select(cp => (int?)cp.ClassYear)
        .FirstOrDefault()))
      .ForMember(dest => dest.CurrentClassLetter, opt => opt.MapFrom(src => src.CompetitionParticipants
        .OrderByDescending(cp => cp.SchoolYear)
        .ThenByDescending(cp => cp.CreatedAt)
        .Select(cp => cp.ClassLetter)
        .FirstOrDefault()))
      .ForMember(dest => dest.Participations, opt => opt.MapFrom(src => src.CompetitionParticipants.OrderByDescending(cp => cp.SchoolYear)));

    CreateMap<CompetitionParticipant, StudentParticipationDto>()
      .ForMember(dest => dest.CompetitionName, opt => opt.MapFrom(src => src.Competition.Name))
      .ForMember(dest => dest.CompetitionDate, opt => opt.MapFrom(src => src.Competition.Date.ToDateTime(TimeOnly.MinValue)));

    CreateMap<LanguageExam, GetLanguageExamResponseDto>()
      .ForMember(dest => dest.StudentFirstName, opt => opt.MapFrom(src => src.Student != null ? src.Student.FirstName : string.Empty))
      .ForMember(dest => dest.StudentLastName,  opt => opt.MapFrom(src => src.Student != null ? src.Student.LastName  : string.Empty));

    CreateMap<CompetitionParticipant, ParticipantDto>()
      .ForMember(dest => dest.StudentId, opt => opt.MapFrom(src => src.StudentId))
      .ForMember(dest => dest.FirstName, opt => opt.MapFrom(src => src.Student != null ? src.Student.FirstName : "Unknown"))
      .ForMember(dest => dest.LastName, opt => opt.MapFrom(src => src.Student != null ? src.Student.LastName : "Student"))
      .ForMember(dest => dest.ClassYear, opt => opt.MapFrom(src => src.ClassYear))
      .ForMember(dest => dest.ClassLetter, opt => opt.MapFrom(src => src.ClassLetter))
      .ForMember(dest => dest.SchoolYear, opt => opt.MapFrom(src => src.SchoolYear));
  }
}
