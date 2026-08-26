# Domain Entities — Backend

## DynamoDB Single-Table Design

### Session Metadata
| Attribute | Type | Description |
|---|---|---|
| PK | String | `SESSION#{sessionCode}` |
| SK | String | `METADATA` |
| sessionCode | String | Session identifier |
| createdAt | String | ISO 8601 timestamp |

### Participant
| Attribute | Type | Description |
|---|---|---|
| PK | String | `SESSION#{sessionCode}` |
| SK | String | `PARTICIPANT#{participantId}` |
| participantId | String | UUID |
| sessionCode | String | Session identifier |
| displayName | String | 1-200 chars |
| photoObjectKey | String | S3 key or empty |
| skills | List | `[{ skillId, skillName, likeCount }]` |
| totalLikes | Number | Sum of all skill likes |
| createdAt | String | ISO 8601 timestamp |

### Vote (Idempotency)
| Attribute | Type | Description |
|---|---|---|
| PK | String | `VOTE#{sessionCode}` |
| SK | String | `{voterId}#{targetParticipantId}#{skillId}` |

## TypeScript Interfaces

```typescript
interface Skill { skillId: string; skillName: string; likeCount: number; }
interface Participant { participantId: string; displayName: string; photoUrl: string; skills: Skill[]; totalLikes: number; createdAt: string; }
interface LeaderEntry { participantId: string; displayName: string; photoUrl: string; totalLikes: number; }
interface SkillEntry { skillId: string; skillName: string; totalLikes: number; }
```

## Skills Catalog
15 fixed skills with IDs '1' through '15'. Defined as constant in `src/constants/skills.ts`. Shared between backend validation and frontend display.
