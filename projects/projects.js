import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm';
import { fetchJSON, renderProjects } from '../global.js';

const projects = await fetchJSON('../lib/projects.json');
const projectsContainer = document.querySelector('.projects');

// Step 1.6: show the project count in the page title
const projectsTitle = document.querySelector('.projects-title');
if (projectsTitle) {
  projectsTitle.textContent = `${projects?.length ?? 0} Projects`;
}

// Lab 5: pie chart of projects per year, with search + year filtering
let query = '';
let selectedIndex = -1;
let selectedYear = null; // label of the selected wedge, survives re-renders

let colors = d3.scaleOrdinal(d3.schemeTableau10);
let arcGenerator = d3.arc().innerRadius(0).outerRadius(50);

// Step 4.3: case-insensitive search across all project metadata
function filterByQuery(projectsGiven) {
  return projectsGiven.filter((project) => {
    let values = Object.values(project).join('\n').toLowerCase();
    return values.includes(query.toLowerCase());
  });
}

// Step 5.4: apply both filters (search query AND selected year)
function updateView() {
  let searchedProjects = filterByQuery(projects);

  // The pie shows stats for the searched projects
  renderPieChart(searchedProjects);

  let visibleProjects =
    selectedIndex === -1
      ? searchedProjects
      : searchedProjects.filter((p) => p.year === selectedYear);

  renderProjects(visibleProjects, projectsContainer, 'h2');
}

// Step 4.4: all plotting lives in one function
function renderPieChart(projectsGiven) {
  let rolledData = d3.rollups(
    projectsGiven,
    (v) => v.length,
    (d) => d.year,
  );
  let data = rolledData.map(([year, count]) => {
    return { value: count, label: year };
  });

  let sliceGenerator = d3.pie().value((d) => d.value);
  let arcData = sliceGenerator(data);
  let arcs = arcData.map((d) => arcGenerator(d));

  // Keep the selection if its year is still present, otherwise clear it
  selectedIndex = data.findIndex((d) => d.label === selectedYear);
  if (selectedIndex === -1) selectedYear = null;

  // Clear old paths and legend items
  let svg = d3.select('#projects-pie-plot');
  svg.selectAll('path').remove();
  let legend = d3.select('.legend');
  legend.selectAll('li').remove();

  arcs.forEach((arc, i) => {
    svg
      .append('path')
      .attr('d', arc)
      .attr('fill', colors(i))
      .attr('class', i === selectedIndex ? 'selected' : null)
      .on('click', () => {
        selectedIndex = selectedIndex === i ? -1 : i;
        selectedYear = selectedIndex === -1 ? null : data[i].label;
        updateView();
      });
  });

  data.forEach((d, idx) => {
    legend
      .append('li')
      .attr('style', `--color:${colors(idx)}`)
      .attr('class', idx === selectedIndex ? 'legend-item selected' : 'legend-item')
      .html(`<span class="swatch"></span> ${d.label} <em>(${d.value})</em>`);
  });
}

// Initial render on page load
updateView();

// Step 4.2: search bar (input event for real-time filtering)
let searchInput = document.querySelector('.searchBar');
searchInput.addEventListener('input', (event) => {
  query = event.target.value;
  updateView();
});
