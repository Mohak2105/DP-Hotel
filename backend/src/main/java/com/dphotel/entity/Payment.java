package com.dphotel.entity;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "payments")
public class Payment {

    @Id
    @Column(length = 36)
    private String id;

    @JsonProperty("booking_id")
    @Column(name = "booking_id", nullable = false, length = 36)
    private String bookingId;

    @JsonProperty("user_id")
    @Column(name = "user_id", nullable = false, length = 36)
    private String userId;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "booking_id", insertable = false, updatable = false)
    private Booking booking;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id", insertable = false, updatable = false)
    private User user;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal amount;

    @JsonProperty("payment_method")
    @Column(name = "payment_method", nullable = false, length = 50)
    private String paymentMethod;

    @JsonProperty("payment_status")
    @Column(name = "payment_status", nullable = false, length = 50)
    private String paymentStatus = "pending";

    @JsonProperty("transaction_id")
    @Column(name = "transaction_id", length = 255)
    private String transactionId;

    @JsonProperty("card_last_four")
    @Column(name = "card_last_four", length = 4)
    private String cardLastFour;

    @JsonProperty("card_brand")
    @Column(name = "card_brand", length = 50)
    private String cardBrand;

    @JsonProperty("upi_id")
    @Column(name = "upi_id", length = 255)
    private String upiId;

    @JsonProperty("payment_gateway_response")
    @Column(name = "payment_gateway_response", columnDefinition = "JSON")
    private String paymentGatewayResponse;

    @JsonProperty("paid_at")
    @Column(name = "paid_at")
    private LocalDateTime paidAt;

    @JsonProperty("created_at")
    @Column(name = "created_at", insertable = false, updatable = false)
    private LocalDateTime createdAt;

    @JsonProperty("updated_at")
    @Column(name = "updated_at", insertable = false, updatable = false)
    private LocalDateTime updatedAt;

    public Payment() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getBookingId() { return bookingId; }
    public void setBookingId(String bookingId) { this.bookingId = bookingId; }

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }

    public Booking getBooking() { return booking; }
    public void setBooking(Booking booking) { this.booking = booking; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }

    public String getPaymentMethod() { return paymentMethod; }
    public void setPaymentMethod(String paymentMethod) { this.paymentMethod = paymentMethod; }

    public String getPaymentStatus() { return paymentStatus; }
    public void setPaymentStatus(String paymentStatus) { this.paymentStatus = paymentStatus; }

    public String getTransactionId() { return transactionId; }
    public void setTransactionId(String transactionId) { this.transactionId = transactionId; }

    public String getCardLastFour() { return cardLastFour; }
    public void setCardLastFour(String cardLastFour) { this.cardLastFour = cardLastFour; }

    public String getCardBrand() { return cardBrand; }
    public void setCardBrand(String cardBrand) { this.cardBrand = cardBrand; }

    public String getUpiId() { return upiId; }
    public void setUpiId(String upiId) { this.upiId = upiId; }

    public String getPaymentGatewayResponse() { return paymentGatewayResponse; }
    public void setPaymentGatewayResponse(String paymentGatewayResponse) { this.paymentGatewayResponse = paymentGatewayResponse; }

    public LocalDateTime getPaidAt() { return paidAt; }
    public void setPaidAt(LocalDateTime paidAt) { this.paidAt = paidAt; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    @JsonProperty("check_in_date")
    public LocalDate getCheckInDate() { return booking != null ? booking.getCheckInDate() : null; }

    @JsonProperty("check_out_date")
    public LocalDate getCheckOutDate() { return booking != null ? booking.getCheckOutDate() : null; }

    @JsonProperty("booking_status")
    public String getBookingStatus() { return booking != null ? booking.getStatus() : null; }

    @JsonProperty("room_number")
    public String getRoomNumber() { return (booking != null && booking.getRoom() != null) ? booking.getRoom().getRoomNumber() : null; }

    @JsonProperty("room_name")
    public String getRoomName() { return (booking != null && booking.getRoom() != null) ? booking.getRoom().getName() : null; }

    @JsonProperty("user_email")
    public String getUserEmail() { return user != null ? user.getEmail() : null; }

    @JsonProperty("user_first_name")
    public String getUserFirstName() { return user != null ? user.getFirstName() : null; }

    @JsonProperty("user_last_name")
    public String getUserLastName() { return user != null ? user.getLastName() : null; }
}
