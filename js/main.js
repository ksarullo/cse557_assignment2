console.log("main.js loaded")

var width = document.getElementById('map-card').offsetWidth - 100;
var height = document.getElementById('map-card').offsetHeight - 100;

var projection = d3.geoMercator()
var path = d3.geoPath().projection(projection);


var svg = d3.select('#map-card').append('svg')
            .attr("preserveAspectRatio", "xMinYMin meet")
            .attr("viewBox", "0 0 " + String(width) + " " + String(height))
            // Class to make it responsive.
            .classed("svg-content-responsive", true)
var zoom = d3.zoom()
                .scaleExtent([1, 40])
                .translateExtent([[-100, -100], [width + 90, height + 100]])
                .on("zoom", zoomed);


d3.json('data/Abila.json', function(error, d) {

    console.log("geojson", d.features)
    projection.fitExtent([[0, 0], [width, height]], d);

    view = svg.selectAll("path")
        .data(d.features)
        .enter().append('path')
        .attr('d', path)


});


//TODO: Add a zoom control to at least tell the user that zooming is available.
svg.call(zoom);



function zoomed() {
    view.attr("transform", d3.event.transform);
  }
  
function resetted() {
    svg.transition()
        .duration(750)
        .call(zoom.transform, d3.zoomIdentity);
  }