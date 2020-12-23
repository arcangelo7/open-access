var tip = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

var svg = d3.select("svg"),
    width = +svg.attr("width"),
    height = +svg.attr("height");

// Map and projection
var path = d3.geoPath(); // Maps GeoJSON features to SVG
var projection = d3.geoEckert6()
  .scale(200)
  .translate([width / 2, height / 2]);

// Data and color scale
var labour_force = new Map(); // The Map object holds key-value pairs and remembers the original insertion order of the keys.
var colorScale = d3.scaleThreshold()
  .domain([0, 10, 20, 30, 40, 50, 60]) 
  .range(d3.schemeBlues[7]);

// Load external data and boot
var promises = [
    d3.json("data/world.geojson"),
    d3.csv("data/labour_force.csv", function(d) { labour_force.set(d.country_code, +d.YR2020); })
]

Promise.all(promises).then(function(data){
    ready(data);
}).catch(function(error){
    console.log(error);
});

function ready(world) {
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
        tip.html(d.properties.name + "<br/>" + d.labour_force + "%")
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
            return colorScale(d.labour_force);
        })
        .style("stroke", "black")
        .attr("class", function(d){ return "Country" } )
        .style("opacity", 1)
        .on("mouseover", mouseOver )
        .on("mouseleave", mouseLeave )
}



