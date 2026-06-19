import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Bed, Bath, Wifi, Tv, Coffee, Users } from "lucide-react";
import roomSuite from "../assets/room-suite.jpg";
import roomExecutive from "../assets/room-executive.jpg";
import roomDeluxe from "../assets/room-deluxe.jpg";
import "./RoomsSection.css";

const RoomsSection = () => {
  const navigate = useNavigate();
  const [rooms] = useState([
    {
      id: "1",
      name: "Plush Suite",
      image: roomSuite,
      price: "₹8,500",
      description: "Get away from the stress of your hectic lifestyle. Soak in the comfort of our warm rooms with premium king-size beds and luxury amenities.",
      size: "550 sq ft",
      features: [
        { icon: Bed, label: "King Bed" },
        { icon: Bath, label: "Jacuzzi" },
        { icon: Wifi, label: "High-Speed WiFi" },
        { icon: Tv, label: "55\" Smart TV" },
        { icon: Coffee, label: "Mini Bar" },
        { icon: Users, label: "2 Guests" },
      ],
    },
    {
      id: "2",
      name: "Executive Room",
      image: roomExecutive,
      price: "₹5,500",
      description: "Perfect for business travelers. Spacious rooms with dedicated work desk, city views, and all modern amenities for a productive stay.",
      size: "400 sq ft",
      features: [
        { icon: Bed, label: "Queen Bed" },
        { icon: Bath, label: "Rain Shower" },
        { icon: Wifi, label: "High-Speed WiFi" },
        { icon: Tv, label: "42\" Smart TV" },
        { icon: Coffee, label: "Tea/Coffee" },
        { icon: Users, label: "2 Guests" },
      ],
    },
    {
      id: "3",
      name: "Deluxe Room",
      image: roomDeluxe,
      price: "₹3,500",
      description: "Comfortable and elegant rooms ideal for leisure and business travelers. Twin beds available with all essential amenities for a perfect stay.",
      size: "320 sq ft",
      features: [
        { icon: Bed, label: "Twin Beds" },
        { icon: Bath, label: "Shower" },
        { icon: Wifi, label: "WiFi" },
        { icon: Tv, label: "Smart TV" },
        { icon: Coffee, label: "Tea/Coffee" },
        { icon: Users, label: "2 Guests" },
      ],
    },
  ]);

  return (
    <section id="rooms" className="rooms-section">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="section-header"
        >
          <p className="section-subtitle">Accommodations</p>
          <h2 className="section-title">Our Rooms & Suites</h2>
          <div className="divider" />
        </motion.div>

        <div className="rooms-container">
          {rooms.map((room, index) => (
            <motion.div
              key={room.id || room.name}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className={`room-card ${index % 2 === 1 ? "reverse" : ""}`}
            >
              <div className="room-image-container">
                <img
                  src={room.image}
                  alt={room.name}
                  className="room-image"
                />
              </div>

              <div className="room-content">
                <div>
                  <p className="room-size">{room.size}</p>
                  <h3 className="room-name">{room.name}</h3>
                </div>
                <p className="room-description">{room.description}</p>
                <div className="features-grid">
                  {room.features.map((f, idx) => (
                    <div key={idx} className="feature-item">
                      <f.icon className="feature-icon" />
                      <span>{f.label}</span>
                    </div>
                  ))}
                </div>
                <div className="price-container">
                  <div>
                    <span className="price">{room.price}</span>
                    <span className="price-unit"> / night</span>
                  </div>
                  <button 
                    className="book-button"
                    onClick={() => navigate(`/booking?type=${room.type || room.name.toLowerCase().replace(' ', '-')}`)}
                  >
                    Book Now
                  </button>
                </div>
                <div className="room-divider" />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default RoomsSection;