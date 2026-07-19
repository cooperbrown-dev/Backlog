using Backlog.Api.Models;

using Microsoft.EntityFrameworkCore;

namespace Backlog.Api.Data;

public class BacklogDbContext(DbContextOptions<BacklogDbContext> options) : DbContext(options)

{
    public DbSet<BacklogItem> BacklogItems => Set<BacklogItem>();

    public DbSet<Movie> Movies => Set<Movie>();

    public DbSet<Show> Shows => Set<Show>();

    public DbSet<VideoGame> VideoGames => Set<VideoGame>();

    public DbSet<Vacation> Vacations => Set<Vacation>();

    public DbSet<Book> Books => Set<Book>();
}
