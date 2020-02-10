// console.log("main.js loaded")

var width = document.getElementById('map-card').offsetWidth - 100;
var height = document.getElementById('map-card').offsetHeight - 100;

var projection = d3.geoMercator()
var path = d3.geoPath().projection(projection);

var gpsData;

var svg = d3.select('#map-card').append('svg')
    .attr("preserveAspectRatio", "xMinYMin meet")
    .attr("viewBox", "0 0 " + String(width) + " " + String(height))
    // Class to make it responsive.
    .classed("svg-content-responsive", true)
var zoom = d3.zoom()
    .scaleExtent([1, 40])
    .translateExtent([
        [-100, -100],
        [width + 90, height + 100]
    ])
    .on("zoom", zoomed);

car_id_to_name = {};

lastPersonSelection = 0;

d3.queue()
    .defer(d3.json, 'data/Abila.json')
    .defer(d3.csv, 'data/gps_1.csv') //
    .defer(d3.csv, 'data/gps.csv')
    .defer(d3.csv, 'data/car-assignments.csv')
    .await(ready);

function ready(error, d, gpsWithID10, gps, carAssign) {
    projection.fitExtent([
        [0, 0],
        [width, height]
    ], d);

    view = svg.selectAll("path")
        .data(d.features)
        .enter().append('path')
        .attr('d', path)

    gpsData = gps;

    d3.values(carAssign).map(function (d) {
        return car_id_to_name[d.FirstName + ' ' + d.LastName] = d.CarID;
    });

    d3.select('#person-select')
        .on('change', function() {
            // Draw Routes
            var selectedName = d3.select('#person-select').property('value');
            var filteredData = gpsData.filter(d => d.id == car_id_to_name[selectedName]);
            drawRoutes(filteredData);

            // Draw Analysis
            d3.select('[id="' + lastLocationSelection + '-Transactions"]').style("display", "none");
            d3.select('[id="' + lastLocationSelection + '-Loyalty"]').style("display", "none");
            d3.select('[id="' + lastLocationSelection + '-Transactions-Graph"]').style("display", "none");
            d3.select('[id="' + lastPersonSelection + '-Transactions-Per-Person"]').style("display", "none");
            d3.select('[id="' + lastPersonSelection + '-Loyalty-Per-Person"]').style("display", "none");
            selectValue = d3.select('#person-select').property('value');
            lastPersonSelection = selectValue;
            $('[id="' + selectValue + '-Loyalty-Per-Person"]').remove().insertAfter($('[id="' + selectValue + '-Transactions-Per-Person"]'));
            d3.select('[id="' + selectValue + '-Transactions-Per-Person"]').style("display", "block");
            d3.select('[id="' + selectValue + '-Loyalty-Per-Person"]').style("display", "block");

            $("#location-select").prop("selectedIndex", -1);
        });

    }

function drawRoutes(data) {
    // Convert String to Number
    data = data.map(d => {
        return {
            timestamp: d.Timestamp,
            id: +d.id,
            lat: +d.lat,
            lon: +d.long
        }
    })

    var links = [];

    // Generate Links
    for (var i = 0, len = data.length - 1; i < len; i++) {
        links.push({
            type: "LineString",
            coordinates: [
                [data[i].lon, data[i].lat],
                [data[i + 1].lon, data[i + 1].lat]
            ]
        });
    }

    // Add the path
    svg.selectAll('.route').remove()

    employee_paths = svg.selectAll("path")
        .data(links)
        .enter()
        .append("path")
        .attr("d", function (d) {
            return path(d)
        })
        .attr('class', 'route')
}


//TODO: Add a zoom control to at least tell the user that zooming is available.
svg.call(zoom);

function zoomed() {
    view.attr("transform", d3.event.transform);
    employee_paths.attr("transform", d3.event.transform);
}

function resetted() {
    svg.transition()
        .duration(750)
        .call(zoom.transform, d3.zoomIdentity);
}