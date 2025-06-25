using System.Security.Claims;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Workspace.Backend.Dtos.Competition;
using Workspace.Backend.Models;
using Workspace.Backend.Services.CompetitionService;

namespace Workspace.Backend.Controllers
{
  [ApiController]
  [Route("api/[controller]")]
  public class CompetitionController : ControllerBase
  {
    private readonly ICompetitionService _competitionService;
    public CompetitionController(ICompetitionService competitionService)
    {
      _competitionService = competitionService;
    }

    [HttpGet(""), Authorize(Roles = "admin,contributor,viewer")]
    public async Task<ActionResult<ServiceResponse<List<GetCompetitionResponseDto>>>> GetAll()
    {
      var serviceResponse = new ServiceResponse<List<GetCompetitionResponseDto>>();
      try
      {
        serviceResponse.Data = await _competitionService.GetAll();
        return Ok(serviceResponse);
      }
      catch (Exception e)
      {
        serviceResponse.Data = null;
        serviceResponse.Success = false;
        serviceResponse.Message = e.Message;
        return BadRequest(serviceResponse);
      }
    }

    [HttpGet("{id}"), Authorize(Roles = "admin,contributor,viewer")]
    public async Task<ActionResult<ServiceResponse<GetCompetitionResponseDto>>> GetSingle(int id)
    {
      var serviceResponse = new ServiceResponse<GetCompetitionResponseDto>();
      try
      {
        serviceResponse.Data = await _competitionService.GetSingle(id);
        return Ok(serviceResponse);
      }
      catch (KeyNotFoundException e)
      {
        serviceResponse.Data = null;
        serviceResponse.Success = false;
        serviceResponse.Message = e.Message;
        return NotFound(serviceResponse);
      }
      catch (Exception e)
      {
        serviceResponse.Data = null;
        serviceResponse.Success = false;
        serviceResponse.Message = e.Message;
        return BadRequest(serviceResponse);
      }
    }

    [HttpPost, Authorize(Roles = "admin,contributor")]
    public async Task<ActionResult<ServiceResponse<List<GetCompetitionResponseDto>>>> AddCompetition(AddCompetitionRequestDto newCompetition)
    {
      var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);
      if (string.IsNullOrEmpty(currentUserId))
      {
        return Unauthorized(new ServiceResponse<List<GetCompetitionResponseDto>> { Success = false, Message = "User not authenticated" });
      }

      var serviceResponse = new ServiceResponse<List<GetCompetitionResponseDto>>();
      try
      {
        serviceResponse.Data = await _competitionService.AddCompetition(newCompetition, currentUserId);
        return Ok(serviceResponse);
      }
      catch (UnauthorizedAccessException e)
      {
        serviceResponse.Data = null;
        serviceResponse.Success = false;
        serviceResponse.Message = e.Message;
        return Forbid();
      }
      catch (Exception e)
      {
        serviceResponse.Data = null;
        serviceResponse.Success = false;
        serviceResponse.Message = e.Message;
        return BadRequest(serviceResponse);
      }
    }

    [HttpPut("{id}"), Authorize(Roles = "admin,contributor")]
    public async Task<ActionResult<ServiceResponse<GetCompetitionResponseDto>>> UpdateCompetition(int id, UpdateCompetitionRequestDto updatedCompetition)
    {
      var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);
      if (string.IsNullOrEmpty(currentUserId))
      {
        return Unauthorized(new ServiceResponse<GetCompetitionResponseDto> { Success = false, Message = "User not authenticated" });
      }

      var serviceResponse = new ServiceResponse<GetCompetitionResponseDto>();
      try
      {
        serviceResponse.Data = await _competitionService.UpdateCompetition(id, updatedCompetition, currentUserId);
        return Ok(serviceResponse);
      }
      catch (KeyNotFoundException e)
      {
        serviceResponse.Data = null;
        serviceResponse.Success = false;
        serviceResponse.Message = e.Message;
        return NotFound(serviceResponse);
      }
      catch (UnauthorizedAccessException e)
      {
        serviceResponse.Data = null;
        serviceResponse.Success = false;
        serviceResponse.Message = e.Message;
        return Forbid();
      }
      catch (Exception e)
      {
        serviceResponse.Data = null;
        serviceResponse.Success = false;
        serviceResponse.Message = e.Message;
        return BadRequest(serviceResponse);
      }
    }

    [HttpDelete("{id}"), Authorize(Roles = "admin,contributor")]
    public async Task<ActionResult<ServiceResponse<List<GetCompetitionResponseDto>>>> DeleteCompetition(int id)
    {
      var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);
      if (string.IsNullOrEmpty(currentUserId))
      {
        return Unauthorized(new ServiceResponse<List<GetCompetitionResponseDto>> { Success = false, Message = "User not authenticated" });
      }

      var serviceResponse = new ServiceResponse<List<GetCompetitionResponseDto>>();
      try
      {
        serviceResponse.Data = await _competitionService.DeleteCompetition(id, currentUserId);
        return Ok(serviceResponse);
      }
      catch (KeyNotFoundException e)
      {
        serviceResponse.Data = null;
        serviceResponse.Success = false;
        serviceResponse.Message = e.Message;
        return NotFound(serviceResponse);
      }
      catch (UnauthorizedAccessException e)
      {
        serviceResponse.Data = null;
        serviceResponse.Success = false;
        serviceResponse.Message = e.Message;
        return Forbid();
      }
      catch (Exception e)
      {
        serviceResponse.Data = null;
        serviceResponse.Success = false;
        serviceResponse.Message = e.Message;
        return BadRequest(serviceResponse);
      }
    }
  }
}
