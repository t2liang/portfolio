console.log('IT’S ALIVE!');

function $$(selector, context = document) {
  return Array.from(context.querySelectorAll(selector));
}

const navLinks = $$("nav a");

const ARE_WE_HOME = document.documentElement.classList.contains('home');
let pages = [
  { url: '/portfolio/', title: 'Home' },
  { url: '/portfolio/projects/', title: 'Projects' },
  { url: '/portfolio/contact/', title: 'Contact'},
  { url: '/portfolio/resume.html', title: 'resume'},
  { url: '/portfolio/meta/index.html', title: 'Meta'}
  // add the rest of your pages here
];

let nav = document.createElement('nav');
document.body.prepend(nav);

for (let p of pages) {
  let url = p.url;
  let title = p.title;
  if (!ARE_WE_HOME && !url.startsWith('http') && !url.startsWith('/')) {
    url = '../' + url;
  }
  let a = document.createElement('a');
  a.href = url;
  a.textContent = title;
  // Highlight the current page link
  a.classList.toggle('current', a.host === location.host && a.pathname === location.pathname);

  // Open external links in a new tab
  a.toggleAttribute('target', a.host !== location.host);
  nav.append(a);
}

document.body.insertAdjacentHTML(
    'afterbegin',
    `
    <label class="color-scheme">
      Theme:
      <select>
        <option value="light dark">Auto</option>
        <option value="light">Light</option>
        <option value="dark">Dark</option>
      </select>
    </label>`
  );
  
  // Add event listener to the dropdown
const select = document.querySelector('.color-scheme select');
  
if (localStorage.colorScheme) {
    const scheme = localStorage.colorScheme; // Define scheme

    // Apply the saved color scheme
    document.documentElement.style.setProperty('color-scheme', scheme);
    document.documentElement.classList.remove('light-mode', 'dark-mode');

    if (scheme === 'light') {
        document.documentElement.classList.add('light-mode');
    } else if (scheme === 'dark') {
        document.documentElement.classList.add('dark-mode');
    }

    // Update the <select> element to match
    select.value = scheme;
}
  
  // Add an input event listener
select.addEventListener('input', function (event) {
    // Log the selected value (for debugging)
    console.log('Color scheme changed to', event.target.value);
  
    // Set the color-scheme property on the root element
    document.documentElement.style.setProperty('color-scheme', event.target.value);
  
    // Save the user's preference to localStorage
    localStorage.colorScheme = event.target.value;
});

export async function fetchJSON(url) {
    try {
        // Fetch the JSON file from the given URL
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Failed to fetch projects: ${response.statusText}`);
        }
        const data = await response.json();
        return data; 

    } catch (error) {
        console.error('Error fetching or parsing JSON data:', error);
    }
}

export function renderProjects(projects, containerElement, headingLevel = 'h2') {
    // Your code will go here
    containerElement.innerHTML = '';
    const projectsTitle = document.querySelector('.projects-title');

    // Update projects title with the count of projects
    if (projectsTitle) {
        projectsTitle.textContent = `Projects (${projects.length})`;
    }

    // Loop through each project in the array
    projects.forEach(proj => {
    // Create a new <article> element for each project
        const article = document.createElement('article');

    // Populate the <article> with project details
        article.innerHTML = `
        <h3>${proj.title}</h3>
        <img src="${proj.image}" alt="${proj.title}">
        <p>${proj.description}</p>
`;


        // Append the <article> to the container
        containerElement.appendChild(article);
    });
}

export async function fetchGithubData(username) {
    return fetchJSON(`https://api.github.com/users/${username}`);
  
  }