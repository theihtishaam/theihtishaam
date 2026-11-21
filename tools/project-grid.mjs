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

const artwork = {
  memory: '<g fill="#f7f0d8"><path d="M25 63C5 36 33 3 57 13c10-18 36-14 43 2 31-7 52 20 43 42 18 25-1 48-27 47-6 18-30 24-45 13-19 12-43 2-45-15C8 95 7 73 25 63Z"/><path d="M72 16v96m-28-80 15 14-9 21 14 21m39-55-14 16 16 19-12 21" fill="none"/></g><g fill="#f08049"><circle cx="44" cy="32" r="6"/><circle cx="50" cy="67" r="6"/><circle cx="104" cy="33" r="6"/><circle cx="104" cy="68" r="6"/></g>',
  award: '<path d="M34 22H8v13q0 31 38 34m70-47h25v14q0 29-36 33" fill="none"/><path d="M32 13h88l-7 43q-5 26-32 33v15h22v12H46v-12h22V89Q42 82 38 57Z" fill="#fff1b1"/><path d="m76 26 7 13 15 3-11 11 2 15-13-7-14 7 2-15-10-11 15-3Z" fill="#ea693b"/>',
  check: '<g fill="#fff4d9"><path d="m23 23 81-16 23 86-81 17z"/><path d="M33 21h88v90H33z"/><path d="M43 18h60l21 20v78H43Z"/><path d="M103 18v20h21M56 60h45M56 73h29" fill="none"/></g><circle cx="111" cy="94" r="26" fill="#9fbf9d"/><path d="m97 93 10 10 19-23" fill="none"/>',
  map: '<path d="m6 36 42-15 47 17 45-16v79l-45 16-47-17-42 15z" fill="#fff0ce"/><path d="m48 23 1 75m46-59v74" fill="none"/><path d="M18 85c15-21 39 1 57-20s45-16 58-23" stroke="#587ec0" fill="none"/><path d="M82 6c-16 0-25 12-23 26 2 14 22 36 23 36s22-24 23-37C107 17 97 6 82 6Z" fill="#ec6437"/><circle cx="82" cy="28" r="7" fill="#fff0ce"/>',
  catalog: '<g fill="#f8edcd"><path d="m12 37 33-9 13 8 65-12 14 66-98 20z"/><path d="m20 28 32-4 12 9 61-6 9 68-98 9z"/><path d="M23 31h39l8 9h66v62H23z" fill="#ed7746"/></g><path d="M30 47h97l-7 61H23z" fill="#fff0c8"/><path d="m64 65-11 12 11 9m24-21 11 10-11 10m-9-22-7 25" fill="none"/>',
  ledger: '<path d="m16 22 46-9 12 7 46-8 11 87-48 11-12-7-45 10z" fill="#fcf0ce"/><path d="m67 22 9 75M31 41l23-5m-20 16 23-4m26-10 21-4" fill="none"/><g fill="#70a1a2"><path d="M85 76v-13h10v13zm15 0V52h10v24zm15 0V40h10v36z"/></g>',
  portfolio: '<rect x="10" y="18" width="127" height="84" rx="5" fill="#fff1cd"/><path d="M10 36h127M27 62l-9 8 9 8m13-16 9 8-9 8" fill="none"/><rect x="72" y="50" width="46" height="35" fill="#7ca4c5"/><path d="M61 102v13m28-13v13m-42 1h55"/><circle cx="22" cy="27" r="1"/>',
  source: '<path d="M12 34V22h43l13 12h65v72H12z" fill="#fff0cf"/><path d="M17 43h122l-11 63H12Z" fill="#9fb4c7"/><path d="m60 57-14 13 14 12m32-25 14 13-14 12m-10-26-9 29" fill="none"/>'
};

export function projectCard(repo) {
  const info = projects.get(repo.name) ?? {};
  const title = info.title || repo.name;
  const subject = info.subject || (repo.fork ? ['Project', 'fork'] : ['Open', 'source']);
  const color = info.color || '#ddd8c9';
  const glyph = artwork[info.icon] || artwork.source;
  const lines = subject.map((line, i) =>
    '<text x="29" y="' + (77 + i * 54) + '">' + xml(line) + '</text>').join('');
  return '<svg xmlns="http://www.w3.org/2000/svg" width="520" height="169" viewBox="0 0 520 169" role="img" aria-labelledby="title desc">' +
    '<title id="title">' + xml(title) + '</title><desc id="desc">' + xml(info.description || repo.description) + '</desc>' +
    '<defs><pattern id="dots" width="7" height="7" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r="1.2" fill="#152337" opacity=".23"/></pattern></defs>' +
    '<rect width="520" height="169" fill="' + color + '"/><path d="M339 0h181v169H303z" fill="url(#dots)"/>' +
    '<g fill="#122337" font-family="Arial, sans-serif" font-size="50" letter-spacing="-2" font-weight="800">' + lines + '</g>' +
    '<g transform="translate(331 22)" stroke="#192b3b" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round">' + glyph + '</g></svg>';
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
    return '<td ' + cell + ' valign="top">\n<a href="' + url + '"><img ' + thumbnail + ' src="./assets/repos/' +
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
