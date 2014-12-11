(function(){
  var graphsDiabetes = d3.select("#tddiabetes").append("svg").style("height", "100px").style("width", "100%");
  var graphsHipertension = d3.select("#tdhipertension").append("svg").style("height", "150px").style("width", "100%");
  function color(i){
  c = ["#000", "#d7191c", "orangered", "gold", "#abdda4", "#2b83ba" ];
  return c[i];
  };
  function drawBars(url, id, title, offset, graphs){
    var maxBarWidth = 200,
        myOffset = 0,
        maxRatio = 100;
    d3.json(url+id, function(dataComuna){
      dataComuna.data.forEach(function(item){
        var val1 = parseFloat(item.val1),
            val2 = parseFloat(item.val2),
            val3 = parseFloat(item.val3);
        graphs.append("text").attr("x", 10)
        .attr("y", 15+myOffset+offset)
        .text(title+" "+item.year);
        graphs.append("rect").attr("x", 100)
        .attr("y", 0+myOffset+offset)
        .attr("height", 20)
        .attr("width", 0)
        .attr("class", "bar")
        .style("fill", color(item.val3))
        .transition()
        .attr("width", function(d){ return (val3 == 0)?0:maxBarWidth*(val1/val2)})
        .duration(800);
        graphs.append("text").attr("x", function(d){
          return (val3 == 0)?100:100+maxBarWidth*(val1/val2);
        })
        .attr("y", 15+myOffset+offset)
        .style("opacity", 0)
        .transition()
        .text(function(){
            return (item.val3 == 0)?"No data":parseInt(100*val1/val2)+"%";
        })
        .style("opacity", 1)
        .duration(1000);
       
        myOffset += 50;
      });
      myOffset -= 50;
  })
  }
  d3.json("/js/comunas.json", function(error, chile) {
    d3.select("#waiting").style("display", "none");
    
    d3.select("#comparar").attr("disabled", null).on("click", function(d){
      graphsDiabetes.selectAll("rect").remove();
      graphsDiabetes.selectAll("text").remove();
      graphsDiabetes.selectAll("line").remove();
      graphsHipertension.selectAll("rect").remove();
      graphsHipertension.selectAll("text").remove();
      graphsHipertension.selectAll("line").remove();

      var sel =  document.getElementById('comuna1');
      var val = sel.options[sel.selectedIndex].value;
      var name = sel.options[sel.selectedIndex].innerHTML;
      drawBars("/getDiabetesComuna/", val, name, 0, graphsDiabetes);
      drawBars("/getHipertensionComuna/", val, name,  44, graphsHipertension);
      sel =  document.getElementById('comuna2');
      val = sel.options[sel.selectedIndex].value;
      name = sel.options[sel.selectedIndex].innerHTML;
      drawBars("/getDiabetesComuna/", val, name, 22, graphsDiabetes);
      drawBars("/getHipertensionComuna/", val, name,  22, graphsHipertension);
    });
    
    d3.selectAll(".comuna").selectAll("option")
      .data(topojson.feature(chile, chile.objects.comunas).features.sort(function(a, b) { return d3.ascending(a.id, b.id)}))
      .enter()
      .append("option")
        .attr("class", "comuna")
        .attr("value", function(d){return d.properties.COD_COMUNA})
        .html(function(d){return d.properties.NOM_COM});
  })
})();
