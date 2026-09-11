package com.dphotel.service;

import com.dphotel.dto.OtherDtos;
import com.dphotel.entity.EventBooking;
import com.dphotel.repository.EventBookingRepository;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Service
public class EventService {

    private final EventBookingRepository eventBookingRepository;

    public EventService(EventBookingRepository eventBookingRepository) {
        this.eventBookingRepository = eventBookingRepository;
    }

    public List<Map<String, String>> getEventTypes() {
        List<Map<String, String>> list = new ArrayList<>();

        Map<String, String> e1 = new HashMap<>();
        e1.put("id", "conference");
        e1.put("name", "Conference");
        e1.put("description", "Professional business conferences and seminars");
        list.add(e1);

        Map<String, String> e2 = new HashMap<>();
        e2.put("id", "wedding");
        e2.put("name", "Wedding");
        e2.put("description", "Wedding ceremonies and receptions");
        list.add(e2);

        Map<String, String> e3 = new HashMap<>();
        e3.put("id", "meeting");
        e3.put("name", "Meeting");
        e3.put("description", "Business meetings and corporate events");
        list.add(e3);

        Map<String, String> e4 = new HashMap<>();
        e4.put("id", "party");
        e4.put("name", "Party");
        e4.put("description", "Birthday parties and celebrations");
        list.add(e4);

        Map<String, String> e5 = new HashMap<>();
        e5.put("id", "other");
        e5.put("name", "Other");
        e5.put("description", "Other events and gatherings");
        list.add(e5);

        return list;
    }

    @Transactional
    public EventBooking createEventBooking(String userId, OtherDtos.EventBookingRequest request) {
        EventBooking booking = new EventBooking();
        booking.setId(UUID.randomUUID().toString());
        booking.setUserId(userId);
        booking.setEventType(request.getEventType());
        booking.setEventName(request.getEventName());
        booking.setEventDate(request.getEventDate());
        booking.setStartTime(request.getStartTime());
        booking.setEndTime(request.getEndTime());
        booking.setGuestsCount(request.getGuestsCount());
        booking.setRequirements(request.getRequirements());
        booking.setStatus("inquiry");

        return eventBookingRepository.save(booking);
    }

    public List<EventBooking> getMyEventBookings(String userId) {
        return eventBookingRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    public List<EventBooking> getAllEventBookings(String status, String eventType) {
        Specification<EventBooking> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (status != null && !status.trim().isEmpty()) {
                predicates.add(cb.equal(root.get("status"), status));
            }
            if (eventType != null && !eventType.trim().isEmpty()) {
                predicates.add(cb.equal(root.get("eventType"), eventType));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        return eventBookingRepository.findAll(spec, Sort.by(Sort.Direction.ASC, "eventDate"));
    }

    @Transactional
    public EventBooking updateEventBookingStatus(String id, OtherDtos.UpdateEventStatusRequest request) {
        List<String> validStatuses = Arrays.asList("inquiry", "pending", "confirmed", "completed", "cancelled");
        if (request.getStatus() != null && !validStatuses.contains(request.getStatus())) {
            throw new IllegalArgumentException("Invalid status");
        }

        EventBooking booking = eventBookingRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Event booking not found"));

        if (request.getStatus() != null) {
            booking.setStatus(request.getStatus());
        }
        if (request.getTotalAmount() != null) {
            booking.setTotalAmount(request.getTotalAmount());
        }

        return eventBookingRepository.save(booking);
    }
}
