
console.log('projects.js loaded');
import { fetchJSON, renderProjects } from '../global.js';
const projects = await fetchJSON('../lib/projects.json');
const projectsContainer = document.querySelector('.projects');
renderProjects(projects, projectsContainer, 'h2');
import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm";

let arcGenerator = d3.arc().innerRadius(0).outerRadius(50);

let rolledData = d3.rollups(
    projects,
    (v) => v.length,
    (d) => d.year,
);

let data = rolledData.map(([year, count]) => {
    return { value: count, label: year };
});

let sliceGenerator = d3.pie().value((d) => d.value);
let arcData = sliceGenerator(data);
let arcs = arcData.map((d) => arcGenerator(d));

let colors =  d3.scaleOrdinal(d3.schemeTableau10);
arcs.forEach((arc, idx) => {
    d3.select('svg')
      .append('path')
      .attr('d', arc)
      .attr('fill', colors(idx)) // Fill in the attribute for fill color via indexing the colors variable
})

let legend = d3.select('.legend');
data.forEach((d, idx) => {
    let item = legend.append('li')
        .attr('class', 'legend-item');

    item.append('span') // Create swatch
        .attr('class', 'swatch')
        .style('background-color', colors(idx)) // Apply color directly
        .style('border', '2px solid black'); // Ensure border is visible

    item.append('span') // Add text label next to swatch
        .html(`${d.label} <em>(${d.value})</em>`);
});

function renderPieChart(projectsGiven) {
    // Recalculate data based on filtered projects
    let newRolledData = d3.rollups(projectsGiven, (v) => v.length, (d) => d.year);
    let newData = rolledData.map(([year, count]) => {
        return { value: count, label: year };
    });
    // Define slice generator and arc data (you should set the pie chart parameters here)
    let newSliceGenerator = d3.pie().value(d => d.count);
    let newArcData = newSliceGenerator(newData);
  
    let newSVG = d3.select('svg');
    newSVG.selectAll('path').remove(); // Remove existing pie chart paths

    // Set up the arcs (pie chart slices)
    let arc = d3.arc()
        .outerRadius(150) // Adjust as needed
        .innerRadius(0);
    newSVG.selectAll('path')
        .data(newArcData)
        .enter()
        .append('path')
        .attr('d', arc)
        .attr('fill', (d, idx) => d3.schemeCategory10[idx % 10]) // Adjust colors as needed
        .attr('transform', 'translate(200, 200)');
        let legend = d3.select('.legend');
        legend.selectAll('*').remove(); // Clear the existing legend
      
        newData.forEach((d, idx) => {
          let legendItem = legend.append('li').attr('class', 'legend-item');
      
          legendItem.append('span')
            .attr('class', 'swatch')
            .style('background-color', d3.schemeCategory10[idx % 10]);
      
          legendItem.append('span')
            .text(`${d.year}: ${d.count}`);
        });
    }
  
let query = '';
let searchInput = document.querySelector('.searchBar');
renderPieChart(projects);

searchInput.addEventListener('change', (event) => {
  let filteredProjects = setQuery(event.target.value);
  // re-render legends and pie chart when event triggers
  renderProjects(filteredProjects, projectsContainer, 'h2');
  renderPieChart(filteredProjects);
});