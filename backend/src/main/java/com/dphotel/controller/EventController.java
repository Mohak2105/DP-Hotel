package com.dphotel.controller;

import com.dphotel.dto.ApiResponse;
import com.dphotel.dto.OtherDtos;
import com.dphotel.entity.EventBooking;
import com.dphotel.security.UserPrincipal;
import com.dphotel.service.EventService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/events")
public class EventController {

    private final EventService eventService;

    public EventController(EventService eventService) {
        this.eventService = eventService;
    }

    @GetMapping("/types")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getEventTypes() {
        List<Map<String, String>> eventTypes = eventService.getEventTypes();
        Map<String, Object> data = new HashMap<>();
        data.put("eventTypes", eventTypes);
        return ResponseEntity.ok(ApiResponse.success(data));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Map<String, Object>>> createEventBooking(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @Valid @RequestBody OtherDtos.EventBookingRequest request) {
        String userId = userPrincipal != null ? userPrincipal.getId() : null;
        EventBooking booking = eventService.createEventBooking(userId, request);
        Map<String, Object> data = new HashMap<>();
        data.put("eventBooking", booking);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Event booking inquiry submitted successfully. Our team will contact you shortly.", data));
    }

    @GetMapping("/my-events")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getMyEventBookings(
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        List<EventBooking> eventBookings = eventService.getMyEventBookings(userPrincipal.getId());
        Map<String, Object> data = new HashMap<>();
        data.put("eventBookings", eventBookings);
        return ResponseEntity.ok(ApiResponse.success(data));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Map<String, Object>>> getAllEventBookings(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String eventType) {
        List<EventBooking> eventBookings = eventService.getAllEventBookings(status, eventType);
        Map<String, Object> data = new HashMap<>();
        data.put("eventBookings", eventBookings);
        return ResponseEntity.ok(ApiResponse.success(data));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<ApiResponse<Map<String, Object>>> updateEventBookingStatus(
            @PathVariable String id,
            @RequestBody OtherDtos.UpdateEventStatusRequest request) {
        EventBooking booking = eventService.updateEventBookingStatus(id, request);
        Map<String, Object> data = new HashMap<>();
        data.put("eventBooking", booking);
        return ResponseEntity.ok(ApiResponse.success("Event booking updated successfully", data));
    }
}
