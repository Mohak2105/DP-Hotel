package com.dphotel.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
public class HealthController {

    @GetMapping("/")
    public ResponseEntity<Map<String, Object>> root() {
        Map<String, Object> response = new HashMap<>();
        response.put("status", "ok");
        response.put("service", "DP Hotel Backend (Spring Boot 3)");
        response.put("message", "API server is running successfully!");
        response.put("health", "/api/health");
        response.put("rooms", "/api/rooms");
        return ResponseEntity.ok(response);
    }

    @GetMapping("/api")
    public ResponseEntity<Map<String, Object>> api() {
        return root();
    }

    @GetMapping("/api/health")
    public ResponseEntity<Map<String, String>> health() {
        Map<String, String> response = new HashMap<>();
        response.put("status", "ok");
        response.put("message", "DP Hotel API is running (Spring Boot)");
        return ResponseEntity.ok(response);
    }
}
