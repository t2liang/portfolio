
let data = [];
let xScale, yScale;
let selectedCommits = [];
let filteredCommits = [];

async function loadData() {
  data = await d3.csv('loc.csv', (row) => ({
    ...row,
    line: Number(row.line), // or just +row.line
    depth: Number(row.depth),
    length: Number(row.length),
    date: new Date(row.date + 'T00:00' + row.timezone),
    datetime: new Date(row.datetime),
    
  }));
  displayStats();
}

document.addEventListener('DOMContentLoaded', async () => {
  await loadData();
  updateScatterplot();
  updateTimeDisplay();
});

function processCommits() {
  commits = d3
    .groups(data, (d) => d.commit)
    .map(([commit, lines]) => {
      let first = lines[0];
      let { author, date, time, timezone, datetime } = first;
      let ret = {
        id: commit,
        url: `https://github.com/YOUR_REPO/commit/${commit}`,
        author,
        date,
        time,
        timezone,
        datetime,
        hourFrac: datetime.getHours() + datetime.getMinutes() / 60,
        totalLines: lines.length,
      };

      // Store lines but keep it hidden in console logs
      Object.defineProperty(ret, 'lines', {
        value: lines,
        writable: false,
        enumerable: false,  // Prevent cluttering console logs
        configurable: false
      });

      return ret;
    });
}



function displayStats() {
  // Process commit data
  d3.select('#stats').selectAll('*').remove();
  processCommits();
  // Create the <dl> element
  
  const dl = d3.select('#stats').append('dl').attr('class', 'stats');

  // Add total LOC
  dl.append('dt').html('Total <abbr title="Lines of code">LOC</abbr>');
  dl.append('dd').text(data.length);

  // Add total commits
  dl.append('dt').text('Total commits');
  dl.append('dd').text(filteredCommits.length);

  // Compute additional statistics
  let files = Array.from(new Set(data.map((d) => d.file))).length; // Unique file count
  let maxFileLines = d3.max(d3.rollup(data, (v) => v.length, (d) => d.file).values()); // Largest file in lines
  let avgFileLines = d3.mean(d3.rollup(data, (v) => v.length, (d) => d.file).values()); // Average file length
  let busiestHour = d3.rollup(filteredCommits, (v) => v.length, (d) => Math.floor(d.hourFrac)); // Most active hour
  console.log(data);
  // Add number of files
  dl.append('dt').text('Number of files');
  dl.append('dd').text(files);

  // Add max file length
  dl.append('dt').text('Max file length (lines)');
  dl.append('dd').text(maxFileLines);

  // Add average file length
  dl.append('dt').text('Average file length (lines)');
  dl.append('dd').text(avgFileLines.toFixed(2));

  // Add busiest hour
  let busiestTime = [...busiestHour.entries()].reduce((a, b) => (a[1] > b[1] ? a : b))[0];
  dl.append('dt').text('Busiest hour');
  dl.append('dd').text(`${busiestTime}:00`);
}

function updateScatterplot(filteredCommits) {

  const width = 1000;
  const height = 600;
  const margin = { top: 10, right: 10, bottom: 30, left: 20 };
  const usableArea = {
    top: margin.top,
    right: width - margin.right,
    bottom: height - margin.bottom,
    left: margin.left,
    width: width - margin.left - margin.right,
    height: height - margin.top - margin.bottom,
  };
  d3.select('svg').remove(); 
  const svg = d3
    .select('#chart')
    .append('svg')
    .attr('viewBox', `0 0 ${width} ${height}`)
    .style('overflow', 'visible');
  xScale = d3
    .scaleTime()
    .domain(d3.extent(filteredCommits, (d) => d.datetime))
    .range([0, width])
    .nice();
  yScale = d3.scaleLinear().domain([0, 24]).range([height, 0]);
  // Update scales with new ranges
  xScale.range([usableArea.left, usableArea.right]);
  yScale.range([usableArea.bottom, usableArea.top]);
  
  svg.selectAll('g').remove();
  // Add x-axis
  const xAxis = d3.axisBottom(xScale).ticks(5); // Adjust the number of ticks as needed
  svg.select('.x-axis').remove(); // Remove existing x-axis
  svg
    .append('g')
    .attr('class', 'x-axis')
    .attr('transform', `translate(0, ${usableArea.bottom})`)
    .call(xAxis);

  // Add y-axis
  const yAxis = d3.axisLeft(yScale).ticks(5); // Adjust the number of ticks as needed
  svg.select('.y-axis').remove(); // Remove existing y-axis
  svg
    .append('g')
    .attr('class', 'y-axis')
    .attr('transform', `translate(${usableArea.left}, 0)`)
    .call(yAxis);
  // Add y-axis gridlines
  const yGridlines = d3.axisLeft(yScale).ticks(5).tickSize(-usableArea.width).tickFormat('');
  svg.select('.y-gridlines').remove(); // Remove existing y-gridlines
  svg
    .append('g')
    .attr('class', 'y-gridlines')
    .attr('transform', `translate(${usableArea.left}, 0)`)
    .call(yGridlines);
  const dots = svg.append('g').attr('class', 'dots');
  const [minLines, maxLines] = d3.extent(filteredCommits, (d) => d.totalLines);
  const rScale = d3
  .scaleSqrt() // Change only this line
  .domain([minLines, maxLines])
  .range([2, 30]);
  
  dots.selectAll('circle').remove();
  dots
    .selectAll('circle')
    .data(filteredCommits)
    .join('circle')
    .attr('cx', (d) => xScale(d.datetime))
    .attr('cy', (d) => yScale(d.hourFrac))
    .attr('r', 5)
    .attr('fill', 'steelblue')
    .attr('r', (d) => rScale(d.totalLines))
    .style('fill-opacity', 0.7) // Add transparency for overlapping dots
    .on('mouseenter', (event, commit) => {
      d3.select(event.currentTarget).classed('selected', isCommitSelected(commit));
      updateTooltipContent(commit);
      updateTooltipVisibility(true);
      updateTooltipPosition(event);
    })
    .on('mouseleave', () => {
      d3.select(event.currentTarget).classed('selected', false);
      updateTooltipContent({});
      updateTooltipVisibility(false);
      
    });
  }

function updateTooltipContent(commit) {
  const link = document.getElementById('commit-link');
  const date = document.getElementById('commit-date');

  if (Object.keys(commit).length === 0) return;

  link.href = commit.url;
  link.textContent = commit.id;
  date.textContent = commit.datetime?.toLocaleString('en', {
    dateStyle: 'full',
  });
}

function updateTooltipVisibility(isVisible) {
  const tooltip = document.getElementById('commit-tooltip');
  tooltip.hidden = !isVisible;
}
function updateTooltipPosition(event) {
  const tooltip = document.getElementById('commit-tooltip');
  tooltip.style.left = `${event.clientX}px`;
  tooltip.style.top = `${event.clientY}px`;
}

function brushSelector() {
  const svg = document.querySelector('svg');
  d3.select(svg).call(d3.brush().on('start brush end', brushed));
  d3.select(svg).selectAll('.dots, .overlay ~ *').raise();
}

let brushSelection = null;

function brushed(evt) {
  let brushSelection = evt.selection;
  selectedCommits = !brushSelection
    ? []
    : filteredCommits.filter((commit) => {
        let min = { x: brushSelection[0][0], y: brushSelection[0][1] };
        let max = { x: brushSelection[1][0], y: brushSelection[1][1] };
        let x = xScale(commit.date);
        let y = yScale(commit.hourFrac);

        return x >= min.x && x <= max.x && y >= min.y && y <= max.y;
      });
}

function isCommitSelected(commit) {
  return selectedCommits.includes(commit);
}

function updateSelection() {
  // Update visual state of dots based on selection
  d3.selectAll('circle').classed('selected', (d) => isCommitSelected(d));
}

function updateSelectionCount() {
  const selectedCommits = brushSelection
    ? commits.filter(isCommitSelected)
    : [];

  const countElement = document.getElementById('selection-count');
  countElement.textContent = `${
    selectedCommits.length || 'No'
  } commits selected`;
  
  return selectedCommits;
}

function displayCommitFiles() {
  const lines = filteredCommits.flatMap((d) => d.lines);
  let fileTypeColors = d3.scaleOrdinal(d3.schemeTableau10);
  let files = d3.groups(lines, (d) => d.file).map(([name, lines]) => {
    return { name, lines };
  });
  files = d3.sort(files, (d) => -d.lines.length);
  d3.select('.files').selectAll('div').remove();
  let filesContainer = d3.select('.files').selectAll('div').data(files).enter().append('div');
  filesContainer.append('dt').html(d => `<code>${d.name}</code><small>${d.lines.length} lines</small>`);
  filesContainer.append('dd')
                .selectAll('div')
                .data(d => d.lines)
                .enter()
                .append('div')
                .attr('class', 'line')
                .style('background', d => fileTypeColors(d.type));
}


function updateLanguageBreakdown() {
  const selectedCommits = brushSelection
    ? commits.filter(isCommitSelected)
    : [];
  const container = document.getElementById('language-breakdown');

  if (selectedCommits.length === 0) {
    container.innerHTML = '';
    return;
  }
  const requiredCommits = selectedCommits.length ? selectedCommits : commits;
  const lines = requiredCommits.flatMap((d) => d.lines);

  // Use d3.rollup to count lines per language
  const breakdown = d3.rollup(
    lines,
    (v) => v.length,
    (d) => d.type
  );

  // Update DOM with breakdown
  container.innerHTML = '';

  for (const [language, count] of breakdown) {
    const proportion = count / lines.length;
    const formatted = d3.format('.1~%')(proportion);

    container.innerHTML += `
            <dt>${language}</dt>
            <dd>${count} lines (${formatted})</dd>
        `;
  }

  return breakdown;
}


// Initial commit progress
let commitProgress = 100;
const timeSlider = document.getElementById('commit-slider');
const selectedTime = document.getElementById('selectedTime');

function filterCommitsByTime(commitMaxTime) {
  filteredCommits = commits.filter(commit => commit.datetime < commitMaxTime);
}

function updateTimeDisplay() {
  processCommits();
  commitProgress = Number(timeSlider.value);
  if (!data || data.length === 0) {
    console.error("Data is not loaded yet.");
    return;
  }
  let timeScale = d3.scaleTime([d3.min(commits, d => d.datetime), d3.max(commits, d => d.datetime)], [0, 100]);
  let commitMaxTime = timeScale.invert(commitProgress);

  selectedTime.textContent = timeScale.invert(commitProgress).toLocaleString();
  filterCommitsByTime(commitMaxTime); // filters by time and assign to some top-level variable.
  console.log(filteredCommits

  );
  if (filteredCommits.length > 0) {
    updateScatterplot(filteredCommits);
  }
  displayStats();

  let lines = filteredCommits.flatMap((d) => d.lines);
  let files = [];
  let fileTypeColors = d3.scaleOrdinal(d3.schemeTableau10);
  files = d3
    .groups(lines, (d) => d.file)
    .map(([name, lines]) => {
      return { name, lines };
    });
  files = d3.sort(files, (d) => -d.lines.length);
  console.log(files);
  // Clear existing content
  d3.select('.files').selectAll('div').remove();

  // Bind data and create file details
  let filesContainer = d3
    .select('.files')
    .selectAll('div')
    .data(files)
    .enter()
    .append('div');

  // Add file name (<dt>)
  filesContainer
    .append('dt')
    .html((d) => `<code>${d.name}</code><small>${d.lines.length} lines</small>`);

  // Add line count (<dd>)
  filesContainer
    .append('dd')
    .selectAll('div')
    .data(d => d.lines)
    .enter()
    .append('div')
    .attr('class','line')
    .style('background', (d) => fileTypeColors(d.type));
  
  
}
updateTimeDisplay();
timeSlider.addEventListener('input', updateTimeDisplay);


let NUM_ITEMS = 80; // Ideally, let this value be the length of your commit history
let ITEM_HEIGHT = 100; // Feel free to change
let VISIBLE_COUNT = 20; // Feel free to change as well
let totalHeight = (NUM_ITEMS - 1) * ITEM_HEIGHT;
const scrollContainer = d3.select('#scroll-container');
const spacer = d3.select('#spacer');
spacer.style('height', `${totalHeight}px`);
const itemsContainer = d3.select('#items-container');
scrollContainer.on('scroll', () => {
  const scrollTop = scrollContainer.property('scrollTop');
  let startIndex = Math.floor(scrollTop / ITEM_HEIGHT);
  startIndex = Math.max(0, Math.min(startIndex, commits.length - VISIBLE_COUNT));
  renderItems(startIndex);
});

function renderItems(startIndex) {
  // Clear things off
  itemsContainer.selectAll('div').remove();
  const endIndex = Math.min(startIndex + VISIBLE_COUNT, commits.length);
  let newCommitSlice = commits.slice(startIndex, endIndex);
  commits.sort((a, b) => a.datetime - b.datetime); 

  // Update the scatterplot
  updateScatterplot(newCommitSlice);

  // Re-bind the commit data to the container and represent each using a div
  itemsContainer
    .selectAll('div')
    .data(newCommitSlice)
    .enter()
    .append('div')
    .html((commit, index) => {
      // Create a dummy narrative for each commit
      return `
        <p>
          On ${commit.datetime.toLocaleString('en', { dateStyle: 'full', timeStyle: 'short' })}, I made
          <a href="${commit.url}" target="_blank">
            ${index > 0 ? 'another glorious commit' : 'my first commit, and it was glorious'}
          </a>. I edited ${commit.totalLines} lines across ${d3.rollups(commit.lines, (D) => D.length, (d) => d.file).length} files. Then I looked over all I had made, and I saw that it was very good.
        </p>
      `;
    })
   
    .style('top', (_, idx) => `${(startIndex + idx) * ITEM_HEIGHT}px`); // Fix: Calculate top based on startIndex
}

let NUM_FILES = commits.length; // Use the length of the commit history
let FILE_ITEM_HEIGHT = 100; // Height of each item
let VISIBLE_FILE_COUNT = 10; // Number of visible items
let totalFileHeight = (NUM_FILES - 1) * FILE_ITEM_HEIGHT;

const filesScrollContainer = d3.select('#files-scroll-container');
const filesSpacer = d3.select('#files-spacer');
filesSpacer.style('height', `${totalFileHeight}px`);

const filesItemsContainer = d3.select('#files-items-container');

filesScrollContainer.on('scroll', () => {
  const scrollTop = filesScrollContainer.property('scrollTop');
  let startIndex = Math.floor(scrollTop / FILE_ITEM_HEIGHT);
  startIndex = Math.max(0, Math.min(startIndex, commits.length - VISIBLE_FILE_COUNT));
  renderFileItems(startIndex);
});

// Render file items in the scrolly section
function renderFileItems(startIndex) {
  // Clear existing items
  filesItemsContainer.selectAll('div').remove();

  const endIndex = Math.min(startIndex + VISIBLE_FILE_COUNT, commits.length);
  let newFileSlice = commits.slice(startIndex, endIndex);

  // Update the file sizes visualization
  displayC(newFileSlice);

  // Re-bind the file data to the container
  filesItemsContainer.selectAll('div')
    .data(newFileSlice)
    .enter()
    .append('div')
    .html((file, index) => {
      return `
        <p>
          File: <strong>${file.name}</strong><br>
          Lines edited: ${file.lines.length}<br>
          Total changes: ${file.lines.reduce((acc, line) => acc + line.changes, 0)}
        </p>
      `;
    })
    .style('top', (_, idx) => `${(startIndex + idx) * FILE_ITEM_HEIGHT}px`);
}

