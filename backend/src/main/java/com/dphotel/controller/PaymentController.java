package com.dphotel.controller;

import com.dphotel.dto.ApiResponse;
import com.dphotel.dto.PaymentRequestDtos;
import com.dphotel.entity.Payment;
import com.dphotel.security.UserPrincipal;
import com.dphotel.service.PaymentService;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/payments")
public class PaymentController {

    private final PaymentService paymentService;

    public PaymentController(PaymentService paymentService) {
        this.paymentService = paymentService;
    }

    @GetMapping("/methods")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getPaymentMethods() {
        List<Map<String, String>> methods = paymentService.getPaymentMethods();
        Map<String, Object> data = new HashMap<>();
        data.put("methods", methods);
        return ResponseEntity.ok(ApiResponse.success(data));
    }

    @PostMapping("/initiate")
    public ResponseEntity<ApiResponse<Map<String, Object>>> initiatePayment(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @Valid @RequestBody PaymentRequestDtos.InitiateRequest request) {
        Map<String, Object> result = paymentService.initiatePayment(userPrincipal.getId(), request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Payment initiated", result));
    }

    @PostMapping("/process/{paymentId}")
    public ResponseEntity<ApiResponse<Map<String, Object>>> processPayment(
            @PathVariable String paymentId,
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @RequestBody(required = false) Map<String, Object> details) {
        Payment payment = paymentService.processPayment(paymentId, userPrincipal.getId(), details);
        Map<String, Object> data = new HashMap<>();
        data.put("payment", payment);

        String message = "completed".equalsIgnoreCase(payment.getPaymentStatus())
                ? "Payment successful"
                : "Payment failed";

        return ResponseEntity.ok(ApiResponse.success(message, data));
    }

    @GetMapping("/my-payments")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getMyPayments(
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        List<Payment> payments = paymentService.getMyPayments(userPrincipal.getId());
        Map<String, Object> data = new HashMap<>();
        data.put("payments", payments);
        return ResponseEntity.ok(ApiResponse.success(data));
    }

    @GetMapping("/booking/{bookingId}")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getPaymentByBooking(
            @PathVariable String bookingId,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        Payment payment = paymentService.getPaymentByBooking(bookingId, userPrincipal);
        Map<String, Object> data = new HashMap<>();
        data.put("payment", payment);
        return ResponseEntity.ok(ApiResponse.success(data));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getPaymentById(
            @PathVariable String id,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        Payment payment = paymentService.getPaymentById(id, userPrincipal);
        Map<String, Object> data = new HashMap<>();
        data.put("payment", payment);
        return ResponseEntity.ok(ApiResponse.success(data));
    }

    @PostMapping("/{id}/refund")
    public ResponseEntity<ApiResponse<Map<String, Object>>> refundPayment(
            @PathVariable String id,
            @RequestBody(required = false) PaymentRequestDtos.RefundRequest request) {
        String reason = request != null ? request.getReason() : null;
        Payment payment = paymentService.refundPayment(id, reason);
        Map<String, Object> data = new HashMap<>();
        data.put("payment", payment);
        return ResponseEntity.ok(ApiResponse.success("Payment refunded successfully", data));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Map<String, Object>>> getAllPayments(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String method,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate) {
        List<Payment> payments = paymentService.getAllPayments(status, method, fromDate, toDate);
        Map<String, Object> data = new HashMap<>();
        data.put("payments", payments);
        return ResponseEntity.ok(ApiResponse.success(data));
    }

    @GetMapping("/admin/stats")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getPaymentStats() {
        Map<String, Object> stats = paymentService.getPaymentStats();
        Map<String, Object> data = new HashMap<>();
        data.put("stats", stats);
        return ResponseEntity.ok(ApiResponse.success(data));
    }
}
