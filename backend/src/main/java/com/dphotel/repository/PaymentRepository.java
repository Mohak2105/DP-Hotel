package com.dphotel.repository;

import com.dphotel.entity.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, String>, JpaSpecificationExecutor<Payment> {

    Optional<Payment> findByBookingId(String bookingId);

    Optional<Payment> findByTransactionId(String transactionId);

    List<Payment> findByUserIdOrderByCreatedAtDesc(String userId);

    @Query(value = """
        SELECT 
            COUNT(*) as total_payments,
            COALESCE(SUM(CASE WHEN payment_status = 'completed' THEN amount ELSE 0 END), 0) as total_collected,
            COALESCE(SUM(CASE WHEN payment_status = 'pending' THEN amount ELSE 0 END), 0) as pending_amount,
            COALESCE(SUM(CASE WHEN payment_status = 'refunded' THEN amount ELSE 0 END), 0) as refunded_amount,
            COALESCE(SUM(CASE WHEN payment_method = 'google_pay' THEN 1 ELSE 0 END), 0) as google_pay_count,
            COALESCE(SUM(CASE WHEN payment_method = 'phone_pay' THEN 1 ELSE 0 END), 0) as phone_pay_count,
            COALESCE(SUM(CASE WHEN payment_method = 'credit_card' THEN 1 ELSE 0 END), 0) as credit_card_count,
            COALESCE(SUM(CASE WHEN payment_method = 'debit_card' THEN 1 ELSE 0 END), 0) as debit_card_count,
            COALESCE(SUM(CASE WHEN payment_method = 'upi' THEN 1 ELSE 0 END), 0) as upi_count,
            COALESCE(SUM(CASE WHEN payment_method = 'net_banking' THEN 1 ELSE 0 END), 0) as net_banking_count,
            COALESCE(SUM(CASE WHEN payment_method = 'cash' THEN 1 ELSE 0 END), 0) as cash_count
        FROM payments
        """, nativeQuery = true)
    Map<String, Object> getPaymentStatistics();
}
