# Ethical Use of AI — MzansiBuilds

## Overview

This document outlines how Artificial Intelligence tools were used
ethically and consciously during the development of MzansiBuilds.

## AI Tools Used

- **Claude (Anthropic)** — Used as a development companion throughout the project

## How AI Was Used Ethically

### 1. AI as a Companion, Not a Replacement

Claude was used as a coding companion to assist with:

- Suggesting code structure and architecture
- Debugging errors and explaining solutions
- Generating boilerplate code that was then reviewed and modified
- Explaining concepts like Row Level Security and JWT authentication

At no point was AI used to blindly copy-paste code without understanding it.
Every piece of code was reviewed, understood, and adapted to fit the specific
needs of MzansiBuilds.

### 2. Evidence of Own Thinking

The following decisions were made independently by the developer:

- **UI Design Choice** — The decision to use a dark theme with green accents
  was a personal design decision inspired by the MzansiBuilds mockup provided
- **Database Schema Design** — The relationship between profiles, projects,
  milestones, comments, collaborations and likes was planned and understood
  before implementation

- **Security Decisions** — The choice to use Row Level Security on every table
  was a conscious security decision, not just an AI suggestion

- **Tech Stack Selection** — React + Supabase was chosen based on understanding
  of the project requirements (realtime feed, auth, storage)

- **Problem Solving** — When errors occurred (e.g. database trigger errors,
  CI/CD Node.js version mismatch), the developer read and understood the error
  messages before applying fixes

### 3. Transparency

All AI interactions were used transparently as part of the development workflow.
The use of AI is acknowledged openly in this documentation as required by the
Derivco Code Skills Challenge guidelines.

### 4. Learning, Not Copying

Each AI suggestion was used as a learning opportunity:

- Understanding WHY a piece of code works, not just THAT it works
- Asking follow-up questions to understand concepts
- Modifying AI suggestions to better fit the project context

### 5. Data Privacy Consciousness

- No sensitive user data was shared with AI tools during development
- Only code snippets and error messages were shared for debugging
- Database credentials and API keys were never shared with AI tools

## AI Usage by Competency

| Competency              | AI Involvement                       | Own Contribution                              |
| ----------------------- | ------------------------------------ | --------------------------------------------- |
| Project Profiling       | Helped format UML diagram            | Architecture decisions, requirements analysis |
| Code Version Control    | Suggested commit message conventions | All git commands executed by developer        |
| Test-Driven Development | Suggested test structure             | Test cases designed by developer              |
| Secure By Design        | Explained RLS concepts               | Security decisions and implementation         |
| Documentation           | Helped format markdown               | Content and technical decisions               |
| Ethical Use of AI       | N/A                                  | This document written with own reflection     |

## Conclusion

AI was used as a powerful tool to accelerate development while maintaining
full understanding and ownership of the codebase. I as a developer, I remained in
control of all architectural, design, and security decisions throughout the
project.

Skhumbuzo Mkize, 2026.
