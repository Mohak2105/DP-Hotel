package com.dphotel.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

public class OtherDtos {

    public static class ContactMessageRequest {
        @NotBlank(message = "Name is required")
        private String name;

        @NotBlank(message = "Valid email is required")
        @Email(message = "Valid email is required")
        private String email;

        private String phone;
        private String subject;

        @NotBlank(message = "Message is required")
        private String message;

        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public String getPhone() { return phone; }
        public void setPhone(String phone) { this.phone = phone; }
        public String getSubject() { return subject; }
        public void setSubject(String subject) { this.subject = subject; }
        public String getMessage() { return message; }
        public void setMessage(String message) { this.message = message; }
    }

    public static class EventBookingRequest {
        @NotBlank(message = "Event type is required")
        @JsonProperty("eventType")
        private String eventType;

        @NotBlank(message = "Event name is required")
        @JsonProperty("eventName")
        private String eventName;

        @NotNull(message = "Valid event date is required")
        @JsonProperty("eventDate")
        private LocalDate eventDate;

        @NotNull(message = "Start time is required")
        @JsonProperty("startTime")
        private LocalTime startTime;

        @NotNull(message = "End time is required")
        @JsonProperty("endTime")
        private LocalTime endTime;

        @NotNull(message = "Number of guests is required")
        @JsonProperty("guestsCount")
        private Integer guestsCount;

        private String requirements;

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
    }

    public static class UpdateEventStatusRequest {
        private String status;
        @JsonProperty("totalAmount")
        private BigDecimal totalAmount;

        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
        public BigDecimal getTotalAmount() { return totalAmount; }
        public void setTotalAmount(BigDecimal totalAmount) { this.totalAmount = totalAmount; }
    }

    public static class RoomRequest {
        @JsonProperty("roomNumber")
        private String roomNumber;

        @JsonProperty("roomType")
        private String roomType;

        private String name;
        private String description;

        @JsonProperty("pricePerNight")
        private BigDecimal pricePerNight;

        private Integer capacity;
        private List<String> amenities;
        private List<String> images;

        @JsonProperty("isAvailable")
        private Boolean isAvailable;

        public String getRoomNumber() { return roomNumber; }
        public void setRoomNumber(String roomNumber) { this.roomNumber = roomNumber; }
        public String getRoomType() { return roomType; }
        public void setRoomType(String roomType) { this.roomType = roomType; }
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
        public BigDecimal getPricePerNight() { return pricePerNight; }
        public void setPricePerNight(BigDecimal pricePerNight) { this.pricePerNight = pricePerNight; }
        public Integer getCapacity() { return capacity; }
        public void setCapacity(Integer capacity) { this.capacity = capacity; }
        public List<String> getAmenities() { return amenities; }
        public void setAmenities(List<String> amenities) { this.amenities = amenities; }
        public List<String> getImages() { return images; }
        public void setImages(List<String> images) { this.images = images; }
        public Boolean getIsAvailable() { return isAvailable; }
        public void setIsAvailable(Boolean isAvailable) { this.isAvailable = isAvailable; }
    }
}
