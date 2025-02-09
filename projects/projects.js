
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
    let newData = newRolledData.map(([year, count]) => ({ year, count }));
  
    // Define slice generator and arc data (you should set the pie chart parameters here)
    let newSliceGenerator = d3.pie().value(d => d.count);
    let newArcData = newSliceGenerator(newData);
  
    // Create arc elements (paths) for each slice
    let arcs = d3.select('svg').selectAll('path').data(newArcData);
    
    arcs.enter()
      .append('path')
      .attr('d', d3.arc().innerRadius(0).outerRadius(50))
      .attr('fill', (d, i) => colors(i));  // Use your color scale
  }
function renderLegend(filteredProjects) {
  // Clear existing legend items
  d3.select('.legend').selectAll('li').remove();

  // Render new legend items
  filteredProjects.forEach((project, idx) => {
    let values = Object.values(project).join(' ').toLowerCase();
    let color = colors(idx);  // Get color for each project
    d3.select('.legend')
      .append('li')
      .attr('class', 'legend-item')
      .html(`<span class="swatch" style="background-color:${color};"></span> ${project.label} <em>(${project.value})</em>`);
  });
}
  
let query = '';
let searchInput = document.querySelector('.searchBar');
searchInput.addEventListener('change', (event) => {
  // update query value
  query = event.target.value;
  // filter projects
  let filteredProjects = projects.filter((project) => {
    let values = Object.values(project).join('\n').toLowerCase();
    return values.includes(query.toLowerCase());
  });
  // render filtered projects
  renderProjects(filteredProjects, projectsContainer, 'h2');
  renderPieChart(filteredProjects);  // Re-render pie chart
  renderLegend(filteredProjects);
});