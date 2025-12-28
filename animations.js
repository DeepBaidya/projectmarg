document.addEventListener('DOMContentLoaded', () => {
    
    const yearSpan = document.getElementById("year");
    if(yearSpan) yearSpan.textContent = new Date().getFullYear();

    const toggle = document.querySelector('.nav-toggle');
    const navLinks = document.querySelector('.nav-links');
    if(toggle && navLinks) {
        toggle.addEventListener('click', () => {
            navLinks.classList.toggle('active');
        });
    }

    // --- MAP INITIALIZATION ---
    // CHANGED: scrollWheelZoom set to TRUE
    const map = L.map("map", { scrollWheelZoom: true }).setView([12.9716, 77.5946], 13);

    L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        attribution: 'Tiles &copy; Esri'
    }).addTo(map);

    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}{r}.png', {
        pane: 'shadowPane'
    }).addTo(map);

    // Markers
    const severityHigh = { color: '#f72585', fillColor: '#f72585', fillOpacity: 0.8, radius: 80 };
    const severityMed = { color: '#f7a925', fillColor: '#f7a925', fillOpacity: 0.8, radius: 60 };

    L.circle([12.975, 77.59], severityHigh).addTo(map)
        .bindPopup("<b>Critical Pothole</b><br>Severity: High");

    L.circle([12.968, 77.6], severityMed).addTo(map)
        .bindPopup("<b>Surface Crack</b><br>Severity: Medium");

    // Scroll Animation
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add('reveal');
            }
        });
    }, { threshold: 0.1 });
    
    document.querySelectorAll('.pre-reveal').forEach((el) => observer.observe(el));
});