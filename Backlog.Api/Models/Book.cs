namespace Backlog.Api.Models;
public abstract class Book : MediaItem

{
    public int? TotalPages { get; set; }
}