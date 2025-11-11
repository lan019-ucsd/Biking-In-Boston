import mapboxgl from 'https://cdn.jsdelivr.net/npm/mapbox-gl@2.15.0/+esm';
import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm';


console.log('Mapbox GL JS Loaded:', mapboxgl);

mapboxgl.accessToken = 'pk.eyJ1IjoibGFuMDE5IiwiYSI6ImNtaHR1a2JqODF3cGQyanBqZWswbGdiYTUifQ.TvJAT73RHKnClFO4WohpIw';

// Initialize the map
const map = new mapboxgl.Map({
  container: 'map', // ID of the div where the map will render
  style: 'mapbox://styles/mapbox/streets-v12', // Map style
  center: [-71.09415, 42.36027], // [longitude, latitude]
  zoom: 12, // Initial zoom level
  minZoom: 5, // Minimum allowed zoom
  maxZoom: 18, // Maximum allowed zoom
});

map.addControl(new mapboxgl.NavigationControl());

map.on('load', async () => { 
    console.log('Map loaded');

    /* Boston */
    map.addSource('boston_route', {
        type: 'geojson',
        data: 'https://bostonopendata-boston.opendata.arcgis.com/datasets/boston::existing-bike-network-2022.geojson',
    });

    map.addLayer({
        id: 'bike-lanes',
        type: 'line',
        source: 'boston_route',
        paint: {
            'line-color': '#1E7D30',
            'line-width': 3,
            'line-opacity': 0.4,
        },
    });

    /* Cambridge */
    map.addSource('cambridge_route', {
        type: 'geojson',
        data: 'https://raw.githubusercontent.com/cambridgegis/cambridgegis_data/main/Recreation/Bike_Facilities/RECREATION_BikeFacilities.geojson',
    });

    map.addLayer({
        id: 'bike-lanes-cambridge',
        type: 'line',
        source: 'cambridge_route',
        paint: {
            'line-color': '#0C61B0',
            'line-width': 3,
            'line-opacity': 0.4,
        },
    });

    /* Bike Station */
    let jsonData;
    
    try {
        const jsonData = await d3.json('https://dsc106.com/labs/lab07/data/bluebikes-stations.json');
        const stations = jsonData.data.stations;
        console.log('Stations Array:', stations);

        const svg = d3
            .select('#map').append('svg')
            .style('position', 'absolute')
            .style('z-index', 1)
            .style('width', '100%')
            .style('height', '100%')
            .style('pointer-events', 'none');

        function getCoords(station) {
            const point = new mapboxgl.LngLat(+station.lon, +station.lat); // Convert lon/lat to Mapbox LngLat
            const { x, y } = map.project(point); // Project to pixel coordinates
            return { cx: x, cy: y }; // Return as object for use in SVG attributes
        }

        // Append circles to the SVG for each station
        const circles = svg
            .selectAll('circle')
            .data(stations)
            .enter()
            .append('circle')
            .attr('r', 5) // Radius of the circle
            .attr('fill', 'steelblue') // Circle fill color
            .attr('stroke', 'white') // Circle border color
            .attr('stroke-width', 1) // Circle border thickness
            .attr('opacity', 0.8); // Circle opacity


        // Function to update circle positions when the map moves/zooms
        function updatePositions() {
            circles
            .attr('cx', (d) => getCoords(d).cx) // Set the x-position using projected coordinates
            .attr('cy', (d) => getCoords(d).cy); // Set the y-position using projected coordinates
        }

        // Initial position update when map loads
        updatePositions();

        // Reposition markers on map interactions
        map.on('move', updatePositions); // Update during map movement
        map.on('zoom', updatePositions); // Update during zooming
        map.on('resize', updatePositions); // Update on window resize
        map.on('moveend', updatePositions); // Final adjustment after movement ends

    } catch (error) {
        console.error('Error loading:', error);
    }

});

