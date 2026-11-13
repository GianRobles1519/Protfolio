console.log('IT’S ALIVE!');

function $$(selector, context = document) {
  return Array.from(context.querySelectorAll(selector));
}

// Step 2: automatic current page link (replaced by Step 3)
// let navLinks = $$('nav a');
// let currentLink = navLinks.find(
//   (a) => a.host === location.host && a.pathname === location.pathname,
// );
// currentLink?.classList.add('current');

// Step 3: automatic navigation menu
let pages = [
  { url: '', title: 'Home' },
  { url: 'contact/', title: 'Contact Information' },
  { url: 'projects/', title: 'Projects' },
  { url: 'meta/', title: 'Meta' },
  { url: 'https://github.com/GianRobles1519', title: 'GitHub' },
  { url: 'resume-cv/', title: 'CV/Resume' },
];

const BASE_PATH =
  location.hostname === 'localhost' || location.hostname === '127.0.0.1'
    ? '/' // Local server
    : '/Protfolio/'; // GitHub Pages repo name

let nav = document.createElement('nav');
document.body.prepend(nav);

for (let p of pages) {
  let url = p.url;
  let title = p.title;

  url = !url.startsWith('http') ? BASE_PATH + url : url;

  let a = document.createElement('a');
  a.href = url;
  a.textContent = title;

  a.classList.toggle(
    'current',
    a.host === location.host && a.pathname === location.pathname,
  );

  if (a.host !== location.host) {
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
  }

  nav.append(a);
}

// Step 4: dark mode switch
document.body.insertAdjacentHTML(
  'afterbegin',
  `
	<label class="color-scheme">
		Theme:
		<select>
			<option value="light dark">Automatic</option>
			<option value="light">Light</option>
			<option value="dark">Dark</option>
		</select>
	</label>`,
);

let select = document.querySelector('.color-scheme select');

function setColorScheme(colorScheme) {
  document.documentElement.style.setProperty('color-scheme', colorScheme);
  select.value = colorScheme;
}

if ('colorScheme' in localStorage) {
  setColorScheme(localStorage.colorScheme);
}

select.addEventListener('input', function (event) {
  console.log('color scheme changed to', event.target.value);
  setColorScheme(event.target.value);
  localStorage.colorScheme = event.target.value;
});

// Step 5: better contact form
let form = document.querySelector('form');

form?.addEventListener('submit', function (event) {
  event.preventDefault();

  let data = new FormData(form);
  let params = [];

  for (let [name, value] of data) {
    params.push(`${name}=${encodeURIComponent(value)}`);
  }

  let url = form.action + '?' + params.join('&');
  location.href = url;
});

// Lab 4, Step 1.2: fetch and parse JSON data
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

// Lab 4, Step 1.4: render a list of projects into a container
export function renderProjects(projects, containerElement, headingLevel = 'h2') {
  if (!(containerElement instanceof Element)) {
    console.error('renderProjects: invalid container element', containerElement);
    return;
  }

  // Only allow real heading tags (h1–h6)
  if (!/^h[1-6]$/.test(headingLevel)) {
    console.warn(`renderProjects: invalid heading level "${headingLevel}", using h2`);
    headingLevel = 'h2';
  }

  containerElement.innerHTML = '';

  if (!Array.isArray(projects) || projects.length === 0) {
    containerElement.innerHTML = '<p>No projects to display yet.</p>';
    return;
  }

  for (let project of projects) {
    const article = document.createElement('article');
    const title = project.title ?? 'Untitled project';
    const titleHTML = project.url
      ? `<a href="${project.url}" target="_blank" rel="noopener">${title}</a>`
      : title;
    // Local images are listed relative to the site root (e.g. "images/x.png"),
    // so prefix BASE_PATH to make them work from any page.
    let image = project.image ?? 'https://vis-society.github.io/labs/2/images/empty.svg';
    if (!/^(https?:)?\/\//.test(image) && !image.startsWith('/')) {
      image = BASE_PATH + image;
    }
    article.innerHTML = `
      <${headingLevel}>${titleHTML}</${headingLevel}>
      <img src="${image}" alt="${project.title ?? ''}">
      <div>
        <p>${project.description ?? ''}</p>
        <p class="project-year">c. ${project.year ?? ''}</p>
      </div>
    `;
    containerElement.appendChild(article);
  }
}

// Lab 4, Step 3.2: fetch public profile data from the GitHub API
export async function fetchGitHubData(username) {
  return fetchJSON(`https://api.github.com/users/${username}`);
}
