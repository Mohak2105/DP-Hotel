package com.dphotel.controller;

import com.dphotel.dto.ApiResponse;
import com.dphotel.dto.BookingRequestDtos;
import com.dphotel.entity.Booking;
import com.dphotel.security.UserPrincipal;
import com.dphotel.service.BookingService;
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
@RequestMapping("/api/bookings")
public class BookingController {

    private final BookingService bookingService;

    public BookingController(BookingService bookingService) {
        this.bookingService = bookingService;
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Map<String, Object>>> createBooking(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @Valid @RequestBody BookingRequestDtos.CreateBookingRequest request) {
        Booking booking = bookingService.createBooking(userPrincipal.getId(), request);
        Map<String, Object> data = new HashMap<>();
        data.put("booking", booking);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Booking created successfully", data));
    }

    @GetMapping("/my-bookings")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getMyBookings(
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        List<Booking> bookings = bookingService.getMyBookings(userPrincipal.getId());
        Map<String, Object> data = new HashMap<>();
        data.put("bookings", bookings);
        return ResponseEntity.ok(ApiResponse.success(data));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getBookingById(
            @PathVariable String id,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        Booking booking = bookingService.getBookingById(id, userPrincipal);
        Map<String, Object> data = new HashMap<>();
        data.put("booking", booking);
        return ResponseEntity.ok(ApiResponse.success(data));
    }

    @PostMapping("/{id}/cancel")
    public ResponseEntity<ApiResponse<Map<String, Object>>> cancelBooking(
            @PathVariable String id,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        Booking booking = bookingService.cancelBooking(id, userPrincipal);
        Map<String, Object> data = new HashMap<>();
        data.put("booking", booking);
        return ResponseEntity.ok(ApiResponse.success("Booking cancelled successfully", data));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Map<String, Object>>> getAllBookings(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate) {
        List<Booking> bookings = bookingService.getAllBookings(status, fromDate, toDate);
        Map<String, Object> data = new HashMap<>();
        data.put("bookings", bookings);
        return ResponseEntity.ok(ApiResponse.success(data));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<ApiResponse<Map<String, Object>>> updateBookingStatus(
            @PathVariable String id,
            @RequestBody BookingRequestDtos.UpdateStatusRequest request) {
        Booking booking = bookingService.updateBookingStatus(id, request.getStatus());
        Map<String, Object> data = new HashMap<>();
        data.put("booking", booking);
        return ResponseEntity.ok(ApiResponse.success("Booking status updated successfully", data));
    }

    @GetMapping("/admin/stats")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getBookingStats() {
        Map<String, Object> stats = bookingService.getBookingStats();
        Map<String, Object> data = new HashMap<>();
        data.put("stats", stats);
        return ResponseEntity.ok(ApiResponse.success(data));
    }
}
