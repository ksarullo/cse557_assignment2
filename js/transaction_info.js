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

        // Get location keys and values
        var locations = d3.values(sorted_by_loc).map(function (d) {
            return d.key;
        });
        var trans_per_loc = d3.values(sorted_by_loc).map(function (d) {
            return d.values;
        });

        // Select div to work in
        var transaction_div = d3.select("#pills-analysis");

        // Create dropdown
        var lastSelection = 0;
        var filter_div = d3.select("#pills-filter");
        var select = filter_div.append('select')
            .attr('class','select')
            .on('change',function() {
                d3.select('[id="' + lastSelection + '-Transactions"]').style("display", "none");
                selectValue = locations.indexOf(d3.select('select').property('value'));
                lastSelection = selectValue;
                d3.select('[id="' + selectValue + '-Transactions"]').style("display", "block");
            })
            .selectAll('option')
            .data(locations)
            .enter()
            .append('option')
            .text(function (d) { return d; });

        // Create location transaction div's
        for (var i = 0; i < locations.length; i++) {
            var location_div = transaction_div.append('div').attr("id", [i] + '-Transactions').style("display", "none");
            location_div.append('p').append('b').text(locations[i]);

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
            location_div.append("br");

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
            var time_v_pop_div = location_div.append('div');
            time_v_pop_div.append("h6").text("Time vs. Popularity").style("font-size", 12 + 'px');
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
        d3.select('[id="0-Transactions"]').style("display", "block");
    });





