using Backlog.Api.Common.Enums;
using Backlog.Api.Data;
using Backlog.Api.Dtos;
using Backlog.Api.Models;
using Microsoft.EntityFrameworkCore;
namespace Backlog.Api.Accessors;

public class BacklogAccessor(BacklogDbContext db) : IBacklogAccessor
{
    public async Task<List<BacklogItemDto>> GetAllAsync()
    {
        var entities = await db.BacklogItems.OrderByDescending(i => i.CreatedAt).ToListAsync();
        return entities.Select(ToDto).ToList();   // ⚠️ map AFTER ToListAsync — see gotcha
    }

    public async Task<BacklogItemDto> CreateAsync(CreateBacklogItemRequest request)
    {
        // BacklogItem is abstract — pick the concrete subtype from the Category.
        BacklogItem entity = request.Category switch
        {
            Category.Movie     => new Movie(),
            Category.Show      => new Show(),
            Category.VideoGame => new VideoGame(),
            Category.Book      => new Book(),
            Category.Vacation  => new Vacation(),
            _ => throw new ArgumentOutOfRangeException(nameof(request.Category)),
        };
        entity.Id = Guid.NewGuid();
        entity.Title = request.Title;
        entity.Status = BacklogStatus.NotStarted;
        // CreatedAt defaults to DateTime.UtcNow in the model — no need to set it here
        db.BacklogItems.Add(entity);
        await db.SaveChangesAsync();
        return ToDto(entity);
    }

    public async Task<BacklogItemDto?> UpdateAsync(Guid id, UpdateBacklogItemRequest request)
    {
        var entity = await db.BacklogItems.FindAsync(id);
        if (entity is null) return null;
        entity.Status = request.Status;
        entity.Rating = request.Rating;
        entity.Note = request.Note;
        await db.SaveChangesAsync();
        return ToDto(entity);
    }

    public async Task<bool> DeleteAsync(Guid id)
    {
        var entity = await db.BacklogItems.FindAsync(id);
        if (entity is null) return false;

        db.BacklogItems.Remove(entity);
        await db.SaveChangesAsync();
        return true;
    }

    private static BacklogItemDto ToDto(BacklogItem i) =>
        new(i.Id, i.Title, ToCategory(i), i.Status, i.CreatedAt, i.Rating, i.Note);

    private static Category ToCategory(BacklogItem i) => i switch
    {
        Movie => Category.Movie,
        Show => Category.Show,
        VideoGame => Category.VideoGame,
        Book => Category.Book,
        Vacation => Category.Vacation,
        _ => throw new ArgumentOutOfRangeException(nameof(i)),
    };
}