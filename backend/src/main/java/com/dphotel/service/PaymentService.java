package com.dphotel.service;

import com.dphotel.dto.PaymentRequestDtos;
import com.dphotel.entity.Booking;
import com.dphotel.entity.Payment;
import com.dphotel.repository.BookingRepository;
import com.dphotel.repository.PaymentRepository;
import com.dphotel.security.UserPrincipal;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

@Service
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final BookingRepository bookingRepository;
    private final ObjectMapper objectMapper;

    public PaymentService(PaymentRepository paymentRepository, BookingRepository bookingRepository, ObjectMapper objectMapper) {
        this.paymentRepository = paymentRepository;
        this.bookingRepository = bookingRepository;
        this.objectMapper = objectMapper;
    }

    public List<Map<String, String>> getPaymentMethods() {
        List<Map<String, String>> methods = new ArrayList<>();

        Map<String, String> m1 = new HashMap<>();
        m1.put("id", "upi_qr");
        m1.put("name", "Scan & Pay (UPI)");
        m1.put("icon", "upi");
        m1.put("type", "upi_qr");
        methods.add(m1);

        Map<String, String> m2 = new HashMap<>();
        m2.put("id", "pay_at_hotel");
        m2.put("name", "Pay at Hotel");
        m2.put("icon", "cash");
        m2.put("type", "cash");
        methods.add(m2);

        return methods;
    }

    @Transactional
    public Map<String, Object> initiatePayment(String userId, PaymentRequestDtos.InitiateRequest request) {
        Booking booking = bookingRepository.findById(request.getBookingId())
                .orElseThrow(() -> new NoSuchElementException("Booking not found"));

        if (!booking.getUserId().equals(userId)) {
            throw new AccessDeniedException("Access denied");
        }

        Optional<Payment> existingPayment = paymentRepository.findByBookingId(booking.getId());
        if (existingPayment.isPresent() && "completed".equalsIgnoreCase(existingPayment.get().getPaymentStatus())) {
            throw new IllegalArgumentException("Payment already completed for this booking");
        }

        Payment payment = existingPayment.orElseGet(Payment::new);
        if (payment.getId() == null) {
            payment.setId(UUID.randomUUID().toString());
        }
        payment.setBookingId(booking.getId());
        payment.setUserId(userId);
        payment.setAmount(booking.getTotalAmount());
        payment.setPaymentMethod(request.getPaymentMethod());
        payment.setCardLastFour(request.getCardLastFour());
        payment.setCardBrand(request.getCardBrand());
        payment.setUpiId(request.getUpiId());
        payment.setPaymentStatus("pending");

        Payment savedPayment = paymentRepository.save(payment);

        Map<String, Object> gateway = new HashMap<>();
        gateway.put("method", request.getPaymentMethod());
        gateway.put("amount", booking.getTotalAmount());
        gateway.put("orderId", savedPayment.getId());

        Map<String, Object> result = new HashMap<>();
        result.put("payment", savedPayment);
        result.put("paymentGateway", gateway);

        return result;
    }

    @Transactional
    public Payment processPayment(String paymentId, String userId, Map<String, Object> details) {
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new NoSuchElementException("Payment not found"));

        if (!payment.getUserId().equals(userId)) {
            throw new AccessDeniedException("Access denied");
        }

        payment.setPaymentStatus("completed");
        payment.setPaidAt(LocalDateTime.now());
        payment.setTransactionId("TXN" + System.currentTimeMillis() + UUID.randomUUID().toString().substring(0, 8).toUpperCase());

        try {
            Map<String, Object> gwResp = new HashMap<>();
            gwResp.put("gateway", payment.getPaymentMethod());
            gwResp.put("status", "success");
            gwResp.put("timestamp", LocalDateTime.now().toString());
            if (details != null) {
                gwResp.putAll(details);
            }
            payment.setPaymentGatewayResponse(objectMapper.writeValueAsString(gwResp));
        } catch (Exception ignored) {}

        Payment updatedPayment = paymentRepository.save(payment);

        // Update booking status to confirmed
        bookingRepository.findById(payment.getBookingId()).ifPresent(b -> {
            b.setStatus("confirmed");
            bookingRepository.save(b);
        });

        return updatedPayment;
    }

    public Payment getPaymentById(String id, UserPrincipal userPrincipal) {
        Payment payment = paymentRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Payment not found"));

        boolean isAdmin = "admin".equalsIgnoreCase(userPrincipal.getRole());
        if (!payment.getUserId().equals(userPrincipal.getId()) && !isAdmin) {
            throw new AccessDeniedException("Access denied");
        }

        return payment;
    }

    public List<Payment> getMyPayments(String userId) {
        return paymentRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    public Payment getPaymentByBooking(String bookingId, UserPrincipal userPrincipal) {
        Payment payment = paymentRepository.findByBookingId(bookingId)
                .orElseThrow(() -> new NoSuchElementException("Payment not found for this booking"));

        boolean isAdmin = "admin".equalsIgnoreCase(userPrincipal.getRole());
        if (!payment.getUserId().equals(userPrincipal.getId()) && !isAdmin) {
            throw new AccessDeniedException("Access denied");
        }

        return payment;
    }

    @Transactional
    public Payment refundPayment(String id, String reason) {
        Payment payment = paymentRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Payment not found"));

        if (!"completed".equalsIgnoreCase(payment.getPaymentStatus())) {
            throw new IllegalArgumentException("Can only refund completed payments");
        }

        payment.setPaymentStatus("refunded");
        try {
            Map<String, Object> resp = new HashMap<>();
            resp.put("refund_reason", reason);
            resp.put("refunded_at", LocalDateTime.now().toString());
            payment.setPaymentGatewayResponse(objectMapper.writeValueAsString(resp));
        } catch (Exception ignored) {}

        Payment refunded = paymentRepository.save(payment);

        bookingRepository.findById(payment.getBookingId()).ifPresent(b -> {
            b.setStatus("cancelled");
            bookingRepository.save(b);
        });

        return refunded;
    }

    public List<Payment> getAllPayments(String status, String method, LocalDate fromDate, LocalDate toDate) {
        Specification<Payment> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (status != null && !status.trim().isEmpty()) {
                predicates.add(cb.equal(root.get("paymentStatus"), status));
            }
            if (method != null && !method.trim().isEmpty()) {
                predicates.add(cb.equal(root.get("paymentMethod"), method));
            }
            if (fromDate != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("createdAt"), fromDate.atStartOfDay()));
            }
            if (toDate != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("createdAt"), toDate.plusDays(1).atStartOfDay()));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        return paymentRepository.findAll(spec, Sort.by(Sort.Direction.DESC, "createdAt"));
    }

    public Map<String, Object> getPaymentStats() {
        return paymentRepository.getPaymentStatistics();
    }
}
