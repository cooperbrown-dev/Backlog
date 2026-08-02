using Backlog.Api.Dtos;
using Backlog.Api.Managers;
using Microsoft.AspNetCore.Mvc;
namespace Backlog.Api.Controllers;

[ApiController]
[Route("api/[controller]")] // => /api/backlogitems
public class BacklogItemsController(IBacklogManager manager) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<List<BacklogItemDto>>> Get() => await manager.GetItemsAsync();

    [HttpPost]
    public async Task<ActionResult<BacklogItemDto>> Post(CreateBacklogItemRequest request)
    {
        var created = await manager.AddItemAsync(request);
        return CreatedAtAction(nameof(Get), new { id = created.Id }, created);
    }

    [HttpPut("{id:guid}")]
    public async Task<ActionResult<BacklogItemDto>> Put(Guid id, UpdateBacklogItemRequest request)
    {
        var updated = await manager.UpdateItemAsync(id, request);
        return updated is null ? NotFound() : updated;
    }
}