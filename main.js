var toolTip = d3.tip()
    .attr("class", "d3-tip")
    .offset([-12, 0])
    .html(function(d) {
        return "<h5>"+d.id+"</h5>"
    });

var drag = d3.drag()
    .on('start', dragstarted)
    .on('drag', dragged)
    .on('end', dragended);
    
var svg = d3.select('svg');
svg.call(toolTip);
var width = +svg.attr('width');
var height = +svg.attr('height');

var colorScale = d3.scaleOrdinal(d3.schemeTableau10);
var linkScale = d3.scaleSqrt().range([1,5]);




d3.json('les_miserables.json').then(function(dataset) {
    console.log(dataset);
    network = dataset;
    linkScale.domain(d3.extent(network.links, function(d){ return d.value;}));

    var simulation = d3.forceSimulation()
        .force('link', d3.forceLink().id(function(d) { return d.id; }))
        .force('charge', d3.forceManyBody())
        .force('center', d3.forceCenter(width / 2, height / 2));
    
    simulation.nodes(dataset.nodes)
        .on('tick', tickSimulation);
    
    simulation.force('link')
        .links(dataset.links);


    var linkG = svg.append('g')
        .attr('class', 'links-group');

    var nodeG = svg.append('g')
        .attr('class', 'nodes-group');


    var linkEnter = linkG.selectAll('.link')
        .data(network.links)
        .enter()
        .append('line')
        .attr('class', 'link')
        .attr('stroke-width', function(d) {
            return linkScale(d.value);
        });

    var nodeEnter = nodeG.selectAll('.node')
        .data(network.nodes)
        .enter()
        .append('circle')
        .attr('class', 'node')
        .attr('r', 6)
        .style('fill', function(d) {
            return colorScale(d.group);
        });
    nodeEnter.call(drag);

    nodeEnter.on('mouseover', toolTip.show)
    .on('mouseout', toolTip.hide);

    function tickSimulation() {
        linkEnter
            .attr('x1', function(d) { return d.source.x;})
            .attr('y1', function(d) { return d.source.y;})
            .attr('x2', function(d) { return d.target.x;})
            .attr('y2', function(d) { return d.target.y;});
    
        nodeEnter
            .attr('cx', function(d) { return d.x;})
            .attr('cy', function(d) { return d.y;});
    }
    

});


function dragstarted(d) {
    if (!d3.event.active) simulation.alphaTarget(1).restart();
    d.fx = d.x;
    d.fy = d.y;
}

function dragged(d) {
    d.fx = d3.event.x;
    d.fy = d3.event.y;
}

function dragended(d) {
    if (!d3.event.active) simulation.alphaTarget(0);
    d.fx = null;
    d.fy = null;
}
