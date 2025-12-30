export default function getDistanceToRoad(p, a, b) {
    const y1 = a.lat, x1 = a.lng;
    const y2 = b.lat, x2 = b.lng;
    const yP = p.lat, xP = p.lng;

    // 1. Calculate the squared length of the line segment AB
    const dx = x2 - x1;
    const dy = y2 - y1;
    const segmentLenSq = dx * dx + dy * dy;

    if (segmentLenSq === 0) return getPythagorasDistance(p, a);

    // 2. Project point P onto the line AB to find the closest point on the line
    // t is the projection factor (clamped between 0 and 1)
    let t = ((xP - x1) * dx + (yP - y1) * dy) / segmentLenSq;
    t = Math.max(0, Math.min(1, t));

    // 3. Find the coordinates of the closest point on the segment
    const closestPoint = {
        lat: y1 + t * dy,
        lng: x1 + t * dx
    };

    // 4. Return the distance in meters
    return calculateHaversine(p, closestPoint);
}

// Helper to convert lat/lng to meters accurately
function calculateHaversine(p1, p2) {
    const R = 6371e3; // Earth radius in meters
    const φ1 = p1.lat * Math.PI / 180;
    const φ2 = p2.lat * Math.PI / 180;
    const Δφ = (p2.lat - p1.lat) * Math.PI / 180;
    const Δλ = (p2.lng - p1.lng) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; 
}