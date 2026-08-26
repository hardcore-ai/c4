# Frontend Components — Frontend

## Component Hierarchy
```
layout.tsx (RootLayout)
├── page.tsx (HomePage)
│   └── JoinForm
│       └── SkillChip (selection mode, no like button)
└── wall/page.tsx (WallPage)
    ├── ParticipantCard[]
    │   └── SkillChip[] (with like button)
    └── Leaderboard
```

## Components

### JoinForm (`components/join-form.tsx`)
- **Props**: `{ onJoined: () => void }`
- **State**: displayName, selectedSkills (Set), photo (File), preview (URL), loading, error
- **data-testid**: `join-form-display-name`, `join-form-photo-button`, `skill-chip-{id}`, `join-form-error`, `join-form-submit`
- **API calls**: `getUploadUrl()`, `uploadToS3()`, `joinSession()`

### ParticipantCard (`components/participant-card.tsx`)
- **Props**: `{ participant: Participant, onLike: (targetId, skillId) => void, isSelf: boolean }`
- **data-testid**: `participant-card-{participantId}`
- Self card highlighted with blue border/background

### SkillChip (`components/skill-chip.tsx`)
- **Props**: `{ skillId, skillName, likeCount, onLike, disabled }`
- Shows skill name + like count + heart button
- Disabled when `isSelf` (no self-voting)

### Leaderboard (`components/leaderboard.tsx`)
- **Props**: `{ topParticipants: LeaderEntry[], topSkills: SkillEntry[] }`
- Two columns: Top Participantes (ranked list), Top Skills (ranked list)
- Empty state: "Sin datos aún"

## Page-Level data-testid
- `tab-wall`, `tab-leaderboard` — tab toggle buttons
- `sort-new`, `sort-top` — sort toggle buttons
