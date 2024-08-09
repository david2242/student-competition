using Microsoft.AspNetCore.Authorization;
using Workspace.Backend.Models;
using Microsoft.AspNetCore.Mvc;
using Workspace.Backend.Dtos.Competition;
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

    [HttpGet(""), Authorize]
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

    [HttpGet("{id}"), Authorize]
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

    [HttpPost, Authorize]
    public async Task<ActionResult<ServiceResponse<List<GetCompetitionResponseDto>>>> AddCompetition(AddCompetitionRequestDto newCompetition)
    {
      var serviceResponse = new ServiceResponse<List<GetCompetitionResponseDto>>();
      try
      {
        serviceResponse.Data = await _competitionService.AddCompetition(newCompetition);
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

    [HttpPut("{id}"), Authorize]
    public async Task<ActionResult<ServiceResponse<GetCompetitionResponseDto>>> UpdateCompetition(int id, UpdateCompetitionRequestDto updatedCompetition)
    {
      var serviceResponse = new ServiceResponse<GetCompetitionResponseDto>();
      try
      {
        serviceResponse.Data = await _competitionService.UpdateCompetition(id, updatedCompetition);
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

    [HttpDelete("{id}"), Authorize]
    public async Task<ActionResult<ServiceResponse<List<GetCompetitionResponseDto>>>> DeleteCompetition(int id)
    {
      var serviceResponse = new ServiceResponse<List<GetCompetitionResponseDto>>();
      try
      {
        serviceResponse.Data = await _competitionService.DeleteCompetition(id);
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
  }
}
