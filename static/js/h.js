(function(){
  var timer = null;
  var width = (window.innerWidth||document.documentElement.clientWidth||document.body.clientWidth||800),
  height = 1200,
  colorTransitionTime = 400;
  var proportionMap = 0.3,
  proportionDetails = 0.3;
  var svg = d3.select("#viz").append("svg")
  .attr("width", width*0.4)
  .attr("height", height);

  var details = d3.select("#details").append("svg")
  .attr("width", width*0.4)
  .attr("height", height)
  .attr("id", "details");
  var title = details.append("text").attr("x", 10).attr("y", 50).attr("class", "title");
  var graphs = details.append("g");
  var g = svg.append("g");

  function zoomed() {
    g.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
    g.select(".region").style("stroke-width", 1.5 / d3.event.scale + "px");
//  features.select(".county-border").style("stroke-width", .5 / d3.event.scale + "px");
}

var zoom = d3.behavior.zoom()
.translate([0, 0])
.scale(1)
.scaleExtent([1, 80])
.on("zoom", zoomed);

svg.call(zoom);

var color = function(i){
  c = ["#000", "#d7191c", "orangered", "gold", "#abdda4", "#2b83ba" ];
  return c[i];
};

var regiones = [];
var colorComunas = {}
var maxRatio = 0;

data.forEach(function(item){
  if(item.val1h/item.val2h > maxRatio){ maxRatio = item.val1h/item.val2h}
    colorComunas[parseInt(item.codigo)] = {val1h: item.val1h, val2h: item.val2h, cls: parseInt(item.classh)};
});
d3.json("/js/comunas.json", function(error, chile) {
  d3.select("#waiting").style("display", "none");
  var projection = d3.geo.mercator().scale(width).translate([width*1.3 , -400]);
  var path = d3.geo.path().projection(projection);

  g.selectAll(".comunas")
  .data(topojson.feature(chile, chile.objects.comunas).features).enter().append("path")
  .attr("class", "comuna").style("opacity", 0.5)
  .attr("id", function(d){return d.properties.COD_COMUNA})
  .attr("data-name", function(d){return d.properties.NOM_COM})
  .attr("data-region", function(d){if(regiones.indexOf(d.properties.NOM_REG) < 0){regiones.push(d.properties.NOM_REG)} return d.properties.NOM_REG})
  .attr("d", path)
  .style("fill", function(d, i){
    var c = parseInt(d.properties.COD_COMUNA);
    if(colorComunas[c] == undefined){
      return "#000";
    }
    return color(colorComunas[d.properties.COD_COMUNA].cls)
  })
  .on("mouseover", function(d){
    var self = this;
    clearTimeout(timer)
    timer = setTimeout(function(){
      var id = d3.select(self).attr("id");
      d3.select(self).style("opacity", 1).style("stroke", "#000");
      var maxBarWidth = (width*proportionDetails +200);
      title.text(d3.select(self).attr("data-name"));
      var myOffset = 0;
      d3.json("/getHipertensionComuna/"+id, function(dataComuna){
        dataComuna.data.forEach(function(item){
          graphs.append("text").attr("x", 10)
          .attr("y", 95+myOffset)
          .text(item.year);
          graphs.append("rect").attr("x", 100)
          .attr("y", 80+myOffset)
          .attr("height", 20)
          .attr("width", 0)
          .attr("class", "bar")
          .style("fill", color(colorComunas[id].cls))
          .transition()
          .attr("width", function(d){ return (item.val3 == 0)?0:maxBarWidth*(parseFloat(item.val1)/parseFloat(item.val2))/maxRatio})
          .duration(800);
          graphs.append("text").attr("x", function(d){
            return (item.val3 == 0)?100:100+maxBarWidth*(parseFloat(item.val1)/parseFloat(item.val2))/maxRatio;
          })
          .attr("y", 95+myOffset)
          .style("opacity", 0)
          .transition()
          .text(function(){
            return (item.val3 == 0)?"No data":parseInt(100*item.val1/item.val2)+"%";
          })
          .style("opacity", 1)
          .duration(1000);

          myOffset += 50;
        });
myOffset -= 50;
graphs.append("line").attr("x1", 100+maxBarWidth/maxRatio)
.attr("y1", 70)
.attr("x2", 100+maxBarWidth/maxRatio)
.attr("y2", 70+myOffset)
.style("stroke", "#ccc")
.transition()
.attr("y2", 110+myOffset)
.duration(1000)
;
graphs.append("text").attr("x", 85+maxBarWidth/maxRatio)
.attr("y", 130+myOffset)
.style("fill", "grey")
.style("opacity", 0)
.transition()
.text("100%")
.style("opacity", 1)
.duration(1000);

});
}, 200)
  })
.on("mouseout", function(d){
  d3.select(this).style("opacity", 0.5);
  title.text("");
  graphs.selectAll("rect").remove();
  graphs.selectAll("text").remove();
  graphs.selectAll("line").remove();

})

.append("title").text(function(d){return d.properties.Details});


//});

})
})();