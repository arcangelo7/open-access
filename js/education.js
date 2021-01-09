// set the dimensions and margins of the graph
var marginEdu = { left:80, right:250, top:50, bottom:100 },
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
$("#eduMeasure").on("change", function(){
    updateEdu();
    addCheckboxes();
})
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
        addCheckboxes();
    }
});

// Read in data
d3.json("data/edu.json").then(function(data) {
    dataEdu = data;
    filteredData = {};
    // Prepare and clean data
    for (var measure in data) {
        if (!data.hasOwnProperty(measure)) {
            continue;
        }
        filteredData[measure] = data[measure].filter(function(d){
            return (!(d["value"] == null))
        })
        filteredData[measure].forEach(function(d){
            d["country"] = d["country"];
            d["year"] = parseTimeEdu(d["year"]);
            d["value"] = +d["value"];
        });
    }
    // Run the visualization for the first time
    updateEdu();
    addCheckboxes();
    // $(countriesSelectedDefault).each(function(index, value){
    //     $(`#${value}`).prop("checked", true).trigger("click");
    // });
});

var t = function(){ return d3.transition().duration(1000); }

function updateEdu(){
    // Filter data based on selections
    curEduMeasure = $("#eduMeasure").val(),
        sliderValues = $("#sliderEdu").slider("values");
    var dataTimeFiltered = filteredData[curEduMeasure].filter(function(d){
        return ((d.year >= sliderValues[0]) && (d.year <= sliderValues[1]) && countriesSelected.includes(d["country"]))
    });
    // Update scales
    xEdu.domain(d3.extent(dataTimeFiltered, function(d){ return d.year; }));
    yEdu.domain([d3.min(dataTimeFiltered, function(d){ return d.value; }), 
        d3.max(dataTimeFiltered, function(d){ return d.value; })]);
    colorEdu.domain(dataTimeFiltered.map(function(d){ return d.country }));
      
    // Update axes
    xAxisCallEdu.scale(xEdu);
    xAxisEdu.transition(t()).call(xAxisCallEdu);
    yAxisCallEdu.scale(yEdu);
    yAxisEdu.transition(t()).call(yAxisCallEdu);

    var countriesSelectedData = colorEdu.domain().map(function(name) {
        return {
            country: name,
            values: dataEdu[curEduMeasure].filter(function(d,i){
                return d.country == name
            }).map(function(d, i){
                if (d.country == name){
                    return {
                        year: d.year,
                        value: d.value
                    }
                }
            })
        }
    });

    // Path generator
    lineEdu = d3.line()
        .x(function(d){ return xEdu(d.year); })
        .y(function(d){ return yEdu(d.value); });

    // Update our line path
    d3.selectAll(".countryLine").remove();
    var countryLines = gEdu.selectAll(".countryLine")
      .data(countriesSelectedData)
      .enter().append("g")
      .attr("class", "countryLine");
    countryLines.append("path")
        .attr("class", "line")
        .attr("d", function(d) {
            return lineEdu(d.values);
        })
        .style("stroke", function(d) {
            return colorEdu(d.country);
        });

    // Legend
    d3.selectAll(".legendEdu").remove();
    var legendEdu = svgEdu.selectAll(".legendEdu")
        .data(countriesSelectedData)
        .enter().append("g")
            .attr("class", "legendEdu")
            .attr("transform", function(d,i) { return "translate(0," + i * 20 + ")"; })
            .style("opacity","0");

    legendEdu.append("rect")
        .attr("x", widthEdu+250)
        .attr("width", 18)
        .attr("height", 18)
        .style("fill", function(d) { 
            return colorEdu(d.country); 
        });

    legendEdu.append("text")
        .attr("x", widthEdu+240)
        .attr("y", 9)
        .attr("dy", ".35em")
        .style("text-anchor", "end")
        .text(function(d) {return d.country; });

    legendEdu.transition().duration(500).delay(function(d,i){ return 1300 + 100 * i; }).style("opacity","1");

    // Tooltip
    var linesEdu = document.getElementsByClassName('line');
    d3.selectAll(".mouse-over-effects").remove();
    var mouseG = gEdu.append("g")
        .attr("class", "mouse-over-effects");
    mouseG.append("path") // this is the black vertical line to follow mouse
      .attr("class", "mouse-line")
      .style("stroke", "black")
      .style("stroke-width", "1px")
      .style("opacity", "0");
    var mousePerLine = mouseG.selectAll('.mouse-per-line')
        .data(countriesSelectedData)
        .enter()
        .append("g")
        .attr("class", "mouse-per-line");
    mousePerLine.append("circle")
        .attr("r", 7)
        .style("stroke", function(d) {
            return colorEdu(d.country);
        })
        .style("fill", "none")
        .style("stroke-width", "1px")
        .style("opacity", "0");
    mouseG.append('svg:rect') // append a rect to catch mouse movements on canvas
        .attr('width', widthEdu) // can't catch mouse events on a g element
        .attr('height', heightEdu)
        .attr('fill', 'none')
        .attr('pointer-events', 'all')
        .on('mouseout', function() { // on mouse out hide line, circles and text
            d3.select(".mouse-line")
                .style("opacity", "0");
            d3.selectAll(".mouse-per-line circle")
                .style("opacity", "0");
            d3.selectAll(".mouse-per-line text")
                .style("opacity", "0");
            tipLineChart.style('opacity', '0');
        })
        .on('mouseover', function() { // on mouse in show line, circles and text
            d3.select(".mouse-line")
                .style("opacity", "1");
            d3.selectAll(".mouse-per-line circle")
                .style("opacity", "1");
            d3.selectAll(".mouse-per-line text")
                .style("opacity", "1");
            tipLineChart.style('opacity', '.9');
        })
        .on('mousemove', function(event) { // mouse moving over canvas
            var mouse = d3.pointer(event);
            var xDate = xEdu.invert(mouse[0]);
            d3.select(".mouse-line")
            .attr("d", function() {
                var d = "M" + mouse[0] + "," + heightEdu;
                d += " " + mouse[0] + "," + 0;
                return d;
            });
            d3.selectAll(".mouse-per-line")
                .attr("transform", function(d, i) {
                var bisect = d3.bisector(function(d) { return d.year; }).right;
                    idx = bisect(d.values, xDate);
                var beginning = 0,
                    end = linesEdu[i].getTotalLength(),
                    target = null;
  
                while (true){
                    target = Math.floor((beginning + end) / 2);
                    pos = linesEdu[i].getPointAtLength(target);
                    if ((target === end || target === beginning) && pos.x !== mouse[0]) {
                        break;
                    }
                    if (pos.x > mouse[0]) end = target;
                    else if (pos.x < mouse[0]) beginning = target;
                    else break; //position found
                }                
                return "translate(" + mouse[0] + "," + pos.y +")";
            }); 
            // Cartiglio
            var cursorEduData = dataEdu[curEduMeasure].filter(function(d){
                if (formatTime(d.year) == formatTime(xDate) && countriesSelected.includes(d.country)){
                    return d
                }
            }).sort(function(a, b){
                return b.value - a.value
            });       
            tipLineChart
                .html(formatTime(xDate))
                .style('opacity', '.9')
                .style("left", (event.pageX) + "px")
                .style("top", (event.pageY - 28) + "px")
                .selectAll()
                .data(cursorEduData).enter()
                .append('div')
                .style("color", function(d){
                    return colorEdu(d.country)
                })
                .html(function(d, i){
                    return `${cursorEduData[i]["country"] + ": " + Math.round(cursorEduData[i]["value"] * 100) / 100}%<br/>`
                });
        });
}

function addCheckboxes(){
    // Add checkboxes to modal
    $("#modalEduCountriesContent").html("");
    $("#modalEduCountriesContent").html('<span class="close" id="closeEdu">&times;</span>');
    var relevantCountries = []
    $(dataEdu[curEduMeasure]).each(function(i, d){
        if (!relevantCountries.includes(d["country"])){
            relevantCountries.push(d["country"])
            if (countriesSelectedDefault.includes(d["country"])){
                $("#modalEduCountriesContent").append(
                    `<input type="checkbox" class="eduCountryCheckbox" id="${d["country"]}" name="${d["country"]}" value="${d["country"]}" checked>
                    <label for="${d["country"]}">${d["country"]}</label><br>`); 
            } else {
                $("#modalEduCountriesContent").append(
                    `<input type="checkbox" class="eduCountryCheckbox" id="${d["country"]}" name="${d["country"]}" value="${d["country"]}">
                    <label for="${d["country"]}">${d["country"]}</label><br>`);    
            }
        }
    });
}

$(document).ready(function() {
    countriesSelected = ["European Union", "Advanced Economies", "Sub-Saharan Africa"]
    countriesSelectedDefault = ["European Union", "Advanced Economies", "Sub-Saharan Africa"]
    // Get the modal
    var modalEduCountries = document.getElementById("modalEduCountries");
    // Get the button that opens the modal
    var btnModalEduCountries = document.getElementById("btnModalEduCountries");
    // When the user clicks on the button, open the modal
    btnModalEduCountries.onclick = function() {
        modalEduCountries.style.display = "block";
    }
    // When the user clicks anywhere outside of the modal, close it
    window.onclick = function(event) {
    if (event.target == modalEduCountries) {
        modalEduCountries.style.display = "none";
    }
    // Get the <span> element that closes the modal
    var spanModalEduCountries = $("#closeEdu")[0];
    // When the user clicks on <span> (x), close the modal
    spanModalEduCountries.onclick = function() {
        modalEduCountries.style.display = "none";
    }
    // Update chart when checkbox selected
    $(".eduCountryCheckbox").change(function() {
        if ($(this).is(":checked")){
            countriesSelected.push($(this).val());
        } else {
            var eduCountryIndex = countriesSelected.indexOf($(this).val());
            if (eduCountryIndex > -1) {
                countriesSelected.splice(eduCountryIndex, 1);
              }
        }
        updateEdu();
    });
}});




