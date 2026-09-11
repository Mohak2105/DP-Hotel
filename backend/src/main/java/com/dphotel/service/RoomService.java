package com.dphotel.service;

import com.dphotel.dto.OtherDtos;
import com.dphotel.entity.Room;
import com.dphotel.repository.RoomRepository;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.*;

@Service
public class RoomService {

    private final RoomRepository roomRepository;

    public RoomService(RoomRepository roomRepository) {
        this.roomRepository = roomRepository;
    }

    public List<Room> getAllRooms(String type, Boolean available, BigDecimal maxPrice, Integer capacity) {
        Specification<Room> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (type != null && !type.trim().isEmpty()) {
                predicates.add(cb.equal(root.get("roomType"), type));
            }
            if (available != null) {
                predicates.add(cb.equal(root.get("isAvailable"), available));
            }
            if (maxPrice != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("pricePerNight"), maxPrice));
            }
            if (capacity != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("capacity"), capacity));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        return roomRepository.findAll(spec, Sort.by(Sort.Direction.ASC, "pricePerNight"));
    }

    public Room getRoomById(String id) {
        return roomRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Room not found"));
    }

    public List<Room> getAvailableRooms(LocalDate checkIn, LocalDate checkOut, String roomType) {
        return roomRepository.findAvailableRooms(checkIn, checkOut, (roomType != null && !roomType.trim().isEmpty()) ? roomType : null);
    }

    public List<Map<String, Object>> getRoomTypes() {
        List<Map<String, Object>> summaries = roomRepository.getRoomTypeSummaries();
        List<Map<String, Object>> result = new ArrayList<>();
        for (Map<String, Object> summary : summaries) {
            Map<String, Object> item = new HashMap<>();
            item.put("room_type", summary.get("roomType"));
            item.put("min_price", summary.get("minPrice"));
            item.put("max_price", summary.get("maxPrice"));
            item.put("total_rooms", summary.get("totalRooms"));
            item.put("available_rooms", summary.get("availableRooms"));
            result.add(item);
        }
        return result;
    }

    @Transactional
    public Room createRoom(OtherDtos.RoomRequest request) {
        Room room = new Room();
        room.setId(UUID.randomUUID().toString());
        room.setRoomNumber(request.getRoomNumber());
        room.setRoomType(request.getRoomType());
        room.setName(request.getName());
        room.setDescription(request.getDescription());
        room.setPricePerNight(request.getPricePerNight());
        room.setCapacity(request.getCapacity() != null ? request.getCapacity() : 2);
        room.setAmenities(request.getAmenities() != null ? request.getAmenities() : new ArrayList<>());
        room.setImages(request.getImages() != null ? request.getImages() : new ArrayList<>());
        room.setIsAvailable(request.getIsAvailable() != null ? request.getIsAvailable() : true);

        return roomRepository.save(room);
    }

    @Transactional
    public Room updateRoom(String id, OtherDtos.RoomRequest request) {
        Room room = getRoomById(id);

        if (request.getName() != null) room.setName(request.getName());
        if (request.getDescription() != null) room.setDescription(request.getDescription());
        if (request.getPricePerNight() != null) room.setPricePerNight(request.getPricePerNight());
        if (request.getCapacity() != null) room.setCapacity(request.getCapacity());
        if (request.getAmenities() != null) room.setAmenities(request.getAmenities());
        if (request.getImages() != null) room.setImages(request.getImages());
        if (request.getIsAvailable() != null) room.setIsAvailable(request.getIsAvailable());
        if (request.getRoomType() != null) room.setRoomType(request.getRoomType());

        return roomRepository.save(room);
    }
}
