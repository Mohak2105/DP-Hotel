package com.dphotel.controller;

import com.dphotel.dto.ApiResponse;
import com.dphotel.dto.OtherDtos;
import com.dphotel.entity.ContactMessage;
import com.dphotel.service.ContactService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/contact")
public class ContactController {

    private final ContactService contactService;

    public ContactController(ContactService contactService) {
        this.contactService = contactService;
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Void>> submitMessage(@Valid @RequestBody OtherDtos.ContactMessageRequest request) {
        contactService.submitMessage(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.message("Message submitted successfully. We will get back to you soon!"));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Map<String, Object>>> getAllMessages(
            @RequestParam(required = false) Boolean isRead) {
        List<ContactMessage> messages = contactService.getAllMessages(isRead);
        Map<String, Object> data = new HashMap<>();
        data.put("messages", messages);
        return ResponseEntity.ok(ApiResponse.success(data));
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<ApiResponse<Void>> markAsRead(@PathVariable String id) {
        contactService.markAsRead(id);
        return ResponseEntity.ok(ApiResponse.message("Message marked as read"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteMessage(@PathVariable String id) {
        contactService.deleteMessage(id);
        return ResponseEntity.ok(ApiResponse.message("Message deleted successfully"));
    }
}
