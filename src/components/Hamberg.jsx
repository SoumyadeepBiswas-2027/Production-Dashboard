import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";


export default function Hamberg() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Hamburger Icon OR Close Button - same position */}
      <div
        style={{
          position: "fixed",
          top: "24px",
          left: "24px",
          zIndex: 9999,
          cursor: "pointer",
        }}
        onClick={() => setOpen(!open)}
      >
        {open ? (
          // Show X when menu is open
          <div style={{ fontSize: "24px", color: "white" }}>✕</div>
        ) : (
          // Show hamburger when menu is closed
          <>
            <div
              style={{
                width: "32px",
                height: "3px",
                backgroundColor: "white",
                marginBottom: "6px",
                borderRadius: "2px",
              }}
            ></div>
            <div
              style={{
                width: "24px",
                height: "3px",
                backgroundColor: "white",
                borderRadius: "2px",
              }}
            ></div>
          </>
        )}
      </div>

      {/* Overlay Menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            style={{
              position: "fixed",
              inset: 0,
              backgroundColor: "rgba(15, 10, 40, 0.85)",
              backdropFilter: "blur(20px)",
              WebkitBackdropFilter: "blur(20px)",
              zIndex: 9998,
              padding: "32px",
            }}
          >
            {/* Menu Content - no close button here anymore */}
            <div
              style={{
                marginTop: "60px",
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: "24px",
              }}
            >
              <div
                style={{
                  backgroundColor: "black",
                  color: "white",
                  padding: "24px",
                  borderRadius: "16px",
                }}
              >
                <h2 style={{ fontSize: "20px", marginBottom: "16px" }}>
                  About
                </h2>
                <p>Company</p>
                <p>Careers</p>
              </div>

              <div
                style={{
                  backgroundColor: "#581c87",
                  color: "white",
                  padding: "24px",
                  borderRadius: "16px",
                }}
              >
                <h2 style={{ fontSize: "20px", marginBottom: "16px" }}>
                  Projects
                </h2>
                <p>Featured</p>
                <p>Case Studies</p>
              </div>

              <div
                style={{
                  backgroundColor: "#1f2937",
                  color: "white",
                  padding: "24px",
                  borderRadius: "16px",
                }}
              >
                <h2 style={{ fontSize: "20px", marginBottom: "16px" }}>
                  Contact
                </h2>
                <p>Email</p>
                <p>Twitter</p>
                <p>LinkedIn</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}