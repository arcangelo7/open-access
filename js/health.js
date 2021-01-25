///////////////////////////////////////////// Life expectancy 
var margin_le = { left: 250, right: 50, top: 100, bottom: 50 }
var width_le = $(".tab").width() - margin_le.left - margin_le.right
var height_le = 3000 - margin_le.top - margin_le.bottom

// Create a select dropdown
const leOrderSelector = document.getElementById("leOrderSelector");
const leSelectItems = ["Descendingly female", "Ascendingly female", "Descendingly male", "Ascendingly male", "Alphabetically"];
// Create a drop down
d3.select(leOrderSelector)
    .append("span")
    .append("select")
    .attr("id", "leSelection")
    .attr("class", "form-control")
    .attr("name", "tasks")
    .selectAll("option")
    .data(leSelectItems)
    .enter()
    .append("option")
    .attr("value", d => d)
    .text(d => d);

// Hover info
let leMouseOver = function (event, d) {
    d3.selectAll("rect")
        .transition()
        .duration(200)
        .style("opacity", .5)
    d3.select(this)
        .transition()
        .duration(200)
        .style("opacity", 1)
    tip.transition()
        .duration(200)
        .style("opacity", .9)
        .style("left", (event.pageX) + "px")
        .style("top", (event.pageY - 28) + "px");
    tip.html(function () {
        var sex;
        if (d.sex == "F") {
            sex = "Female"
        } else if (d.sex == "M") {
            sex = "Male"
        } else if (d.sex == "T") {
            sex = "Total"
        }
        return "<strong>" + d.country + "</strong><br/>"
            + d.value + " years<br/>"
            + "<strong>Sex</strong>: " + sex
    })
}

let leMouseLeave = function (event, d) {
    d3.selectAll("rect")
        .transition()
        .duration(200)
        .style("opacity", 1)
    tip.transition()
        .duration(500)
        .style("opacity", 0);
}

d3.json("data/health_life_expectancy.json").then(data => {
    document.addEventListener("DOMContentLoaded", leChart());

    function leChart() {
        // Append SVG to this DIV
        const leChartDIV = document.createElement("div");

        var g_le = d3.select(leChartDIV)
            .append("svg")
            .attr("preserveAspectRatio", "xMinYMin meet")
            .attr("viewBox", `0 0 ${width_le + margin_le.left + margin_le.right} ${height_le + margin_le.top + margin_le.bottom}`)
            .append("g")
            .attr("transform", "translate(" + margin_le.left + ", " + margin_le.top + ")");

        // Y Label
        g_le.append("text")
            .attr("class", "x-axis label")
            .attr("x", (width_le / 2))
            .attr("y", -40)
            .attr("font-size", "20px")
            .attr("text-anchor", "middle")
            .text("Life expectancy (years)")

        var y0 = d3.scaleBand()
            .domain(data.map(d => {
                return d.country
            }))
            .range([0, height_le])
            .padding(.3);

        var y1 = d3.scaleBand()
            .domain(data[0].values.map(function (d) {
                return d.sex
            })
            )
            .rangeRound([0, y0.bandwidth()])

        var x = d3.scaleLinear()
            .domain([0, d3.max(data, d => {
                return d3.max(d.values, function (values) {
                    return values.value
                })
            })]).nice()
            .range([0, width_le])

        const color = d3.scaleOrdinal(d3.schemeCategory10);

        var yAxisCall = d3.axisLeft(y0);
        g_le.append("g")
            .attr("class", "y-axis")
            .style("font-size", "14px")
            .call(yAxisCall)
            .selectAll("text")
            // .attr("y", "10")
            // .attr("x", "-5")
            .attr("text-anchor", "end")
        // .attr("transform", "rotate(-40)");

        var xAxisCall = d3.axisTop(x)
            .tickFormat(d => {
                return d
            });
        g_le.append("g")
            .attr("class", "x-axis")
            .style("font-size", "14px")
            // .attr("transform", "translate(0," + height + ")")
            .call(xAxisCall);

        var slice_le = g_le.selectAll(".slice_le")
            .data(data)
            .enter().append("g")
            .attr("class", "g")
            .attr("transform", function (d) { return "translate(0," + y0(d.country) + ")"; });

        slice_le.selectAll("rect")
            .data(function (d) { return d.values; })
            .join("rect")
            .attr("height", y1.bandwidth())
            .attr("y", function (d) { return y1(d.sex); })
            .style("fill", function (d) { return color(d.sex) })
            .attr("x", function (d) { return x(0); })
            .attr("width", function (d) { return x(0); })
            .on("mouseover", leMouseOver)
            .on("mouseout", leMouseLeave);
        slice_le.selectAll("rect")
            .transition()
            .delay(function (d) { return Math.random() * 1000; })
            .duration(1000)
            .attr("x", function (d) { return x(0); })
            .attr("width", function (d) {
                if (+d.value) {
                    return x(d.value);
                }
            })

        //Legend
        var legend_le = g_le.selectAll(".legend")
            .data(data[0].values.map(function (d) { return d.sex; }).reverse())
            .enter().append("g")
            .attr("class", "legend")
            .attr("transform", function (d, i) { return "translate(0," + i * 20 + ")"; })
            .style("opacity", "0");

        legend_le.append("rect")
            .attr("x", width_le - 18)
            .attr("y", -100)
            .attr("width", 18)
            .attr("height", 18)
            .style("fill", function (d) { return color(d); });

        legend_le.append("text")
            .attr("x", width_le - 24)
            .attr("y", -91)
            .attr("dy", ".35em")
            .style("text-anchor", "end")
            .text(function (d) {
                if (d == "F") {
                    return "Female"
                } else if (d == "M") {
                    return "Male"
                } else if (d == "T") {
                    return "Total"
                }
            });

        legend_le.transition().duration(500).delay(function (d, i) { return 1300 + 100 * i; }).style("opacity", "1");

        // This code will redraw charts based on dropdown selection. 
        const showLeChart = document.getElementById("healthLifeExpectancy");
        while (showLeChart.firstChild) {
            showLeChart.firstChild.remove();
        }
        showLeChart.appendChild(leChartDIV);
    }

    // Chart changes based on drop down selection
    d3.select("#leSelection").on("change", function () {
        const selectedOption = d3.select(this).node().value;
        if (selectedOption == "Ascendingly female") {
            data.sort((a, b) => {
                return d3.ascending(a.values[0].value, b.values[0].value)
            })
        } else if (selectedOption == "Descendingly female") {
            data.sort((a, b) => {
                return d3.descending(a.values[0].value, b.values[0].value)
            })
        } else if (selectedOption == "Ascendingly male") {
            data.sort((a, b) => {
                return d3.ascending(a.values[1].value, b.values[1].value)
            })
        } else if (selectedOption == "Descendingly male") {
            data.sort((a, b) => {
                return d3.descending(a.values[1].value, b.values[1].value)
            })
        } else if (selectedOption == "Alphabetically") {
            data.sort((a, b) => {
                return d3.ascending(a.country, b.country)
            })
        }
        leChart();
    });
}).catch(error => {
    console.log(error);
});

///////////////////////////////////////////// Causes of mortality
var deathMap = L.map('deathMap').setView([0, 0], 2);
mapLink =
    '<a href="http://openstreetmap.org" target="_blank">OpenStreetMap</a>';
L.tileLayer(
    'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; ' + mapLink + ' Contributors',
    maxZoom: 18,
    clickable: true
}).addTo(deathMap);
// Add an SVG element to Leaflet’s overlay pane
var svgDeath = d3.select(deathMap.getPanes().overlayPane).append("svg").attr("pointer-events", "auto"),
    gDeath = svgDeath.append("g").attr("class", "leaflet-zoom-hide");

var svg_death = d3.select("svg#healthDeathCauses"),
    width = +svg_death.attr("width"),
    height = +svg_death.attr("height");

var death_causes = new Map()
var death_fields = []
var measure_fields = ["value_f", "value_m"]
var cur_death_year = 2000;
var cur_death_cause = "All causes of death"
var cur_death_sex = "value_f"

var sliderHealth = d3.select(".sliderHealth")
    .append("input")
    .attr("class", "vizSliderInput")
    .attr("type", "range")
    .attr("min", 2000)
    .attr("max", 2017)
    .attr("step", 1);

var selectorsDeath = d3.select('#selectorsDeath').append("select").attr("class", "form-control");
var selectorsSex = d3.select('#selectorsSex').append("select").attr("class", "form-control");

var promises_health = [
    d3.json("data/world.geojson"),
    d3.csv("data/health_death_causes.csv", function (d) {
        if (death_causes.get(d.country_code)) {
            death_causes.get(d.country_code).push({ "year": +d.year, "death_cause": d.indicator, "value_f": +d.value_f, "note_f": d.note_f, "value_m": +d.value_m, "note_m": d.note_m })
        } else {
            death_causes.set(d.country_code, [{ "year": +d.year, "death_cause": d.indicator, "value_f": +d.value_f, "note_f": d.note_f, "value_m": +d.value_m, "note_m": d.note_m }])
        }
        if (!(death_fields.includes(d.indicator))) {
            death_fields.push(d.indicator)
        }
    })
]

Promise.all(promises_health).then(function (data) {
    ready_health(data);
}).catch(function (error) {
    console.log(error);
});

function update_death(year, cause, sex, data) {
    // Slider
    sliderHealth.property("value", year);
    d3.select(".yearHealth").text("Year: " + year);
    // the radius of the circle is proportional to the square root of the deaths' number
    var radius = d3.scaleSqrt()
        .domain(d3.extent(data, function (d) {
            for (let [index, years] of d[1].entries()) {
                if (years["year"] == year && years["death_cause"] == cause) {
                    return years[sex]
                }
            }
        }))
        .range([5, 15]);
    d3.selectAll(".bubble")
        .attr("r", function (d) {
            if (d[year]) {
                for (let [i, causes] of d[year].entries()) {
                    if (causes["death_cause"] == cause) {
                        return radius(causes[cur_death_sex])
                    }
                }
            }
        });
    // Legend
    var valuesToShow = [radius.domain()[0], radius.domain()[1]]
    var xCircle = 100
    var xLabel = 150
    var yCircle = 40
    d3.selectAll(".bubbleLegend").remove()
    // Legend 
    var legendDeath = d3.select("#deathMapLegend")
        .append("g")
    // .style("transform", "translate(0, -505px)")
    legendDeath
        .selectAll("legend")
        .data(valuesToShow)
        .enter()
        .append("circle")
        .attr("class", "bubbleLegend")
        .attr("cx", xCircle)
        .attr("cy", function (d) { return yCircle - radius(d) })
        .attr("r", function (d) { return radius(d) })
        .style("fill", "none")
        .attr("stroke", "black")
    // Add legend: segments
    legendDeath
        .selectAll("legend")
        .data(valuesToShow)
        .enter()
        .append("line")
        .attr('x1', function (d) { return xCircle + radius(d) })
        .attr('x2', xLabel)
        .attr('y1', function (d) { return yCircle - radius(d) })
        .attr('y2', function (d) { return yCircle - radius(d) })
        .attr('stroke', 'black')
        .attr("class", "bubbleLegend")
        .style('stroke-dasharray', ('2,2'))
    // Add legend: labels
    legendDeath
        .selectAll("legend")
        .data(valuesToShow)
        .enter()
        .append("text")
        .attr("class", "bubbleLegend")
        .attr('x', xLabel)
        .attr('y', function (d) { return yCircle - radius(d) })
        .text(function (d) { return d.toLocaleString("en-US") })
        .style("font-size", 10)
        .attr('alignment-baseline', 'middle')
}

function beautifyMeasure(measure) {
    switch (measure) {
        case "value_f":
            return "Number of female deaths"
        case "value_m":
            return "Number of male deaths"
    }
}

// Use Leaflet to implement a D3 geometric transformation.
function projectPointDeath(x, y) {
    var point = deathMap.latLngToLayerPoint(new L.LatLng(y, x));
    this.stream.point(point.x, point.y);
}

function ready_health(world) {
    // Selectors
    for (var i = 0; i < death_fields.length; i++) {
        selectorsDeath.append("option")
            .attr("value", death_fields[i])
            .text(death_fields[i]);
    }
    for (var i = 0; i < measure_fields.length; i++) {
        selectorsSex.append("option")
            .attr("value", measure_fields[i])
            .text(beautifyMeasure(measure_fields[i]));
    }
    sliderHealth.on("input", function () {
        cur_death_year = this.value;
        update_death(cur_death_year, cur_death_cause, cur_death_sex, death_causes);
    });
    // Map
    mapHealth = svg_death.append("g")
        .selectAll("path")
        .data(world[0].features)
        .enter()
        .append("path")
        .attr("d", path)
        .attr("fill", function (d) {
            if (death_causes.get(d.id)) {
                for (let [i, value] of death_causes.get(d.id).entries()) {
                    if (d[value["year"]]) {
                        d[value["year"]].push({ "death_cause": value.death_cause, "value_f": value.value_f, "note_f": value.note_f, "value_m": value.value_m, "note_m": value.note_m })
                    } else {
                        d[value["year"]] = [{ "death_cause": value.death_cause, "value_f": value.value_f, "note_f": value.note_f, "value_m": value.value_m, "note_m": value.note_m }]
                    }
                }
            }
        });

    selectorsDeath.on("change", function () {
        cur_death_cause = $("#selectorsDeath").find(".form-control").val()
        update_death(cur_death_year, cur_death_cause, cur_death_sex, death_causes);
    });

    selectorsSex.on("change", function () {
        cur_death_sex = $("#selectorsSex").find(".form-control").val()
        update_death(cur_death_year, cur_death_cause, cur_death_sex, death_causes);
    });

    //  create a d3.geo.path to convert GeoJSON to SVG
    var transformLeafletDeath = d3.geoTransform({ point: projectPointDeath }),
        pathLeafletDeath = d3.geoPath().projection(transformLeafletDeath);
    // create path elements for each of the features
    d3featuresDeath = gDeath.selectAll("path")
        .data(world[0].features)
        .enter().append("path");

    deathMap.on("zoom", resetDeath);
    // Bubbles
    var svgCircles = svgDeath.append("g")
        .selectAll("circle")
        .data(world[0].features)
        .enter().append("circle")
        .attr("class", "bubble")
        .style("fill", "red")
        .attr("stroke", "red")
        .attr("stroke-width", 3)
        .attr("fill-opacity", .4)
        .on("mouseover", mouseOverDeath)
        .on("mouseleave", mouseLeaveDeath);
    resetDeath();
    // fit the SVG element to leaflet's map layer
    function resetDeath() {
        bounds = pathLeafletDeath.bounds(world[0]);
        var topLeft = bounds[0],
            bottomRight = bounds[1];
        svgDeath.attr("width", bottomRight[0] - topLeft[0])
            .attr("height", bottomRight[1] - topLeft[1])
            .style("left", topLeft[0] + "px")
            .style("top", topLeft[1] + "px");
        gDeath.attr("transform", "translate(" + -topLeft[0] + ","
            + -topLeft[1] + ")");
        // initialize the path data	
        d3featuresDeath.attr("d", pathLeafletDeath)
            .attr("class", function (d) { return "country_health" })
            .style("opacity", 0);
        svgCircles
            .attr("cx", function (d) {
                return pathLeafletDeath.centroid(d)[0];
            })
            .attr("cy", function (d) {
                return pathLeafletDeath.centroid(d)[1];
            })
            .attr("transform", "translate(" + -topLeft[0] + "," + -topLeft[1] + ")");
        update_death(cur_death_year, cur_death_cause, cur_death_sex, death_causes);
    }
}

let mouseOverDeath = function (event, d) {
    d3.selectAll(".bubble")
        .transition()
        .duration(200)
        .style("opacity", .5)
    d3.select(this)
        .transition()
        .duration(200)
        .style("opacity", 1)

    tip.transition()
        .duration(200)
        .style("opacity", .9);
    tip.html(function () {
        if (d[cur_death_year]) {
            for (let [i, cause] of d[cur_death_year].entries()) {
                if (cause["death_cause"] == cur_death_cause) {
                    return "<strong>" + d.properties.name + "</strong><br/>"
                        + "<strong>Indicator</strong>:" + cur_death_cause + "<br/>"
                        + "<strong>Measure</strong>:" + beautifyMeasure(cur_death_sex) + "<br/>"
                        + "<strong>Value</strong>:" + cause[cur_death_sex].toLocaleString("en-US")
                }
            }
        }
    })
        .style("left", (event.pageX) + "px")
        .style("top", (event.pageY - 28) + "px");
}

let mouseLeaveDeath = function (d) {
    d3.selectAll(".bubble")
        .transition()
        .duration(200)
        .style("opacity", 1)
    d3.select(this)
        .transition()
        .duration(200)
    tip.transition()
        .duration(500)
        .style("opacity", 0);
}

$(document).ready(function () {
    $(document).on("click", ".tablinks:contains('Health')", function (e) {
        deathMap.invalidateSize();
    });
});
