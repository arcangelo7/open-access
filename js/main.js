var tip = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

var svg = d3.select("svg"),
    width = +svg.attr("width"),
    height = +svg.attr("height");

var selectedYear = 2011;

// Map and projection
var path = d3.geoPath(); // Maps GeoJSON features to SVG
var projection = d3.geoEckert6()
  .scale(200)
  .translate([width / 2, height / 2]);

var labour_force = new Map(); // The Map object holds key-value pairs and remembers the original insertion order of the keys.

// Load external data 
var promises = [
    d3.json("data/world.geojson"),
    d3.csv("data/labour_force.csv", function(d) { labour_force.set(d.country_code, {1990:+d.YR1990, 2000:+d.YR2000, 2011:+d.YR2011, 2012:+d.YR2012, 2013:+d.YR2013, 2014:+d.YR2014, 2015:+d.YR2015, 2016:+d.YR2016, 2017:+d.YR2017, 2018:+d.YR2018, 2019:+d.YR2019, 2020:+d.YR2020}); })
]

Promise.all(promises).then(function(data){
    ready(data);
}).catch(function(error){
    console.log(error);
});

function ready(world) {    
    var colorScale = d3.scaleThreshold()
        .domain([0, 10, 20, 30, 40, 50, 60]) 
        .range(d3.schemeBlues[7]);
  
    // Legend scale
    var x = d3.scaleLinear()
        .domain([0, 60])
        .rangeRound([700, 990]);

    let mouseOver = function(event, d) {
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
        tip.html(d.properties.name + "<br/>" + (Math.round(d.labour_force[selectedYear]) || "No") + "%")
            .style("left", (event.pageX) + "px")
            .style("top", (event.pageY - 28) + "px");
    }
    
    let mouseLeave = function(d) {
        d3.selectAll(".Country")
            .transition()
            .duration(200)
            .style("opacity", 1)
        d3.select(this)
            .transition()
            .duration(200)
            .style("stroke", "black")

        tip.transition()
            .duration(500)
            .style("opacity", 0);
    }

    // Draw the map
    svg.append("g")
        .selectAll("path")
        .data(world[0].features)
        // .enter returns an enter selection which basically represents the elements that need to be added. 
        // It’s usually followed by .append which adds elements to the DOM
        .enter()
        .append("path")
        // draw each country
        .attr("d", d3.geoPath()
            .projection(projection)
        )
        // set the color of each country
        .attr("fill", function (d) {
            d.labour_force = labour_force.get(d.id) || 0;
        })
        .style("stroke", "black")
        .attr("class", function(d){ return "Country" } )
        .style("opacity", 1)
        .on("mouseover", mouseOver )
        .on("mouseleave", mouseLeave )
    
    // Legend 
    var legend = svg.append("g")
        .attr("class", "key")
        .attr("transform", "translate(0,15)");

    legend.selectAll("rect")
        .data(colorScale.range().map(function(d) {
            d = colorScale.invertExtent(d);
            if (d[0] == null) d[0] = x.domain()[0];
            if (d[1] == null) d[1] = x.domain()[1];
            return d;
        }))
        .enter().append("rect")
            .attr("height", 8)
            .attr("x", function(d) { return x(d[0]); })
            .attr("width", function(d) { return x(d[1]) - x(d[0]); })
            .attr("fill", function(d) { return colorScale(d[0]); });

    legend.append("text")
        .attr("class", "caption")
        .attr("x", x.range()[0])
        .attr("y", -6)
        .attr("fill", "#000")
        .attr("text-anchor", "start")
        .attr("font-weight", "bold")
        .text("Female labor force rate");

    legend.call(d3.axisBottom(x)
        .tickSize(13)
        .tickFormat(function(x, i) { return i ? x : x + "%"; })
        .tickValues(colorScale.domain()))
      .select(".domain")
        .remove();
    
    // Slider
    function update(year){
        slider.property("value", year);
        d3.select(".year").text(year);
        d3.selectAll(".Country")
            .style("fill", function(d) {
                return colorScale(d.labour_force[year]);
            });

        selectedYear = year;
    }

    var slider = d3.select(".slider")
		.append("input")
			.attr("type", "range")
			.attr("min", 2011)
			.attr("max", 2020)
			.attr("step", 1)
			.on("input", function() {
				var year = this.value;
				update(year);
            });
    update(selectedYear);
}




