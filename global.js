console.log('IT’S ALIVE!');

function $$(selector, context = document) {
  return Array.from(context.querySelectorAll(selector));
}

const navLinks = $$("nav a");

const ARE_WE_HOME = document.documentElement.classList.contains('home');
let pages = [
  { url: '/', title: 'Home' },
  { url: '/projects/', title: 'Projects' },
  { url: '/contact/', title: 'Contact'},
  { url: '/resume', title: 'resume'}
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
  
// Check if a color scheme preference is saved in localStorage
if ('colorScheme' in localStorage) {
    // Apply the saved color scheme
    document.documentElement.style.setProperty('color-scheme', localStorage.colorScheme);
  
    // Update the <select> element to match
    select.value = localStorage.colorScheme;
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
