import Navbar from "../components/Navbar";
import HeroSection from "../components/HeroSection";
import RoomsSection from "../components/RoomsSection";
import DiningSection from "../components/DiningSection";
import EventsSection from "../components/EventsSection";
import ContactSection from "../components/ContactSection";
import Footer from "../components/Footer";
import { useRef } from "react";
import "./Index.css";

const Index = () => {
  const roomsRef = useRef(null);
  
  const scrollToRooms = () => {
    roomsRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  
  return (
    <div className="app-container">
      <Navbar />
      <HeroSection onReserveClick={scrollToRooms} onExploreClick={scrollToRooms} />
      <div ref={roomsRef}>
        <RoomsSection />
      </div>
      <DiningSection />
      <EventsSection />
      <ContactSection />
      <Footer />
    </div>
  );
};

export default Index;