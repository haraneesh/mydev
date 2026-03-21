# AI-Driven Development Lifecycle (AIDLC) Documentation

This directory contains all documentation artifacts for the AI-driven development lifecycle process.

## 📁 Directory Structure

### `/plans/`
Work plans that must be approved before execution. Each plan outlines:
- Objectives
- Tasks breakdown
- Implementation approach
- Testing strategy
- Success criteria

**Workflow**: Plan → Approval → Execution

### `/story-artifacts/`
User stories following standard format:
- As a [role]
- I want [feature]
- So that [benefit]
- Acceptance criteria
- Definition of done

### `/design-artifacts/`
Architecture and design documents including:
- System architecture diagrams
- API design specifications
- Database schemas
- Integration patterns
- Technical decision records (TDRs)

### `/prompts.md`
Sequential log of all prompts and AI interactions, maintaining:
- Chronological order
- Request context
- Outcomes and deliverables
- Cross-references to artifacts

## 🔄 AIDLC Workflow

1. **Request** → User requests work
2. **Plan** → AI creates plan in `/plans/` folder
3. **Review** → User reviews and approves plan
4. **Execute** → AI implements approved plan
5. **Document** → All prompts logged to `prompts.md`
6. **Artifact** → Deliverables stored in appropriate folders

## 📝 Related Documentation

- **Requirements & Specs**: `../specs-docs/specs.md`
- **Original Specs**: `../specs-docs/specs_swe1.md`

## 🎯 Purpose

Enable structured, traceable, and collaborative AI-assisted development with clear approval gates and comprehensive documentation.
