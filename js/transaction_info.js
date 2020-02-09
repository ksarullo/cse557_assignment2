var lastLocationSelection = 0;
var lastPersonSelection = 0;
var allLocations = [];
var allNames = [];

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
        var locations = d3.values(sorted_by_loc).map(function (d) {
            return d.key;
        });
        locations = locations.sort();
        allLocations = locations;

        var trans_per_loc = d3.values(locations).map(function (d) {
            return ordered[d];
        });

        // Select div to work in
        var transaction_div = d3.select("#pills-analysis");

        // Create dropdown
        var filter_div = d3.select("#pills-filter");
        filter_div.append("p").text("Choose a location:");
        var select = filter_div.append('select')
            .attr('id','location-select')
            .on('change',function() {
                d3.select('[id="' + lastLocationSelection + '-Transactions"]').style("display", "none");
                d3.select('[id="' + lastLocationSelection + '-Loyalty"]').style("display", "none");
                d3.select('[id="' + lastLocationSelection + '-Transactions-Graph"]').style("display", "none");
                d3.select('[id="' + lastPersonSelection + '-Transactions-Per-Person"]').style("display", "none");
                d3.select('[id="' + lastPersonSelection + '-Loyalty-Per-Person"]').style("display", "none");
                selectValue = locations.indexOf(d3.select('#location-select').property('value'));
                lastLocationSelection = selectValue;
                $('[id="' + selectValue + '-Transactions"]').remove().insertAfter($('[id="' + selectValue + '-Transactions-Graph"]'));
                $('[id="' + selectValue + '-Loyalty"]').remove().insertAfter($('[id="' + selectValue + '-Transactions"]'));
                d3.select('[id="' + selectValue + '-Transactions-Graph"]').style("display", "block");
                d3.select('[id="' + selectValue + '-Transactions"]').style("display", "block");
                d3.select('[id="' + selectValue + '-Loyalty"]').style("display", "block");
            })
            .selectAll('option')
            .data(locations)
            .enter()
            .append('option')
            .text(function (d) { return d; });

        $("#location-select").prop("selectedIndex", -1);

        // Create location transaction div's
        for (var i = 0; i < locations.length; i++) {
            var location_div = transaction_div.append('div').attr("id", [i] + '-Transactions').style("display", "none");
            location_div.append("br")
            location_div.append('h5').text("Transaction Information").style("font-size", 12 + 'px');
            var transaction_box = location_div.append("div")
                .style("width", 400 + 'px')
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

            // Get location keys and values
            var hours = d3.values(sorted_by_hour).map(function (d) {
                return d.values;
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
                y[item2.key] = Math.round(item2.values.length  / 2)
                sum = sum + y[item2.key]
            });

            // Add bar chart
            var time_v_pop_div = transaction_div.append('div').attr("id", [i] + '-Transactions-Graph').style("display", "none");;
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

        // Create dropdown
        var filter_div = d3.select("#pills-filter");
        filter_div.append("br");
        filter_div.append("br");
        filter_div.append("p").text("Or choose a person:");
        var select = filter_div.append('select')
            .attr('id','person-select')
            .on('change',function() {
                d3.select('[id="' + lastLocationSelection + '-Transactions"]').style("display", "none");
                d3.select('[id="' + lastLocationSelection + '-Loyalty"]').style("display", "none");
                d3.select('[id="' + lastLocationSelection + '-Transactions-Graph"]').style("display", "none");
                d3.select('[id="' + lastPersonSelection + '-Transactions-Per-Person"]').style("display", "none");
                d3.select('[id="' + lastPersonSelection + '-Loyalty-Per-Person"]').style("display", "none");
                selectValue = names.indexOf(d3.select('#person-select').property('value'));
                lastPersonSelection = selectValue;
                $('[id="' + selectValue + '-Loyalty-Per-Person"]').remove().insertAfter($('[id="' + selectValue + '-Transactions-Per-Person"]'));
                d3.select('[id="' + selectValue + '-Transactions-Per-Person"]').style("display", "block");
                d3.select('[id="' + selectValue + '-Loyalty-Per-Person"]').style("display", "block");
            })
            .selectAll('option')
            .data(names)
            .enter()
            .append('option')
            .text(function (d) { return d; });

        $("#person-select").prop("selectedIndex", -1)

        // Create location transaction div's
        for (var i = 0; i < names.length; i++) {
            var location_div = transaction_div.append('div').attr("id", [i] + '-Transactions-Per-Person').style("display", "none");
            location_div.append('h2').append('b').text(names[i]);
            location_div.append("br").append("br");

            location_div.append('h5').text("Transaction Information").style("font-size", 12 + 'px');
            var transaction_box = location_div.append("div")
                .style("width", 400 + 'px')
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
            var location_div = transaction_div.append('div').attr("id", [i] + '-Loyalty').style("display", "none");

            location_div.append("br");
            location_div.append('h5').text("Loyalty Card Information").style("font-size", 12 + 'px');
            var transaction_box = location_div.append("div")
                .style("width", 400 + 'px')
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
            var location_div = transaction_div.append('div').attr("id", [i] + '-Loyalty-Per-Person').style("display", "none");

            location_div.append('h5').text("Loyalty Card Information").style("font-size", 12 + 'px');
            var transaction_box = location_div.append("div")
                .style("width", 400 + 'px')
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



