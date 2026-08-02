using Backlog.Api.Dtos;
namespace Backlog.Api.Accessors;

public interface IBacklogAccessor
{
    Task<List<BacklogItemDto>> GetAllAsync();
    Task<BacklogItemDto> CreateAsync(CreateBacklogItemRequest request);
    Task<BacklogItemDto?> UpdateAsync(Guid id, UpdateBacklogItemRequest request);
    Task<bool> DeleteAsync(Guid id);
}