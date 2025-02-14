console.log("main.js is successfully loaded!");
let data = [];

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
  console.log(commits);
}

document.addEventListener('DOMContentLoaded', async () => {
  await loadData();
});

function processCommits() {
  commits = d3
    .groups(data, (d) => d.commit)
    .map(([commit, lines]) => {
      let first = lines[0];
      let { author, date, time, timezone, datetime } = first;
      let ret = {
        id: commit,
        url: 'https://github.com/vis-society/lab-7/commit/' + commit,
        author,
        date,
        time,
        timezone,
        datetime,
        hourFrac: datetime.getHours() + datetime.getMinutes() / 60,
        totalLines: lines.length,
      };

      Object.defineProperty(ret, 'lines', {
        value: lines,
        enumerable: false, // Hides the property when logging the object
        writable: false, // Prevents modification
        configurable: false, // Prevents deletion or redefinition
      });

      return ret;
    });
}
async function loadData() {
  // original function as before
  processCommits();
  console.log(commits);
}

function displayStats() {
  // Process commit data
  processCommits();

  // Create the <dl> element
  const dl = d3.select('#stats').append('dl').attr('class', 'stats');

  // Add total LOC
  dl.append('dt').html('Total <abbr title="Lines of code">LOC</abbr>');
  dl.append('dd').text(data.length);

  // Add total commits
  dl.append('dt').text('Total commits');
  dl.append('dd').text(commits.length);

  // Compute additional statistics
  let files = Array.from(new Set(data.map((d) => d.file))).length; // Unique file count
  let maxFileLines = d3.max(d3.rollup(data, (v) => v.length, (d) => d.file).values()); // Largest file in lines
  let avgFileLines = d3.mean(d3.rollup(data, (v) => v.length, (d) => d.file).values()); // Average file length
  let maxLineLength = d3.max(data, (d) => d.line.length); // Longest line in characters
  let busiestHour = d3.rollup(commits, (v) => v.length, (d) => Math.floor(d.hourFrac)); // Most active hour

  // Add number of files
  dl.append('dt').text('Number of files');
  dl.append('dd').text(files);

  // Add max file length
  dl.append('dt').text('Max file length (lines)');
  dl.append('dd').text(maxFileLines);

  // Add average file length
  dl.append('dt').text('Average file length (lines)');
  dl.append('dd').text(avgFileLines.toFixed(2));

  // Add longest line length
  dl.append('dt').text('Longest line (characters)');
  dl.append('dd').text(maxLineLength);

  // Add busiest hour
  let busiestTime = [...busiestHour.entries()].reduce((a, b) => (a[1] > b[1] ? a : b))[0];
  dl.append('dt').text('Busiest hour');
  dl.append('dd').text(`${busiestTime}:00`);
}
