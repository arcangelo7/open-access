// set the dimensions and margins of the graph
var marginEdu = { left:80, right:100, top:50, bottom:100 },
    widthEdu = 1000 - marginEdu.left - marginEdu.right,
    heightEdu = 500 - marginEdu.top - marginEdu.bottom;

// Define svg canvas
var svgEdu = d3.select("#eduChart")
  .attr("width", widthEdu + marginEdu.left + marginEdu.right)
  .attr("height", heightEdu + marginEdu.top + marginEdu.bottom)
var gEdu = svgEdu.append("g")
  .attr("transform", "translate(" + marginEdu.left + "," + marginEdu.top + ")");

// parse the date / time
var parseTimeEdu = d3.timeParse("%Y");
var formatTime = d3.timeFormat("%Y");
// For tooltip
var bisectDate = d3.bisector(function(d) { return d.year; }).left;

// Add the line for the first time
gEdu.append("path")
    .attr("class", "line")
    .attr("fill", "none")
    .attr("stroke", "grey")
    .attr("stroke-width", "3px");

// Scales
var xEdu = d3.scaleTime().range([0, widthEdu]);
var yEdu = d3.scaleLinear().range([heightEdu, 0]);
var colorEdu = d3.scaleOrdinal().range(d3.schemeCategory10);

// Define axes
var xAxisCallEdu = d3.axisBottom().scale(xEdu);
var yAxisCallEdu = d3.axisLeft().scale(yEdu)
    .ticks(10)
    .tickFormat(function(d) { return parseInt(d) + "%"; });

// Place the axes on the chart
var xAxisEdu = gEdu
    .append("g")
    .attr("class", "x-axis")
    .attr("transform", "translate(0," + heightEdu + ")")
var yAxisEdu = gEdu
    .append("g")
    .attr("class", "y-axis")
// Y-Axis label
// yAxisEdu.append("text")
//     .attr("class", "axis-title")
//     .attr("transform", "rotate(-90)")
//     // .attr("y", 6)
//     // .attr("dy", ".71em")
//     .style("text-anchor", "end")
//     .attr("fill", "#5D6971")
//     .text("Female percentage");

// Line path generator
var lineEdu = d3.line()
    .x(function(d) { return xEdu(d.year); })
    .y(function(d) { return yEdu(d.value); });

// Event listeners
$("#eduMeasure").on("change", updateEdu)
// Add jQuery UI slider
$("#sliderEdu").slider({
    range: true,
    max: parseTimeEdu("2016").getTime(),
    min: parseTimeEdu("1970").getTime(),
    step: 86400000*365, // One year
    values: [parseTimeEdu("1970").getTime(), parseTimeEdu("2016").getTime()],
    slide: function(event, ui){
        $("#dateLabel1").text(formatTime(new Date(ui.values[0])));
        $("#dateLabel2").text(formatTime(new Date(ui.values[1])));
        updateEdu();
    }
});

// Read in data
d3.json("data/edu.json").then(function(data) {
    // Prepare and clean data
    filteredData = {};
    for (var measure in data) {
        if (!data.hasOwnProperty(measure)) {
            continue;
        }
        filteredData[measure] = data[measure].filter(function(d){
            return !(d["value"] == null)
        })
        filteredData[measure].forEach(function(d){
            d["country"] = d["country"];
            d["year"] = parseTimeEdu(d["year"]);
            d["value"] = +d["value"];
        });
    }
    // Run the visualization for the first time
    updateEdu()
});

var t = function(){ return d3.transition().duration(1000); }

function updateEdu(){
    // Filter data based on selections
    var curEduMeasure = $("#eduMeasure").val(),
        sliderValues = $("#sliderEdu").slider("values");
    var dataTimeFiltered = filteredData[curEduMeasure].filter(function(d){
        return ((d.year >= sliderValues[0]) && (d.year <= sliderValues[1]))
    });
    // Update scales
    xEdu.domain(d3.extent(dataTimeFiltered, function(d){ return d.year; }));
    yEdu.domain([d3.min(dataTimeFiltered, function(d){ return d.value; }), 
        d3.max(dataTimeFiltered, function(d){ return d.value; })]);
    // Update axes
    xAxisCallEdu.scale(xEdu);
    xAxisEdu.transition(t()).call(xAxisCallEdu);
    yAxisCallEdu.scale(yEdu);
    yAxisEdu.transition(t()).call(yAxisCallEdu);

    // Path generator
    lineEdu = d3.line()
        .x(function(d){ return xEdu(d.year); })
        .y(function(d){ return yEdu(d.value); });
    // Update our line path
    gEdu.select(".line")
        .transition(t)
        .attr("d", lineEdu(dataTimeFiltered));

    // Clear old tooltips
    d3.select(".focus").remove();
    d3.select(".overlay").remove();
    
    // Tooltip code
    var focus = gEdu.append("g")
        .attr("class", "focus")
        .style("display", "none");
    focus.append("line")
        .attr("class", "x-hover-line hover-line")
        .attr("y1", 0)
        .attr("y2", heightEdu);
    focus.append("line")
        .attr("class", "y-hover-line hover-line")
        .attr("x1", 0)
        .attr("x2", widthEdu);
    focus.append("circle")
        .attr("r", 5);
    focus.append("text")
        .attr("x", 15)
        .attr("dy", ".31em");
    svgEdu.append("rect")
        .attr("transform", "translate(" + marginEdu.left + "," + marginEdu.top + ")")
        .attr("class", "overlay")
        .attr("width", widthEdu)
        .attr("height", heightEdu)
        .on("mouseover", function() { focus.style("display", null); })
        .on("mouseout", function() { focus.style("display", "none"); })
        .on("mousemove", mousemoveEdu);

    function mousemoveEdu(event) {
        var x0edu = xEdu.invert(d3.pointer(event)[0]),
            i = bisectDate(dataTimeFiltered, x0edu, 1),
            d0 = dataTimeFiltered[i - 1],
            d1 = dataTimeFiltered[i],
            d = (d1 && d0) ? (x0edu - d0.date > d1.date - x0edu ? d1 : d0) : 0;
        focus.attr("transform", "translate(" + xEdu(d.year) + "," + yEdu(d.value) + ")");
        focus.select("text").text(function() { 
            return Math.round(d.value) + "%"; 
        });
        focus.select(".x-hover-line").attr("y2", heightEdu - yEdu(d.value));
        focus.select(".y-hover-line").attr("x2", -xEdu(d.year));
    }
}



