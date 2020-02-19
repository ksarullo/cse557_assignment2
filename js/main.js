// ********************************* TRANSACTION DATA *********************************
// ************************************************************************************
// ************************************************************************************
// ************************************************************************************
// ************************************************************************************
// ************************************************************************************

var allNames = [];
var allTransPerPerson = {};
var allTransPerLoc = {};
var allLoyaltyPerPerson = {};
var allLoyaltyPerLoc = {};
var allTransPerLocHours = {};
var colors = ["#e41a1c","#377eb8","#4daf4a","#984ea3","#ff7f00","#ffff33","#a65628","#f781bf","#999999","#66c2a5",
    "#fc8d62","#8da0cb","#e78ac3","#a6d854","#ffd92f","#e5c494","#b3b3b3","#8dd3c7","#ffffb3","#bebada","#fb8072",
    "#80b1d3","#fdb462","#b3de69","#fccde5","#d9d9d9","#bc80bd","#ccebc5","#ffed6f","#1f77b4","#ff7f0e","#2ca02c",
    "#d62728","#9467bd","#8c564b","#e377c2","#7f7f7f","#bcbd22","#17becf","#1b9e77","#d95f02","#7570b3","#e7298a",
    "#66a61e","#e6ab02","#a6761d","#666666","#7fc97f","#beaed4","#fdc086","#ffff99","#386cb0","#f0027f","#bf5b17"];

var selectedPerson;
var filteredRange;
var theMinDate;
var theMaxDate;
window['moment-range'].extendMoment(moment);

// ***************************
// Slider Values
// ***************************
var dragSlider = document.getElementById('slider');

var nodes = [
    document.getElementById('lower-value'), // 0
    document.getElementById('upper-value') // 1
];

// ***************************
// Credit Card Data
// ***************************
d3.csv('data/cc_data.csv')
    .row((d, i) => {
        var format_price = d3.format(",.2f");
        return {
            timestamp: d.timestamp,
            hour: d.timestamp.split(" ")[1].split(":")[0],
            location: d.location,
            name: d.FirstName + ' ' + d.LastName,
            cost: '$' + format_price(d.price)
        };
    })
    .get((error, rows) => {

        // Get transaction data per location
        var sorted_by_loc = d3.nest()
            .key(function (d) {
                return d.location;
            })
            .entries(rows);
        ordered = {};
        d3.values(sorted_by_loc).map(function (d) {
            return ordered[d.key] = d.values;
        });
        var unsorted_locations = d3.values(sorted_by_loc).map(function (d) {
            return d.key;
        });
        var locations = unsorted_locations.sort();
        d3.values(locations).map(function (d) {
            return allTransPerLoc[d] = ordered[d];
        });

        // Get transaction data per person
        var sorted_by_name = d3.nest()
            .key(function (d) {
                return d.name;
            })
            .entries(rows);
        d3.values(sorted_by_name).map(function (d) {
            return allTransPerPerson[d.key] = d.values;
        });

        // Get hours at locations
        var sorted_by_hour = d3.nest()
            .key(function (d) {
                return d.location;
            })
            .key(function (d) {
                return d.hour;
            })
            .entries(rows);
        ordered = {};
        d3.values(sorted_by_hour).map(function (d) {
            return ordered[d.key] = d.values;
        });
        var hours = d3.values(locations).map(function (d) {
            return allTransPerLocHours[d] = ordered[d];
        });

        // Create location select
        var filter_div = d3.select("#location_dropdown");
        filter_div.append("p").text("Choose one or more locations:");
        var select = filter_div.append('select')
            .attr('id', 'location-select')
            .attr('class', 'form-control')
            .property('multiple', 'multiple')
            .selectAll('option')
            .data(locations)
            .enter()
            .append('option')
            .text(function (d) {
                return d;
            })
            .attr("value", function (d) {
                return d;
            });
        $("#location-select").prop("selectedIndex", -1);
        $('#location-select').multiselect({
            buttonWidth: '480px',
            enableFiltering: false,
            maxHeight: 200,
            onChange: function (option, checked) {
                update_analysis();
            }
        });

        // Get names for person select
        var sorted_by_name_loc = d3.nest()
            .key(function (d) {
                return d.name;
            })
            .key(function (d) {
                return d.location;
            })
            .entries(rows);
        ordered_by_name_loc = {};
        d3.values(sorted_by_name_loc).map(function (d) {
            return ordered_by_name_loc[d.key] = d.values;
        });
        var names = d3.values(sorted_by_name).map(function (d) {
            return d.key;
        });
        names = names.sort();
        allNames = names;

        // Create person select
        d3.select('#person-select').selectAll('option')
            .data(names)
            .enter()
            .append('option')
            .text(function (d) {
                return d;
            })
            .attr("value", function (d) {
                return d;
            });
        $('#person-select').multiselect({
            buttonWidth: '480px',
            enableFiltering: false,
            maxHeight: 200,
            onChange: function (option, checked) {
                update_analysis();
            }
        });
        d3.select("#person-select").property("selectedIndex", -1);

    });


// ***************************
// Loyalty Data
// ***************************
d3.csv('data/loyalty_data.csv')
    .row((d, i) => {
        var format_price = d3.format(",.2f");
        return {
            date: d.timestamp,
            location: d.location,
            name: d.FirstName + ' ' + d.LastName,
            cost: '$' + format_price(d.price)
        };
    })
    .get((error, rows) => {

        // Get transaction data per location
        var sorted_by_loc = d3.nest()
            .key(function (d) {
                return d.location;
            })
            .entries(rows);
        ordered = {};
        d3.values(sorted_by_loc).map(function (d) {
            return ordered[d.key] = d.values;
        });
        var unsorted_locations = d3.values(sorted_by_loc).map(function (d) {
            return d.key;
        });
        var locations = unsorted_locations.sort();
        d3.values(locations).map(function (d) {
            return allLoyaltyPerLoc[d] = ordered[d];
        });

        // Get loyalty data per person
        var sorted_by_name = d3.nest()
            .key(function (d) {
                return d.name;
            })
            .entries(rows);
        d3.values(sorted_by_name).map(function (d) {
            return allLoyaltyPerPerson[d.key] = d.values;
        });

    });

// ***************************
// Filter Button
// ***************************
var filter_div = d3.select("#reset_btn");
filter_div.append('button')
    .text('Reset Selections')
    .attr('id', 'reset_button')
    .attr('class', 'btn btn-warning')
    .on('click', function () {
        $("#location-select").multiselect("clearSelection");
        $("#location-select").multiselect('refresh');
        $("#person-select").multiselect("clearSelection");
        $("#person-select").multiselect('refresh');
        svg.selectAll('.route').remove();
        svg.selectAll(".stops").remove();
        svg.selectAll(".stops-text").remove();
        d3.select("#test").selectAll("*").remove();
        dragSlider.noUiSlider.reset();
        dragSlider.noUiSlider.set([theMinDate.getDate(), theMaxDate.getDate()])
        nodes[0].innerHTML = `${theMinDate.getMonth() + 1} / ${theMinDate.getDate()} / ${theMinDate.getFullYear()}`;
        nodes[1].innerHTML = `${theMaxDate.getMonth() + 1} / ${theMaxDate.getDate()} / ${theMaxDate.getFullYear()}`;

    });

function update_analysis() {

    // Remove old
    svg.selectAll('.route').remove();
    svg.selectAll(".stops").remove();
    svg.selectAll(".stops-text").remove();
    var working_div = d3.select('#test');
    working_div.selectAll("*").remove();

    // Get new values
    var person_values = $('#person-select').val();
    var location_values = $('#location-select').val();

    // Draw only location data
    if (person_values.length == 0 && location_values.length > 0) {
        location_values.forEach(function (loc_val) {

            // Create bar graph
            var x = [];
            var y = [];
            for (var j = 0; j < 24; j++) {
                x.push(j);
                y.push(1);
            }
            var sum = 0;
            allTransPerLocHours[loc_val].forEach(function (item2) {
                y[item2.key] = (Math.round(item2.values.length / 2)) + 1;
                sum = sum + y[item2.key]
            });
            var time_v_pop_div = working_div.append('div');
            time_v_pop_div.append('h2').append('b').text(loc_val);
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
                        if (y[j] > 1) {
                            return 95 - (y[j] / sum) * 100;
                        } else {
                            return 94
                        }
                    })
                    .attr("width", 15)
                    .attr("fill", "black")
                    .attr("height", function (d) {
                        if (y[j] > 1) {
                            return (y[j] / sum) * 100;
                        } else {
                            return 1
                        }
                    });
            }
            x.forEach(function (val) {
                time_v_pop_div.append("text")
                    .style("font-size", 10 + 'px')
                    .style("writing-mode", "tb-rl")
                    .text(function (d) {
                        return val + ":00";
                    });
            });

            // Create transaction information per location
            var transaction_per_location = working_div.append('div');
            transaction_per_location.append("br");
            transaction_per_location.append('h5').text("Transaction Information").style("font-size", 12 + 'px');
            var transaction_box = transaction_per_location.append("div")
                .style("width", 450 + 'px')
                .style("border", 2 + 'px solid #ccc')
                .style("height", 80 + 'px')
                .style("padding", 10 + 'px')
                .style("overflow", "auto")
                .style("resize", "vertical");
            allTransPerLoc[loc_val].forEach(function (val) {
                if (filteredRange) {
                    if (filteredRange.contains(moment(val.timestamp))) {
                        transaction_box.append("p")
                            .style("line-height", 3 + 'px')
                            .text(val.timestamp + ', ' + val.name + ', ' + val.cost)
                    }
                } else {
                    transaction_box.append("p")
                        .style("line-height", 3 + 'px')
                        .text(val.timestamp + ', ' + val.name + ', ' + val.cost)
                }
            });

            // Create loyalty information per location
            var loyalty_per_location = working_div.append('div');
            loyalty_per_location.append("br");
            loyalty_per_location.append('h5').text("Loyalty Card Information").style("font-size", 12 + 'px');
            var transaction_box = loyalty_per_location.append("div")
                .style("width", 450 + 'px')
                .style("border", 2 + 'px solid #ccc')
                .style("height", 80 + 'px')
                .style("padding", 10 + 'px')
                .style("overflow", "auto")
                .style("resize", "vertical");
            allLoyaltyPerLoc[loc_val].forEach(function (val) {
                if (filteredRange) {
                    if (filteredRange.contains(moment(val.date))) {
                        transaction_box.append("p")
                            .style("line-height", 3 + 'px')
                            .text(val.date + ', ' + val.name + ', ' + val.cost)
                    }
                } else {
                    transaction_box.append("p")
                        .style("line-height", 3 + 'px')
                        .text(val.date + ', ' + val.name + ', ' + val.cost)
                }
            });

            working_div.append('br');
        });
        // Draw only person data
    } else if (location_values.length == 0 && person_values.length > 0 ) {
        person_values.forEach(function (person_val, idx) {
            selectedPerson = car_id_to_name[person_val];
            color = colors[idx];

            if (filteredRange) {
                var filteredDataTime = gpsData.filter(d => d.id == selectedPerson && filteredRange.contains(moment(d.Timestamp)));
                var filteredGpsStops = gpsStops.filter(d => d.id == selectedPerson && filteredRange.contains(moment(d.Timestamp)));

                drawRoutes(filteredDataTime, filteredGpsStops, color);
            } else {
                var filteredData = gpsData.filter(d => d.id == car_id_to_name[person_val]);
                var filteredGpsStops = gpsStops.filter(d => d.id == car_id_to_name[person_val]);
                drawRoutes(filteredData, filteredGpsStops, color);
            }

            // Create transaction per person data
            var transaction_per_person = working_div.append('div').attr("id", 'transaction-data');
            transaction_per_person.append('h2').append('b').text(person_val);
            transaction_per_person.append("br");
            transaction_per_person.append('h5').text("Transaction Information").style("font-size", 12 + 'px');
            var transaction_box = transaction_per_person.append("div")
                .style("width", 450 + 'px')
                .style("border", 2 + 'px solid #ccc')
                .style("height", 80 + 'px')
                .style("padding", 10 + 'px')
                .style("overflow", "auto")
                .style("resize", "vertical");

            allTransPerPerson[person_val].forEach(function (val) {
                if (filteredRange) {
                    if (filteredRange.contains(moment(val.timestamp))) {
                        transaction_box.append("p")
                            .style("line-height", 3 + 'px')
                            .text(val.timestamp + ', ' + val.location + ', ' + val.cost)
                    }
                } else {
                    transaction_box.append("p")
                        .style("line-height", 3 + 'px')
                        .text(val.timestamp + ', ' + val.location + ', ' + val.cost)
                }

            });
            transaction_per_person.append("br");

            // Create loyalty per person data
            var loyalty_per_person = working_div.append('div').attr('id', 'loyalty-data');
            loyalty_per_person.append('h5').text("Loyalty Card Information").style("font-size", 12 + 'px');
            var loyalty_box = loyalty_per_person.append("div")
                .style("width", 450 + 'px')
                .style("border", 2 + 'px solid #ccc')
                .style("height", 80 + 'px')
                .style("padding", 10 + 'px')
                .style("overflow", "auto")
                .style("resize", "vertical");
            allLoyaltyPerPerson[person_val].forEach(function (val) {
                if (filteredRange) {
                    if (filteredRange.contains(moment(val.date))) {
                        loyalty_box.append("p")
                            .style("line-height", 3 + 'px')
                            .text(val.date + ', ' + val.location + ', ' + val.cost)
                    }
                } else {
                    loyalty_box.append("p")
                        .style("line-height", 3 + 'px')
                        .text(val.date + ', ' + val.location + ', ' + val.cost)
                }
            });
            loyalty_per_person.append("br");
        });
        // Draw person and location data
    } else if (location_values.length > 0 && person_values.length > 0) {
        person_values.forEach(function (person_val, idx) {
            selectedPerson = car_id_to_name[person_val];
            color = colors[idx];

            if (filteredRange) {
                var filteredDataTime = gpsData.filter(d => d.id == selectedPerson && filteredRange.contains(moment(d.Timestamp)));
                var filteredGpsStops = gpsStops.filter(d => d.id == selectedPerson && filteredRange.contains(moment(d.Timestamp)));

                drawRoutes(filteredDataTime, filteredGpsStops, color);
            } else {
                var filteredData = gpsData.filter(d => d.id == car_id_to_name[person_val]);
                var filteredGpsStops = gpsStops.filter(d => d.id == car_id_to_name[person_val]);
                drawRoutes(filteredData, filteredGpsStops, color);
            }


            ordered_again_by_name_loc = {};
            d3.values(ordered_by_name_loc[person_val]).map(function (d) {
                return ordered_again_by_name_loc[d.key] = d.values;
            });

            location_values.forEach(function (person_loc) {
                var name_loc_data = ordered_again_by_name_loc[person_loc];
                working_div.append('h5').text(person_val + ' at ' + person_loc);

                if (name_loc_data) {

                    // Add bar chart
                    var x = [];
                    var y = [];
                    var sum = 0;
                    for (var j = 0; j < 24; j++) {
                        x.push(j);
                        y.push(1);
                    }
                    name_loc_data.forEach(function (name_loc_hour) {
                        y[name_loc_hour.hour] = y[name_loc_hour.hour] + 1;
                        sum = sum + 1;
                    });
                    working_div.append("h5").text("Visit Times").style("font-size", 12 + 'px');
                    var bar_chart_div = working_div.append("div")
                        .attr("width", 400)
                        .attr("height", 100);
                    for (var j = 0; j < 24; j++) {
                        bar_chart_div.append("svg")
                            .attr("width", 15)
                            .attr("height", 100)
                            .append("rect")
                            .attr("y", function (d) {
                                if (y[j] > 1) {
                                    return 95 - (y[j] / sum) * 100;
                                } else {
                                    return 94
                                }
                            })
                            .attr("width", 15)
                            .attr("fill", "black")
                            .attr("height", function (d) {
                                if (y[j] > 1) {
                                    return (y[j] / sum) * 100;
                                } else {
                                    return 1
                                }
                            });
                    }
                    x.forEach(function (val) {
                        working_div.append("text")
                            .style("font-size", 10 + 'px')
                            .style("writing-mode", "tb-rl")
                            .text(function (d) {
                                return val + ":00";
                            });
                    });

                    // Add Transaction Information
                    working_div.append('br');
                    working_div.append('br');
                    working_div.append('h5').text("Transaction Information").style("font-size", 12 + 'px');
                    var transaction_for_name_loc = working_div.append("div")
                        .style("width", 450 + 'px')
                        .style("border", 2 + 'px solid #ccc')
                        .style("height", 80 + 'px')
                        .style("padding", 10 + 'px')
                        .style("overflow", "auto")
                        .style("resize", "vertical");

                    name_loc_data.forEach(function (val) {
                        if (filteredRange) {
                            if (filteredRange.contains(moment(val.timestamp))) {
                                transaction_for_name_loc.append("p")
                                    .style("line-height", 3 + 'px')
                                    .text(val.timestamp + ', ' + val.cost);
                            }
                        } else {
                            transaction_for_name_loc.append("p")
                                .style("line-height", 3 + 'px')
                                .text(val.timestamp + ', ' + val.cost);
                        }
                    });
                } else {
                    // Add empty box
                    var transaction_for_name_loc = working_div.append("div")
                        .style("width", 450 + 'px')
                        .style("border", 2 + 'px solid #ccc')
                        .style("height", 80 + 'px')
                        .style("padding", 10 + 'px')
                        .style("overflow", "auto")
                        .style("resize", "vertical");
                    transaction_for_name_loc.append('p').text('No Transaction Information')
                }
                working_div.append('br');
            });
        });
    }
}


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
var gpsStops;
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
    .defer(d3.csv, 'data/gps_reduced.csv')
    .defer(d3.csv, 'data/car-assignments.csv')
    .defer(d3.csv, 'data/gps_stops.csv')
    .await(ready);

// *****************************
// d - Map of Abila
// places - Location of stores/company
// gps - GPS data for each employee
// carAssign - Car Assginment Data 
// *****************************
function ready(error, d, places, gps, carAssign, gps_stops) {

    d3.values(carAssign).map(function (d) {
        return car_id_to_name[d.FirstName + ' ' + d.LastName] = d.CarID;
    });

    projection.fitExtent([
        [0, 0],
        [width, height]
    ], d);
    view = svg.selectAll("path")
        .data(d.features)
        .enter().append('path')
        .attr('d', path)
    gpsData = gps;
    gpsStops = gps_stops;
    // Get Min Data 
    var minData = d3.min(gps.map(d => d.Timestamp));
    // Get Max Data
    var maxData = d3.max(gps.map(d => d.Timestamp));
    theMinDate = new Date(minData);
    theMaxDate = new Date(maxData);

    // Create Slide
    noUiSlider.create(slider, {
        start: [theMinDate.getDate(), theMaxDate.getDate()],
        tooltips: true,
        connect: true,
        range: {
            'min': theMinDate.getDate(),
            'max': theMaxDate.getDate()
        },
        format: {
            from: function (value) {
                return parseInt(value);
            },
            to: function (value) {
                return parseInt(value);
            }
        }
    })

    // Assign text for lower and upper bound 
    nodes[0].innerHTML = `${theMinDate.getMonth() + 1} / ${theMinDate.getDate()} / ${theMinDate.getFullYear()}`;
    nodes[1].innerHTML = `${theMaxDate.getMonth() + 1} / ${theMaxDate.getDate()} / ${theMaxDate.getFullYear()}`;
    // Start Date. For example (01/06/2014)
    startDate = moment(`${prependZero(theMinDate.getMonth() + 1)}/${theMinDate.getDate()}/${theMinDate.getFullYear()}`);
    // End Date. For example (01/19/2014)
    endDate = moment(`${prependZero(theMinDate.getMonth() + 1)}/${theMaxDate.getDate()}/${theMinDate.getFullYear()}`);

    // Add 0 if the number is one digit
    function prependZero(number) {
        if (number < 9)
            return "0" + number;
        else
            return number;
    }

    // Listen Slider Change
    dragSlider.noUiSlider.on('change', function (values, handle) {
        console.log(values)
        nodes[0].innerHTML = `${theMinDate.getMonth() + 1} / ${parseInt(values[0])} / ${theMinDate.getFullYear()}`;
        nodes[1].innerHTML = `${theMinDate.getMonth() + 1} / ${parseInt(values[1])} / ${theMinDate.getFullYear()}`;

        // Start Date. For example (01/06/2014)
        var startDate = moment(`${prependZero(theMinDate.getMonth() + 1)}/${prependZero(parseInt(values[0]))}/${theMinDate.getFullYear()}`);
        // End Date. For example (01/19/2014)
        var endDate = moment(`${prependZero(theMinDate.getMonth() + 1)}/${prependZero(parseInt(values[1]))}/${theMinDate.getFullYear()}`);
        // Get Range between start and end date
        filteredRange = moment.range(startDate, endDate);
        // Get selectedPerson id from checkbox and whether the date is within a range
        update_analysis()

    });

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
}

function drawRoutes(data, stops, color) {
    console.log('DrawRoutes triggered!');
    // Convert String to Number
    resetted();
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
    // svg.selectAll(".route").remove();
    // Create Routes
    employee_paths = svg.append("g")
        .selectAll("path")
        .data(links)
        .enter()
        .append("path")
        .attr("d", function (d) {
            return path(d)
        })
        .attr('class', 'route')
        .style("stroke", color)
        .style("stroke-width", 2);

    // svg.selectAll(".stops").remove();
    employee_stops = svg.append("g")
        .selectAll("circle")
        .data(stops)
        .enter()
        .append('circle')
        .attr('cx', function (d) {
            return projection([d.long, d.lat])[0];
        })
        .attr('cy', function (d) {
            return projection([d.long, d.lat])[1];
        })
        .attr('class', 'stops')

    // svg.selectAll(".stops-text").remove()
    employee_stops_text = svg.append("g")
        .selectAll("circle")
        .data(stops)
        .enter()
        .append('text')
        .attr('dx', function (d) {
            return projection([d.long, d.lat])[0]-4;
        })
        .attr('dy', function (d) {
            return projection([d.long, d.lat])[1]+4;
        })
        .attr('class', 'stops-text')
        .text(function (d, i) {
            return i+1;
        })
}

svg.call(zoom);

function zoomed() {
    view.attr("transform", d3.event.transform);
    stores.attr("transform", d3.event.transform);
    employee_paths.attr("transform", d3.event.transform);
    employee_stops.attr("transform", d3.event.transform);
    employee_stops_text.attr("transform", d3.event.transform);
}


function resetted() {
    svg.transition()
        .duration(750)
        .call(zoom.transform, d3.zoomIdentity);

}