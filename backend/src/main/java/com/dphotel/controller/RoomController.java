package com.dphotel.controller;

import com.dphotel.dto.ApiResponse;
import com.dphotel.dto.OtherDtos;
import com.dphotel.entity.Room;
import com.dphotel.service.RoomService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/rooms")
public class RoomController {

    private final RoomService roomService;

    public RoomController(RoomService roomService) {
        this.roomService = roomService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Map<String, Object>>> getAllRooms(
            @RequestParam(required = false) String type,
            @RequestParam(required = false) Boolean available,
            @RequestParam(required = false) BigDecimal maxPrice,
            @RequestParam(required = false) Integer capacity) {
        List<Room> rooms = roomService.getAllRooms(type, available, maxPrice, capacity);
        Map<String, Object> data = new HashMap<>();
        data.put("rooms", rooms);
        return ResponseEntity.ok(ApiResponse.success(data));
    }

    @GetMapping("/types")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getRoomTypes() {
        List<Map<String, Object>> roomTypes = roomService.getRoomTypes();
        Map<String, Object> data = new HashMap<>();
        data.put("roomTypes", roomTypes);
        return ResponseEntity.ok(ApiResponse.success(data));
    }

    @GetMapping("/available")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getAvailableRooms(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate checkIn,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate checkOut,
            @RequestParam(required = false) String type) {

        if (checkIn == null || checkOut == null) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Check-in and check-out dates are required"));
        }

        List<Room> rooms = roomService.getAvailableRooms(checkIn, checkOut, type);
        Map<String, Object> data = new HashMap<>();
        data.put("rooms", rooms);
        return ResponseEntity.ok(ApiResponse.success(data));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getRoomById(@PathVariable String id) {
        Room room = roomService.getRoomById(id);
        Map<String, Object> data = new HashMap<>();
        data.put("room", room);
        return ResponseEntity.ok(ApiResponse.success(data));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Map<String, Object>>> createRoom(@RequestBody OtherDtos.RoomRequest request) {
        Room room = roomService.createRoom(request);
        Map<String, Object> data = new HashMap<>();
        data.put("room", room);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Room created successfully", data));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<Map<String, Object>>> updateRoom(
            @PathVariable String id,
            @RequestBody OtherDtos.RoomRequest request) {
        Room room = roomService.updateRoom(id, request);
        Map<String, Object> data = new HashMap<>();
        data.put("room", room);
        return ResponseEntity.ok(ApiResponse.success("Room updated successfully", data));
    }
}
