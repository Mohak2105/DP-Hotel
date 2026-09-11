package com.dphotel.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;
import java.util.Map;

public class PaymentRequestDtos {

    public static class InitiateRequest {
        @NotBlank(message = "Booking ID is required")
        @JsonProperty("bookingId")
        private String bookingId;

        @NotBlank(message = "Payment method is required")
        @JsonProperty("paymentMethod")
        private String paymentMethod;

        @JsonProperty("cardLastFour")
        private String cardLastFour;

        @JsonProperty("cardBrand")
        private String cardBrand;

        @JsonProperty("upiId")
        private String upiId;

        public String getBookingId() { return bookingId; }
        public void setBookingId(String bookingId) { this.bookingId = bookingId; }

        public String getPaymentMethod() { return paymentMethod; }
        public void setPaymentMethod(String paymentMethod) { this.paymentMethod = paymentMethod; }

        public String getCardLastFour() { return cardLastFour; }
        public void setCardLastFour(String cardLastFour) { this.cardLastFour = cardLastFour; }

        public String getCardBrand() { return cardBrand; }
        public void setCardBrand(String cardBrand) { this.cardBrand = cardBrand; }

        public String getUpiId() { return upiId; }
        public void setUpiId(String upiId) { this.upiId = upiId; }
    }

    public static class RefundRequest {
        private String reason;
        public String getReason() { return reason; }
        public void setReason(String reason) { this.reason = reason; }
    }
}
