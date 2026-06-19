import { useState } from "react";
import { motion } from "framer-motion";
import { Phone, MapPin, Mail, Clock, User, MessageSquare } from "lucide-react";
import { TextField, TextArea } from "./ui/TextField";
import "./ContactSection.css";

const ContactSection = () => {
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Simple form reset without backend
    setForm({ name: "", email: "", phone: "", message: "" });
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  };

  return (
    <section id="contact" className="contact-section">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="section-header"
        >
          <p className="section-subtitle">Get In Touch</p>
          <h2 className="section-title">Contact Us</h2>
          <div className="divider" />
        </motion.div>

        <div className="contact-grid">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="contact-info"
          >
            <div className="contact-details-grid">
              {[
                { icon: Phone, label: "Call Us", value: "95956 95956" },
                { icon: MapPin, label: "Address", value: "Narhe Ambegaon, Pune - 411041" },
                { icon: Mail, label: "Email", value: "info@deccanpavilion.com" },
                { icon: Clock, label: "Check-in / Check-out", value: "12:00 PM / 11:00 AM" },
              ].map((item) => (
                <div key={item.label} className="contact-item">
                  <div className="icon-wrapper">
                    <item.icon className="icon" />
                  </div>
                  <div>
                    <h4 className="item-label">{item.label}</h4>
                    <p className="item-value">{item.value}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="map-container">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3784.5346120843997!2d73.82260097523536!3d18.45942788262229!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bc295391f411f43%3A0x9b809412b91d1dea!2sHotel%20Deccan%20Pavilion!5e0!3m2!1sen!2sin!4v1773929122228!5m2!1sen!2sin"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Hotel Deccan Pavilion Location"
              />
            </div>
          </motion.div>

          <motion.form
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            onSubmit={handleSubmit}
            className="contact-form"
          >
            <h3 className="form-title">Send us a message</h3>
            {submitted && (
              <div className="success-message">
                Thank you! We'll get back to you shortly.
              </div>
            )}
            <TextField
              label="Your Name"
              icon={User}
              type="text"
              placeholder="Enter name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
            <TextField
              label="Email Address"
              icon={Mail}
              type="email"
              placeholder="Enter email address"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
            <TextField
              label="Phone Number"
              icon={Phone}
              type="tel"
              placeholder="Enter phone number"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
            <TextArea
              label="Your Message"
              icon={MessageSquare}
              placeholder="Enter message"
              rows={4}
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              required
            />
            <button 
              type="submit" 
              className="submit-button"
            >
              Send Message
            </button>
          </motion.form>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;