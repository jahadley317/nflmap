//Choropleth Map of US adapted from https://bl.ocks.org/jadiehm/8f5adc05465a94e77e30
//Creates tooltip and makes it invisible
var div = d3.select("body").append("div")
  .attr("class", "tooltip")
  .style("opacity", 0);

//Sets dimensions
var margin = {top: 10, left: 10, bottom: 10, right: 10}
  , width = window.outerWidth
  , width = width - margin.left - margin.right
  , mapRatio = .5
  , height = width * mapRatio;

//Tells the nap what projection to use
var projection = d3.geo.albersUsa()
    .scale(width)
    .translate([width / 2, height / 2]);

//Tells the map how to draw the paths from the projection
var path = d3.geo.path()
    .projection(projection);

//Appened svg to page
var map = d3.select(".g-chart").append("svg")
  .style('height', height + 'px')
  .style('width', width + 'px');  

//Load the files
queue()
    .defer(d3.json, "data/us.json")
    .defer(d3.csv, "data/TeamData.csv")
    .await(ready);

//Moves selection to front
d3.selection.prototype.moveToFront = function() {
  return this.each(function(){
    this.parentNode.appendChild(this);
  });
}; 

//Moves selection to back
d3.selection.prototype.moveToBack = function() { 
  return this.each(function() { 
  var firstChild = this.parentNode.firstChild; 
    if (firstChild) { 
      this.parentNode.insertBefore(this, firstChild); 
    } 
  }); 
};    

function ready(error, us, TeamData) {
  if (error) throw error;

  console.log(us, TeamData);   

  //Sets color scale
  var numMedian = d3.median(TeamData, function(d) { return d.State_num;}); 
  var quantize = d3.scale.quantize()
    .domain([0, numMedian])
    .range(d3.range(5).map(function(i) { return "q" + i + "-9"; }));
 
  //Pair data with state id
  var dataByFIPS = {};
  maptemplate.forEach(function(d) { dataByFIPS[d.FIPS] = +d.num; });

  //Pair state name with state id
  var stateByFIPS = {};
  maptemplate.forEach(function(d) { stateByFIPS[d.FIPS] = d.state; });

  //Appends chart headline
  d3.select(".g-hed").text("Map headline goes here");

  //Appends chart intro text
  d3.select(".g-intro").text("Map intro text goes here. Write a short sentence describing the map here.");

  //Append states
  map.append("g")
    .attr("class", "states")
    .selectAll("path")
    .data(topojson.feature(us, us.objects.states).features)
    .enter().append("path")
    .attr("d", path)
    //Color states
    .attr("class", function(d) { return quantize(dataByFIPS[d.id]); })
    //Hovers
    .on("mouseover", function(d) {
      var sel = d3.select(this);
        sel.moveToFront();
      d3.select(this).transition().duration(300).style("opacity", 0.8);
      div.transition().duration(300)
      .style("opacity", 1)
      div.text(stateByFIPS[d.id] + ": " + dataByFIPS[d.id])
      .style("left", (d3.event.pageX) + "px")
      .style("top", (d3.event.pageY - 30) + "px");
    })
    .on("mouseout", function() {
      var sel = d3.select(this);
        sel.moveToBack();
      d3.select(this)
      .transition().duration(300)
      .style("opacity", 1);
      div.transition().duration(300)
      .style("opacity", 0);
    });

  //Appends chart source
  d3.select(".g-source-bold")
    .text("SOURCE: ")
    .attr("class", "g-source-bold");

  d3.select(".g-source-reg")
    .text("Chart source info goes here")
    .attr("class", "g-source-reg");    

    //RESPONSIVENESS
d3.select(window).on('resize', resize);

function resize() {

    var w = d3.select(".g-chart").node().clientWidth;
    console.log("resized", w);

    // adjust things when the window size changes
    width = w - margin.left - margin.right;
    height = width * mapRatio;

    console.log(width)
    // update projection
    var newProjection = d3.geo.albersUsa()
      .scale(width)
      .translate([width / 2, height / 2]);

    //Update path
    path = d3.geo.path()
      .projection(newProjection);    

    // resize the map container
    map
        .style('width', width + 'px')
        .style('height', height + 'px');

    // resize the map
    map.selectAll("path").attr('d', path);
}
function cities(){
	var city = d3.select(".g-chart");
		city.append("circle")
			.attr("cx", "624")
			.attr("cy", "600")
			.attr("r", "15")
			.attr("fill","yellow");
}
}

