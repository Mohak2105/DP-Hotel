package com.dphotel.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.LocalDate;

public class BookingRequestDtos {

    public static class CreateBookingRequest {
        @NotNull(message = "Room ID is required")
        @JsonProperty("roomId")
        private String roomId;

        @NotNull(message = "Valid check-in date is required")
        @JsonProperty("checkInDate")
        private LocalDate checkInDate;

        @NotNull(message = "Valid check-out date is required")
        @JsonProperty("checkOutDate")
        private LocalDate checkOutDate;

        private Integer guests = 1;

        @JsonProperty("specialRequests")
        private String specialRequests;

        @JsonProperty("gstNumber")
        private String gstNumber;

        @JsonProperty("companyName")
        private String companyName;

        public String getRoomId() { return roomId; }
        public void setRoomId(String roomId) { this.roomId = roomId; }

        public LocalDate getCheckInDate() { return checkInDate; }
        public void setCheckInDate(LocalDate checkInDate) { this.checkInDate = checkInDate; }

        public LocalDate getCheckOutDate() { return checkOutDate; }
        public void setCheckOutDate(LocalDate checkOutDate) { this.checkOutDate = checkOutDate; }

        public Integer getGuests() { return guests; }
        public void setGuests(Integer guests) { this.guests = guests; }

        public String getSpecialRequests() { return specialRequests; }
        public void setSpecialRequests(String specialRequests) { this.specialRequests = specialRequests; }

        public String getGstNumber() { return gstNumber; }
        public void setGstNumber(String gstNumber) { this.gstNumber = gstNumber; }

        public String getCompanyName() { return companyName; }
        public void setCompanyName(String companyName) { this.companyName = companyName; }
    }

    public static class UpdateStatusRequest {
        private String status;
        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
    }
}
