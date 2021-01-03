var margin = { left:80, right:20, top:50, bottom:100 }
var width = 1000 - margin.left - margin.right
var height = 700 - margin.top - margin.bottom

let histoMouseOver = function(event, d) {
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
    tip.html(function(){
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

let histoMouseLeave = function(event, d) {
    d3.selectAll("rect")
        .transition()
        .duration(200)
        .style("opacity", 1)
    tip.transition()
        .duration(500)
        .style("opacity", 0);
}

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

d3.json("data/digital.json").then(data => {
    var x0 = d3.scaleBand()
        .domain(data.map(d => {
            return d.category
        }))
        .range([0, width])
        .padding(0.2);
    
    var x1  = d3.scaleBand()
        .domain(data[0].values.map(function(d){ 
                return d.series 
            })
        )
        .rangeRound([0, x0.bandwidth()])
    
    var y = d3.scaleLinear()
        .domain([0, d3.max(data, d => {
            return d3.max(d.values, function(values){
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
        .attr("transform",function(d) { return "translate(" + x0(d.category) + ",0)"; });
  
        slice.selectAll("rect")
        .data(function(d) { return d.values; })
          .enter().append("rect")
              .attr("width", x1.bandwidth())
              .attr("x", function(d) { return x1(d.series); })
               .style("fill", function(d) { return color(d.series) })
               .attr("y", function(d) { return y(0); })
               .attr("height", function(d) { return height - y(0); })
               .on("mouseover", histoMouseOver)
               .on("mouseout", histoMouseLeave);
        slice.selectAll("rect")
            .transition()
            .delay(function (d) {return Math.random()*1000;})
            .duration(1000)
            .attr("y", function(d) { return y(d.value); })
            .attr("height", function(d) { return height - y(d.value); })

    //Legend
    var legend = g.selectAll(".legend")
        .data(data[0].values.map(function(d) { return d.series; }).reverse())
        .enter().append("g")
            .attr("class", "legend")
            .attr("transform", function(d,i) { return "translate(0," + i * 20 + ")"; })
            .style("opacity","0");

    legend.append("rect")
        .attr("x", width - 18)
        .attr("width", 18)
        .attr("height", 18)
        .style("fill", function(d) { return color(d); });

    legend.append("text")
        .attr("x", width - 24)
        .attr("y", 9)
        .attr("dy", ".35em")
        .style("text-anchor", "end")
        .text(function(d) {return d; });

    legend.transition().duration(500).delay(function(d,i){ return 1300 + 100 * i; }).style("opacity","1");

}).catch(error => {
    console.log(error);
});



