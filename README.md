# plugins

Steven's agent plugins: small, focused plugins that install in Cursor, Claude Code and Codex from one link, `https://github.com/stevmolina/plugins`. Every skill is a plain `SKILL.md`, so any agent that reads skills (Grok Bot included) can load them too.

## Plugins

| Plugin | What it does |
|---|---|
| [`steven-core`](plugins/steven-core) | Shared rules the others load: approval before anything is published, sent or paid, and Steven's writing voice |
| [`showup`](plugins/showup) | Capture real work, draft posts in Steven's voice, publish approved posts, review what worked. Needs `steven-core` |

## Install

The marketplace is called `stevmolina-plugins`.

### Claude Code

```bash
claude plugin marketplace add stevmolina/plugins
claude plugin install showup@stevmolina-plugins
```

Inside a session the same commands work as `/plugin marketplace add stevmolina/plugins` and `/plugin install showup@stevmolina-plugins`. Installing `showup` installs `steven-core` with it.

### Codex

```bash
codex plugin marketplace add stevmolina/plugins --ref main
codex plugin add steven-core@stevmolina-plugins
codex plugin add showup@stevmolina-plugins
```

Codex does not install dependencies, so add `steven-core` yourself. Restart the Codex app afterwards. To get updates, run `codex plugin marketplace upgrade stevmolina-plugins`.

### Cursor

Cursor has no command to add a marketplace from a link on personal plans, so pick one:

- **In the app:** open Customize, go to Plugins, click Add Marketplace, choose Import from GitHub and paste `https://github.com/stevmolina/plugins`. Then install the plugins you want.
- **Teams plan:** an admin imports the same link in Dashboard, Plugins & MCPs, Team Marketplaces, Import from Repo.
- **Local, any plan:** clone and link the plugin folders, then run Developer: Reload Window.

  ```bash
  git clone https://github.com/stevmolina/plugins ~/src/stevmolina-plugins
  mkdir -p ~/.cursor/plugins/local
  ln -s ~/src/stevmolina-plugins/plugins/steven-core ~/.cursor/plugins/local/steven-core
  ln -s ~/src/stevmolina-plugins/plugins/showup ~/.cursor/plugins/local/showup
  ```

  `git pull` in the clone updates them.

### Grok Bot and other agents

Point the agent at a skill folder, for example `plugins/showup/skills/showup-draft`, and it loads the `SKILL.md` inside.

## Share one plugin

Send the folder link, for example `https://github.com/stevmolina/plugins/tree/main/plugins/showup`. Each plugin folder is self-contained: its manifests, skills and references. If it needs `steven-core`, its README says so.

## Layout

```text
.claude-plugin/marketplace.json     Claude Code marketplace
.cursor-plugin/marketplace.json     Cursor marketplace
.agents/plugins/marketplace.json    Codex marketplace
plugins/<name>/
  plugin.json                       Agent Plugins standard, also read by Codex and Cursor
  .claude-plugin/plugin.json        Claude Code manifest
  .cursor-plugin/plugin.json        Cursor manifest
  skills/<skill>/SKILL.md           one job per skill: when to use it, then the steps
  references/                       longer material the skills link to
scripts/validate.mjs                checks that the manifests and skills agree
```

## Add a plugin

1. Copy `plugins/steven-core` to `plugins/<name>` and change the three manifests (same `name`, `version` and `description` in all three).
2. Write one short skill per job. Load `steven-approval` or `steven-voice` instead of repeating them.
3. Add an entry to each of the three marketplace files.
4. Run `node scripts/validate.mjs` and `claude plugin validate .`.

Keep it public-safe: no tokens, private URLs, server details or client names.
