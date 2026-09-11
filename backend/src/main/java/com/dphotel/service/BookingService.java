package com.dphotel.service;

import com.dphotel.dto.BookingRequestDtos;
import com.dphotel.entity.Booking;
import com.dphotel.entity.Room;
import com.dphotel.repository.BookingRepository;
import com.dphotel.repository.RoomRepository;
import com.dphotel.security.UserPrincipal;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.*;

@Service
public class BookingService {

    private final BookingRepository bookingRepository;
    private final RoomRepository roomRepository;

    public BookingService(BookingRepository bookingRepository, RoomRepository roomRepository) {
        this.bookingRepository = bookingRepository;
        this.roomRepository = roomRepository;
    }

    @Transactional
    public Booking createBooking(String userId, BookingRequestDtos.CreateBookingRequest request) {
        Room room = roomRepository.findById(request.getRoomId())
                .orElseThrow(() -> new NoSuchElementException("Room not found"));

        if (!request.getCheckOutDate().isAfter(request.getCheckInDate())) {
            throw new IllegalArgumentException("Check-out date must be after check-in date");
        }

        long overlapping = bookingRepository.countOverlappingBookings(
                request.getRoomId(),
                request.getCheckInDate(),
                request.getCheckOutDate(),
                null
        );

        if (overlapping > 0) {
            throw new IllegalArgumentException("Room is not available for selected dates");
        }

        long nights = ChronoUnit.DAYS.between(request.getCheckInDate(), request.getCheckOutDate());
        if (nights <= 0) nights = 1;

        BigDecimal totalAmount = room.getPricePerNight().multiply(BigDecimal.valueOf(nights));

        Booking booking = new Booking();
        booking.setId(UUID.randomUUID().toString());
        booking.setUserId(userId);
        booking.setRoomId(room.getId());
        booking.setCheckInDate(request.getCheckInDate());
        booking.setCheckOutDate(request.getCheckOutDate());
        booking.setGuests(request.getGuests() != null ? request.getGuests() : 1);
        booking.setTotalNights((int) nights);
        booking.setTotalAmount(totalAmount);
        booking.setSpecialRequests(request.getSpecialRequests());
        booking.setGstNumber(request.getGstNumber());
        booking.setCompanyName(request.getCompanyName());
        booking.setStatus("pending");

        Booking savedBooking = bookingRepository.save(booking);
        return bookingRepository.findById(savedBooking.getId()).orElse(savedBooking);
    }

    public List<Booking> getMyBookings(String userId) {
        return bookingRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    public Booking getBookingById(String id, UserPrincipal userPrincipal) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Booking not found"));

        boolean isAdmin = "admin".equalsIgnoreCase(userPrincipal.getRole());
        if (!booking.getUserId().equals(userPrincipal.getId()) && !isAdmin) {
            throw new AccessDeniedException("Access denied");
        }

        return booking;
    }

    @Transactional
    public Booking cancelBooking(String id, UserPrincipal userPrincipal) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Booking not found"));

        boolean isAdmin = "admin".equalsIgnoreCase(userPrincipal.getRole());
        if (!booking.getUserId().equals(userPrincipal.getId()) && !isAdmin) {
            throw new AccessDeniedException("Access denied");
        }

        if (Arrays.asList("checked_in", "checked_out", "cancelled").contains(booking.getStatus())) {
            throw new IllegalArgumentException("Cannot cancel booking with status: " + booking.getStatus());
        }

        booking.setStatus("cancelled");
        return bookingRepository.save(booking);
    }

    public List<Booking> getAllBookings(String status, LocalDate fromDate, LocalDate toDate) {
        Specification<Booking> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (status != null && !status.trim().isEmpty()) {
                predicates.add(cb.equal(root.get("status"), status));
            }
            if (fromDate != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("checkInDate"), fromDate));
            }
            if (toDate != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("checkOutDate"), toDate));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        return bookingRepository.findAll(spec, Sort.by(Sort.Direction.DESC, "createdAt"));
    }

    @Transactional
    public Booking updateBookingStatus(String id, String status) {
        List<String> validStatuses = Arrays.asList("pending", "confirmed", "checked_in", "checked_out", "cancelled");
        if (!validStatuses.contains(status)) {
            throw new IllegalArgumentException("Invalid status");
        }

        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Booking not found"));

        booking.setStatus(status);
        return bookingRepository.save(booking);
    }

    public Map<String, Object> getBookingStats() {
        return bookingRepository.getBookingStatistics();
    }
}
