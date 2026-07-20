#!/usr/bin/env node

import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
const skillsRoot = path.join(root, "skills")
const errors = []

function walk(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(directory, entry.name)
    return entry.isDirectory() ? walk(fullPath) : [fullPath]
  })
}

function relative(file) {
  return path.relative(root, file)
}

function frontmatterValue(frontmatter, key) {
  const match = frontmatter.match(new RegExp(`^${key}:\\s*(.+?)\\s*$`, "m"))
  return match?.[1].replace(/^(["'])(.*)\1$/, "$2")
}

const skillNames = new Set()
const skillDirectories = fs
  .readdirSync(skillsRoot, { withFileTypes: true })
  .filter((entry) => entry.isDirectory())

for (const directory of skillDirectories) {
  const file = path.join(skillsRoot, directory.name, "SKILL.md")

  if (!fs.existsSync(file)) {
    errors.push(`${relative(file)}: missing SKILL.md`)
    continue
  }

  const content = fs.readFileSync(file, "utf8")
  const match = content.match(/^---\n([\s\S]*?)\n---\n/)

  if (!match) {
    errors.push(`${relative(file)}: missing YAML frontmatter`)
    continue
  }

  const name = frontmatterValue(match[1], "name")
  const description = frontmatterValue(match[1], "description")

  if (!name) errors.push(`${relative(file)}: missing name`)
  if (!description) errors.push(`${relative(file)}: missing description`)
  if (name !== directory.name) {
    errors.push(`${relative(file)}: name '${name}' must match directory '${directory.name}'`)
  }
  if (name && (name.length > 64 || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(name))) {
    errors.push(`${relative(file)}: invalid skill name '${name}'`)
  }
  if (description && !/\bUse\b/.test(description)) {
    errors.push(`${relative(file)}: description must state when to use the skill`)
  }
  if (name && skillNames.has(name)) errors.push(`${relative(file)}: duplicate skill name '${name}'`)
  if (name) skillNames.add(name)
}

const markdownFiles = walk(root).filter(
  (file) => file.endsWith(".md") && !file.includes(`${path.sep}.git${path.sep}`),
)

for (const file of markdownFiles) {
  const content = fs.readFileSync(file, "utf8")

  for (const match of content.matchAll(/(?:<suite-root>\/)?conventions\/([a-z0-9./-]+\.md)/g)) {
    const target = path.join(root, "conventions", match[1])
    if (!fs.existsSync(target)) errors.push(`${relative(file)}: missing ${relative(target)}`)
  }

  if (path.basename(file) === "SKILL.md") {
    for (const match of content.matchAll(/`references\/([a-z0-9./-]+\.md)`/g)) {
      const target = path.join(path.dirname(file), "references", match[1])
      if (!fs.existsSync(target)) errors.push(`${relative(file)}: missing ${relative(target)}`)
    }
  }

  for (const match of content.matchAll(/Load `([a-z0-9-]+)`/g)) {
    if (!skillNames.has(match[1])) errors.push(`${relative(file)}: unknown skill '${match[1]}'`)
  }

  if (content.includes("Status: contract scaffold")) {
    errors.push(`${relative(file)}: unfinished contract scaffold`)
  }
}

if (errors.length > 0) {
  console.error(errors.map((error) => `- ${error}`).join("\n"))
  process.exit(1)
}

console.log(`Validated ${skillNames.size} skills and ${markdownFiles.length} Markdown files.`)
