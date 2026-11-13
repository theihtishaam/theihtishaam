<div align="center">

<img src="./assets/hero-lab.svg" width="100%" alt="Ihtisham Ahmad — C#, Python, TypeScript; Agent Brain, ProcureGuard, and ExactWork">

[**All repositories**](#public-repositories) · [**Featured work**](#featured-work) · [**Languages & tools**](#languages--tools) · [**Websites**](#websites) · [**Connect**](#find-me-online)

</div>

I’m **Ihtisham Ahmad**. I build business applications with **C# and .NET**, web interfaces with **Angular and React**, and automation with **Python**. My open-source projects help coding agents use shared context, follow a practical working method, and produce results people can check.

<img src="./assets/face-scan.svg" width="100%" alt="Ihtisham Ahmad, with my current GitHub photo and technology labels">

<sub>My photo refreshes automatically from GitHub. The scanner is a decorative animation.</sub>

## Public repositories

Start with **Agent Shadow Brain**, **ProcureGuard AI**, or **ExactWork Skills**—my featured projects. Every public repository on this account appears below. New repositories join the grid after the next successful daily refresh.

<!-- AUTO_PUBLIC_PROJECTS_START -->
**5 public repositories · refreshed 2026-11-13**

<table>
<tr>
<td width="50%" valign="top"><a href="https://github.com/theihtishaam/agents-brain"><img src="./assets/repos/agents-brain.svg" width="100%" alt="Agent Shadow Brain: Shared local knowledge, scoped context, PDF imports, and a visual workspace for coding agents."></a><br><a href="https://github.com/theihtishaam/agents-brain"><b>agents-brain</b> ↗</a></td>
<td width="50%" valign="top"><a href="https://github.com/theihtishaam/Procure-guard-ai"><img src="./assets/repos/Procure-guard-ai.svg" width="100%" alt="ProcureGuard AI: Eight specialist agents, evidence, adversarial review, and human approval for vendor decisions."></a><br><a href="https://github.com/theihtishaam/Procure-guard-ai"><b>Procure-guard-ai</b> ↗</a></td>
</tr>
<tr>
<td width="50%" valign="top"><a href="https://github.com/theihtishaam/exactwork-skills"><img src="./assets/repos/exactwork-skills.svg" width="100%" alt="ExactWork Skills: Six portable Agent Skills for focused work, research, review, handoff, context, and learning."></a><br><a href="https://github.com/theihtishaam/exactwork-skills"><b>exactwork-skills</b> ↗</a></td>
<td width="50%" valign="top"><a href="https://github.com/theihtishaam/CiviTwin"><img src="./assets/repos/CiviTwin.svg" width="100%" alt="CivicTwin Δ: Compare tax and regulatory scenarios with typed rules, recorded evidence, and explicit assumptions."></a><br><a href="https://github.com/theihtishaam/CiviTwin"><b>CiviTwin</b> ↗</a></td>
</tr>
<tr>
<td width="50%" valign="top"><a href="https://github.com/theihtishaam/theihtishaam"><img src="./assets/repos/theihtishaam.svg" width="100%" alt="GitHub Profile: My public projects, languages, websites, and links. Repository cards and avatar refresh automatically."></a><br><a href="https://github.com/theihtishaam/theihtishaam"><b>theihtishaam</b> ↗</a></td>
<td width="50%"></td>
</tr>
</table>

[Browse on GitHub](https://github.com/theihtishaam?tab=repositories) · [Project directory](./docs/PUBLIC_PROJECTS.md)
<!-- AUTO_PUBLIC_PROJECTS_END -->

## Featured work

### Agent Shadow Brain · shared context for coding agents

<a href="https://github.com/theihtishaam/agents-brain"><img src="./assets/agent-brain-feature.svg" width="100%" alt="Agent Shadow Brain workflow: add knowledge, assemble context, collaborate, and review outcomes"></a>

Bring project knowledge into one local workspace. Import text or PDFs, review memories, assemble task context, and inspect stored relationships and recorded tool activity in a graphical portal. Workspace skills stay with their project.

**Useful for:** carrying relevant project context between coding tools through supported MCP integrations. Model identity and token usage appear only when the connected tool supplies them.

[**Open Agent Shadow Brain →**](https://github.com/theihtishaam/agents-brain#readme) · [Visual guide](https://github.com/theihtishaam/agents-brain/blob/main/docs/VISUAL_GUIDE_v7.1.4.md) · [npm package](https://www.npmjs.com/package/@theihtisham/agent-shadow-brain) · [Features and limits](https://github.com/theihtishaam/agents-brain/blob/main/docs/FEATURES_AND_LIMITS.md)

![Agent Shadow Brain running with real document relationships and recorded local MCP calls](./assets/agent-brain-runtime.gif)

<sub>Recorded in the working portal with 74 imported sections from the project's public documentation and actual local MCP calls. This is an isolated documentation workspace.</sub>

### ProcureGuard AI · hackathon category winner

<a href="https://github.com/theihtishaam/Procure-guard-ai"><img src="./assets/award.svg" width="100%" alt="ProcureGuard AI — Best Use of AI/ML API, 2026 Band of Agents Hackathon, Team Purrwolf"></a>

**Best Use of AI/ML API · 2026 Band of Agents Hackathon · Team Purrwolf.** ProcureGuard brings eight specialist agents into a vendor approval workspace. They share cited findings, challenge risky assumptions, and prepare an audit packet for human approval.

**Useful for:** making a procurement decision easier to inspect—from the first request to the evidence and final human signoff.

[**Open ProcureGuard AI →**](https://github.com/theihtishaam/Procure-guard-ai) · [Demo video](https://youtu.be/KhKxOJJEYho) · [Case study](./docs/projects/procureguard-ai.md) · [Organizer announcement](https://www.linkedin.com/posts/lablab-ai_meet-the-ai-that-can-veto-its-own-approval-activity-7487495363164233728-iQSx)

<img src="./assets/flow-procureguard-ai.svg" width="100%" alt="ProcureGuard workflow from specialist findings through red-team review to human approval">

### ExactWork Skills · a practical method for agent work

<a href="https://github.com/theihtishaam/exactwork-skills"><img src="./assets/exactwork-feature.svg" width="100%" alt="ExactWork Skills: understand the request, plan, build, verify, and retain useful lessons"></a>

Six Markdown Agent Skills cover **core work, research, review, handoff, context, and learning**. Install them in one project to give compatible coding agents a consistent working method. Optional helpers use Python 3.10+.

**Useful for:** keeping work scoped, research traceable, reviews concrete, and handoffs clear.

[**Open ExactWork Skills →**](https://github.com/theihtishaam/exactwork-skills#readme) · [How the skills fit together](./docs/projects/exactwork-skills.md)

### How Shadow Brain and ExactWork fit together

Shadow Brain provides the project memory and context workspace. ExactWork describes the method an agent can follow. They work independently; installing one does not automatically install or connect the other.

```mermaid
flowchart LR
    A[Your request] --> B[ExactWork: scope and plan]
    B --> C[Coding agent]
    D[Shadow Brain: project context] --> C
    C --> E[Change and evidence]
    E --> F[Review and verification]
    F --> G[Reviewed project lesson]
```

### CivicTwin Δ · tax and regulatory scenarios

An enterprise tax and regulatory scenario planning prototype that connects typed rules, evidence, and assumptions. Explore how different inputs affect a scenario and inspect the reasoning recorded with it.

[**Open CivicTwin →**](https://github.com/theihtishaam/CiviTwin) · [Illustrated case study](./docs/projects/civic-twin.md)

## Languages & tools

<img src="./assets/toolkit.svg" width="100%" alt="C#, .NET, WPF, Angular, React; Python, Flask, Pandas and SQL; TypeScript, Node.js and MCP">

**Applications:** C# · .NET Core · ASP.NET MVC · WPF · REST APIs<br>
**Interfaces:** Angular · React · JavaScript · HTML · CSS<br>
**Data & automation:** Python · Flask · Pandas · NumPy · SQL Server · MySQL · PostgreSQL<br>
**Agent tooling:** TypeScript · Node.js · MCP · Git · GitHub Actions<br>
**Platforms:** Azure · AWS · IIS

## Websites

| [Ababil Technology](https://ababiltechnology.com/) | [Job Opportunity](https://jobopportunity.info/) | [DealVorio](https://dealvorio.com/) |
|:--:|:--:|:--:|
| [<img src="./assets/site-ababil.svg" width="260" alt="Ababil Technology website">](https://ababiltechnology.com/) | [<img src="./assets/site-jobs.svg" width="260" alt="Job Opportunity website">](https://jobopportunity.info/) | [<img src="./assets/site-dealvorio.svg" width="260" alt="DealVorio website">](https://dealvorio.com/) |
| Business technology and digital services | Jobs, scholarships, and fellowships | Deals, coupons, and learning offers |

## Find me online

| [<img src="./assets/link-linkedin.svg" width="260" alt="LinkedIn: ihtishamdeveloper">](https://www.linkedin.com/in/ihtishamdeveloper/) | [<img src="./assets/link-x.svg" width="260" alt="X: theihtishaam">](https://x.com/theihtishaam) | [<img src="./assets/link-instagram.svg" width="260" alt="Instagram: theihtishaam">](https://www.instagram.com/theihtishaam) |
|:--:|:--:|:--:|
| [LinkedIn](https://www.linkedin.com/in/ihtishamdeveloper/) | [X / Twitter](https://x.com/theihtishaam) | [Instagram](https://www.instagram.com/theihtishaam) |

[**Email me**](mailto:Theihtisham@outlook.com) · [GitHub](https://github.com/theihtishaam) · [npm package](https://www.npmjs.com/package/@theihtisham/agent-shadow-brain) · [Ababil Technology](https://ababiltechnology.com/)

## Open-source activity

<a href="./data/github-stats.json"><img src="./assets/statistics.svg" width="100%" alt="Public GitHub repository, star, follower and language counts with their refresh date"></a>

<a href="./data/npm-metrics.json"><img src="./assets/npm-milestone.svg" width="100%" alt="Cumulative Agent Shadow Brain npm downloads with the reporting date"></a>

<sub>Counts refresh daily from public sources. npm downloads are package download events, not unique users. [Sources and dates](./data/npm-metrics.json) · [Refresh workflow](./.github/workflows/profile.yml).</sub>

---

**Have something useful to build?** [Find me on LinkedIn](https://www.linkedin.com/in/ihtishamdeveloper/) or [send an email](mailto:Theihtisham@outlook.com).
