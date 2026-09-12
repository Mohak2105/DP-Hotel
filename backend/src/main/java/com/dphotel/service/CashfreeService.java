package com.dphotel.service;

import com.dphotel.config.CashfreeConfig;
import com.dphotel.entity.Booking;
import com.dphotel.entity.Payment;
import com.dphotel.entity.User;
import com.dphotel.repository.BookingRepository;
import com.dphotel.repository.PaymentRepository;
import com.dphotel.repository.UserRepository;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.*;

@Service
public class CashfreeService {

    private static final Logger logger = LoggerFactory.getLogger(CashfreeService.class);

    private final CashfreeConfig cashfreeConfig;
    private final BookingRepository bookingRepository;
    private final PaymentRepository paymentRepository;
    private final UserRepository userRepository;
    private final ObjectMapper objectMapper;
    private final HttpClient httpClient;

    public CashfreeService(CashfreeConfig cashfreeConfig,
                           BookingRepository bookingRepository,
                           PaymentRepository paymentRepository,
                           UserRepository userRepository,
                           ObjectMapper objectMapper) {
        this.cashfreeConfig = cashfreeConfig;
        this.bookingRepository = bookingRepository;
        this.paymentRepository = paymentRepository;
        this.userRepository = userRepository;
        this.objectMapper = objectMapper;
        this.httpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(15))
                .build();
    }

    /**
     * Creates an order with Cashfree PG and returns session details for frontend checkout.
     */
    @Transactional
    public Map<String, Object> createOrder(String bookingId, String returnUrl) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new NoSuchElementException("Booking not found with ID: " + bookingId));

        User user = userRepository.findById(booking.getUserId())
                .orElse(null);

        String orderId = "order_" + booking.getId().replace("-", "").substring(0, 16) + "_" + (System.currentTimeMillis() % 100000);
        BigDecimal amount = booking.getTotalAmount();

        // Customer details
        String customerId = user != null ? user.getId() : "cust_" + booking.getId().substring(0, 8);
        String customerName = user != null ? (user.getFirstName() + " " + user.getLastName()).trim() : "Valued Guest";
        String customerEmail = user != null && user.getEmail() != null ? user.getEmail() : "guest@dphotel.com";
        String customerPhone = user != null && user.getPhone() != null ? user.getPhone().replaceAll("[^0-9]", "") : "9595695956";
        if (customerPhone.length() < 10) customerPhone = "9595695956";
        if (customerPhone.length() > 10) customerPhone = customerPhone.substring(customerPhone.length() - 10);

        Map<String, Object> customerDetails = new HashMap<>();
        customerDetails.put("customer_id", customerId);
        customerDetails.put("customer_name", customerName);
        customerDetails.put("customer_email", customerEmail);
        customerDetails.put("customer_phone", customerPhone);

        Map<String, Object> orderMeta = new HashMap<>();
        if (returnUrl != null && !returnUrl.trim().isEmpty()) {
            orderMeta.put("return_url", returnUrl);
        }

        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("order_id", orderId);
        requestBody.put("order_amount", amount);
        requestBody.put("order_currency", "INR");
        requestBody.put("customer_details", customerDetails);
        if (!orderMeta.isEmpty()) {
            requestBody.put("order_meta", orderMeta);
        }

        // Cashfree API Call
        try {
            String jsonPayload = objectMapper.writeValueAsString(requestBody);
            String url = cashfreeConfig.getBaseUrl() + "/orders";

            logger.info("Calling Cashfree API: {} for booking: {}", url, bookingId);

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(url))
                    .header("Content-Type", "application/json")
                    .header("x-client-id", cashfreeConfig.getAppId() != null ? cashfreeConfig.getAppId() : "")
                    .header("x-client-secret", cashfreeConfig.getSecretKey() != null ? cashfreeConfig.getSecretKey() : "")
                    .header("x-api-version", cashfreeConfig.getApiVersion())
                    .POST(HttpRequest.BodyPublishers.ofString(jsonPayload))
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

            logger.info("Cashfree response status: {}", response.statusCode());

            if (response.statusCode() >= 200 && response.statusCode() < 300) {
                Map<String, Object> responseMap = objectMapper.readValue(response.body(), new TypeReference<>() {});
                
                // Create or link a pending Payment entity
                Payment payment = new Payment();
                payment.setId(UUID.randomUUID().toString());
                payment.setBookingId(booking.getId());
                payment.setUserId(booking.getUserId());
                payment.setAmount(amount);
                payment.setPaymentMethod("cashfree");
                payment.setPaymentStatus("pending");
                payment.setTransactionId(orderId);
                payment.setPaymentGatewayResponse(response.body());
                paymentRepository.save(payment);

                Map<String, Object> result = new HashMap<>();
                result.put("order_id", orderId);
                result.put("payment_session_id", responseMap.get("payment_session_id"));
                result.put("environment", cashfreeConfig.getEnvironment());
                result.put("cf_order_id", responseMap.get("cf_order_id"));
                result.put("booking_id", bookingId);
                return result;
            } else {
                logger.error("Cashfree order creation error: {}", response.body());
                throw new RuntimeException("Cashfree order creation failed: " + response.body());
            }
        } catch (Exception e) {
            logger.error("Error creating Cashfree order", e);
            throw new RuntimeException("Failed to initiate Cashfree payment: " + e.getMessage(), e);
        }
    }

    /**
     * Verifies payment status with Cashfree and marks booking as confirmed if paid.
     */
    @Transactional
    public Map<String, Object> verifyPayment(String orderId) {
        try {
            String url = cashfreeConfig.getBaseUrl() + "/orders/" + orderId;
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(url))
                    .header("Content-Type", "application/json")
                    .header("x-client-id", cashfreeConfig.getAppId() != null ? cashfreeConfig.getAppId() : "")
                    .header("x-client-secret", cashfreeConfig.getSecretKey() != null ? cashfreeConfig.getSecretKey() : "")
                    .header("x-api-version", cashfreeConfig.getApiVersion())
                    .GET()
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            Map<String, Object> responseMap = objectMapper.readValue(response.body(), new TypeReference<>() {});

            String orderStatus = (String) responseMap.get("order_status");
            logger.info("Order {} status with Cashfree: {}", orderId, orderStatus);

            boolean isPaid = "PAID".equalsIgnoreCase(orderStatus);

            // Update database
            Optional<Payment> paymentOpt = paymentRepository.findByTransactionId(orderId);
            if (paymentOpt.isPresent()) {
                Payment payment = paymentOpt.get();
                if (isPaid) {
                    payment.setPaymentStatus("completed");
                    payment.setPaymentGatewayResponse(response.body());
                    paymentRepository.save(payment);

                    // Confirm booking
                    Booking booking = bookingRepository.findById(payment.getBookingId()).orElse(null);
                    if (booking != null) {
                        booking.setStatus("confirmed");
                        bookingRepository.save(booking);
                    }
                }
            }

            Map<String, Object> result = new HashMap<>();
            result.put("order_id", orderId);
            result.put("order_status", orderStatus);
            result.put("is_paid", isPaid);
            result.put("order_data", responseMap);
            return result;
        } catch (Exception e) {
            logger.error("Error verifying payment for order {}", orderId, e);
            throw new RuntimeException("Payment verification failed: " + e.getMessage(), e);
        }
    }

    /**
     * Webhook handler for asynchronous payment notifications.
     */
    @Transactional
    public void processWebhook(String payload) {
        try {
            Map<String, Object> webhookData = objectMapper.readValue(payload, new TypeReference<>() {});
            logger.info("Received Cashfree webhook: {}", webhookData);

            // Cashfree v2023-08-01 webhook structure: { "data": { "order": { "order_id": ... }, "payment": { "payment_status": "SUCCESS" } }, "type": "PAYMENT_SUCCESS_WEBHOOK" }
            if (webhookData.containsKey("data")) {
                @SuppressWarnings("unchecked")
                Map<String, Object> data = (Map<String, Object>) webhookData.get("data");
                if (data != null && data.containsKey("order")) {
                    @SuppressWarnings("unchecked")
                    Map<String, Object> order = (Map<String, Object>) data.get("order");
                    String orderId = (String) order.get("order_id");
                    if (orderId != null) {
                        verifyPayment(orderId);
                    }
                }
            }
        } catch (Exception e) {
            logger.error("Failed to process Cashfree webhook", e);
        }
    }
}
