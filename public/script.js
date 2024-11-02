// Wait for everything to load
document.addEventListener('DOMContentLoaded', () => {
    const socket = io();
    
    // Initialize map with a wider initial view
    const map = L.map("map").setView([20, 0], 2);
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);
    
    const markers = {};

    // Explicitly request location permission and handle it
    function requestLocation() {
        console.log("Requesting location...");
        
        // First try getting a single position to test permissions
        navigator.geolocation.getCurrentPosition(
            (position) => {
                console.log("Initial position received");
                const { latitude, longitude } = position.coords;
                
                // Center map on initial position
                map.setView([latitude, longitude], 13);
                
                // Create or update marker for own position
                if (!markers['self']) {
                    markers['self'] = L.marker([latitude, longitude])
                        .bindPopup('Your location')
                        .addTo(map);
                } else {
                    markers['self'].setLatLng([latitude, longitude]);
                }

                // Start watching position
                navigator.geolocation.watchPosition(
                    (position) => {
                        const { latitude, longitude } = position.coords;
                        console.log("Position update:", { latitude, longitude });
                        
                        // Update own marker
                        if (markers['self']) {
                            markers['self'].setLatLng([latitude, longitude]);
                        }
                        
                        // Send location to server
                        socket.emit("send-location", { latitude, longitude });
                    },
                    (error) => {
                        console.error("Watch position error:", error.message);
                        alert("Error getting location updates: " + error.message);
                    },
                    {
                        enableHighAccuracy: true,
                        timeout: 5000,
                        maximumAge: 0
                    }
                );
            },
            (error) => {
                console.error("Initial position error:", error);
                alert("Error getting location: " + error.message);
            }
        );
    }

    // Check for geolocation support and request permission
    if ("geolocation" in navigator) {
        console.log("Geolocation is supported");
        requestLocation();
    } else {
        console.error("Geolocation is not supported");
        alert("Your browser doesn't support geolocation");
    }

    // Socket event handlers
    socket.on("receive-location", (data) => {
        console.log("Received location:", data);
        const { id, latitude, longitude } = data;
        
        // Don't create duplicate markers for own position
        if (id !== socket.id) {
            if (markers[id]) {
                markers[id].setLatLng([latitude, longitude]);
            } else {
                markers[id] = L.marker([latitude, longitude])
                    .bindPopup('Other user')
                    .addTo(map);
            }
        }
    });

    socket.on("user-disconnected", (id) => {
        if (markers[id]) {
            map.removeLayer(markers[id]);
            delete markers[id];
        }
    });

    // Log connection status
    socket.on('connect', () => {
        console.log('Connected to server');
    });

    socket.on('connect_error', (error) => {
        console.error('Connection error:', error);
    });
});
