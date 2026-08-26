# Domain Entities — Frontend

## TypeScript Interfaces (synced with backend)

```typescript
interface Skill { skillId: string; skillName: string; likeCount: number; }
interface Participant { participantId: string; displayName: string; photoUrl: string; skills: Skill[]; totalLikes: number; createdAt: string; }
interface LeaderEntry { participantId: string; displayName: string; photoUrl: string; totalLikes: number; }
interface SkillEntry { skillId: string; skillName: string; totalLikes: number; }
```

## Skills Catalog
15 skills with `{ id: string, name: string }`. IDs '1'-'15'. Defined in `src/constants/skills.ts`, identical to backend catalog.

## localStorage Schema
| Key | Value | Set When |
|---|---|---|
| `skillwall_participantId` | UUID string | After successful join |
| `skillwall_sessionCode` | Session code string | After successful join |
