var width = 960,
    height = 2300,
    colorTransitionTime = 400;

var svg = d3.select("body").append("svg")
    .attr("width", width)
    .attr("height", height);
var title = svg.append("text").attr("x", 100).attr("y", 50).attr("class", "title");
var chart1 = svg.append("g").attr("width", 120).attr("height", 200).attr("transform", "translate(100,100)");
var chart2 = svg.append("g").attr("width", 120).attr("height", 200).attr("transform", "translate(100,400)");
var g = svg.append("g");
var mini = svg.append("g").attr("transform","translate(2400 0)").attr("width", 500).attr("height", 500);
var color = d3.scale.category20c();//d3.scale.linear().domain([0,15]).range(['steelblue', 'orangered']);
var regiones = [];
 
d3.json("comunas.json", function(error, chile) {
  var projection = d3.geo.mercator().scale(1200).translate([width*2 , -350]);
  var path = d3.geo.path().projection(projection);

  g.selectAll(".comunas")
     .data(topojson.feature(chile, chile.objects.comunas).features).enter().append("path")
      .attr("class", "region")
      .attr("id", function(d){return d.properties.NOM_COM})
      .attr("data-region", function(d){if(regiones.indexOf(d.properties.NOM_REG) < 0){regiones.push(d.properties.NOM_REG)} return d.properties.NOM_REG})
      .attr("d", path).style("stroke", "black").style("stroke-width", "0.5px").style("fill-opacity", 0.5).style("fill", function(d, i){return color(regiones.indexOf(d.properties.NOM_REG))})
      .append("title").text(function(d){return d.properties.Details});
  d3.selectAll(".region").on("mouseover", function(){
    var region = (d3.select(this).attr("data-region"));
    console.log(region);
    var projectionMini = d3.geo.mercator().scale(2000).translate([800 , -500]);
    var pathMini = d3.geo.path().projection(projectionMini);
    
    mini.selectAll(".region").remove()
     .data(topojson.feature(chile, chile.objects.comunas).features      .filter(function(d){return d.properties.NOM_REG == region})
).enter()
      .append("path")
      .attr("class", "region")
      .attr("id", function(d){return d.properties.NOM_COM})
      .attr("data-region", function(d){if(regiones.indexOf(d.properties.NOM_REG) < 0){regiones.push(d.properties.NOM_REG)} return d.properties.NOM_REG})
      .attr("d", pathMini).style("stroke", "black").style("stroke-width", "0.5px").style("fill-opacity", 0.5).style("fill", function(d, i){return color(regiones.indexOf(d.properties.NOM_REG))})
      .append("title").text(function(d){return d.properties.Details});
    //showGraph();
  });

});


function showGraph(data){
  chart1.selectAll("rect").remove();
  chart1.selectAll("text").remove();
  chart2.selectAll("rect").remove();
  chart2.selectAll("text").remove();
  title.text(data.properties.Region);
  g.selectAll("path").transition().style("fill-opacity", 0.5).duration(colorTransitionTime);
  d3.select(this).transition().style("fill-opacity", 1).duration(colorTransitionTime);
  arr = [];
  for(var i=0; i<7; i++){
    arr[i] = 100*Math.random();
  }
  max = d3.max(arr);
  var barWidth = 20, barHeight = 300;
  chart1.selectAll("rect").data(arr).enter()
       .append("rect").style("fill", "orangered").style("fill-opacity", 0.6).style("stroke", "white")
       .attr("x", 2).attr("y", function(d, i){return i*barWidth})
       .attr("width", 0)
        .attr("height", barWidth)
       .transition()
        .attr("width", function(d){return barHeight*(d/max)})
       .duration(1000);
  chart1.selectAll("text").data(arr).enter()
      .append("text").attr("class", "chart1-text")
      .attr("x", -60)
      .attr("y", function(d, i){return barWidth/2+3+i*barWidth})
      .text(function(d, i){return "Variable "+i})
  chart1.selectAll("text").data(arr).enter()
      .append("text")
      .attr("x", function(d){return barHeight*(d/max)})
      .attr("y", function(d, i){return barWidth/2+i*barWidth})
      .text(function(d, i){return "ASDASD"})
  for(var i=0; i<10; i++){
    arr[i] = 100*Math.random();
  }
 chart2.selectAll("rect").data(arr).enter()
       .append("rect").style("fill", "steelblue").style("fill-opacity", 0.6).style("stroke", "white")
       .attr("x", 2).attr("y", function(d, i){return i*barWidth})
       .attr("width", 0)
        .attr("height", barWidth)
       .transition()
        .attr("width", function(d){return barHeight*(d/max)})
       .duration(1000);
  chart2.selectAll("text").data(arr).enter()
      .append("text").attr("class", "chart1-text")
      .attr("x", -60)
      .attr("y", function(d, i){return barWidth/2+3+i*barWidth})
      .text(function(d, i){return "Variable "+i})
  chart2.selectAll("text").data(arr).enter()
      .append("text")
      .attr("x", function(d){return barHeight*(d/max)})
      .attr("y", function(d, i){return barWidth/2+i*barWidth})
      .text(function(d, i){return "ASDASD"})

}
