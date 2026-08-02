using Backlog.Api.Accessors;
using Backlog.Api.Dtos;
namespace Backlog.Api.Managers;

public class BacklogManager(IBacklogAccessor accessor) : IBacklogManager
{
    public Task<List<BacklogItemDto>> GetItemsAsync() => accessor.GetAllAsync();
    public Task<BacklogItemDto> AddItemAsync(CreateBacklogItemRequest request) => accessor.CreateAsync(request);
    public Task<BacklogItemDto?> UpdateItemAsync(Guid id, UpdateBacklogItemRequest request) => accessor.UpdateAsync(id, request);
    public Task<bool> DeleteItemAsync(Guid id) => accessor.DeleteAsync(id);
}