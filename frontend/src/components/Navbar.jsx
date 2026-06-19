import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Phone } from "lucide-react";
import './Navbar.css';

const navLinks = [
  { label: "Rooms", href: "#rooms" },
  { label: "Dining", href: "#dining" },
  { label: "Events", href: "#events" },
  { label: "Contact", href: "#contact" },
];

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <motion.nav
      initial={{ y: -80 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6 }}
      className={`navbar ${scrolled ? "scrolled" : "transparent"}`}
    >
      <div className="nav-container">
        <a href="#" className="logo">
          <img src="/favicon.png" alt="Deccan Pavilion logo" className="logo-img" />
          <span className="logo-text">
            <span className="gold-text">Deccan</span>
            <span className="logo-pavilion">Pavilion</span>
          </span>
        </a>

        <div className="desktop-nav">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="nav-link"
            >
              {link.label}
            </a>
          ))}
          <a
            href="tel:+919595695956"
            className="phone-link"
          >
            <Phone className="h-4 w-4" />
            <span>95956 95956</span>
          </a>
        </div>

        <div className="mobile-menu-container">
          <button
            onClick={() => setOpen(true)}
            className="menu-button"
            aria-label="Open menu"
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="mobile-menu-overlay open"
          >
            <div className="menu-content">
              <button
                onClick={() => setOpen(false)}
                className="close-button"
                aria-label="Close menu"
              >
                <X className="h-6 w-6" />
              </button>
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="menu-item"
                  onClick={() => setOpen(false)}
                >
                  {link.label}
                </a>
              ))}
              <a
                href="tel:+919595695956"
                className="phone-menu-item"
              >
                <Phone className="h-5 w-5" />
                <span>95956 95956</span>
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

export default Navbar;