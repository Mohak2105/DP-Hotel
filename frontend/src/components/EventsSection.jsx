import { useState } from "react";
import { motion } from "framer-motion";
import { Presentation, Users, PartyPopper } from "lucide-react";
import conferenceImage from "../assets/conference.jpg";
import "./EventsSection.css";

const EventsSection = () => {
  const [events] = useState([
    {
      id: "1",
      title: "Conference Hall",
      icon: Presentation,
      description: "State-of-the-art AV equipment, seating for 100+ guests, ideal for corporate meetings and seminars.",
    },
    {
      id: "2",
      title: "Banquet Hall",
      icon: PartyPopper,
      description: "Elegant venue for weddings, receptions, and grand celebrations with customized catering services.",
    },
    {
      id: "3",
      title: "Board Room",
      icon: Users,
      description: "Intimate private meetings with video conferencing facilities and dedicated support staff.",
    },
  ]);

  return (
    <section id="events" className="events-section">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="section-header"
        >
          <p className="section-subtitle">Meetings & Events</p>
          <h2 className="section-title">Conference & Banquet</h2>
          <div className="divider" />
        </motion.div>

        <div className="events-content">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="image-container"
          >
            <img src={conferenceImage} alt="Conference room" className="events-image" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="events-info"
          >
            <div className="events-grid">
              {events.map((item) => (
                <div key={item.id || item.title} className="event-item">
                  <div className="icon-wrapper">
                    <item.icon className="event-icon" />
                  </div>
                  <div>
                    <h3 className="event-title">{item.title}</h3>
                    <p className="event-description">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
            <button 
              className="enquire-button"
              onClick={() => document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" })}
            >
              Enquire Now
            </button>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default EventsSection;