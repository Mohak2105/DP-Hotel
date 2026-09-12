package com.dphotel.controller;

import com.dphotel.dto.ApiResponse;
import com.dphotel.service.CashfreeService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/payments/cashfree")
public class CashfreeController {

    private final CashfreeService cashfreeService;

    public CashfreeController(CashfreeService cashfreeService) {
        this.cashfreeService = cashfreeService;
    }

    /**
     * Create an order session with Cashfree for a given booking.
     */
    @PostMapping("/create-order")
    public ResponseEntity<ApiResponse<Map<String, Object>>> createOrder(@RequestBody Map<String, String> request) {
        String bookingId = request.get("bookingId");
        String returnUrl = request.get("returnUrl");

        if (bookingId == null || bookingId.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(ApiResponse.error("bookingId is required"));
        }

        Map<String, Object> orderData = cashfreeService.createOrder(bookingId, returnUrl);
        return ResponseEntity.ok(ApiResponse.success("Cashfree order created successfully", orderData));
    }

    /**
     * Verify payment status for an order.
     */
    @PostMapping("/verify/{orderId}")
    public ResponseEntity<ApiResponse<Map<String, Object>>> verifyPayment(@PathVariable String orderId) {
        Map<String, Object> result = cashfreeService.verifyPayment(orderId);
        return ResponseEntity.ok(ApiResponse.success("Payment status retrieved", result));
    }

    /**
     * Webhook endpoint called asynchronously by Cashfree.
     */
    @PostMapping("/webhook")
    public ResponseEntity<String> handleWebhook(@RequestBody String payload) {
        cashfreeService.processWebhook(payload);
        return ResponseEntity.ok("OK");
    }
}
