import {xml} from './profile-metrics.mjs';

// The display order is editorial. Unlisted repositories use public GitHub metadata.
const projects = new Map([
  ['agents-brain', {
    title: 'Agent Shadow Brain', subject: ['Shared', 'memory'], color: '#b1dacf', icon: 'memory',
    description: 'Save a decision or a handoff in one coding tool and pick it up in another. The Brain Hub shows recorded exchanges in the workspace.',
    links: [['Watch the Brain Hub recording', 'https://raw.githubusercontent.com/theihtishaam/agents-brain/v7.25.0/docs/assets/7.25.0-agent-traffic.gif']]
  }],
  ['Procure-guard-ai', {
    title: 'ProcureGuard AI', subject: ['Vendor', 'review'], color: '#ffb863', icon: 'award',
    description: 'Eight specialist agents check vendor evidence before human signoff. Team Purrwolf won Best Use of AI/ML API at the 2026 Band of Agents Hackathon.',
    links: [['Watch the demo', 'https://youtu.be/KhKxOJJEYho'], ['Award announcement', 'https://www.linkedin.com/posts/lablab-ai_meet-the-ai-that-can-veto-its-own-approval-activity-7487495363164233728-iQSx']]
  }],
  ['exactwork-skills', {
    title: 'ExactWork Skills', subject: ['Agent', 'workflows'], color: '#c9bfea', icon: 'check',
    description: 'Six portable skills for execution, research, review, handoff, context, and learning. Choose the instructions a project needs.',
    links: [['Explore the six skills', './docs/projects/exactwork-skills.md']]
  }],
  ['GTA-6-Interactive-Map-and-Loot-Tracker', {
    title: 'GTA 6 Loot Map', subject: ['Leonida', 'field atlas'], color: '#ff9b80', icon: 'map',
    description: 'Choose a mission or collectible, plot a route across Leonida, and keep an offline field journal.',
    links: [['See the atlas', 'https://raw.githubusercontent.com/theihtishaam/GTA-6-Interactive-Map-and-Loot-Tracker/v0.1.3/docs/quickstart/reward-map.webp'], ['Player guide', 'https://github.com/theihtishaam/GTA-6-Interactive-Map-and-Loot-Tracker#readme']]
  }],
  ['omni-skills-forge', {
    title: 'Omni Skills Forge', subject: ['Skill', 'library'], color: '#9dccf3', icon: 'catalog',
    description: 'Find relevant guidance in a workspace, switch skills on or off, and combine a few files into one project skill.',
    links: [['Dashboard walkthrough', 'https://github.com/theihtishaam/omni-skills-forge#open-it-in-your-project']]
  }],
  ['CiviTwin', {
    title: 'CivicTwin Δ', subject: ['Tax', 'scenarios'], color: '#f2d382', icon: 'ledger',
    description: 'Change an assumption in a tax scenario, then trace the rules, evidence, and results in this enterprise planning prototype.',
    links: [['Read the case study', './docs/projects/civic-twin.md']]
  }],
  ['theihtishaam', {
    title: 'GitHub Profile', subject: ['Portfolio', 'source'], color: '#b9cfe2', icon: 'portfolio',
    description: 'The artwork, repository index, and public-data tools behind this profile.'
  }]
]);

const rank = new Map([...projects.keys()].map((name, index) => [name, index]));
rank.set('theihtishaam', Infinity);
export const projectOrder = (a, b) =>
  (rank.get(a.name) ?? 100) - (rank.get(b.name) ?? 100) ||
  (b.pushed_at || b.pushedAt || '').localeCompare(a.pushed_at || a.pushedAt || '') ||
  a.name.localeCompare(b.name);

function publicRepoUrl(repo) {
  const url = repo.html_url || repo.url;
  if (!/^[\w.-]+$/.test(repo.name) || !/^https:\/\/github\.com\/[\w-]+\/[\w.-]+\/?$/.test(url || '')) {
    throw Error('Unexpected public repository name or URL');
  }
  return url;
}

const createdTime = repo => Date.parse(repo.created_at ?? repo.createdAt);
export function latestRepositories(repositories, limit = 3) {
  return [...repositories].filter(repo => Number.isFinite(createdTime(repo)))
    .sort((a, b) => createdTime(b) - createdTime(a) || a.name.localeCompare(b.name)).slice(0, limit);
}

// Each project has a small diagram of the workflow the visitor can explore.
const artwork = {
  memory: '<path d="M12 38 60 12l49 26-49 25zM12 56l48 25 49-25M12 74l48 25 49-25"/><path d="M61 65v37l30 16h31" stroke-dasharray="3 5"/><circle cx="125" cy="118" r="4"/>',
  award: '<path d="M12 24h23l24 35h30m-77 34h23l24-34m-47-1h47"/><circle cx="10" cy="24" r="5"/><circle cx="10" cy="58" r="5"/><circle cx="10" cy="93" r="5"/><path d="m100 35 24 10v19c0 12-11 22-24 30-12-8-23-18-23-30V45z"/><path d="m89 60 9 9 15-18"/>',
  check: '<path d="M13 17h94v79H13zM25 35h8m10 0h42m-60 19h8m10 0h35m-53 18h8m10 0h23"/><circle cx="104" cy="92" r="18" fill="#182035"/><path d="m95 92 6 6 12-14"/>',
  map: '<path d="m7 27 35-12 39 15 40-14v80l-40 14-39-15-35 12zM42 18v75m39-62v76" opacity=".65"/><path d="m15 79 25-23 18 9 15-18 24 7 13-17" stroke-width="3"/><circle cx="15" cy="79" r="4"/><circle cx="110" cy="37" r="5"/>',
  catalog: '<path d="m12 40 49-25 49 25-49 25zM12 59l49 25 49-25M12 77l49 25 49-25"/><path d="m44 41 9-5m3 12 11-16m8 7 7 3"/>',
  ledger: '<path d="M18 17v89h112M20 84l26-33 22 18 42-48M20 84l26-14 24 13 41-20"/><circle cx="46" cy="51" r="4"/><circle cx="68" cy="69" r="4"/><circle cx="110" cy="21" r="5"/><path d="M110 25v78" stroke-dasharray="2 6"/>',
  portfolio: '<rect x="9" y="21" width="115" height="80" rx="4"/><path d="M10 40h113M23 31h6m7 0h6m9 21L34 68l17 14m30-30 17 16-17 14m-10-29-12 30"/>',
  source: '<path d="M8 38V25h39l12 11h64v64H8zM8 49h115m-75 9-13 12 13 11m39-23 13 12-13 11"/>'
};

export function projectCard(repo) {
  const info = projects.get(repo.name) ?? {};
  const title = info.title || repo.name;
  const subject = info.subject || (repo.fork ? ['Project', 'fork'] : ['Open', 'source']);
  const color = info.color || '#c6cfe7';
  const glyph = artwork[info.icon] || artwork.source;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="520" height="160" viewBox="0 0 520 160" role="img" aria-labelledby="title desc">
    <title id="title">${xml(title)}</title><desc id="desc">${xml(info.description || repo.description)}</desc>
    <defs><pattern id="grid" width="14" height="14" patternUnits="userSpaceOnUse"><path d="M14 0H0v14" fill="none" stroke="#505a71" opacity=".35"/></pattern></defs>
    <rect width="520" height="160" fill="#182035"/>
    <path d="M324 0h196v160H294z" fill="url(#grid)"/>
    <path d="M25 24h24" stroke="${color}" stroke-width="3"/>
    <g fill="#f8f4ea" font-family="Arial,Helvetica,sans-serif" font-size="38" font-weight="600" letter-spacing="-1.6">
      <text x="24" y="74">${xml(subject[0])}</text><text x="24" y="119" fill="${color}">${xml(subject[1])}</text>
    </g>
    <g transform="translate(347 17)" fill="none" stroke="${color}" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round">${glyph}</g>
  </svg>`;
}

export function latestRepositoryList(repositories) {
  const latest = latestRepositories(repositories);
  if (!latest.length) return 'Repository creation dates are unavailable.';
  const links = latest.map(repo => {
    const info = projects.get(repo.name);
    const date = new Date(createdTime(repo)).toISOString().slice(0, 10);
    return '<a title="' + xml('Created ' + date + ' · ' + (info?.description || repo.description || repo.name)) +
      '" href="' + xml(publicRepoUrl(repo)) + '">' + xml(info?.title || repo.name) + '</a>';
  });
  const alt = latest.map(repo => (projects.get(repo.name)?.title || repo.name) +
    ', created ' + new Date(createdTime(repo)).toISOString().slice(0, 10)).join('. ');
  return '<img src="./assets/recent-projects.svg" width="100%" alt="' + xml(alt) +
    '">\n\n' + links.join(' · ');
}

export function projectsTimeline(repositories) {
  const latest = latestRepositories(repositories);
  const height = 32 + 67 * latest.length;
  const rows = latest.map((repo, index) => {
    const y = 46 + index * 67;
    const title = projects.get(repo.name)?.title || repo.name;
    const shortTitle = title.length > 26 ? title.slice(0, 25) + '…' : title;
    const date = new Date(createdTime(repo)).toISOString().slice(0, 10);
    return '<g><circle cx="23" cy="' + (y - 7) + '" r="7" fill="' + ['#ed754c','#eab348','#5a8db6'][index] +
      '" stroke="#192f43" stroke-width="2"/><text x="44" y="' + y + '" font-size="19">' + date +
      '</text><text x="181" y="' + y + '" font-size="22" font-weight="700">' + xml(shortTitle) + '</text></g>';
  });
  return '<svg xmlns="http://www.w3.org/2000/svg" width="600" height="' + height + '" viewBox="0 0 600 ' + height +
    '" role="img" aria-labelledby="t"><title id="t">Repository creation dates</title>' +
    '<rect width="600" height="' + height + '" fill="#f9ebd0"/><path d="M23 36v' +
    Math.max(0, (latest.length-1)*67) + '" stroke="#23445d" stroke-width="3"/><g fill="#182e43" font-family="Arial,sans-serif">' + rows.join('') + '</g></svg>';
}

export function projectGrid(repositories, date) {
  const cards = [...repositories].sort(projectOrder).map((repo, index) => {
    const url = xml(publicRepoUrl(repo));
    const info = projects.get(repo.name) || {};
    const name = info.title || repo.name;
    const stars = repo.stargazers_count ?? repo.stars;
    const starLabel = Number.isSafeInteger(stars) && stars > 0 ? ' · ★ ' + stars.toLocaleString('en-US') : '';
    const description = info.description || repo.description || 'Browse the files and project history on GitHub.';
    const links = (info.links || []).map(([label, href]) => '<a href="' + xml(href) + '">' + xml(label) + '</a>');
    const detail = [xml(repo.language || ''), ...links].filter(Boolean).join(' · ');
    const unpaired = index === repositories.length - 1 && index % 2 === 0;
    const cell = unpaired ? 'colspan="2"' : 'width="50%"';
    const thumbnail = unpaired ? 'align="left" width="32%" hspace="10"' : 'width="100%"';
    return '<td ' + cell + ' valign="top">\n<a title="' + xml(description) + '" href="' + url + '"><img ' + thumbnail + ' src="./assets/repos/' +
      encodeURIComponent(repo.name) + '.svg" alt="' + xml(name) + '"></a>\n<h3><a href="' + url + '">' +
      xml(name) + '</a>' + starLabel + '</h3>\n<p>' + xml(description) + '</p>' +
      (detail ? '\n<p><sub>' + detail + '</sub></p>' : '') + '\n</td>';
  });
  const rows = [];
  for (let i = 0; i < cards.length; i += 2) {
    rows.push('<tr>\n' + cards.slice(i, i + 2).join('\n') + '\n</tr>');
  }
  const gallery = rows.length ? '<table>\n' + rows.join('\n') + '\n</table>' : 'No public repositories yet.';
  return gallery + '\n\n' + cards.length + ' public repositories · Updated ' + date.slice(0, 10) +
    ' · [Browse on GitHub](https://github.com/theihtishaam?tab=repositories) · [Project directory](./docs/PUBLIC_PROJECTS.md)\n';
}
