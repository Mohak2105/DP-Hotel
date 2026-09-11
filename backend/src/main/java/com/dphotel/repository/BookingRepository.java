package com.dphotel.repository;

import com.dphotel.entity.Booking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@Repository
public interface BookingRepository extends JpaRepository<Booking, String>, JpaSpecificationExecutor<Booking> {

    List<Booking> findByUserIdOrderByCreatedAtDesc(String userId);

    @Query(value = """
        SELECT COUNT(*) FROM bookings 
        WHERE room_id = :roomId 
        AND status NOT IN ('cancelled', 'checked_out')
        AND (
            (check_in_date <= :checkOut AND check_out_date > :checkIn)
            OR (check_in_date < :checkOut AND check_out_date >= :checkIn)
            OR (check_in_date >= :checkIn AND check_out_date <= :checkOut)
        )
        AND (:excludeBookingId IS NULL OR id != :excludeBookingId)
        """, nativeQuery = true)
    long countOverlappingBookings(
            @Param("roomId") String roomId,
            @Param("checkIn") LocalDate checkIn,
            @Param("checkOut") LocalDate checkOut,
            @Param("excludeBookingId") String excludeBookingId
    );

    @Query(value = """
        SELECT 
            COUNT(*) as total_bookings,
            COALESCE(SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END), 0) as pending_bookings,
            COALESCE(SUM(CASE WHEN status = 'confirmed' THEN 1 ELSE 0 END), 0) as confirmed_bookings,
            COALESCE(SUM(CASE WHEN status = 'checked_in' THEN 1 ELSE 0 END), 0) as checked_in_bookings,
            COALESCE(SUM(CASE WHEN status = 'checked_out' THEN 1 ELSE 0 END), 0) as checked_out_bookings,
            COALESCE(SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END), 0) as cancelled_bookings,
            COALESCE(SUM(total_amount), 0) as total_revenue
        FROM bookings
        """, nativeQuery = true)
    Map<String, Object> getBookingStatistics();
}
