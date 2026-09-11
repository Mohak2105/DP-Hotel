package com.dphotel.controller;

import com.dphotel.dto.ApiResponse;
import com.dphotel.dto.AuthDtos;
import com.dphotel.security.UserPrincipal;
import com.dphotel.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<Map<String, Object>>> register(@Valid @RequestBody AuthDtos.RegisterRequest request) {
        AuthDtos.AuthResponseData data = authService.register(request);

        Map<String, Object> respData = new HashMap<>();
        respData.put("user", data.getUser());
        respData.put("token", data.getToken());

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Registration successful", respData));
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<Map<String, Object>>> login(@Valid @RequestBody AuthDtos.LoginRequest request) {
        AuthDtos.AuthResponseData data = authService.login(request);

        Map<String, Object> respData = new HashMap<>();
        respData.put("user", data.getUser());
        respData.put("token", data.getToken());

        return ResponseEntity.ok(ApiResponse.success("Login successful", respData));
    }

    @GetMapping("/profile")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getProfile(@AuthenticationPrincipal UserPrincipal userPrincipal) {
        AuthDtos.UserDto user = authService.getProfile(userPrincipal.getId());

        Map<String, Object> respData = new HashMap<>();
        respData.put("user", user);

        return ResponseEntity.ok(ApiResponse.success(respData));
    }

    @PutMapping("/profile")
    public ResponseEntity<ApiResponse<Map<String, Object>>> updateProfile(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @RequestBody AuthDtos.UpdateProfileRequest request) {
        AuthDtos.UserDto user = authService.updateProfile(userPrincipal.getId(), request);

        Map<String, Object> respData = new HashMap<>();
        respData.put("user", user);

        return ResponseEntity.ok(ApiResponse.success("Profile updated successfully", respData));
    }
}
