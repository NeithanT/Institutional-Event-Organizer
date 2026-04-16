using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore;

namespace api.Models;

public partial class EventOrganizerContext : DbContext
{
    public EventOrganizerContext()
    {
    }

    public EventOrganizerContext(DbContextOptions<EventOrganizerContext> options)
        : base(options)
    {
    }

    public virtual DbSet<Announcement> Announcements { get; set; }

    public virtual DbSet<Attendance> Attendances { get; set; }

    public virtual DbSet<CanceledEvent> CanceledEvents { get; set; }

    public virtual DbSet<Category> Categories { get; set; }

    public virtual DbSet<Event> Events { get; set; }

    public virtual DbSet<Inscription> Inscriptions { get; set; }

    public virtual DbSet<Mail> Mail { get; set; }

    public virtual DbSet<OrganizerEntity> OrganizerEntities { get; set; }

    public virtual DbSet<Role> Roles { get; set; }

    public virtual DbSet<User> Users { get; set; }

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
    {
        if (!optionsBuilder.IsConfigured)
        {
            optionsBuilder.UseNpgsql("Host=localhost;Port=5432;Database=EventOrganizer;Username=postgres;Password=postgres123");
        }
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Announcement>(entity =>
        {
            entity.ToTable("Announcement");

            entity.Property(e => e.About)
                .HasMaxLength(100)
                .IsUnicode(false);
            entity.Property(e => e.Body)
                .HasMaxLength(1000)
                .IsUnicode(false);
            entity.Property(e => e.Title)
                .HasMaxLength(100)
                .IsUnicode(false);

            entity.HasOne(d => d.Writer).WithMany(p => p.Announcements)
                .HasForeignKey(d => d.WriterId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Announcement_User");

            entity.HasOne(d => d.Event).WithMany()
                .HasForeignKey(d => d.EventId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Announcement_Event");
        });

        modelBuilder.Entity<Attendance>(entity =>
        {
            entity.ToTable("Attendance");

            entity.HasIndex(e => new { e.EventId, e.UserId }, "UQ_Attendance_Event_User").IsUnique();

            entity.HasOne(d => d.Event).WithMany(p => p.Attendances)
                .HasForeignKey(d => d.EventId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Attendance_Event");

            entity.HasOne(d => d.User).WithMany(p => p.Attendances)
                .HasForeignKey(d => d.UserId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Attendance_User");
        });

        modelBuilder.Entity<CanceledEvent>(entity =>
        {
            entity.ToTable("CanceledEvent");

            entity.HasIndex(e => e.EventId, "UQ_CanceledEvent_EventId").IsUnique();

            entity.Property(e => e.Reason)
                .HasMaxLength(500)
                .IsUnicode(false);

            entity.HasOne(d => d.Event).WithOne(p => p.CanceledEvent)
                .HasForeignKey<CanceledEvent>(d => d.EventId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_CanceledEvent_Event");
        });

        modelBuilder.Entity<Category>(entity =>
        {
            entity.ToTable("Category");

            entity.HasIndex(e => e.NameCategory, "UQ_Category_NameCategory").IsUnique();

            entity.Property(e => e.NameCategory)
                .HasMaxLength(50)
                .IsUnicode(false);
        });

        modelBuilder.Entity<Event>(entity =>
        {
            entity.ToTable("Event");

            entity.Property(e => e.EventDate).HasColumnType("timestamp without time zone");
            entity.Property(e => e.ReminderSent).HasDefaultValue(false);
            entity.Property(e => e.EventDescription)
                .HasMaxLength(300)
                .IsUnicode(false);
            entity.Property(e => e.Place)
                .HasMaxLength(100)
                .IsUnicode(false);
            entity.Property(e => e.Title)
                .HasMaxLength(100)
                .IsUnicode(false);

            entity.HasOne(d => d.Category).WithMany(p => p.Events)
                .HasForeignKey(d => d.CategoryId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Event_Category");

            entity.HasOne(d => d.OrganizerEntity).WithMany(p => p.Events)
                .HasForeignKey(d => d.OrganizerEntityId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Event_OrganizerEntity");

            entity.HasOne(d => d.Organizer).WithMany(p => p.Events)
                .HasForeignKey(d => d.OrganizerId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Event_Organizer");
        });

        modelBuilder.Entity<Inscription>(entity =>
        {
            entity.Property(e => e.InscriptionDate).HasColumnType("timestamp without time zone");

            entity.HasIndex(e => new { e.EventId, e.UserId }, "UQ_Inscriptions_Event_User").IsUnique();

            entity.HasOne(d => d.Event).WithMany(p => p.Inscriptions)
                .HasForeignKey(d => d.EventId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Inscriptions_Event");

            entity.HasOne(d => d.User).WithMany(p => p.Inscriptions)
                .HasForeignKey(d => d.UserId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Inscriptions_User");
        });

        modelBuilder.Entity<Mail>(entity =>
        {
            entity.Property(e => e.About)
                .HasMaxLength(100)
                .IsUnicode(false);
            entity.Property(e => e.Body)
                .HasMaxLength(1000)
                .IsUnicode(false);
            entity.Property(e => e.Title)
                .HasMaxLength(100)
                .IsUnicode(false);

            entity.HasOne(d => d.Event).WithMany(p => p.Mail)
                .HasForeignKey(d => d.EventId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Mail_Event");

            entity.HasOne(d => d.Writer).WithMany(p => p.Mail)
                .HasForeignKey(d => d.WriterId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Mail_User");
        });

        modelBuilder.Entity<OrganizerEntity>(entity =>
        {
            entity.ToTable("OrganizerEntity");

            entity.HasIndex(e => e.EntityName, "UQ_OrganizerEntity_EntityName").IsUnique();

            entity.Property(e => e.EntityName)
                .HasMaxLength(50)
                .IsUnicode(false);
        });

        modelBuilder.Entity<Role>(entity =>
        {
            entity.ToTable("Role");

            entity.HasIndex(e => e.RolName, "UQ_Role_RolName").IsUnique();

            entity.Property(e => e.RolName)
                .HasMaxLength(50)
                .IsUnicode(false);
        });

        modelBuilder.Entity<User>(entity =>
        {
            entity.ToTable("User");

            entity.HasIndex(e => e.Email, "UQ_User_Email").IsUnique();

            entity.Property(e => e.Active).HasDefaultValue(true);
            entity.Property(e => e.Email)
                .HasMaxLength(100)
                .IsUnicode(false);
            entity.Property(e => e.UserName)
                .HasMaxLength(100)
                .IsUnicode(false);
            entity.Property(e => e.UserPass)
                .HasMaxLength(50)
                .IsUnicode(false);
            entity.Property(e => e.Biography)
                .HasMaxLength(2000)
                .IsUnicode(false);
            entity.Property(e => e.UrlImageProfile)
                .IsUnicode(false);
            entity.Property(e => e.PreferredLanguage)
                .HasMaxLength(50)
                .IsUnicode(false);

            entity.HasOne(d => d.Role).WithMany(p => p.Users)
                .HasForeignKey(d => d.RoleId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_User_Role");
        });

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}
