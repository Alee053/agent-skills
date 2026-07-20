#!/usr/bin/env node

import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
const skillsRoot = path.join(root, "skills")
const errors = []

function walk(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    if (entry.name === ".git") return []
    const fullPath = path.join(directory, entry.name)
    return entry.isDirectory() ? walk(fullPath) : [fullPath]
  })
}

function relative(file) {
  return path.relative(root, file)
}

function parseFrontmatter(frontmatter, file) {
  const values = {}

  for (const [index, line] of frontmatter.split("\n").entries()) {
    if (line.trim() === "") continue

    const match = line.match(/^([a-z][a-z0-9_-]*):(?:\s+(.*))?$/)
    if (!match || !match[2]) {
      errors.push(`${relative(file)}:${index + 2}: unsupported or empty frontmatter entry`)
      continue
    }

    const [, key, rawValue] = match
    let value = rawValue.trim()

    if (value.startsWith('"')) {
      try {
        value = JSON.parse(value)
      } catch {
        errors.push(`${relative(file)}:${index + 2}: invalid double-quoted frontmatter value`)
        continue
      }
    } else if (value.startsWith("'")) {
      if (value.length < 2 || !value.endsWith("'")) {
        errors.push(`${relative(file)}:${index + 2}: unterminated single-quoted frontmatter value`)
        continue
      }
      const inner = value.slice(1, -1)
      let valid = true
      for (let position = 0; position < inner.length; position += 1) {
        if (inner[position] !== "'") continue
        if (inner[position + 1] !== "'") {
          valid = false
          break
        }
        position += 1
      }
      if (!valid) {
        errors.push(`${relative(file)}:${index + 2}: invalid single-quoted frontmatter value`)
        continue
      }
      value = inner.replace(/''/g, "'")
    }

    if (Object.hasOwn(values, key)) {
      errors.push(`${relative(file)}:${index + 2}: duplicate frontmatter key '${key}'`)
      continue
    }
    values[key] = value
  }

  return values
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

  const frontmatter = parseFrontmatter(match[1], file)
  const { name, description } = frontmatter

  if (!name) errors.push(`${relative(file)}: missing name`)
  if (!description) errors.push(`${relative(file)}: missing description`)
  if (name !== directory.name) {
    errors.push(`${relative(file)}: name '${name}' must match directory '${directory.name}'`)
  }
  if (name && (name.length > 64 || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(name))) {
    errors.push(`${relative(file)}: invalid skill name '${name}'`)
  }
  if (description && !/\bUse (?:when|after|only|for)\b/.test(description)) {
    errors.push(`${relative(file)}: description must contain an explicit 'Use when/after/only/for' trigger`)
  }
  if (name && skillNames.has(name)) errors.push(`${relative(file)}: duplicate skill name '${name}'`)
  if (name) skillNames.add(name)
}

const markdownFiles = walk(root).filter((file) => file.endsWith(".md"))

for (const file of markdownFiles) {
  const content = fs.readFileSync(file, "utf8")

  for (const match of content.matchAll(/`<suite-root>\/([^`\s]+)`/g)) {
    const target = path.resolve(root, match[1])
    if (!target.startsWith(`${root}${path.sep}`)) {
      errors.push(`${relative(file)}: suite reference escapes repository root`)
      continue
    }
    if (!fs.existsSync(target)) errors.push(`${relative(file)}: missing ${relative(target)}`)
  }

  for (const match of content.matchAll(/(?<!<suite-root>\/)conventions\/([a-z0-9._/-]+\.md)/gi)) {
    const target = path.join(root, "conventions", match[1])
    if (!fs.existsSync(target)) errors.push(`${relative(file)}: missing ${relative(target)}`)
  }

  if (path.basename(file) === "SKILL.md") {
    for (const match of content.matchAll(/references\/([a-z0-9._/-]+\.md)/gi)) {
      const target = path.join(path.dirname(file), "references", match[1])
      if (!fs.existsSync(target)) errors.push(`${relative(file)}: missing ${relative(target)}`)
    }
  }

  for (const match of content.matchAll(/\bload\s+`([a-z0-9-]+)`/gi)) {
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
