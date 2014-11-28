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
var color = d3.scale.category20c();//d3.scale.linear().domain([0,15]).range(['steelblue', 'orangered']);
var regiones = [];
var x = d3.scale.linear().range([0, 200]).domain([2000,2015]);
var y = d3.scale.linear().range([10, 0]).domain([0,200]);


 function sparkline(myG, data, line, key, offset, offsetY) {
                            console.log("offsetY!!!", offsetY);

  myG.attr("transform", "translate(100,"+offsetY+")");
  myG.append("text").attr("class", "chart1-text").text(key).attr("transform", "translate(0,"+(offset+20)+")");
  myG
    .append('path')
    .datum(data)
    .attr('class', 'sparkline').attr("transform", "translate(250,"+(offset )+")").transition()
     .attr('d', line(data[0]))
      .transition()
        .duration(1000)
        .attrTween('d', pathTween);

    function pathTween() {
        var interpolate = d3.scale.quantile()
                .domain([0,1])
                .range(d3.range(1, data.length + 1));
        return function(t) {
            return line(data.slice(0, interpolate(t)));
        };
    }

  myG.append('circle')
     .attr('class', 'sparkcircle')
     .attr('cx', x(data[data.length-1].year))
     .attr('cy', y(data[data.length-1].total))
     .transition().attr('r', 0).duration(1000)
     .attr("transform", "translate(250,"+(offset-10)+")")
     .transition().attr('r', 1.5).duration(400);

  myG.append('text')
     .attr('class', 'sparktext')
     .attr('x', x(data[data.length-1].year))
     .attr('y', y(data[data.length-1].total))
     .attr("transform", "translate(260,"+(offset-10)+")")
     .transition().duration(1000)
     .transition().text(data[data.length-1].total).duration(400);

}


d3.json("/js/regiones.json", function(error, chile) {
  var projection = d3.geo.mercator().scale(1200).translate([width*2.4 , -350]);
  var path = d3.geo.path().projection(projection);

  g.selectAll(".regiones")
     .data(topojson.feature(chile, chile.objects.regiones).features).enter().append("path")
      .attr("class", "region")
      .attr("id", function(d){return d.properties.id})
      //.attr("data-region", function(d){if(regiones.indexOf(d.properties.NOM_REG) < 0){regiones.push(d.properties.NOM_REG)} return d.properties.NOM_REG})
      .attr("d", path).style("stroke", "black").style("stroke-width", "0.5px").style("fill-opacity", 0.5).style("fill", function(d, i){return color(regiones.indexOf(d.properties.NOM_REG))})
      .append("title").text(function(d){return d.properties.Details});
  d3.selectAll(".region").on("mouseover", function(){
                          d3.select(this).classed("selectedRegion", true);
                          var region = (d3.select(this).attr("id"));
                          var offsetY = d3.event.pageY - 100;
                          d3.csv("/hola/"+region, function(data){
                            //showGraph(region, data);
                            previous = null;
                            timelines = {};
                            data.forEach(function(item, i){
                              if(previous != item.illness){
                                timelines[item.illness] = [];
                                previous = item.illness;
                              }
                              timelines[item.illness].push({year: item.year, total: item.total});
                            });
                            counter = 0;
                            chart1.selectAll("text").remove();
                            chart1.selectAll("path").remove();
                            chart1.selectAll("circle").remove();

                            for (var key in timelines) {
                              if (timelines.hasOwnProperty(key)) {
                                t = timelines[key];
                                var line = d3.svg.line()
                                .x(function(d) { return x(d.year); })
                                .y(function(d) { return y(d.total); });
                                sparkline(chart1,t, line, key, (counter++*25 - 50), offsetY);
                              }
                            }
                          });
                    });

});


function showGraph(region, data){
  chart1.selectAll("rect").remove();
  chart1.selectAll("text").remove();
  chart2.selectAll("rect").remove();
  chart2.selectAll("text").remove();
 // title.text(region);
  //g.selectAll("path").transition().style("fill-opacity", 0.5).duration(colorTransitionTime);
  //d3.select(this).transition().style("fill-opacity", 1).duration(colorTransitionTime);
  max = 50;//d3.max(arr);
  var barWidth = 20, barHeight = 300;
  console.log(data);
  var offset = 180;
  chart1.selectAll("rect").data(data).enter()
      .append("rect").style("fill", "orangered").style("fill-opacity", 0.6).style("stroke", "white")
       .attr("x", offset).attr("y", function(d, i){return i*barWidth})
       .attr("width", 0)
       .attr("height", barWidth)
       .transition()
       .attr("width", function(d){return barHeight*(d.total/max)})
       .duration(1000);
  chart1.selectAll(".chart1-text").data(data).enter()
      .append("text").attr("class", "chart1-text")
      .attr("x", -60)
      .attr("y", function(d, i){return barWidth/2+3+i*barWidth})
      .text(function(d, i){return d.illness})
  chart1.selectAll(".tooltip").data(data).enter()
      .append("text").attr("class", "tooltip")
      .attr("x", function(d){return Math.max(offset+barHeight*(d.total/max) - 5*(d.total.toString().length) -3, 2)})
      .attr("y", function(d, i){return barWidth/2+3+i*barWidth})
      .text(function(d, i){return (d.total>0)?d.total:""});
  return;
  var arr = [];
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
