console.log("main.js loaded")

var width = 700;
var height = 700;

var projection = d3.geoMercator()
var path = d3.geoPath().projection(projection);


var svg = d3.select('#map-card').append('svg')
                .attr('width', width)
                .attr('height', height);


d3.json('data/Abila.json', function(error, d) {

    console.log("geojson", d.features)
    projection.fitExtent([[0, 0], [width, height]], d);

    svg.selectAll("path")
        .data(d.features)
        .enter().append('path')
        .attr('d', path)


});
