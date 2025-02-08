
console.log('projects.js loaded');
import { fetchJSON, renderProjects } from '../global.js';
const projects = await fetchJSON('../lib/projects.json');
const projectsContainer = document.querySelector('.projects');
renderProjects(projects, projectsContainer, 'h2');

import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm";
let arcGenerator = d3.arc().innerRadius(0).outerRadius(50);
let arc = arcGenerator({
    startAngle: 0,
    endAngle: 2 * Math.PI,
});
d3.select('svg').append('path').attr('d', arc).attr('fill', 'red');
let data = [
    { value: 1, label: 'apples' },
    { value: 2, label: 'oranges' },
    { value: 3, label: 'mangos' },
    { value: 4, label: 'pears' },
    { value: 5, label: 'limes' },
    { value: 5, label: 'cherries' },
  ];
  
let total=0;
for (let d of data) {
    total +=d;
}
let sliceGenerator = d3.pie().value((d) => d.value);
let arcData = sliceGenerator(data);
let arcs = arcData.map((d) => arcGenerator(d));

let colors = d3.scaleOrdinal(d3.schemeTableau10);
arcs.forEach((arc, idx) => {
    d3.select('svg')
      .append('path')
      .attr('d', arc)
      .attr('fill', colors[idx]) // Fill in the attribute for fill color via indexing the colors variable
})

let legend = d3.select('.legend');
data.forEach((d, idx) => {
    legend.append('li')
          .attr('style', `--color:${colors(idx)}`) // set the style attribute while passing in parameters
          .html(`<span class="swatch"></span> ${d.label} <em>(${d.value})</em>`); // set the inner html of <li>
})