namespace Backlog.Api.Models;
public abstract class VideoGame : MediaItem

{
    public int? HowLongToBeat { get; set; }
}