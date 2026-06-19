import { MapPin, Phone, Mail } from "lucide-react";
import "./Footer.css";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-column">
            <h3 className="hotel-name">
              <img src="/favicon.png" alt="Deccan Pavilion logo" className="footer-logo-img" />
              <span className="footer-logo-text">
                <span className="gold-text">Deccan</span>
                <span className="footer-logo-pavilion">Pavilion</span>
              </span>
            </h3>
            <p className="hotel-description">
              Experience luxury and comfort at Pune's finest boutique hotel. 
              Where tradition meets modern hospitality.
            </p>
          </div>

          <div className="footer-column">
            <h4 className="column-title">Quick Links</h4>
            <div className="links-container">
              <a href="#rooms" className="footer-link">Rooms & Suites</a>
              <a href="#dining" className="footer-link">Food & Wine</a>
              <a href="#events" className="footer-link">Conference & Banquet</a>
              <a href="#contact" className="footer-link">Contact Us</a>
            </div>
          </div>

          <div className="footer-column">
            <h4 className="column-title">Reach Us</h4>
            <div className="contact-info">
              <div className="contact-item">
                <MapPin className="contact-icon" />
                <span>Narhe Ambegaon, Pune - 411041</span>
              </div>
              <div className="contact-item">
                <Phone className="contact-icon" />
                <span>95956 95956</span>
              </div>
              <div className="contact-item">
                <Mail className="contact-icon" />
                <span>info@deccanpavilion.com</span>
              </div>
            </div>
          </div>
        </div>

        <div className="copyright">
          © {new Date().getFullYear()} Deccan Pavilion. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;