import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import axios from 'axios'; // Import Axios
import 'leaflet/dist/leaflet.css';
import './App.css';

// --- Components ---

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <nav className="navbar">
      <div className="logo">Road<span>Intel</span></div>
      <div className="nav-toggle" onClick={() => setIsOpen(!isOpen)}>☰</div>
      <ul className={`nav-links ${isOpen ? 'active' : ''}`}>
        <li><a href="#home" onClick={() => setIsOpen(false)}>Home</a></li>
        <li><a href="#features" onClick={() => setIsOpen(false)}>Features</a></li>
        <li><a href="#why-section" onClick={() => setIsOpen(false)}>Why Us?</a></li>
        <li><a href="#map-section" onClick={() => setIsOpen(false)}>Live Map</a></li>
      </ul>
    </nav>
  );
};

const Hero = () => (
  <section id="home" className="hero-bg">
    <div className="hero-overlay"></div>
    <div className="hero-bulge pre-reveal">
      <h1>Mapping the Future of <br /><span>Road Safety</span></h1>
      <p>AI-powered road intelligence transforming daily vehicle movement into actionable city infrastructure insights.</p>
      <a href="#map-section"><button className="btn-main">View Live Map</button></a>
      <div className="upload-section">
        <p className="upload-label">Contribute Road Data</p>
        <form className="upload-form">
          <label className="btn-upload btn-image">
            <input type="file" name="roadImage" accept="image/*" />
            <span>📷 Upload Photo</span>
          </label>
          <label className="btn-upload btn-video">
            <input type="file" name="roadVideo" accept="video/*" />
            <span>🎥 Upload Video</span>
          </label>
        </form>
        <p className="small-text">*Media is analyzed by AI upon selection</p>
      </div>
    </div>
  </section>
);

const Features = () => {
  const features = [
    { title: "Fleet Intelligence", text: "Uses garbage trucks and delivery vehicles to scan roads automatically." },
    { title: "AI Detection", text: "Detects potholes and road damage with severity scoring." },
    { title: "Smart Routing", text: "Helps emergency and delivery vehicles avoid damaged roads." }
  ];
  return (
    <section id="features" className="features-container">
      {features.map((f, i) => (
        <div key={i} className="glass-card pre-reveal">
          <h3>{f.title}</h3>
          <p>{f.text}</p>
        </div>
      ))}
    </section>
  );
};

const MapSection = () => {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const userMarkerRef = useRef(null);
  const markersLayerRef = useRef(null);

  const [btnText, setBtnText] = useState("📍 Locate me");
  const [isLocating, setIsLocating] = useState(false);
  const [mapCenter, setMapCenter] = useState({ lat: 22.97, lng: 88.43 });

  // --- Fetch Data using Axios ---
  const fetchRoadData = (lat, lng, map) => {
    const apiUrl = 'http://localhost:3000/api/v1/map/get';
    const payload = { centerLocation: [lat, lng] };

    axios.post(apiUrl, payload)
      .then(response => {
        const data = response.data;
        console.log(data)
        if (data.success && Array.isArray(data.roads)) {
          processStreetsData(data.roads, map);
        } else {
          // If success is true but roads is empty, clear the map
          if (markersLayerRef.current) {
            markersLayerRef.current.clearLayers();
          }
        }
      })
      .catch(error => {
        console.error("❌ API Failed, clearing map...");

        // THIS IS THE FIX: Remove old lines if the request fails
        if (markersLayerRef.current) {
          markersLayerRef.current.clearLayers();
        }

        // Optional: alert the user or log the status
        // if(error.response?.status === 410) console.log("No city found here");
      });
  };
  useEffect(() => {
    let isMounted = true;

    if (!mapInstanceRef.current && mapContainerRef.current) {
      const map = L.map(mapContainerRef.current, { scrollWheelZoom: true }).setView([22.97, 88.43], 13);
      mapInstanceRef.current = map;

      L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        attribution: 'Tiles &copy; Esri'
      }).addTo(map);

      L.tileLayer('https://{s}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}{r}.png', {
        pane: 'shadowPane'
      }).addTo(map);

      markersLayerRef.current = L.layerGroup().addTo(map);

      // Fetch new data when user stops moving the map
      map.on('moveend', () => {
        if (!isMounted) return;
        const newCenter = map.getCenter();
        setMapCenter({ lat: newCenter.lat.toFixed(5), lng: newCenter.lng.toFixed(5) });
        fetchRoadData(newCenter.lat, newCenter.lng, map);
      });

      // Initial fetch
      fetchRoadData(22.97, 88.43, map);
    }

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.off('moveend');
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  const processStreetsData = (roads, map) => {
    if (!map || !markersLayerRef.current) return;

    markersLayerRef.current.clearLayers();

    // Helper function to determine color based on condition score
    const getConditionColor = (condition) => {
      const score = Number(condition);
      if (score <= 33) return '#ff4d4d'; // Red (Poor)
      if (score <= 66) return '#ffcc00'; // Yellow (Fair)
      return '#00e676'; // Green (Good)
    };

    roads.forEach((road) => {
      if (!road.coordinates || road.coordinates.length < 2) return;

      // Determine the color for this specific road segment
      const roadColor = getConditionColor(road.condition);

      // API: [Lng, Lat] -> Leaflet: [Lat, Lng]
      const polylinePoints = road.coordinates.map(coord => [coord[1], coord[0]]);

      // Draw Polyline with dynamic color
      L.polyline(polylinePoints, {
        color: roadColor, // Dynamic Color applied here
        weight: 7,        // Increased weight for better visibility
        opacity: 0.8,
        lineJoin: 'round'
      }).addTo(markersLayerRef.current)
        .bindPopup(`
        <strong>Road Intelligence</strong><br/>
        ID: ${road._id}<br/>
        Condition Score: <strong>${road.condition}%</strong>
      `);

      // Add dots at start/end with matching colors
      const markerOptions = {
        radius: 5,
        fillColor: roadColor,
        color: '#fff',
        weight: 2,
        fillOpacity: 1
      };

      L.circleMarker(polylinePoints[0], markerOptions).addTo(markersLayerRef.current);
      L.circleMarker(polylinePoints[polylinePoints.length - 1], markerOptions).addTo(markersLayerRef.current);
    });
  };

  const handleLocate = () => {
    if (!navigator.geolocation) return alert('Geolocation not supported');
    setIsLocating(true);
    setBtnText('Locating...');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        if (mapInstanceRef.current) {
          if (userMarkerRef.current) mapInstanceRef.current.removeLayer(userMarkerRef.current);
          userMarkerRef.current = L.marker([latitude, longitude]).addTo(mapInstanceRef.current);
          mapInstanceRef.current.setView([latitude, longitude], 15);
        }
        setIsLocating(false);
        setBtnText('📍 Locate me');
      },
      () => {
        setIsLocating(false);
        setBtnText('📍 Locate me');
        alert('Location access denied');
      }
    );
  };

  return (
    <section id="map-section" className="map-section">
      <div className="section-header pre-reveal">
        <h2 className="section-title">Live Road <span>Condition Map</span></h2>
        <p>Viewing: {mapCenter.lat}, {mapCenter.lng}</p>
      </div>

      <div className="map-wrapper pre-reveal">
        <div ref={mapContainerRef} id="map" style={{ width: '100%', height: '100%' }}></div>
        <button id="locate-btn" className="locate-btn" onClick={handleLocate} disabled={isLocating}>
          {btnText}
        </button>
      </div>
    </section>
  );
};

const WhySection = () => {
  const cards = [
    { img: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=500&auto=format&fit=crop&q=60", title: "The Manual Crisis", text: "Cities rely on slow manual inspections. This 'blind spot' leads to dangerous roads." },
    { img: "https://images.unsplash.com/photo-1570126618953-d437145e8c7e?w=500&auto=format&fit=crop&q=60", title: "Zero-Cost Deployment", text: "We leverage existing municipal fleets using simple cameras.", delay: "0.2s" },
    { img: "https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?w=500&auto=format&fit=crop&q=60", title: "Critical Impact", text: "Faster repairs mean safer cities for everyone.", delay: "0.4s" }
  ];
  return (
    <section id="why-section" className="why-section">
      <div className="section-header pre-reveal">
        <h2 className="section-title">Why <span>RoadIntel</span>?</h2>
      </div>
      <div className="why-grid">
        {cards.map((card, index) => (
          <div key={index} className="glass-card why-card pre-reveal" style={{ transitionDelay: card.delay || '0s' }}>
            <div className="why-img-container"><img src={card.img} alt={card.title} /></div>
            <h3>{card.title}</h3>
            <p>{card.text}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

const Footer = () => (
  <footer><p>© {new Date().getFullYear()} RoadIntel | Hackathon Project</p></footer>
);

function App() {
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) entry.target.classList.add('reveal');
      });
    }, { threshold: 0.1 });
    const elements = document.querySelectorAll('.pre-reveal');
    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <div className="App">
      <Navbar />
      <Hero />
      <Features />
      <MapSection />
      <WhySection />
      <Footer />
    </div>
  );
}

export default App;