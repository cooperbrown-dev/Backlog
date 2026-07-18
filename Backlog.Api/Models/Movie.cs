namespace Backlog.Api.Models;
public abstract class Movie : MediaItem

{
    public int? RuntimeMinutes { get; set; }
}