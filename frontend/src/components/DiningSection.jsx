import { useState } from "react";
import { motion } from "framer-motion";
import { UtensilsCrossed, Wine, TreePine } from "lucide-react";
import diningImage from "../assets/dining.jpg";
import "./DiningSection.css";

const DiningSection = () => {
  const [venues] = useState([
    {
      id: "1",
      name: "Chhavni Restaurant",
      icon: UtensilsCrossed,
      description: "Multi-cuisine fine dining with authentic Maharashtrian and continental flavors. A perfect blend of tradition and modern gastronomy.",
    },
    {
      id: "2",
      name: "Terrace Lounge",
      icon: Wine,
      description: "Unwind with handcrafted cocktails and panoramic views. Perfect for evening conversations and celebrations.",
    },
    {
      id: "3",
      name: "Garden Restaurant & Bar",
      icon: TreePine,
      description: "Al fresco dining amidst lush greenery. Savor grilled delicacies under the stars with live music.",
    },
  ]);

  return (
    <section id="dining" className="dining-section">
      <div className="container">
        <div className="dining-content">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="image-container"
          >
            <img src={diningImage} alt="Fine dining at Deccan Pavilion" className="dining-image" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="dining-info"
          >
            <div className="section-header">
              <p className="section-subtitle">Food & Wine</p>
              <h2 className="section-title">Culinary Excellence</h2>
              <div className="divider" />
            </div>

            <div className="venues-container">
              {venues.map((venue) => (
                <div key={venue.id || venue.name} className="venue-card">
                  <div className="venue-content">
                    <div className="icon-wrapper">
                      <venue.icon className="venue-icon" />
                    </div>
                    <div>
                      <h3 className="venue-name">{venue.name}</h3>
                      <p className="venue-description">{venue.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default DiningSection;