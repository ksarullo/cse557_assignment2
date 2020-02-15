// ********************************* TRANSACTION DATA *********************************
// ************************************************************************************
// ************************************************************************************
// ************************************************************************************
// ************************************************************************************
// ************************************************************************************

var lastLocationSelection = [];
var lastPersonSelection = [];
var allLocations = [];

d3.csv('data/cc_data.csv')
    .row((d, i) => {
        var format_price =  d3.format(",.2f");
        return {
            timestamp: d.timestamp,
            hour: d.timestamp.split(" ")[1].split(":")[0],
            location: d.location,
            name: d.FirstName + ' ' + d.LastName,
            cost: '$' + format_price(d.price)
        };
    })
    .get((error, rows) => {
        // Sort by location
        var sorted_by_loc = d3.nest()
            .key(function (d) {
                return d.location;
            })
            .entries(rows);

        // Sort alphabetically
        ordered = {};
        d3.values(sorted_by_loc).map(function (d) {
            return ordered[d.key] = d.values;
        });

        // Get location keys and values
        var unsorted_locations = d3.values(sorted_by_loc).map(function (d) {
            return d.key;
        });
        locations = unsorted_locations.sort();
        allLocations = locations;

        var trans_per_loc = d3.values(locations).map(function (d) {
            return ordered[d];
        });

        // Select div to work in
        var transaction_div = d3.select("#pills-analysis");

        // Create dropdown
        var filter_div = d3.select("#pills-filter");
        filter_div.append("p").text("Choose one or more locations:");
        var select = filter_div.append('select')
            .attr('id','location-select')
            .attr('class', 'form-control')
            .property('multiple', 'multiple')
            .selectAll('option')
            .data(locations)
            .enter()
            .append('option')
            .text(function (d) { return d; })
            .attr("value", function (d) { return d; });

        $("#location-select").prop("selectedIndex", -1);
        $('#location-select').multiselect({
            buttonWidth: '480px',
            enableFiltering: false,
            maxHeight: 200,
            onChange: function(option, checked) {
                var values = $('#location-select').val();

                if (lastPersonSelection.length > 0) {
                    console.log(lastPersonSelection);
                    console.log(values);
                } else {
                    lastLocationSelection.forEach(function (val) {
                        d3.select('[id="' + val + '-Transactions"]').style("display", "none");
                        d3.select('[id="' + val + '-Loyalty"]').style("display", "none");
                        d3.select('[id="' + val + '-Transactions-Graph"]').style("display", "none");
                    });
                    lastLocationSelection = values;
                    lastPersonSelection.forEach(function (val) {
                        d3.select('[id="' + val + '-Transactions-Per-Person"]').style("display", "none");
                        d3.select('[id="' + val + '-Loyalty-Per-Person"]').style("display", "none");
                    });
                    values.forEach(function (val) {
                        $('[id="' + val + '-Transactions"]').remove().insertAfter($('[id="' + val + '-Transactions-Graph"]'));
                        $('[id="' + val + '-Loyalty"]').remove().insertAfter($('[id="' + val + '-Transactions"]'));
                        d3.select('[id="' + val + '-Transactions-Graph"]').style("display", "block");
                        d3.select('[id="' + val + '-Transactions"]').style("display", "block");
                        d3.select('[id="' + val + '-Loyalty"]').style("display", "block");
                    });
                }
            }
        });

        // Create location transaction div's
        for (var i = 0; i < locations.length; i++) {
            var location_div = transaction_div.append('div').attr("id", locations[i] + '-Transactions').style("display", "none");
            location_div.append("br")
            location_div.append('h5').text("Transaction Information").style("font-size", 12 + 'px');
            var transaction_box = location_div.append("div")
                .style("width", 450 + 'px')
                .style("border", 2 + 'px solid #ccc')
                .style("height", 80 + 'px')
                .style("padding", 10 + 'px')
                .style("overflow", "auto");
            trans_per_loc[i].forEach(function (val) {
                transaction_box.append("p")
                    .style("line-height", 3 + 'px')
                    .text(val.timestamp + ', ' + val.name + ', ' + val.cost)
            });

            // Sort by time by location
            var sorted_by_hour = d3.nest()
                .key(function (d) {
                    return d.location;
                })
                .key(function (d) {
                    return d.hour;
                })
                .entries(rows);

            // Sort alphabetically
            ordered = {};
            d3.values(sorted_by_hour).map(function (d) {
                return ordered[d.key] = d.values;
            });

            // Get location keys and values
            var hours = d3.values(locations).map(function (d) {
                return ordered[d];
            });

            // Create bar graph
            var x = [];
            var y = [];
            for (var j = 0; j < 24; j++) {
                x.push(j);
                y.push(1);
            }
            var sum = 0;
            hours[i].forEach(function (item2) {
                y[item2.key] = (Math.round(item2.values.length  / 2)) + 1;
                sum = sum + y[item2.key]
            });

            // Add bar chart
            var time_v_pop_div = transaction_div.append('div').attr("id", locations[i] + '-Transactions-Graph').style("display", "none");;
            time_v_pop_div.append('h2').append('b').text(locations[i]);
            time_v_pop_div.append("br").append("br");
            time_v_pop_div.append("h5").text("Time vs. Popularity").style("font-size", 12 + 'px');
            var bar_chart_div = time_v_pop_div.append("div")
                .attr("width", 400)
                .attr("height", 100);
            for (var j = 0; j < 24; j++) {
                bar_chart_div.append("svg")
                    .attr("width", 15)
                    .attr("height", 100)
                    .append("rect")
                    .attr("y", function (d) {
                        if (y[j] > 1){
                            return 95 - (y[j] / sum)*100;
                        } else {
                            return 94
                        }
                    })
                    .attr("width", 15)
                    .attr("fill", "black")
                    .attr("height", function (d) {
                        if (y[j] > 1){
                            return (y[j] / sum)*100;
                        } else {
                            return 1
                        }
                    });
            }
            x.forEach(function (val) {
                time_v_pop_div.append("text")
                    .style("font-size", 10 + 'px')
                    .style("writing-mode", "tb-rl")
                    .text(function(d) { return val + ":00";
                    });
            });
        }
    });

d3.csv('data/cc_data.csv')
    .row((d, i) => {
        var format_price =  d3.format(",.2f");
        return {
            timestamp: d.timestamp,
            hour: d.timestamp.split(" ")[1].split(":")[0],
            location: d.location,
            name: d.FirstName + ' ' + d.LastName,
            cost: '$' + format_price(d.price)
        };
    })
    .get((error, rows) => {
        // Sort by location
        var sorted_by_name = d3.nest()
            .key(function (d) {
                return d.name;
            })
            .entries(rows);

        // Sort alphabetically
        ordered = {};
        d3.values(sorted_by_name).map(function (d) {
            return ordered[d.key] = d.values;
        });

        // Get location keys and values
        var names = d3.values(sorted_by_name).map(function (d) {
            return d.key;
        });
        var names = names.sort();

        var trans_per_person = d3.values(names).map(function (d) {
            return ordered[d]
        });

        // Select div to work in
        var transaction_div = d3.select("#pills-analysis");

        d3.select('#person-select').selectAll('option')
            .data(names)
            .enter()
            .append('option')
            .text(function (d) { return d; })
            .attr("value", function (d) { return d; });

        $('#person-select').multiselect({
            buttonWidth: '480px',
            enableFiltering: false,
            maxHeight: 200,
            onChange: function(option, checked) {
                var values = $('#person-select').val();

                if (lastLocationSelection.length > 0) {
                    console.log(lastLocationSelection)
                    console.log(values);
                } else {
                    lastPersonSelection.forEach(function (val) {
                        d3.select('[id="' + val + '-Transactions-Per-Person"]').style("display", "none");
                        d3.select('[id="' + val + '-Loyalty-Per-Person"]').style("display", "none");
                    });
                    lastPersonSelection = values;

                    // Remove Routes
                    svg.selectAll('.route').remove();

                    // Draw first selected route
                    var filteredData = gpsData.filter(d => d.id == car_id_to_name[values[0]]);
                    drawRoutes(filteredData);

                    lastLocationSelection.forEach(function (val) {
                        d3.select('[id="' + val + '-Transactions-Per-Person"]').style("display", "none");
                        d3.select('[id="' + val + '-Loyalty-Per-Person"]').style("display", "none");
                    });
                    values.forEach(function (val) {
                        $('[id="' + val + '-Loyalty-Per-Person"]').remove().insertAfter($('[id="' + val + '-Transactions-Per-Person"]'));
                        d3.select('[id="' + val + '-Transactions-Per-Person"]').style("display", "block");
                        d3.select('[id="' + val + '-Loyalty-Per-Person"]').style("display", "block");
                    });
                }
            }
        });

        d3.select("#person-select").property("selectedIndex", -1);

        // Create dropdown
        var filter_div = d3.select("#pills-filter");
        filter_div.append("br");
        filter_div.append("br");

        // Create location transaction div's
        for (var i = 0; i < names.length; i++) {
            var location_div = transaction_div.append('div').attr("id", names[i] + '-Transactions-Per-Person').style("display", "none");
            location_div.append('h2').append('b').text(names[i]);
            location_div.append("br").append("br");

            location_div.append('h5').text("Transaction Information").style("font-size", 12 + 'px');
            var transaction_box = location_div.append("div")
                .style("width", 450 + 'px')
                .style("border", 2 + 'px solid #ccc')
                .style("height", 80 + 'px')
                .style("padding", 10 + 'px')
                .style("overflow", "auto");
            trans_per_person[i].forEach(function (val) {
                transaction_box.append("p")
                    .style("line-height", 3 + 'px')
                    .text(val.timestamp + ', ' + val.location + ', ' + val.cost)
            });
            location_div.append("br");
        }
    });

d3.csv('data/loyalty_data.csv')
    .row((d, i) => {
        var format_price =  d3.format(",.2f");
        return {
            date: d.timestamp,
            location: d.location,
            name: d.FirstName + ' ' + d.LastName,
            cost: '$' + format_price(d.price)
        };
    })
    .get((error, rows) => {
        // Sort by location
        var sorted_by_loc = d3.nest()
            .key(function (d) {
                return d.location;
            })
            .entries(rows);

        // Sort alphabetically
        ordered = {};
        d3.values(sorted_by_loc).map(function (d) {
            return ordered[d.key] = d.values;
        });

        var locations = locations = d3.values(sorted_by_loc).map(function (d) {
            return d.key;
        });
        locations = locations.sort();

        // Get location keys and values
        let difference = locations
            .filter(x => !allLocations.includes(x))
            .concat(allLocations.filter(x => !locations.includes(x)));

        for (var i = 0; i < difference.length; i++) {
            ordered[difference[i]] = [];
        }

        locations = allLocations;

        var trans_per_loc = d3.values(locations).map(function (d) {
            return ordered[d];
        });

        // Select div to work in
        var transaction_div = d3.select("#pills-analysis");

        // Create location transaction div's
        for (var i = 0; i < locations.length; i++) {
            var location_div = transaction_div.append('div').attr("id", locations[i] + '-Loyalty').style("display", "none");

            location_div.append("br");
            location_div.append('h5').text("Loyalty Card Information").style("font-size", 12 + 'px');
            var transaction_box = location_div.append("div")
                .style("width", 450 + 'px')
                .style("border", 2 + 'px solid #ccc')
                .style("height", 80 + 'px')
                .style("padding", 10 + 'px')
                .style("overflow", "auto");
            trans_per_loc[i].forEach(function (val) {
                transaction_box.append("p")
                    .style("line-height", 3 + 'px')
                    .text(val.date + ', ' + val.name + ', ' + val.cost)
            });
            location_div.append("br");
        }
    });

d3.csv('data/loyalty_data.csv')
    .row((d, i) => {
        var format_price =  d3.format(",.2f");
        return {
            date: d.timestamp,
            location: d.location,
            name: d.FirstName + ' ' + d.LastName,
            cost: '$' + format_price(d.price)
        };
    })
    .get((error, rows) => {
        // Sort by location
        var sorted_by_name = d3.nest()
            .key(function (d) {
                return d.name;
            })
            .entries(rows);

        // Sort alphabetically
        ordered = {};
        d3.values(sorted_by_name).map(function (d) {
            return ordered[d.key] = d.values;
        });

        // Get location keys and values
        var names = d3.values(sorted_by_name).map(function (d) {
            return d.key;
        });
        var names = names.sort();

        var trans_per_person = d3.values(names).map(function (d) {
            return ordered[d]
        });

        // Select div to work in
        var transaction_div = d3.select("#pills-analysis");

        // Create location transaction div's
        for (var i = 0; i < names.length; i++) {
            var location_div = transaction_div.append('div').attr("id", names[i] + '-Loyalty-Per-Person').style("display", "none");

            location_div.append('h5').text("Loyalty Card Information").style("font-size", 12 + 'px');
            var transaction_box = location_div.append("div")
                .style("width", 450 + 'px')
                .style("border", 2 + 'px solid #ccc')
                .style("height", 80 + 'px')
                .style("padding", 10 + 'px')
                .style("overflow", "auto");
            trans_per_person[i].forEach(function (val) {
                transaction_box.append("p")
                    .style("line-height", 3 + 'px')
                    .text(val.date + ', ' + val.location + ', ' + val.cost)
            });
            location_div.append("br");
        }
    });

// ************************************* GPS DATA *************************************
// ************************************************************************************
// ************************************************************************************
// ************************************************************************************
// ************************************************************************************
// ************************************************************************************

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
d3.select("svg").on("mousedown.log", function () {
    console.log(projection.invert(d3.mouse(this)));
});
d3.queue()
    .defer(d3.json, 'data/Abila.json')
    .defer(d3.json, 'data/places.json')
    .defer(d3.csv, 'data/gps.csv')
    .defer(d3.csv, 'data/car-assignments.csv')
    .await(ready);

// *****************************
// d - Map of Abila
// places - Location of stores/company
// gps - GPS data for each employee
// carAssign - Car Assginment Data 
// *****************************
function ready(error, d, places, gps, carAssign) {
    projection.fitExtent([
        [0, 0],
        [width, height]
    ], d);
    view = svg.selectAll("path")
        .data(d.features)
        .enter().append('path')
        .attr('d', path)
    gpsData = gps;
    // Create places as Image Icon
    stores = svg.selectAll("image")
        .data(places)
        .enter()
        .append("image")
        .attr("xlink:href", d => d.link)
        .attr("x", d => {
            return projection([d.lat, d.long])[0]
        })
        .attr("y", d => {
            return projection([d.lat, d.long])[1]
        })
        .attr("width", 16)
        .attr("height", 16)
        .attr("data-toggle", "tooltip")
        .attr("data-placement", "top")
        .attr("title", d => {
            return d.name
        })
    // Boostrap Tooltip: Enable tooltips everywhere
    $(function () {
        $('[data-toggle="tooltip"]').tooltip()
    })

    d3.values(carAssign).map(function (d) {
        return car_id_to_name[d.FirstName + ' ' + d.LastName] = d.CarID;
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
    });
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
    // Create Routes
    employee_paths = svg.selectAll("path")
        .data(links)
        .enter()
        .append("path")
        .attr("d", function (d) {
            return path(d)
        })
        .attr('class', 'route')
}

svg.call(zoom);
function zoomed() {
    view.attr("transform", d3.event.transform);
    stores.attr("transform", d3.event.transform);
    employee_paths.attr("transform", d3.event.transform);
}
function resetted() {
    svg.transition()
        .duration(750)
        .call(zoom.transform, d3.zoomIdentity);

}