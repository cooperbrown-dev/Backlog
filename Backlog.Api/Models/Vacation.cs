namespace Backlog.Api.Models;
public class Vacation : MediaItem

{
    public decimal? EstimatedCost { get; set; }

    public int? HowManyDays { get; set; }
}