var margin = { left:80, right:20, top:50, bottom:100 }
var width = 1000 - margin.left - margin.right
var height = 700 - margin.top - margin.bottom

var g = d3.select("#digital_hysthogram")
    .append("svg")
        .attr("height", height + margin.top + margin.bottom)
        .attr("width", width + margin.left + margin.right)
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

d3.csv("data/digital.csv").then(data => {
    data.forEach(d => {
        d.VALUE = +d.VALUE
    });
    console.log(data);

    var x = d3.scaleBand()
        .domain(data.map(d => {
            return d.CATEGORY
        }))
        .range([0, width])
        .padding(0.2);

    var y = d3.scaleLinear()
        .domain([0, d3.max(data, d => {
            return d.VALUE
        })])
        .range([height, 0])

    var xAxisCall = d3.axisBottom(x);
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

    var rects = g.selectAll("rect")
        .data(data)
        .enter()
        .append("rect")
            .attr("x", d => {
                return x(d.CATEGORY)
            })
            .attr("y", d => {
                return y(d.VALUE)
            })
            .attr("width", x.bandwidth)
            .attr("height", d => {
                return height - y(d.VALUE)
            })
            .attr("fill", "grey");
}).catch(error => {
    console.log(error);
});