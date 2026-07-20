using Backlog.Api.Common.Enums;
namespace Backlog.Api.Dtos;

public record BacklogItemDto(Guid Id, string Title, Category Category, BacklogStatus Status, decimal? Rating, String? Note);
public record CreateBacklogItemRequest(string Title, Category Category);
public record UpdateBacklogItemRequest(BacklogStatus Status, int? Rating);