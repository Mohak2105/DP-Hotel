package com.dphotel.service;

import com.dphotel.dto.OtherDtos;
import com.dphotel.entity.ContactMessage;
import com.dphotel.repository.ContactMessageRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.NoSuchElementException;
import java.util.UUID;

@Service
public class ContactService {

    private final ContactMessageRepository contactMessageRepository;

    public ContactService(ContactMessageRepository contactMessageRepository) {
        this.contactMessageRepository = contactMessageRepository;
    }

    @Transactional
    public ContactMessage submitMessage(OtherDtos.ContactMessageRequest request) {
        ContactMessage message = new ContactMessage();
        message.setId(UUID.randomUUID().toString());
        message.setName(request.getName());
        message.setEmail(request.getEmail());
        message.setPhone(request.getPhone());
        message.setSubject(request.getSubject());
        message.setMessage(request.getMessage());
        message.setIsRead(false);

        return contactMessageRepository.save(message);
    }

    public List<ContactMessage> getAllMessages(Boolean isRead) {
        if (isRead != null) {
            return contactMessageRepository.findByIsReadOrderByCreatedAtDesc(isRead);
        }
        return contactMessageRepository.findAllByOrderByCreatedAtDesc();
    }

    @Transactional
    public void markAsRead(String id) {
        ContactMessage message = contactMessageRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Message not found"));
        message.setIsRead(true);
        contactMessageRepository.save(message);
    }

    @Transactional
    public void deleteMessage(String id) {
        if (!contactMessageRepository.existsById(id)) {
            throw new NoSuchElementException("Message not found");
        }
        contactMessageRepository.deleteById(id);
    }
}
