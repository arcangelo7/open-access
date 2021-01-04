///////////////////////////////////////////// Life expectancy 
var margin_le = { left:80, right:80, top:50, bottom:100 }
var width_le = $(window).width() - margin_le.left - margin_le.right
var height = 800 - margin_le.top - margin_le.bottom

var g_le = d3.select("#healthLifeExpectancy")
    .append("svg")
        .attr("height", height + margin_le.top + margin_le.bottom)
        .attr("width", width_le + margin_le.left + margin_le.right)
    .append("g")
        .attr("transform", "translate(" + margin_le.left + ", " + margin_le.top + ")");

// Y Label
g_le.append("text")
    .attr("class", "y-axis label")
    .attr("x", - (height / 2))
    .attr("y", -60)
    .attr("font-size", "20px")
    .attr("text-anchor", "middle")
    .attr("transform", "rotate(-90)")
    .text("Life expectancy (years)")

// Hover info
let leMouseOver = function(event, d) {
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

let leMouseLeave = function(event, d) {
    d3.selectAll("rect")
        .transition()
        .duration(200)
        .style("opacity", 1)
    tip.transition()
        .duration(500)
        .style("opacity", 0);
}

d3.json("data/health_life_expectancy.json").then(data => {
    var x0 = d3.scaleBand()
        .domain(data.map(d => {
            return d.country
        }))
        .range([0, width_le])
        .padding(0.3);
    
    var x1  = d3.scaleBand()
        .domain(data[0].values.map(function(d){ 
                return d.sex 
            })
        )
        .rangeRound([0, x0.bandwidth()])
    
    var y = d3.scaleLinear()
        .domain([0, d3.max(data, d => {
            return d3.max(d.values, function(values){
                return values.value
            })
        })]).nice()
        .range([height, 0])

    const color = d3.scaleOrdinal(d3.schemeCategory10);

    var xAxisCall = d3.axisBottom(x0);
    g_le.append("g")
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
            return d 
        });
        g_le.append("g")
        .attr("class", "y-axis")
        .call(yAxisCall);

    var slice_le = g_le.selectAll(".slice_le")
        .data(data)
        .enter().append("g")
        .attr("class", "g")
        .attr("transform",function(d) { return "translate(" + x0(d.country) + ",0)"; });
    
        slice_le.selectAll("rect")
            .data(function(d) { return d.values; })
            .join("rect")
                .attr("width", x1.bandwidth())
                .attr("x", function(d) { return x1(d.sex); })
                .style("fill", function(d) { return color(d.sex) })
                .attr("y", function(d) { return y(0); })
                .attr("height", function(d) { return height - y(0); })
                .on("mouseover", leMouseOver)
                .on("mouseout", leMouseLeave);
        slice_le.selectAll("rect")
            .transition()
            .delay(function (d) {return Math.random()*1000;})
            .duration(1000)
            .attr("y", function(d) { return y(d.value); })
            .attr("height", function(d) {
                if (+d.value) {
                    return height - y(d.value); 
                }
            })

    //Legend
    var legend_le = g_le.selectAll(".legend")
        .data(data[0].values.map(function(d) { return d.sex; }).reverse())
        .enter().append("g")
            .attr("class", "legend")
            .attr("transform", function(d,i) { return "translate(0," + i * 20 + ")"; })
            .style("opacity","0");

    legend_le.append("rect")
        .attr("x", width_le - 18)
        .attr("y", -40)
        .attr("width", 18)
        .attr("height", 18)
        .style("fill", function(d) { return color(d); });

    legend_le.append("text")
        .attr("x", width_le - 24)
        .attr("y", -31)
        .attr("dy", ".35em")
        .style("text-anchor", "end")
        .text(function(d) { 
            if (d == "F") {
                return "Female"
            } else if (d == "M") {
                return "Male"
            } else if (d == "T") {
                return "Total"
            }
        });

    legend_le.transition().duration(500).delay(function(d,i){ return 1300 + 100 * i; }).style("opacity","1");

}).catch(error => {
    console.log(error);
});