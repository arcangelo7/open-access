// set the dimensions and margins of the graph
var marginPay = { left:80, right:250, top:50, bottom:100 },
    widthPay = 1000 - marginPay.left - marginPay.right,
    heightPay = 500 - marginPay.top - marginPay.bottom;
// Define svg canvas
var svgPay = d3.select("#payChart")
  .attr("width", widthPay + marginPay.left + marginPay.right)
  .attr("height", heightPay + marginPay.top + marginPay.bottom)
var gPay = svgPay.append("g")
  .attr("transform", "translate(" + marginPay.left + "," + marginPay.top + ")");
// parse the date / time
var parseTimePay = d3.timeParse("%Y");
var parseTimePayFull = d3.timeParse("%d/%m/%Y");
var formatTime = d3.timeFormat("%Y");
// For tooltip
var tipLineChart = d3.select("body").append("div")
    .attr("class", "tipLineChart")
    .style("opacity", 0);
// Scales
var xPay = d3.scaleTime().range([0, widthPay]);
var yPay = d3.scaleLinear().range([heightPay, 0]);
var colorPay = d3.scaleOrdinal().range(d3.schemeCategory10);
// Define axes
var xAxisCallPay = d3.axisBottom().scale(xPay);
var yAxisCallPay = d3.axisLeft().scale(yPay)
    .ticks(10)
    .tickFormat(function(d) { return parseInt(d) + "%"; });
    // Place the axes on the chart
var xAxisPay = gPay
    .append("g")
    .attr("class", "x-axis")
    .attr("transform", "translate(0," + heightPay + ")")
var yAxisPay = gPay
    .append("g")
    .attr("class", "y-axis")
// Add jQuery UI slider
$("#sliderPay").slider({
    range: true,
    min: parseTimePay("1994").getTime(),
    max: parseTimePay("2007").getTime(),
    step: 1, // One year
    values: [parseTimePay("1994").getTime(), parseTimePay("2006").getTime()],
    slide: function(event, ui){
        $("#dateLabel1Pay").text(formatTime(new Date(ui.values[0])));
        $("#dateLabel2Pay").text(formatTime(new Date(ui.values[1])));
    },
    change: function(event, ui){
        updatePay();
        addCheckboxesPay();
    }
});

// Read in data
d3.json("data/paygap.json").then(function(data) {
    filteredDataPay = {};
    // // Prepare and clean data
    for (var measure in data) {
        if (!data.hasOwnProperty(measure)) {
            continue;
        }
        filteredDataPay[measure] = data[measure].filter(function(d){
            return (!(d.value == ":"))
        })
        filteredDataPay[measure].forEach(function(d){
            d["year"] = parseTimePay(d.year);
            d["value"] = +d.value;
        });
    }
    dataPay = filteredDataPay
    // Run the visualization for the first time
    updatePay();
    addCheckboxesPay();
});
var t = function(){ return d3.transition().duration(1000); }
function updatePay(){
    // Filter data based on selections
    sliderPayValues = $("#sliderPay").slider("values");
    var dataPayTimeFiltered = filteredDataPay["paygap"].filter(function(d){
        return ((d.year >= parseTimePay(formatTime(new Date(sliderPayValues[0])))) && (d.year <= parseTimePay(formatTime(new Date(sliderPayValues[1])))) && countriesPaySelected.includes(d["country"]))
    });
    // Update scales
    xPay.domain(d3.extent(dataPayTimeFiltered, function(d){ return d.year; }));
    yPay.domain([d3.min(dataPayTimeFiltered, function(d){ return d.value; }), 
        d3.max(dataPayTimeFiltered, function(d){ return d.value; })]);
    colorPay.domain(dataPayTimeFiltered.map(function(d){ return d.country }));
    // Update axes
    xAxisCallPay.scale(xPay);
    xAxisPay.transition(t()).call(xAxisCallPay);
    yAxisCallPay.scale(yPay);
    yAxisPay.transition(t()).call(yAxisCallPay);
    var countriesSelectedPayData = colorPay.domain().map(function(name) {
        return {
            country: name,
            values: dataPay["paygap"].filter(function(d,i){
                return d.country == name && d.value != ":"
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
    // Line path generator
    var linePay = d3.line()
        .defined(function(d) {
            return d.year <= xPay.domain()[1] && d.year >= xPay.domain()[0]; 
        })
        .x(function(d) { return xPay(d.year); })
        .y(function(d) { return yPay(d.value); });
    // Update our line path
    d3.selectAll(".countryPayLine").remove();
    var countryPayLines = gPay.selectAll(".countryPayLine")
      .data(countriesSelectedPayData)
      .enter().append("g")
      .attr("class", "countryPayLine");
    countryPayLines.append("path")
        .attr("class", "linePay")
        .attr("d", function(d) {
            return linePay(d.values);
        })
        .style("stroke", function(d) {
            return colorPay(d.country);
        })
        .style("fill", "none")
        .style("stroke-width", "2px");
    // Add dots
    var circlePayArea = countryPayLines.append("g");
    circlePayArea.selectAll('circle').remove(); // this makes sure your out of box dots will be remove.
    circlePayArea.selectAll('circle')
      .data(dataPayTimeFiltered)
      .enter()
           .append('circle')
           .attr('r',3)  // radius of dots 
           .attr('fill', function(d, i){ return colorPay(d.country)}) // color of dots
           .attr('transform',function(d,i){ 
               return 'translate('+xPay(d.year)+','+yPay(d.value)+')';
            }); 
    // Legend
    d3.selectAll(".legendPay").remove();
    var legendPay = svgPay.selectAll(".legendPay")
        .data(countriesSelectedPayData)
        .enter().append("g")
            .attr("class", "legendPay")
            .attr("transform", function(d,i) { return "translate(0," + i * 20 + ")"; })
            .style("opacity","0");
    legendPay.append("rect")
        .attr("x", widthPay+250)
        .attr("width", 18)
        .attr("height", 18)
        .style("fill", function(d) { 
            return colorPay(d.country); 
        });
    legendPay.append("text")
        .attr("x", widthPay+240)
        .attr("y", 9)
        .attr("dy", ".35em")
        .style("text-anchor", "end")
        .text(function(d) {return d.country; });
    legendPay.transition().duration(500).delay(function(d,i){ return 1300 + 100 * i; }).style("opacity","1");
    // Tooltip
    var linesPay = document.getElementsByClassName('linePay');
    d3.selectAll(".mousePay-over-effects").remove();
    var mouseGPay = gPay.append("g")
        .attr("class", "mousePay-over-effects");
    mouseGPay.append("path") // this is the black vertical line to follow mouse
      .attr("class", "mousePay-line")
      .style("stroke", "black")
      .style("stroke-width", "1px")
      .style("opacity", "0");
    var mousePerLinePay = mouseGPay.selectAll('.mousePay-per-line')
        .data(countriesSelectedPayData)
        .enter()
        .append("g")
        .attr("class", "mousePay-per-line");
    mousePerLinePay.append("circle")
        .attr("r", 7)
        .style("stroke", function(d) {
            return colorPay(d.country);
        })
        .style("fill", "none")
        .style("stroke-width", "1px")
        .style("opacity", "0");
    mouseGPay.append('svg:rect') // append a rect to catch mouse movements on canvas
        .attr('width', widthPay) // can't catch mouse events on a g element
        .attr('height', heightPay)
        .attr('fill', 'none')
        .attr('pointer-events', 'all')
        .on('mouseout', function() { // on mouse out hide line, circles and text
            d3.select(".mousePay-line")
                .style("opacity", "0");
            d3.selectAll(".mousePay-per-line circle")
                .style("opacity", "0");
            d3.selectAll(".mousePay-per-line text")
                .style("opacity", "0");
            tipLineChart.style('opacity', '0');
        })
        .on('mouseover', function() { // on mouse in show line, circles and text
            d3.select(".mousePay-line")
                .style("opacity", "1");
            d3.selectAll(".mousePay-per-line circle")
                .style("opacity", "1");
            d3.selectAll(".mousePay-per-line text")
                .style("opacity", "1");
            tipLineChart.style('opacity', '.9');
        })
        .on('mousemove', function(event) { // mouse moving over canvas
            var mousePay = d3.pointer(event);
            d3.select(".mousePay-line")
            .attr("d", function() {
                var d = "M" + mousePay[0] + "," + heightPay;
                d += " " + mousePay[0] + "," + 0;
                return d;
            });
            d3.selectAll(".mousePay-per-line")
                .attr("transform", function(d, i) {
                var xDate = xPay.invert(mousePay[0]),
                    bisect = d3.bisector(function(d) { return d.year; }).right;
                    idx = bisect(d.values, xDate);
                var beginning = 0,
                    end = linesPay[i].getTotalLength(),
                    target = null;
  
                while (true){
                    target = Math.floor((beginning + end) / 2);
                    pos = linesPay[i].getPointAtLength(target);
                    if ((target === end || target === beginning) && pos.x !== mousePay[0]) {
                        break;
                    }
                    if (pos.x > mousePay[0]) end = target;
                    else if (pos.x < mousePay[0]) beginning = target;
                    else break; //position found
                }
                return "translate(" + mousePay[0] + "," + pos.y +")";
            }); 
            const yearPay = xPay.invert(mousePay[0]);
            var cursorPayData = dataPay["paygap"].filter(function(d){
                if (formatTime(d.year) == formatTime(yearPay) && countriesPaySelected.includes(d.country)){
                    return d
                }
            }).sort(function(a, b){
                return b.value - a.value
            });
                          
            tipLineChart
                .html(formatTime(yearPay))
                .style('opacity', '.9')
                .style("left", (event.pageX) + "px")
                .style("top", (event.pageY - 28) + "px")
                .selectAll()
                .data(cursorPayData).enter()
                .append('div')
                .style("color", function(d){
                    return colorPay(d.country)
                })
                .html(function(d, i){
                    return `${cursorPayData[i]["country"] + ": " + cursorPayData[i]["value"]}%<br/>`
                });
        });
}
function addCheckboxesPay(){
    // Add checkboxes to modal
    $("#modalPayCountriesContent").html("");
    $("#modalPayCountriesContent").html('<span class="close" id="closePay">&times;</span>');
    var relevantCountriesPay = []
    $(dataPay["paygap"]).each(function(i, d){
        if (!relevantCountriesPay.includes(d["country"])){
            relevantCountriesPay.push(d["country"])
            if (countriesSelectedDefault.includes(d["country"])){
                $("#modalPayCountriesContent").append(
                    `<input type="checkbox" class="countryPayCheckbox" id="${d["country"]}" name="${d["country"]}" value="${d["country"]}" checked>
                    <label for="${d["country"]}">${d["country"]}</label><br>`); 
            } else {
                $("#modalPayCountriesContent").append(
                    `<input type="checkbox" class="countryPayCheckbox" id="${d["country"]}" name="${d["country"]}" value="${d["country"]}">
                    <label for="${d["country"]}">${d["country"]}</label><br>`);    
            }
        }
    });
}
$(document).ready(function() {
    countriesPaySelected = ["Italy", "Finland"]
    countriesPaySelectedDefault = ["Italy", "Finland"]
    // Get the modal
    var modalPayCountries = document.getElementById("modalPayCountries");
    // Get the button that opens the modal
    var btnModalPayCountries = document.getElementById("btnModalPayCountries");
    // When the user clicks on the button, open the modal
    btnModalPayCountries.onclick = function() {
        modalPayCountries.style.display = "block";
    }
    // When the user clicks anywhere outside of the modal, close it
    $('body').click(function (event){
       if($(event.target).is('#modalPayCountries') && !$(event.target).is('#btnModalPayCountries')) {
            $("#modalPayCountries").hide();
       }     
    });
    // When the user clicks on <span> (x), close the modal
    $(document).on("click", "#closePay", function(){
        modalPayCountries.style.display = "none";
    });
    // Update chart when checkbox selected
    $(document).on("change", ".countryPayCheckbox", function() {
        if ($(this).is(":checked")){
            countriesPaySelected.push($(this).val());
        } else {
            var countryPayIndex = countriesPaySelected.indexOf($(this).val());
            if (countryPayIndex > -1) {
                countriesPaySelected.splice(countryPayIndex, 1);
              }
        }
        updatePay();
    });
});
