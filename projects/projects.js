
console.log('projects.js loaded');
import { fetchJSON, renderProjects } from '../global.js';
const projects = await fetchJSON('../lib/projects.json');
const projectsContainer = document.querySelector('.projects');
renderProjects(projects, projectsContainer, 'h2');
import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm";

let data = [1,2,3,4,5,5];
let sliceGenerator = d3.pie();
let arcData = sliceGenerator(data);

let arcs = arcData.map((d) => arcGenerator(d));
let colors =  d3.scaleOrdinal(d3.schemeTableau10);
arcs.forEach((arc, idx) => {
    d3.select('svg')
      .append('path')
      .attr('d', arc)
      .attr(colors[idx]) // Fill in the attribute for fill color via indexing the colors variable
})