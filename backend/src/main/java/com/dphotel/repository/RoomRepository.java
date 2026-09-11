package com.dphotel.repository;

import com.dphotel.entity.Room;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@Repository
public interface RoomRepository extends JpaRepository<Room, String>, JpaSpecificationExecutor<Room> {

    @Query(value = """
        SELECT r.* FROM rooms r
        WHERE r.is_available = TRUE
        AND r.id NOT IN (
            SELECT b.room_id FROM bookings b
            WHERE b.status NOT IN ('cancelled', 'checked_out')
            AND (
                (b.check_in_date <= :checkOut AND b.check_out_date > :checkIn)
                OR (b.check_in_date < :checkOut AND b.check_out_date >= :checkIn)
                OR (b.check_in_date >= :checkIn AND b.check_out_date <= :checkOut)
            )
        )
        AND (:roomType IS NULL OR r.room_type = :roomType)
        ORDER BY r.price_per_night ASC
        """, nativeQuery = true)
    List<Room> findAvailableRooms(
            @Param("checkIn") LocalDate checkIn,
            @Param("checkOut") LocalDate checkOut,
            @Param("roomType") String roomType
    );

    @Query(value = """
        SELECT 
            room_type as roomType,
            MIN(price_per_night) as minPrice,
            MAX(price_per_night) as maxPrice,
            COUNT(*) as totalRooms,
            SUM(CASE WHEN is_available = TRUE THEN 1 ELSE 0 END) as availableRooms
        FROM rooms
        GROUP BY room_type
        """, nativeQuery = true)
    List<Map<String, Object>> getRoomTypeSummaries();
}
