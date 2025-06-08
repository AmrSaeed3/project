// This file would be served to the frontend for map integration

// Initialize the map (using Google Maps as an example)
function initMap() {
    const map = new google.maps.Map(document.getElementById('map'), {
        center: { lat: 30.0444, lng: 31.2357 }, // Cairo, Egypt as default
        zoom: 12
    });
    
    const marker = new google.maps.Marker({
        map: map,
        draggable: true
    });
    
    // Add click event to the map
    map.addListener('click', function(event) {
        placeMarker(event.latLng);
    });
    
    // Function to place marker and get address details
    function placeMarker(location) {
        marker.setPosition(location);
        
        // Get address details using reverse geocoding
        const geocoder = new google.maps.Geocoder();
        geocoder.geocode({ 'location': location }, function(results, status) {
            if (status === 'OK') {
                if (results[0]) {
                    const addressComponents = results[0].address_components;
                    const formattedAddress = results[0].formatted_address;
                    const placeId = results[0].place_id;
                    
                    // Extract address components
                    let street = '', city = '', state = '', zip = '', country = '';
                    
                    for (const component of addressComponents) {
                        const types = component.types;
                        
                        if (types.includes('route')) {
                            street = component.long_name;
                        } else if (types.includes('locality')) {
                            city = component.long_name;
                        } else if (types.includes('administrative_area_level_1')) {
                            state = component.long_name;
                        } else if (types.includes('postal_code')) {
                            zip = component.long_name;
                        } else if (types.includes('country')) {
                            country = component.long_name;
                        }
                    }
                    
                    // Fill form fields with address details
                    document.getElementById('street').value = street;
                    document.getElementById('city').value = city;
                    document.getElementById('state').value = state;
                    document.getElementById('zip').value = zip;
                    document.getElementById('country').value = country;
                    document.getElementById('formattedAddress').value = formattedAddress;
                    document.getElementById('placeId').value = placeId;
                    document.getElementById('coordinates').value = JSON.stringify([
                        location.lng(), // Longitude first
                        location.lat()  // Latitude second
                    ]);
                }
            }
        });
    }
    
    // Add search box
    const input = document.getElementById('search-input');
    const searchBox = new google.maps.places.SearchBox(input);
    
    map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);
    
    // Bias the SearchBox results towards current map's viewport
    map.addListener('bounds_changed', function() {
        searchBox.setBounds(map.getBounds());
    });
    
    // Listen for the event fired when the user selects a prediction
    searchBox.addListener('places_changed', function() {
        const places = searchBox.getPlaces();
        
        if (places.length === 0) {
            return;
        }
        
        // For each place, get the location and place marker
        const bounds = new google.maps.LatLngBounds();
        places.forEach(function(place) {
            if (!place.geometry) {
                console.log("Returned place contains no geometry");
                return;
            }
            
            // Place marker at the location
            marker.setPosition(place.geometry.location);
            
            // Extract and fill address details
            const addressComponents = place.address_components;
            const formattedAddress = place.formatted_address;
            const placeId = place.place_id;
            
            let street = '', city = '', state = '', zip = '', country = '';
            
            for (const component of addressComponents) {
                const types = component.types;
                
                if (types.includes('route')) {
                    street = component.long_name;
                } else if (types.includes('locality')) {
                    city = component.long_name;
                } else if (types.includes('administrative_area_level_1')) {
                    state = component.long_name;
                } else if (types.includes('postal_code')) {
                    zip = component.long_name;
                } else if (types.includes('country')) {
                    country = component.long_name;
                }
            }
            
            // Fill form fields with address details
            document.getElementById('street').value = street;
            document.getElementById('city').value = city;
            document.getElementById('state').value = state;
            document.getElementById('zip').value = zip;
            document.getElementById('country').value = country;
            document.getElementById('formattedAddress').value = formattedAddress;
            document.getElementById('placeId').value = placeId;
            document.getElementById('coordinates').value = JSON.stringify([
                place.geometry.location.lng(), // Longitude first
                place.geometry.location.lat()  // Latitude second
            ]);
            
            if (place.geometry.viewport) {
                bounds.union(place.geometry.viewport);
            } else {
                bounds.extend(place.geometry.location);
            }
        });
        
        map.fitBounds(bounds);
    });
}

// Function to submit address to the API
function submitAddress() {
    const addressData = {
        street: document.getElementById('street').value,
        city: document.getElementById('city').value,
        state: document.getElementById('state').value,
        zip: document.getElementById('zip').value,
        country: document.getElementById('country').value,
        phone: document.getElementById('phone').value,
        coordinates: JSON.parse(document.getElementById('coordinates').value),
        formattedAddress: document.getElementById('formattedAddress').value,
        placeId: document.getElementById('placeId').value
    };
    
    // Send data to the API
    fetch('/api/v1/users/address', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(addressData)
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === 'success') {
            alert('Address added successfully!');
            // Redirect or update UI as needed
        } else {
            alert(`Error: ${data.message}`);
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('An error occurred while saving the address.');
    });
}