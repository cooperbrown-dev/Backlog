namespace Backlog.Api.Models;

public enum Category { Movie, Show, VideoGame, Book, Vacation }

public enum BacklogStatus { Backlog, InProgress, Done }

public abstract class BacklogItem

{

    public Guid Id { get; set; }

    public string Title { get; set; } = string.Empty;

    public Category Category { get; set; }

    public BacklogStatus Status { get; set; }

    public decimal? Rating { get; set; }

    public string? Note { get; set; }

    // public int? YearReleased { get; set; }

}
