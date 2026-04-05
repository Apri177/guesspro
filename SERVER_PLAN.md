# GuessPro 서버 아키텍처 구상안

---

## 1. 전체 구조

```
┌───────────────────────────────────────────────────────────────┐
│                        클라이언트 (Next.js)                    │
│  page.tsx / components (React 19, App Router)                 │
└──────────────────────────┬────────────────────────────────────┘
                           │ fetch / Server Actions
┌──────────────────────────▼────────────────────────────────────┐
│                  Next.js API Layer                             │
│  src/app/api/  (Route Handlers)                               │
│  ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌────────────┐ │
│  │ /auth/*    │ │ /quiz/*    │ │ /upload/*  │ │ /stats/*   │ │
│  └────────────┘ └────────────┘ └────────────┘ └────────────┘ │
└──────┬─────────────────┬─────────────────┬────────────────────┘
       │                 │                 │
┌──────▼──────┐  ┌───────▼───────┐  ┌──────▼──────┐
│   Auth      │  │   Database    │  │  Storage    │
│  (NextAuth) │  │ (PostgreSQL)  │  │ (S3 호환)   │
└─────────────┘  └───────────────┘  └─────────────┘
```

**요약**: Next.js의 Route Handler를 API 서버로 사용하고, 별도 백엔드 없이 모놀리식으로 구성한다.
프론트엔드와 API가 한 프로젝트에 있으므로 배포가 단순하고, 초기 단계에서 관리 포인트가 적다.

---

## 2. 인증 (Authentication)

### 기술: NextAuth.js (Auth.js v5)

```
src/app/api/auth/[...nextauth]/route.ts   ← NextAuth 핸들러
src/lib/auth.ts                            ← 설정 파일
```

### Provider
| Provider | 용도 |
|----------|------|
| Google OAuth | 일반 사용자 |
| Discord OAuth | 게이머 타겟 |
| Credentials | 이메일/비밀번호 (선택) |

### 세션 전략
- **JWT 기반** — DB 세션 테이블 불필요, Stateless
- 토큰에 `userId`, `nickname` 포함
- 미들웨어(`middleware.ts`)에서 보호 라우트 체크:
  - `/quiz/create` → 로그인 필수
  - `/quiz/[id]` → 비로그인도 접근 가능 (기록만 저장 안 됨)

---

## 3. 데이터베이스

### 기술: PostgreSQL + Prisma ORM

Prisma를 사용하면 타입 안전한 DB 쿼리를 Next.js와 자연스럽게 통합할 수 있다.

### 스키마

```prisma
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String
  image     String?
  createdAt DateTime @default(now())

  quizzes   Quiz[]
  attempts  Attempt[]
}

model Quiz {
  id          String   @id @default(cuid())
  title       String
  description String?
  game        String                          // "리그 오브 레전드", "발로란트" 등
  defaultMode String   @default("objective")  // "objective" | "subjective"
  timer       Int      @default(0)            // 0이면 타이머 없음
  published   Boolean  @default(false)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  authorId    String
  author      User       @relation(fields: [authorId], references: [id])
  players     Player[]
  questions   Question[]
  attempts    Attempt[]
}

model Player {
  id     String @id @default(cuid())
  name   String
  order  Int                              // 선택지 표시 순서

  quizId String
  quiz   Quiz   @relation(fields: [quizId], references: [id], onDelete: Cascade)
}

model Question {
  id            String @id @default(cuid())
  order         Int                          // 문제 순서
  videoUrl      String?                      // YouTube URL
  videoFileKey  String?                      // S3 파일 키 (직접 업로드 시)
  authorComment String?

  quizId        String
  quiz          Quiz     @relation(fields: [quizId], references: [id], onDelete: Cascade)
  answerPlayer  String                       // Player.id (정답)
  responses     Response[]
}

model Attempt {
  id         String   @id @default(cuid())
  score      Int
  totalQ     Int
  mode       String                          // 풀 때 사용한 모드
  createdAt  DateTime @default(now())

  userId     String?
  user       User?    @relation(fields: [userId], references: [id])
  quizId     String
  quiz       Quiz     @relation(fields: [quizId], references: [id])
  responses  Response[]
}

model Response {
  id              String   @id @default(cuid())
  selectedPlayer  String?                     // 객관식: Player.id
  textAnswer      String?                     // 주관식: 입력한 텍스트
  isCorrect       Boolean

  attemptId       String
  attempt         Attempt  @relation(fields: [attemptId], references: [id], onDelete: Cascade)
  questionId      String
  question        Question @relation(fields: [questionId], references: [id])
}
```

### 핵심 관계 정리

```
User ──< Quiz ──< Question ──< Response
  │                   │            ▲
  │       Quiz ──< Player         │
  │                               │
  └──< Attempt ──< Response ──────┘
```

- **User** 1:N **Quiz** — 한 유저가 여러 퀴즈 출제
- **Quiz** 1:N **Player** — 한 퀴즈에 여러 플레이어 후보
- **Quiz** 1:N **Question** — 한 퀴즈에 여러 문제
- **Question** 1:N **Response** — 문제별 응답 기록
- **Attempt** — 한 번의 퀴즈 풀기 시도 (점수, 모드 기록)

---

## 4. API 엔드포인트

### 인증
| Method | Path | 설명 |
|--------|------|------|
| — | `/api/auth/*` | NextAuth 자동 처리 |

### 퀴즈 목록/조회
| Method | Path | 설명 |
|--------|------|------|
| GET | `/api/quiz` | 퀴즈 목록 (필터: game, sort, search, page) |
| GET | `/api/quiz/[id]` | 퀴즈 상세 (문제 + 선택지, 정답은 제외) |
| GET | `/api/quiz/[id]/answer` | 정답 제출 후 정답 + 통계 반환 |

### 퀴즈 생성/관리
| Method | Path | 설명 |
|--------|------|------|
| POST | `/api/quiz` | 퀴즈 생성 (로그인 필수) |
| PUT | `/api/quiz/[id]` | 퀴즈 수정 (본인만) |
| DELETE | `/api/quiz/[id]` | 퀴즈 삭제 (본인만) |

### 정답 제출
| Method | Path | 설명 |
|--------|------|------|
| POST | `/api/quiz/[id]/submit` | 문제별 답 제출 → 정답 여부 + 통계 반환 |
| POST | `/api/quiz/[id]/complete` | 퀴즈 완료 → Attempt 기록 저장 |

### 파일 업로드
| Method | Path | 설명 |
|--------|------|------|
| POST | `/api/upload/presign` | S3 pre-signed URL 발급 |

### 통계
| Method | Path | 설명 |
|--------|------|------|
| GET | `/api/stats/quiz/[id]` | 퀴즈별 정답률, 참여자 수 |
| GET | `/api/stats/me` | 내 풀이 기록 |

---

## 5. 영상 업로드/저장

### 전략: S3 호환 스토리지 + Pre-signed URL

```
클라이언트                   서버                    S3
    │                         │                      │
    ├── POST /upload/presign ─▶ pre-signed URL 생성 ─┤
    │◀── presigned URL ───────┤                      │
    │                         │                      │
    ├── PUT (파일 직접 업로드) ──────────────────────▶│
    │                         │                      │
    ├── 퀴즈 생성 시 fileKey 전달 ─▶ DB에 키 저장     │
```

### 왜 Pre-signed URL인가?
- 영상 파일이 크므로(최대 100MB) 서버를 거치면 메모리/대역폭 낭비
- 클라이언트가 S3에 직접 업로드하므로 서버 부하 없음
- 업로드 후 파일 키만 서버에 전달

### S3 호환 서비스 후보
| 서비스 | 특징 |
|--------|------|
| **Cloudflare R2** | 이그레스 무료, 가격 저렴 — 추천 |
| AWS S3 | 가장 범용적, 프리티어 활용 가능 |
| Supabase Storage | Supabase 사용 시 통합 편리 |

### YouTube URL 지원
- YouTube URL을 입력한 경우 파일 업로드 없이 URL만 DB에 저장
- 재생 시 YouTube iframe embed 사용 (`react-youtube` 등)
- 파일 업로드와 YouTube URL 중 하나만 존재하면 됨

---

## 6. 정답 검증 흐름

### 보안 핵심: 정답은 서버에서만 비교

```
                    클라이언트                          서버
                        │                               │
객관식:  선택한 playerId ├── POST /quiz/[id]/submit ───▶ │
                        │                               ├─ DB에서 정답 조회
                        │                               ├─ playerId === answerPlayerId ?
                        │◀── { correct, stats } ────────┤
                        │                               │
주관식:  입력한 텍스트   ├── POST /quiz/[id]/submit ───▶ │
                        │                               ├─ DB에서 정답 플레이어명 조회
                        │                               ├─ normalize(input) === normalize(answer) ?
                        │                               │   (소문자 변환, 공백 trim, 별칭 테이블 체크)
                        │◀── { correct, stats } ────────┤
```

### 주관식 정답 판정 로직
```typescript
function checkSubjectiveAnswer(input: string, answerName: string): boolean {
  const normalize = (s: string) => s.trim().toLowerCase().replace(/\s+/g, "");
  return normalize(input) === normalize(answerName);
}
```

> 향후 고도화: 별칭 테이블 (예: "faker" = "페이커" = "이상혁") 지원 가능

---

## 7. 배포 인프라

### 추천 구성

```
┌─────────────┐     ┌───────────────┐     ┌───────────────┐
│  Vercel      │     │  Supabase     │     │ Cloudflare R2 │
│  (Next.js)   │────▶│  (PostgreSQL) │     │  (영상 저장)   │
│  + API Routes│     │  + Auth(옵션) │     │               │
└─────────────┘     └───────────────┘     └───────────────┘
```

| 구성요소 | 서비스 | 이유 |
|----------|--------|------|
| **앱 호스팅** | Vercel | Next.js 최적, 무료 티어 충분 |
| **DB** | Supabase (PostgreSQL) | 무료 500MB, Prisma 호환 |
| **파일 저장** | Cloudflare R2 | 이그레스 무료, 영상 서빙 비용 절감 |
| **도메인** | Vercel 기본 또는 커스텀 | — |

### 대안 구성 (올인원)
- **Supabase만 사용**: DB + Auth + Storage를 Supabase 하나로 통합
- 장점: 관리 포인트 최소화
- 단점: 영상 스토리지 용량 제한 (무료 1GB)

---

## 8. 디렉터리 구조 (서버 코드 추가 시)

```
src/
  app/
    api/
      auth/[...nextauth]/route.ts     ← 인증
      quiz/route.ts                    ← GET(목록), POST(생성)
      quiz/[id]/route.ts              ← GET(상세), PUT(수정), DELETE(삭제)
      quiz/[id]/submit/route.ts       ← POST(정답 제출)
      quiz/[id]/complete/route.ts     ← POST(퀴즈 완료)
      upload/presign/route.ts         ← POST(업로드 URL 발급)
      stats/quiz/[id]/route.ts        ← GET(퀴즈 통계)
      stats/me/route.ts               ← GET(내 기록)
    login/page.tsx
    quiz/[id]/page.tsx
    quiz/create/page.tsx
    page.tsx
    layout.tsx
  lib/
    auth.ts                            ← NextAuth 설정
    db.ts                              ← Prisma client 초기화
    s3.ts                              ← S3 클라이언트 + presign 유틸
  components/
    Header.tsx
    ...
prisma/
  schema.prisma                        ← DB 스키마
```

---

## 9. 구현 순서

### Phase 1 — DB + 인증 기초
1. Prisma 설정 + DB 스키마 생성 (`npx prisma migrate dev`)
2. NextAuth 설정 (Google, Discord provider)
3. `middleware.ts`에서 보호 라우트 설정

### Phase 2 — 퀴즈 CRUD API
4. `POST /api/quiz` — 퀴즈 + 플레이어 + 문제 일괄 생성
5. `GET /api/quiz` — 목록 (필터, 페이지네이션)
6. `GET /api/quiz/[id]` — 상세 (정답 제외)
7. 프론트엔드 연동: 문제 만들기 → API 호출, 목록 → API에서 가져오기

### Phase 3 — 정답 제출 + 통계
8. `POST /api/quiz/[id]/submit` — 정답 비교 + Response 저장
9. `POST /api/quiz/[id]/complete` — Attempt 저장
10. `GET /api/stats/quiz/[id]` — 정답률, 선택 분포 집계
11. 프론트엔드 연동: 풀기 페이지 → submit API → 결과 표시

### Phase 4 — 영상 업로드
12. S3 클라이언트 설정 + presign 엔드포인트
13. 프론트엔드: 드래그앤드롭 → presign → 직접 업로드
14. YouTube URL 지원 (iframe embed)

### Phase 5 — 고도화
15. 주관식 별칭 테이블
16. 랭킹 / 리더보드
17. 공유 기능 (OG 이미지 동적 생성)
18. 댓글

---

## 10. 환경 변수

```env
# Database
DATABASE_URL="postgresql://user:pass@host:5432/guesspro"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="..."

# OAuth Providers
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."
DISCORD_CLIENT_ID="..."
DISCORD_CLIENT_SECRET="..."

# S3 (Cloudflare R2)
S3_ENDPOINT="https://xxx.r2.cloudflarestorage.com"
S3_ACCESS_KEY="..."
S3_SECRET_KEY="..."
S3_BUCKET="guesspro-videos"
S3_PUBLIC_URL="https://videos.guesspro.com"
```
