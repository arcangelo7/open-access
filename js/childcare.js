var childcareSvg = d3.select("svg#childcare"),
    width = +svg.attr("width"),
    height = +svg.attr("height");

var euProjection = d3.geoConicConformal()
    .center([ 13, 52 ])
    .scale(width / 1.5)
    .translate([width / 2, height / 2]);

var childcare_map = new Map();
var childcareRange = []

let childCareMouseOver = function(event, d) {
    d3.selectAll(".Country")
        .transition()
        .duration(200)
        .style("opacity", .5)
    d3.select(this)
        .transition()
        .duration(200)
        .style("opacity", 1)
        .style("stroke", "black")
    tip.transition()
        .duration(200)
        .style("opacity", .9);
    tip.html(function(){
        return "<strong>" + d.properties.name + "</strong><br/>"
            + "Rate: " + d.childcare + "%"
    })
    .style("left", (event.pageX) + "px")
    .style("top", (event.pageY - 28) + "px");
}

var yearChildcare = 2005;

var sliderChildcare = d3.select(".sliderChildcare")
    .append("input")
        .attr("type", "range")
        .attr("min", 2005)
        .attr("max", 2017)
        .attr("step", 1)
        .on("input", function() {
            var year = this.value;
            updateChildcare(year, mapChildcare);
        });

function updateChildcare(year, map){
    sliderChildcare.property("value", year);
    d3.select(".yearChildcare").text(year);
}

// Load external data 
var promises = [
    d3.json("data/world.geojson"),
    d3.csv("data/childcare.csv", function(d) {
        childcare_map.set(d.Alpha3Code, +d.Value)
        childcareRange.push(+d.Value)
    })
]



Promise.all(promises).then(function(data){
    childcareReady(data);
}).catch(function(error){
    console.log(error);
});

function childcareReady(europe) {
    colorScaleChildcare = d3.scaleThreshold()
        .domain([0, 10, 20, 30, 50, d3.max(childcareRange)]) 
        .range(d3.schemeReds[6]); 

    // Draw the map
    mapChildcare = childcareSvg.append("g")
        .selectAll("path")
        .data(europe[0].features)
        // .enter returns an enter selection which basically represents the elements that need to be added. 
        // It’s usually followed by .append which adds elements to the DOM
        .enter()
        .append("path")
        // draw each country
        .attr("d", d3.geoPath()
            .projection(euProjection)
        )
        .attr("fill", function(d){
            d.childcare = childcare_map.get(d.id) || 0;
            return colorScaleChildcare(d.childcare);
        })
        .attr("class", function(d){ return "Country" } )
        .on("mouseover", childCareMouseOver )
        .on("mouseleave", mouseLeave );

    // Legend scale
    var x = d3.scaleLinear()
        .domain([0, d3.max(childcareRange)])
        .rangeRound([10, 200]);

    // Legend
    var legendChildcare = childcareSvg.append("g")
        .attr("class", "key")
        .attr("transform", "translate(0,550)");

    legendChildcare.selectAll("rect")
        .data(colorScaleChildcare.range().map(function(d) {
            d = colorScaleChildcare.invertExtent(d);
            if (d[0] == null) d[0] = x.domain()[0];
            if (d[1] == null) d[1] = x.domain()[1];
            return d;
        }))
        .enter().append("rect")
            .attr("height", 8)
            .attr("x", function(d) { return x(d[0]); })
            .attr("width", function(d) { return x(d[1]) - x(d[0]); })
            .attr("fill", function(d) { return colorScaleChildcare(d[0]); });

    legendChildcare.append("text")
        .attr("class", "caption")
        .attr("x", x.range()[0])
        .attr("y", -6)
        .attr("fill", "#000")
        .attr("text-anchor", "start")
        .attr("font-weight", "bold")
        .text("Enrolment rate of children in child care (%)");

    legendChildcare.call(d3.axisBottom(x)
        .tickSize(13)
        .tickFormat(function(x, i) { return Math.round(x) })
        .tickValues(colorScaleChildcare.domain()))
        .select(".domain")
        .remove();
    
    updateChildcare(yearChildcare, mapChildcare);
}



