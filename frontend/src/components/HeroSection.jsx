import { motion } from 'framer-motion';
import { Phone, MapPin, Star } from 'lucide-react';
import heroImage from '../assets/hero-hotel.jpg';
import './HeroSection.css';

const HeroSection = () => {
    return (
        <section className='hero-section'>
            <div className='hero-image-container'>
                <img src={heroImage} alt="Deccan Pavilion luxury hotel lobby" className='hero-image' />
                <div className="hero-overlay" />
            </div>

            <div className="hero-content">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    className="hero-text">

                    <div className='stars-container'>
                        {[...Array(5)].map((_, i) => (
                            <Star key={i} className="star-icon" />
                        ))}
                    </div>

                    <h1 className='hero-title'>
                        <span className='gold-text'>Deccan</span>{" "}
                        <span>Pavilion</span>
                    </h1>

                    <div className='hero-subtitle-container'>
                        <p className='hero-subtitle'>
                            Reach · Relax · Revel
                        </p>
                        <div className='subtitle-underline'></div>
                    </div>

                    <div className='location-container'>
                        <MapPin className="location-icon" />
                        <span className="location-text">Narhe Ambegaon, Pune - 411041</span>
                    </div>

                </motion.div>
            </div>

        </section>
    )
}

export default HeroSection;