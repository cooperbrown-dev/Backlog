using Backlog.Api.Common.Enums;

namespace Backlog.Api.Models;

public abstract class BacklogItem

{
    public Guid Id { get; set; }

    public string Title { get; set; } = string.Empty;

    public BacklogStatus Status { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public decimal? Rating { get; set; }

    public string? Note { get; set; }
}
