var childcareMap = L.map('childcareMap').setView([54.5260, 15.2551], 4);
mapLink = 
    '<a href="http://openstreetmap.org" target="_blank">OpenStreetMap</a>';
L.tileLayer(
    'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; ' + mapLink + ' Contributors',
    maxZoom: 18,
    clickable: true
}).addTo(childcareMap);
// Add an SVG element to Leaflet’s overlay pane
var svgChildcare = d3.select(childcareMap.getPanes().overlayPane).append("svg").attr("pointer-events", "auto"),
    gChildcare = svgChildcare.append("g").attr("class", "leaflet-zoom-hide");
var legendChildcare = d3.select("#childcareMapLegend")
    .append("g")
    .style("transform", "translate(0, 15px)")

var childcareSvg = d3.select("svg#childcare"),
    width = +svg.attr("width"),
    height = +svg.attr("height");

var childcare_map = new Map();
var childcareRange = []
var yearChildcare = 2005;

let mouseOverChildcare = function(event, d) {
    d3.selectAll(".CountryChildcare")
        .transition()
        .duration(200)
        .style("opacity", .3)
    d3.select(this)
        .transition()
        .duration(200)
        .style("opacity", .5)
        .style("stroke", "black")
    tip.transition()
        .duration(200)
        .style("opacity", .9);
    tip.html(function(){
        if (d[yearChildcare]) {
            return "<strong>" + d.properties.name + "</strong><br/>"
                + "Rate: " + d[yearChildcare] + "%"
        } else {
            return "<strong>" + d.properties.name + "</strong><br/>"
                + "No data"
        }
    })
    .style("left", (event.pageX) + "px")
    .style("top", (event.pageY - 28) + "px");
}

let mouseLeaveChildcare = function(d) {
    d3.selectAll(".CountryChildcare")
        .transition()
        .duration(200)
        .style("opacity", .5)
    d3.select(this)
        .transition()
        .duration(200)
        .style("stroke", "black")
    
    tip.transition()
        .duration(500)
        .style("opacity", 0);
}

var sliderChildcare = d3.select(".sliderChildcare")
    .append("input")
        .attr("class", "vizSliderInput")
        .attr("type", "range")
        .attr("min", 2005)
        .attr("max", 2017)
        .attr("step", 1)
        .on("input", function() {
            var year = this.value;
            updateChildcare(year, mapChildcare);
        });

function updateChildcare(year){
    sliderChildcare.property("value", year);
    d3.select(".yearChildcare").text("Year: " + year);
    d3.selectAll(".CountryChildcare")
        .style("fill", function(d) {
            return colorScaleChildcare(d[year])
        });
    yearChildcare = year;
}

// Use Leaflet to implement a D3 geometric transformation.
function projectPoint(x, y) {
    var point = childcareMap.latLngToLayerPoint(new L.LatLng(y, x));
    this.stream.point(point.x, point.y);
}

// Load external data 
var promises = [
    d3.json("data/world.geojson"),
    d3.csv("data/childcare.csv", function(d) {
        if (childcare_map.get(d.Alpha3Code)) {
            childcare_map.get(d.Alpha3Code).push({"year": +d.PeriodCode, "value": +d.Value})
        } else {
            childcare_map.set(d.Alpha3Code, [{"year": +d.PeriodCode, "value": +d.Value}])
        }
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
        .enter()
        .append("path")
        .attr("fill", function(d){
            if (childcare_map.get(d.id)) {
                for (let [i, value] of childcare_map.get(d.id).entries()) {
                    d[value.year] = value.value
                }
            }
        });

    // Legend scale
    var x = d3.scaleLinear()
        .domain([0, d3.max(childcareRange)])
        .rangeRound([10, 200]);

    // Legend
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
        .tickFormat(function(x, i) { return Math.round(x) + "%"})
        .tickValues(colorScaleChildcare.domain()))
        .select(".domain")
        .remove();
    
    //  create a d3.geo.path to convert GeoJSON to SVG
    var transformLeaflet = d3.geoTransform({point: projectPoint}),
            pathLeaflet = d3.geoPath().projection(transformLeaflet);
    // create path elements for each of the features
    d3_features = gChildcare.selectAll("path")
        .data(europe[0].features)
        .enter().append("path")
        .on("mouseover", mouseOverChildcare )
        .on("mouseleave", mouseLeaveChildcare );

    childcareMap.on("zoom", resetChildcare);
    resetChildcare();
    // fit the SVG element to leaflet's map layer
    function resetChildcare() {
        bounds = pathLeaflet.bounds(europe[0]);
        var topLeft = bounds[0],
            bottomRight = bounds[1];
        svgChildcare.attr("width", bottomRight[0] - topLeft[0])
                    .attr("height", bottomRight[1] - topLeft[1])
                    .style("left", topLeft[0] + "px")
                    .style("top", topLeft[1] + "px");
        gChildcare.attr("transform", "translate(" + -topLeft[0] + "," 
                                        + -topLeft[1] + ")");
        // initialize the path data	
        d3_features.attr("d", pathLeaflet)
            .attr("class", function(d){ return "CountryChildcare" } )
            .style("stroke", "black")
            .style("opacity", .5);
        updateChildcare(yearChildcare);
    } 
}
$(document).ready(function(){
    $(document).on("click", ".tablinks:contains('Childcare')", function(e) {
        childcareMap.invalidateSize();
    });    
});



