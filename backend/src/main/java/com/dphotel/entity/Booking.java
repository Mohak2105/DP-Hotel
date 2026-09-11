package com.dphotel.entity;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "bookings")
public class Booking {

    @Id
    @Column(length = 36)
    private String id;

    @JsonProperty("user_id")
    @Column(name = "user_id", nullable = false, length = 36)
    private String userId;

    @JsonProperty("room_id")
    @Column(name = "room_id", nullable = false, length = 36)
    private String roomId;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id", insertable = false, updatable = false)
    private User user;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "room_id", insertable = false, updatable = false)
    private Room room;

    @JsonProperty("check_in_date")
    @Column(name = "check_in_date", nullable = false)
    private LocalDate checkInDate;

    @JsonProperty("check_out_date")
    @Column(name = "check_out_date", nullable = false)
    private LocalDate checkOutDate;

    @Column(nullable = false)
    private Integer guests = 1;

    @JsonProperty("total_nights")
    @Column(name = "total_nights", nullable = false)
    private Integer totalNights;

    @JsonProperty("total_amount")
    @Column(name = "total_amount", nullable = false, precision = 10, scale = 2)
    private BigDecimal totalAmount;

    @JsonProperty("special_requests")
    @Column(name = "special_requests", columnDefinition = "TEXT")
    private String specialRequests;

    @JsonProperty("gst_number")
    @Column(name = "gst_number", length = 50)
    private String gstNumber;

    @JsonProperty("company_name")
    @Column(name = "company_name", length = 255)
    private String companyName;

    @Column(length = 20)
    private String status = "pending";

    @JsonProperty("created_at")
    @Column(name = "created_at", insertable = false, updatable = false)
    private LocalDateTime createdAt;

    @JsonProperty("updated_at")
    @Column(name = "updated_at", insertable = false, updatable = false)
    private LocalDateTime updatedAt;

    public Booking() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }

    public String getRoomId() { return roomId; }
    public void setRoomId(String roomId) { this.roomId = roomId; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public Room getRoom() { return room; }
    public void setRoom(Room room) { this.room = room; }

    public LocalDate getCheckInDate() { return checkInDate; }
    public void setCheckInDate(LocalDate checkInDate) { this.checkInDate = checkInDate; }

    public LocalDate getCheckOutDate() { return checkOutDate; }
    public void setCheckOutDate(LocalDate checkOutDate) { this.checkOutDate = checkOutDate; }

    public Integer getGuests() { return guests; }
    public void setGuests(Integer guests) { this.guests = guests; }

    public Integer getTotalNights() { return totalNights; }
    public void setTotalNights(Integer totalNights) { this.totalNights = totalNights; }

    public BigDecimal getTotalAmount() { return totalAmount; }
    public void setTotalAmount(BigDecimal totalAmount) { this.totalAmount = totalAmount; }

    public String getSpecialRequests() { return specialRequests; }
    public void setSpecialRequests(String specialRequests) { this.specialRequests = specialRequests; }

    public String getGstNumber() { return gstNumber; }
    public void setGstNumber(String gstNumber) { this.gstNumber = gstNumber; }

    public String getCompanyName() { return companyName; }
    public void setCompanyName(String companyName) { this.companyName = companyName; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    // Convenience getters for JSON output to match Node response
    @JsonProperty("user_email")
    public String getUserEmail() { return user != null ? user.getEmail() : null; }

    @JsonProperty("user_first_name")
    public String getUserFirstName() { return user != null ? user.getFirstName() : null; }

    @JsonProperty("user_last_name")
    public String getUserLastName() { return user != null ? user.getLastName() : null; }

    @JsonProperty("user_phone")
    public String getUserPhone() { return user != null ? user.getPhone() : null; }

    @JsonProperty("room_number")
    public String getRoomNumber() { return room != null ? room.getRoomNumber() : null; }

    @JsonProperty("room_type")
    public String getRoomType() { return room != null ? room.getRoomType() : null; }

    @JsonProperty("room_name")
    public String getRoomName() { return room != null ? room.getName() : null; }

    @JsonProperty("price_per_night")
    public BigDecimal getPricePerNight() { return room != null ? room.getPricePerNight() : null; }
}
