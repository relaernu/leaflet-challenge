// get earthquake data
var queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

// define colors
var colors = ["#69B34C", "#ACB334", "#FAB733", "#FF8E15", "#FF4E11", "#FF0D0D"];

// get color code for different magnitued
function getColor(magnitude) {
    return colors[Math.floor(magnitude)];
}

d3.json(queryUrl, data => {
    createFeature(data.features)
});

// Set up the legend
function createLegend() {
    var legend = L.control({ position: "bottomright" });
    legend.onAdd = function () {
        var div = L.DomUtil.create("div", "info legend");
        var magnitude = [0,1,2,3,4,5];
        var labels = ["0-1", "1-2", "2-3","3-4","4-5","5+"];

        magnitude.forEach((mag, index) =>
            {
                div.innerHTML += `<li><span style="background-color: ${colors[index]}"></span>${labels[index]}</li>`;
            });

        // // Add min & max
        // var legendInfo = "<h1>Median Income</h1>" +
        //     "<div class=\"labels\">" +
        //     "<div class=\"min\">" + limits[0] + "</div>" +
        //     "<div class=\"max\">" + limits[limits.length - 1] + "</div>" +
        //     "</div>";

        // limits.forEach(function (limit, index) {
        //     labels.push("<li style=\"background-color: " + colors[index] + "\"></li>");
        // });

        div.innerHTML = `<ul id="leg">` + div.innerHTML + "</ul>";
        return div;
    }
    return legend;
}


function createFeature(featureData) {

    // get size for different magnitued
    function getSize(magnitude) {
        return Math.floor(magnitude) * 5;
    }

    // to create circle marker with popup
    function circleMarker(feature, latlng) {
        var circle = L.circleMarker(latlng, {
            color: "white",
            fillColor: getColor(feature.properties.mag),
            fillOpacity: 0.75,
            radius: getSize(feature.properties.mag)
        }).bindPopup("<h3>" + feature.properties.place + "(" + feature.properties.mag + ")" +
                 "</h3><hr><p>" + new Date(feature.properties.time) + "</p>");
        return circle;
    }

    // create marker variable to create the overlay layer
    var earthquakes = L.geoJSON(featureData, {
        pointToLayer: circleMarker
    });

    // Sending earthquakes layer to the createMap function
    var myMap = createMap(earthquakes);

}

function createMap(earthquakes) {
    var streetmap = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
        attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
        tileSize: 512,
        maxZoom: 18,
        zoomOffset: -1,
        id: "mapbox/streets-v11",
        accessToken: API_KEY
    });

    var darkmap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
        attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
        maxZoom: 18,
        id: "dark-v10",
        accessToken: API_KEY
    });

    // Define a baseMaps object to hold our base layers
    var baseMaps = {
        "Street Map": streetmap,
        "Dark Map": darkmap
    };

    // Create overlay object to hold our overlay layer
    var overlayMaps = {
        Earthquakes: earthquakes
    };

    // Create our map, giving it the streetmap and earthquakes layers to display on load
    var myMap = L.map("map", {
        center: [
            37.09, -95.71
        ],
        zoom: 5,
        layers: [streetmap, earthquakes]
    });

    // Create a layer control
    // Pass in our baseMaps and overlayMaps
    // Add the layer control to the map
    L.control.layers(baseMaps, overlayMaps, {
        collapsed: false
    }).addTo(myMap);

    var legend = createLegend()

    legend.addTo(myMap);

    return myMap;

}

