# Move the three AI projects to the official GitHub account

The new profile is **theihtishaam**. The source account is **ihtishaam-dev**.

The GitHub connector can publish files into existing repositories, but cannot create new repositories or migrate Git branches by itself. For each project, create an **empty public repository** under the new account without initializing it with a README. Then use Git to copy all branches and tags.

| Source | Destination |
|---|---|
| ihtishaam-dev/agent-shadow-brain | theihtishaam/agent-shadow-brain |
| ihtishaam-dev/Civic-Twins | theihtishaam/Civic-Twins |
| ihtishaam-dev/procureguard-ai-band-agents | theihtishaam/procureguard-ai-band-agents |

## Windows PowerShell

Prerequisites: Git and GitHub CLI (`gh`), authenticated with write access to **theihtishaam**.

```powershell
gh auth status
gh auth setup-git

$repos = @("agent-shadow-brain", "Civic-Twins", "procureguard-ai-band-agents")
foreach ($name in $repos) {
  # This fails rather than overwriting an existing destination.
  gh repo create "theihtishaam/$name" --public
  if ($LASTEXITCODE -ne 0) { throw "Repository creation failed: $name" }

  git clone --bare "https://github.com/ihtishaam-dev/$name.git" "$name.git"
  if ($LASTEXITCODE -ne 0) { throw "Clone failed: $name" }
  Push-Location "$name.git"
  git push "https://github.com/theihtishaam/$name.git" --all
  if ($LASTEXITCODE -ne 0) { throw "Branch push failed: $name" }
  git push "https://github.com/theihtishaam/$name.git" --tags
  if ($LASTEXITCODE -ne 0) { throw "Tag push failed: $name" }
  Pop-Location
}
```

Check **all three destination repositories**, branches, and tags after copying. For repositories using Git LFS, transfer LFS objects separately. Git pushes do not transfer issues, PRs, releases/release assets, branch protection, secrets, stars, or fork relationships. Do not delete the originals until all dependent links, releases and deployment configurations have been checked.

After migration, update the three project URLs in `README.md`; the daily project feed will automatically discover the destination repositories.
