namespace Backlog.Api.Models;
public abstract class Vacation : MediaItem

{
    public decimal? EstimatedCost { get; set; }

    public int? HowManyDays { get; set; }
}