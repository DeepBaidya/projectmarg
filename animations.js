document.addEventListener('DOMContentLoaded', () => {
    
    // 1. Footer Year
    const yearSpan = document.getElementById("year");
    if(yearSpan) yearSpan.textContent = new Date().getFullYear();

    // 2. Mobile Nav Toggle
    const toggle = document.querySelector('.nav-toggle');
    const navLinks = document.querySelector('.nav-links');
    if(toggle && navLinks) {
        toggle.addEventListener('click', () => {
            navLinks.classList.toggle('active');
        });
    }

    // 3. MAP INITIALIZATION (Zoom Enabled: True)
    const map = L.map("map", { scrollWheelZoom: true }).setView([12.9716, 77.5946], 13);

    // Satellite Layer
    L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        attribution: 'Tiles &copy; Esri'
    }).addTo(map);

    // Labels Layer
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}{r}.png', {
        pane: 'shadowPane'
    }).addTo(map);

    // Dummy Markers (Example data)
    const severityHigh = { color: '#f72585', fillColor: '#f72585', fillOpacity: 0.8, radius: 80 };
    const severityMed = { color: '#f7a925', fillColor: '#f7a925', fillOpacity: 0.8, radius: 60 };

    L.circle([12.975, 77.59], severityHigh).addTo(map)
        .bindPopup("<b>Critical Pothole</b><br>Severity: High");

    L.circle([12.968, 77.6], severityMed).addTo(map)
        .bindPopup("<b>Surface Crack</b><br>Severity: Medium");

    // 4. Scroll Animation
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add('reveal');
            }
        });
    }, { threshold: 0.1 });
    
    document.querySelectorAll('.pre-reveal').forEach((el) => observer.observe(el));

    // --- User Geolocation: request permission and show user location on the map ---
    const locateBtn = document.getElementById('locate-btn');
    let userMarker = null;

    function onLocationSuccess(position) {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;

        if (userMarker) map.removeLayer(userMarker);

        userMarker = L.marker([lat, lng]).addTo(map);
        map.setView([lat, lng], 15);
    }

    function onLocationError(err) {
        console.warn('Geolocation error:', err);
        alert('Unable to retrieve location: ' + (err.message || 'permission denied'));
        if (locateBtn) {
            locateBtn.disabled = false;
            locateBtn.textContent = '📍 Locate me';
        }
    }

    function locateUser() {
        if (!navigator.geolocation) {
            alert('Geolocation is not supported by your browser.');
            return;
        }
        if (locateBtn) {
            locateBtn.disabled = true;
            locateBtn.textContent = 'Locating...';
        }
        navigator.geolocation.getCurrentPosition((pos) => {
            onLocationSuccess(pos);
            if (locateBtn) {
                locateBtn.disabled = false;
                locateBtn.textContent = '📍 Locate me';
            }
        }, onLocationError, { enableHighAccuracy: true, timeout: 10000 });
    }

    if (locateBtn) {
        locateBtn.addEventListener('click', locateUser);
        // Ask once (confirm) whether user wants to share their location on load
        setTimeout(() => {
            try {
                if (confirm('Allow RoadIntel to access your location to show it on the map?')) {
                    locateUser();
                }
            } catch (e) {
                // some browsers may block repeated prompts; ignore
            }
        }, 900);
    }
});