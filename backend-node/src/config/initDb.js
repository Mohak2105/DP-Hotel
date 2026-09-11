const mysql = require('mysql2/promise');
require('dotenv').config();

const initDatabase = async () => {
  let connection;
  
  try {
    // Connect without database to create it if not exists
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || ''
    });

    const dbName = process.env.DB_NAME || 'dp_hotel';
    
    // Create database if not exists
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\``);
    console.log(`✅ Database '${dbName}' created or already exists`);
    
    // Use the database
    await connection.query(`USE \`${dbName}\``);

    // Create Users table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(36) PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100) NOT NULL,
        phone VARCHAR(20),
        address TEXT,
        role ENUM('user', 'admin') DEFAULT 'user',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Users table created');

    // Create Rooms table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS rooms (
        id VARCHAR(36) PRIMARY KEY,
        room_number VARCHAR(10) UNIQUE NOT NULL,
        room_type ENUM('deluxe', 'executive', 'suite') NOT NULL,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        price_per_night DECIMAL(10, 2) NOT NULL,
        capacity INT NOT NULL DEFAULT 2,
        amenities JSON,
        images JSON,
        is_available BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Rooms table created');

    // Create Bookings table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS bookings (
        id VARCHAR(36) PRIMARY KEY,
        user_id VARCHAR(36) NOT NULL,
        room_id VARCHAR(36) NOT NULL,
        check_in_date DATE NOT NULL,
        check_out_date DATE NOT NULL,
        guests INT NOT NULL DEFAULT 1,
        total_nights INT NOT NULL,
        total_amount DECIMAL(10, 2) NOT NULL,
        special_requests TEXT,
        status ENUM('pending', 'confirmed', 'checked_in', 'checked_out', 'cancelled') DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE
      )
    `);
    console.log('✅ Bookings table created');

    // Create Payments table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS payments (
        id VARCHAR(36) PRIMARY KEY,
        booking_id VARCHAR(36) NOT NULL,
        user_id VARCHAR(36) NOT NULL,
        amount DECIMAL(10, 2) NOT NULL,
        payment_method ENUM('google_pay', 'phone_pay', 'credit_card', 'debit_card', 'net_banking', 'upi', 'cash') NOT NULL,
        payment_status ENUM('pending', 'processing', 'completed', 'failed', 'refunded') DEFAULT 'pending',
        transaction_id VARCHAR(255),
        card_last_four VARCHAR(4),
        card_brand VARCHAR(50),
        upi_id VARCHAR(255),
        payment_gateway_response JSON,
        paid_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);
    console.log('✅ Payments table created');

    // Create Contact Messages table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS contact_messages (
        id VARCHAR(36) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        phone VARCHAR(20),
        subject VARCHAR(255),
        message TEXT NOT NULL,
        is_read BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Contact Messages table created');

    // Create Events/Conference Bookings table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS event_bookings (
        id VARCHAR(36) PRIMARY KEY,
        user_id VARCHAR(36),
        event_type ENUM('conference', 'wedding', 'meeting', 'party', 'other') NOT NULL,
        event_name VARCHAR(255) NOT NULL,
        event_date DATE NOT NULL,
        start_time TIME NOT NULL,
        end_time TIME NOT NULL,
        guests_count INT NOT NULL,
        requirements TEXT,
        total_amount DECIMAL(10, 2),
        status ENUM('inquiry', 'pending', 'confirmed', 'completed', 'cancelled') DEFAULT 'inquiry',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
      )
    `);
    console.log('✅ Event Bookings table created');

    // Insert sample rooms data
    await connection.query(`
      INSERT IGNORE INTO rooms (id, room_number, room_type, name, description, price_per_night, capacity, amenities, images) VALUES
      ('room-001', '101', 'deluxe', 'Deluxe Room', 'Comfortable room with modern amenities, perfect for business travelers and couples.', 5999.00, 2, '["WiFi", "AC", "TV", "Mini Bar", "Room Service"]', '["room-deluxe.jpg"]'),
      ('room-002', '102', 'deluxe', 'Deluxe Room', 'Comfortable room with modern amenities, perfect for business travelers and couples.', 5999.00, 2, '["WiFi", "AC", "TV", "Mini Bar", "Room Service"]', '["room-deluxe.jpg"]'),
      ('room-003', '201', 'executive', 'Executive Room', 'Spacious room with premium amenities, ideal for extended stays and business executives.', 8999.00, 3, '["WiFi", "AC", "TV", "Mini Bar", "Room Service", "Work Desk", "Lounge Access"]', '["room-executive.jpg"]'),
      ('room-004', '202', 'executive', 'Executive Room', 'Spacious room with premium amenities, ideal for extended stays and business executives.', 8999.00, 3, '["WiFi", "AC", "TV", "Mini Bar", "Room Service", "Work Desk", "Lounge Access"]', '["room-executive.jpg"]'),
      ('room-005', '301', 'suite', 'Presidential Suite', 'Luxurious suite with separate living area, breathtaking views, and personalized service.', 15999.00, 4, '["WiFi", "AC", "TV", "Mini Bar", "Room Service", "Work Desk", "Lounge Access", "Private Balcony", "Jacuzzi", "Butler Service"]', '["room-suite.jpg"]'),
      ('room-006', '302', 'suite', 'Presidential Suite', 'Luxurious suite with separate living area, breathtaking views, and personalized service.', 15999.00, 4, '["WiFi", "AC", "TV", "Mini Bar", "Room Service", "Work Desk", "Lounge Access", "Private Balcony", "Jacuzzi", "Butler Service"]', '["room-suite.jpg"]')
    `);
    console.log('✅ Sample rooms data inserted');

    console.log('\n🎉 Database initialization completed successfully!');
    
  } catch (error) {
    console.error('❌ Database initialization failed:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
};

// Run initialization
initDatabase();
