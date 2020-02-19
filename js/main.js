// ********************************* TRANSACTION DATA *********************************
// ************************************************************************************
// ************************************************************************************
// ************************************************************************************
// ************************************************************************************
// ************************************************************************************

var lastLocationSelection = [];
var lastPersonSelection = [];
var allLocations = [];
var selectedPerson;
window['moment-range'].extendMoment(moment);

// ***************************
// Slider Values
// ***************************
var dragSlider = document.getElementById('slider');

var nodes = [
    document.getElementById('lower-value'), // 0
    document.getElementById('upper-value') // 1
];

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

        // Sort by location
        var sorted_by_loc = d3.nest()
            .key(function (d) {
                return d.location;
            })
            .entries(rows);

        // Sort by name by location
        var sorted_by_name_loc = d3.nest()
            .key(function (d) {
                return d.name;
            })
            .key(function (d) {
                return d.location;
            })
            .entries(rows);

        // Sort alphabetically
        ordered_by_name_loc = {};
        d3.values(sorted_by_name_loc).map(function (d) {
            return ordered_by_name_loc[d.key] = d.values;
        });

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
        var filter_div = d3.select("#employee_dropdown");
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
                var values = $('#location-select').val();

                var working_div = d3.select('#test');

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

                working_div.selectAll("*").remove();
                if (lastLocationSelection.length == 0) {
                    var values = $('#person-select').val();
                    lastPersonSelection = values;

                    if (lastPersonSelection.length == 1) {

                        // Draw first selected route
                        var filteredData = gpsData.filter(d => d.id == car_id_to_name[values[0]]);
                        var filteredGpsStops = gpsStops.filter(d => d.id == car_id_to_name[values[0]]);
                        console.log("stops1:");
                        console.log(filteredGpsStops);

                        drawRoutes(filteredData, filteredGpsStops);


                        /*
                        // Hoping this draws all selected people's routes
                        for (i=0; i < values.length; i++){
                            var filteredData = gpsData.filter(d => d.id == car_id_to_name[values[i]]);
                            drawRoutes(filteredData);
                        }
                        */


                        values.forEach(function (val) {
                            $('[id="' + val + '-Loyalty-Per-Person"]').remove().insertAfter($('[id="' + val + '-Transactions-Per-Person"]'));
                            d3.select('[id="' + val + '-Transactions-Per-Person"]').style("display", "block");
                            d3.select('[id="' + val + '-Loyalty-Per-Person"]').style("display", "block");
                        });
                    } else {
                        values.forEach(function (val) {
                            $('[id="' + val + '-Loyalty-Per-Person"]').remove().insertAfter($('[id="' + val + '-Transactions-Per-Person"]'));
                            d3.select('[id="' + val + '-Transactions-Per-Person"]').style("display", "block");
                            d3.select('[id="' + val + '-Loyalty-Per-Person"]').style("display", "block");
                        });
                    }

                } else if (lastPersonSelection.length > 0) {
                    // Get names and locations
                    lastPersonSelection.forEach(function (person) {
                        // Make a dict
                        ordered_again_by_name_loc = {};
                        d3.values(ordered_by_name_loc[person]).map(function (d) {
                            return ordered_again_by_name_loc[d.key] = d.values;
                        });

                        lastLocationSelection.forEach(function (person_loc) {
                            var name_loc_data = ordered_again_by_name_loc[person_loc];

                            working_div.append('h5').text(person + ' at ' + person_loc);
                            var transaction_for_name_loc = working_div.append("div")
                                .style("width", 450 + 'px')
                                .style("border", 2 + 'px solid #ccc')
                                .style("height", 80 + 'px')
                                .style("padding", 10 + 'px')
                                .style("overflow", "auto")
                                .style("resize", "vertical");
                            if (name_loc_data) {
                                name_loc_data.forEach(function (val) {
                                    transaction_for_name_loc.append("p")
                                        .style("line-height", 3 + 'px')
                                        .text(val.timestamp + ', ' + val.cost)
                                });
                            } else {
                                transaction_for_name_loc.append('p').text('No Transaction Information')
                            }
                            working_div.append('br');
                        });
                    });
                } else {
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

        for (var i = 0; i < locations.length; i++) {
            var location_div = transaction_div.append('div').attr("id", locations[i] + '-Transactions').style("display", "none");
            location_div.append("br")
            location_div.append('h5').text("Transaction Information").style("font-size", 12 + 'px');
            var transaction_box = location_div.append("div")
                .style("width", 450 + 'px')
                .style("border", 2 + 'px solid #ccc')
                .style("height", 80 + 'px')
                .style("padding", 10 + 'px')
                .style("overflow", "auto")
                .style("resize", "vertical");
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
                y[item2.key] = (Math.round(item2.values.length / 2)) + 1;
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
        }
        // Create location transaction div's
    });

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

        // Sort by name by location
        var sorted_by_name_loc = d3.nest()
            .key(function (d) {
                return d.name;
            })
            .key(function (d) {
                return d.location;
            })
            .entries(rows);

        // Sort alphabetically
        ordered_by_name_loc = {};
        d3.values(sorted_by_name_loc).map(function (d) {
            return ordered_by_name_loc[d.key] = d.values;
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
                var values = $('#person-select').val();
                var working_div = d3.select('#test');

                lastPersonSelection.forEach(function (val) {
                    d3.select('[id="' + val + '-Transactions-Per-Person"]').style("display", "none");
                    d3.select('[id="' + val + '-Loyalty-Per-Person"]').style("display", "none");
                });
                lastPersonSelection = values;
                lastLocationSelection.forEach(function (val) {
                    d3.select('[id="' + val + '-Transactions"]').style("display", "none");
                    d3.select('[id="' + val + '-Loyalty"]').style("display", "none");
                    d3.select('[id="' + val + '-Transactions-Graph"]').style("display", "none");
                });

                // Remove Routes
                svg.selectAll('.route').remove();
                working_div.selectAll("*").remove();

                if (lastPersonSelection.length == 0) {
                    var values = $('#location-select').val();
                    values.forEach(function (val) {
                        $('[id="' + val + '-Transactions"]').remove().insertAfter($('[id="' + val + '-Transactions-Graph"]'));
                        $('[id="' + val + '-Loyalty"]').remove().insertAfter($('[id="' + val + '-Transactions"]'));
                        d3.select('[id="' + val + '-Transactions-Graph"]').style("display", "block");
                        d3.select('[id="' + val + '-Transactions"]').style("display", "block");
                        d3.select('[id="' + val + '-Loyalty"]').style("display", "block");
                    });
                } else if (lastLocationSelection.length > 0) {
                    // Get names and locations
                    lastPersonSelection.forEach(function (person) {
                        // Make a dict
                        ordered_again_by_name_loc = {};
                        d3.values(ordered_by_name_loc[person]).map(function (d) {
                            return ordered_again_by_name_loc[d.key] = d.values;
                        });

                        lastLocationSelection.forEach(function (person_loc) {
                            var name_loc_data = ordered_again_by_name_loc[person_loc];

                            working_div.append('h5').text(person + ' at ' + person_loc);
                            var transaction_for_name_loc = working_div.append("div")
                                .style("width", 450 + 'px')
                                .style("border", 2 + 'px solid #ccc')
                                .style("height", 80 + 'px')
                                .style("padding", 10 + 'px')
                                .style("overflow", "auto")
                                .style("resize", "vertical");
                            if (name_loc_data) {
                                name_loc_data.forEach(function (val) {
                                    transaction_for_name_loc.append("p")
                                        .style("line-height", 3 + 'px')
                                        .text(val.timestamp + ', ' + val.cost)
                                });
                            } else {
                                transaction_for_name_loc.append('p').text('No Transaction Information')
                            }
                            working_div.append('br');
                        });
                    });
                } else if (lastPersonSelection.length == 1) {
                    selectedPerson = car_id_to_name[lastPersonSelection[0]];
                    var filteredData = gpsData.filter(d => d.id == car_id_to_name[values[0]]);
                    var filteredGpsStops = gpsStops.filter(d => d.id == car_id_to_name[values[0]]);
                    console.log("stops2:");
                    console.log(filteredGpsStops);

                    drawRoutes(filteredData, filteredGpsStops);

                    values.forEach(function (val) {
                        $('[id="' + val + '-Loyalty-Per-Person"]').remove().insertAfter($('[id="' + val + '-Transactions-Per-Person"]'));
                        d3.select('[id="' + val + '-Transactions-Per-Person"]').style("display", "block");
                        d3.select('[id="' + val + '-Loyalty-Per-Person"]').style("display", "block");
                    });
                } else {
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
        var filter_div = d3.select("#location_dropdown");
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
                .style("overflow", "auto")
                .style("resize", "vertical");
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
        var format_price = d3.format(",.2f");
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
                .style("overflow", "auto")
                .style("resize", "vertical");
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
        var format_price = d3.format(",.2f");
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
                .style("overflow", "auto")
                .style("resize", "vertical");
            trans_per_person[i].forEach(function (val) {
                transaction_box.append("p")
                    .style("line-height", 3 + 'px')
                    .text(val.date + ', ' + val.location + ', ' + val.cost)
            });
            location_div.append("br");
        }
    });

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
    var theMinDate = new Date(minData);
    var theMaxDate = new Date(maxData);

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
        nodes[0].innerHTML = `${theMinDate.getMonth() + 1} / ${parseInt(values[0])} / ${theMinDate.getFullYear()}`;
        nodes[1].innerHTML = `${theMinDate.getMonth() + 1} / ${parseInt(values[1])} / ${theMinDate.getFullYear()}`;

        // Start Date. For example (01/06/2014)
        var startDate = moment(`${prependZero(theMinDate.getMonth() + 1)}/${prependZero(parseInt(values[0]))}/${theMinDate.getFullYear()}`);
        // End Date. For example (01/19/2014)
        var endDate = moment(`${prependZero(theMinDate.getMonth() + 1)}/${prependZero(parseInt(values[1]))}/${theMinDate.getFullYear()}`);
        // Get Range between start and end date
        var filteredRange = moment.range(startDate, endDate);
        // Get selectedPerson id from checkbox and whether the date is within a range 
        var filteredDataTime = gpsData.filter(d => d.id == selectedPerson && filteredRange.contains(moment(d.Timestamp)));
        var filteredGpsStops = gpsStops.filter(d => d.id == selectedPerson && filteredRange.contains(moment(d.Timestamp)));
        console.log("stops3:");
        console.log(filteredGpsStops);

        drawRoutes(filteredDataTime, filteredGpsStops);

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

    d3.values(carAssign).map(function (d) {
        return car_id_to_name[d.FirstName + ' ' + d.LastName] = d.CarID;
    });
}

function drawRoutes(data, stops) {
    console.log('DrawRoutes triggered!')
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
    svg.selectAll(".route").remove()
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

    svg.selectAll(".stops").remove()
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
        .attr('title', function (d, i) {
            console.log(i+1);
            return i+1;
        })
        .attr('class', 'stops')
}

svg.call(zoom);

function zoomed() {
    view.attr("transform", d3.event.transform);
    stores.attr("transform", d3.event.transform);
    employee_paths.attr("transform", d3.event.transform);
    employee_stops.attr("transform", d3.event.transform);
}


function resetted() {
    svg.transition()
        .duration(750)
        .call(zoom.transform, d3.zoomIdentity);

}