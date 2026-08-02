using Backlog.Api.Dtos;
namespace Backlog.Api.Managers;

public interface IBacklogManager
{
    Task<List<BacklogItemDto>> GetItemsAsync();
    Task<BacklogItemDto> AddItemAsync(CreateBacklogItemRequest request);
    Task<BacklogItemDto?> UpdateItemAsync(Guid id, UpdateBacklogItemRequest request);
    Task<bool> DeleteItemAsync(Guid id);
}