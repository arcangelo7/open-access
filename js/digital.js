var margin = { left: 80, right: 20, top: 50, bottom: 100 }
var width = $(".tab").width() - margin.left - margin.right
var height = 700 - margin.top - margin.bottom

// Create a select dropdown
const digitalOrderSelector = document.getElementById("digitalOrderSelector");
const digitalSelectItems = ["Descendingly female", "Ascendingly female", "Descendingly male", "Ascendingly male", "Alphabetically"];
// Create a drop down
d3.select(digitalOrderSelector)
    .append("span")
    .append("select")
    .attr("id", "digitalSelection")
    .attr("name", "tasks")
    .selectAll("option")
    .data(digitalSelectItems)
    .enter()
    .append("option")
    .attr("value", d => d)
    .text(d => d);

let histoMouseOver = function (event, d) {
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
        if (d.note) {
            return "<strong>" + d.country + "</strong><br/>"
                + Math.round(d.value * 100) / 100 + "% Percentage of individuals<br/>"
                + "<strong>note</strong>: " + d.note + "<br/>"
                + "<strong>breakdown</strong>: " + d.series
        } else {
            return "<strong>" + d.country + "</strong><br/>"
                + Math.round(d.value * 100) / 100 + "% Percentage of individuals<br/>"
                + "<strong>breakdown</strong>: " + d.series
        }
    })
}

let histoMouseLeave = function (event, d) {
    d3.selectAll("rect")
        .transition()
        .duration(200)
        .style("opacity", 1)
    tip.transition()
        .duration(500)
        .style("opacity", 0);
}

d3.json("data/digital.json").then(data => {
    document.addEventListener("DOMContentLoaded", digitalChart());

    function digitalChart() {
        // Append SVG to this DIV
        const digitalChartDIV = document.createElement("div");

        var g = d3.select(digitalChartDIV)
            .append("svg")
            .attr("preserveAspectRatio", "xMinYMin meet")
            .attr("viewBox", `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`)
            .append("g")
            .attr("transform", "translate(" + margin.left + ", " + margin.top + ")");

        // Y Label
        g.append("text")
            .attr("class", "y-axis label")
            .attr("x", - (height / 2))
            .attr("y", -60)
            .attr("font-size", "20px")
            .attr("text-anchor", "middle")
            .attr("transform", "rotate(-90)")
            .text("% of individuals")

        var x0 = d3.scaleBand()
            .domain(data.map(d => {
                return d.category
            }))
            .range([0, width])
            .padding(0.2);

        var x1 = d3.scaleBand()
            .domain(data[0].values.map(function (d) {
                return d.series
            })
            )
            .rangeRound([0, x0.bandwidth()])

        var y = d3.scaleLinear()
            .domain([0, d3.max(data, d => {
                return d3.max(d.values, function (values) {
                    return values.value
                })
            })])
            .range([height, 0])

        const color = d3.scaleOrdinal(d3.schemeCategory10);

        var xAxisCall = d3.axisBottom(x0);
        g.append("g")
            .attr("class", "x-axis")
            .attr("transform", "translate(0," + height + ")")
            .call(xAxisCall)
            .selectAll("text")
            .attr("y", "10")
            .attr("x", "-5")
            .attr("text-anchor", "end")
            .attr("transform", "rotate(-40)");

        var yAxisCall = d3.axisLeft(y)
            .tickFormat(d => {
                return d + "%"
            });
        g.append("g")
            .attr("class", "y-axis")
            .call(yAxisCall);

        var slice = g.selectAll(".slice")
            .data(data)
            .enter().append("g")
            .attr("class", "g")
            .attr("transform", function (d) { return "translate(" + x0(d.category) + ",0)"; });

        slice.selectAll("rect")
            .data(function (d) { return d.values; })
            .enter().append("rect")
            .attr("width", x1.bandwidth())
            .attr("x", function (d) { return x1(d.series); })
            .style("fill", function (d) { return color(d.series) })
            .attr("y", function (d) { return y(0); })
            .attr("height", function (d) { return height - y(0); })
            .on("mouseover", histoMouseOver)
            .on("mouseout", histoMouseLeave);
        slice.selectAll("rect")
            .transition()
            .delay(function (d) { return Math.random() * 1000; })
            .duration(1000)
            .attr("y", function (d) { return y(d.value); })
            .attr("height", function (d) { return height - y(d.value); })
        //Legend
        var legend = g.selectAll(".legend")
            .data(data[0].values.map(function (d) { return d.series; }).reverse())
            .enter().append("g")
            .attr("class", "legend")
            .attr("transform", function (d, i) { 
                return "translate(0, -" + (i * 20 + 30) + ")" })
            .style("opacity", "0");

        legend.append("rect")
            .attr("x", width - 18)
            .attr("width", 18)
            .attr("height", 18)
            .style("fill", function (d) { return color(d); });

        legend.append("text")
            .attr("x", width - 24)
            .attr("y", 9)
            .attr("dy", ".35em")
            .style("text-anchor", "end")
            .text(function (d) { return d; });

        legend.transition().duration(500).delay(function (d, i) { return 1300 + 100 * i; }).style("opacity", "1");
        
        // This code will redraw charts based on dropdown selection. 
        const showChart = document.getElementById("digital_hysthogram");
        while (showChart.firstChild) {
            showChart.firstChild.remove();
        }
        showChart.appendChild(digitalChartDIV);
    }

    // Chart changes based on drop down selection
    d3.select("#digitalSelection").on("change", function () {
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
                return d3.ascending(a.category, b.category)
            })
        }
        digitalChart();
    });
}).catch(error => {
    console.log(error);
});



