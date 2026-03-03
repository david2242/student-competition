using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Workspace.Backend.Data;
using Workspace.Backend.Dtos.Student;
using Workspace.Backend.Exceptions;
using Workspace.Backend.Services.StudentService;
using Workspace.Backend.Services;
using AutoMapper;
using AutoMapper.QueryableExtensions;

namespace Workspace.Backend.Services.StudentService;

public class StudentService : IStudentService
{
    private readonly DataContext _context;
    private readonly IMapper _mapper;
    private const int DefaultSearchLimit = 5;
    private readonly ILogger<StudentService> _logger;

    public StudentService(DataContext context, IMapper mapper, ILogger<StudentService> logger)
    {
        _context = context;
        _mapper = mapper;
        _logger = logger;
    }

    public async Task<StudentSearchResponseDto> SearchStudentsAsync(StudentSearchRequestDto searchRequest)
    {
        if (searchRequest == null)
            throw new ArgumentNullException(nameof(searchRequest));

        var query = _context.Students.AsQueryable();
        var searchQuery = searchRequest.Query.Trim();

        var searchTerms = searchQuery.Split(' ', StringSplitOptions.RemoveEmptyEntries);

        if (searchTerms.Length > 0)
        {
            foreach (var term in searchTerms)
            {
                var term1 = term.ToLower();
                query = query.Where(s =>
                    s.FirstName.ToLower().Contains(term1) ||
                    s.LastName.ToLower().Contains(term1));
            }
        }

        if (searchRequest.ClassYear.HasValue)
        {
            query = query.Where(s => s.CompetitionParticipants
                .Any(cp => cp.ClassYear == searchRequest.ClassYear.Value));
        }

        if (!string.IsNullOrWhiteSpace(searchRequest.ClassLetter))
        {
            var classLetter = searchRequest.ClassLetter.Trim().ToUpper();
            query = query.Where(s => s.CompetitionParticipants
                .Any(cp => cp.ClassLetter.ToUpper() == classLetter));
        }

        if (searchRequest.SchoolYear.HasValue)
        {
            query = query.Where(s => s.CompetitionParticipants
                .Any(cp => cp.SchoolYear == searchRequest.SchoolYear.Value));
        }

        var totalCount = await query.CountAsync();

        var students = await query
            .OrderBy(s => s.LastName)
            .ThenBy(s => s.FirstName)
            .Take(searchRequest.Limit > 0 ? searchRequest.Limit : DefaultSearchLimit)
            .ProjectTo<StudentSearchResultDto>(_mapper.ConfigurationProvider)
            .ToListAsync();

        try
        {
            return new StudentSearchResponseDto
            {
                Results = students,
                TotalCount = totalCount
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error searching for students");
            throw;
        }
    }
}
