package com.dphotel.repository;

import com.dphotel.entity.EventBooking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EventBookingRepository extends JpaRepository<EventBooking, String>, JpaSpecificationExecutor<EventBooking> {
    List<EventBooking> findByUserIdOrderByCreatedAtDesc(String userId);
}
