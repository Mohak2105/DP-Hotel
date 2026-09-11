package com.dphotel.repository;

import com.dphotel.entity.ContactMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ContactMessageRepository extends JpaRepository<ContactMessage, String> {
    List<ContactMessage> findAllByOrderByCreatedAtDesc();
    List<ContactMessage> findByIsReadOrderByCreatedAtDesc(Boolean isRead);
}
