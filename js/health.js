///////////////////////////////////////////// Life expectancy 
var margin_le = { left:250, right:250, top:100, bottom:100 }
var width_le = $(window).width() - margin_le.left - margin_le.right
var height = 3000 - margin_le.top - margin_le.bottom

var g_le = d3.select("#healthLifeExpectancy")
    .append("svg")
        .attr("height", height + margin_le.top + margin_le.bottom)
        .attr("width", width_le + margin_le.left + margin_le.right)
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
    var y0 = d3.scaleBand()
        .domain(data.map(d => {
            return d.country
        }))
        .range([0, height*4])
        .padding(.3);
    
    var y1  = d3.scaleBand()
        .domain(data[0].values.map(function(d){ 
                return d.sex 
            })
        )
        .rangeRound([0, y0.bandwidth()])
    
    var x = d3.scaleLinear()
        .domain([0, d3.max(data, d => {
            return d3.max(d.values, function(values){
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
        .attr("transform",function(d) { return "translate(0," + y0(d.country) + ")"; });
    
        slice_le.selectAll("rect")
            .data(function(d) { return d.values; })
            .join("rect")
                .attr("height", y1.bandwidth())
                .attr("y", function(d) { return y1(d.sex); })
                .style("fill", function(d) { return color(d.sex) })
                .attr("x", function(d) { return x(0); })
                .attr("width", function(d) { return x(0); })
                .on("mouseover", leMouseOver)
                .on("mouseout", leMouseLeave);
        slice_le.selectAll("rect")
            .transition()
            .delay(function (d) {return Math.random()*1000;})
            .duration(1000)
            .attr("x", function(d) { return x(0); })
            .attr("width", function(d) {
                if (+d.value) {
                    return x(d.value); 
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
        .attr("y", -100)
        .attr("width", 18)
        .attr("height", 18)
        .style("fill", function(d) { return color(d); });

    legend_le.append("text")
        .attr("x", width_le - 24)
        .attr("y", -91)
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