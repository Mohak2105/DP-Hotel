package com.dphotel.entity;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Entity
@Table(name = "event_bookings")
public class EventBooking {

    @Id
    @Column(length = 36)
    private String id;

    @JsonProperty("user_id")
    @Column(name = "user_id", length = 36)
    private String userId;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id", insertable = false, updatable = false)
    private User user;

    @JsonProperty("event_type")
    @Column(name = "event_type", nullable = false, length = 50)
    private String eventType;

    @JsonProperty("event_name")
    @Column(name = "event_name", nullable = false)
    private String eventName;

    @JsonProperty("event_date")
    @Column(name = "event_date", nullable = false)
    private LocalDate eventDate;

    @JsonProperty("start_time")
    @Column(name = "start_time", nullable = false)
    private LocalTime startTime;

    @JsonProperty("end_time")
    @Column(name = "end_time", nullable = false)
    private LocalTime endTime;

    @JsonProperty("guests_count")
    @Column(name = "guests_count", nullable = false)
    private Integer guestsCount;

    @Column(columnDefinition = "TEXT")
    private String requirements;

    @JsonProperty("total_amount")
    @Column(name = "total_amount", precision = 10, scale = 2)
    private BigDecimal totalAmount;

    @Column(length = 50)
    private String status = "inquiry";

    @JsonProperty("created_at")
    @Column(name = "created_at", insertable = false, updatable = false)
    private LocalDateTime createdAt;

    @JsonProperty("updated_at")
    @Column(name = "updated_at", insertable = false, updatable = false)
    private LocalDateTime updatedAt;

    public EventBooking() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public String getEventType() { return eventType; }
    public void setEventType(String eventType) { this.eventType = eventType; }

    public String getEventName() { return eventName; }
    public void setEventName(String eventName) { this.eventName = eventName; }

    public LocalDate getEventDate() { return eventDate; }
    public void setEventDate(LocalDate eventDate) { this.eventDate = eventDate; }

    public LocalTime getStartTime() { return startTime; }
    public void setStartTime(LocalTime startTime) { this.startTime = startTime; }

    public LocalTime getEndTime() { return endTime; }
    public void setEndTime(LocalTime endTime) { this.endTime = endTime; }

    public Integer getGuestsCount() { return guestsCount; }
    public void setGuestsCount(Integer guestsCount) { this.guestsCount = guestsCount; }

    public String getRequirements() { return requirements; }
    public void setRequirements(String requirements) { this.requirements = requirements; }

    public BigDecimal getTotalAmount() { return totalAmount; }
    public void setTotalAmount(BigDecimal totalAmount) { this.totalAmount = totalAmount; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    @JsonProperty("user_email")
    public String getUserEmail() { return user != null ? user.getEmail() : null; }

    @JsonProperty("first_name")
    public String getUserFirstName() { return user != null ? user.getFirstName() : null; }

    @JsonProperty("last_name")
    public String getUserLastName() { return user != null ? user.getLastName() : null; }

    @JsonProperty("phone")
    public String getUserPhone() { return user != null ? user.getPhone() : null; }
}
