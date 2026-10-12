# CLASH ARENA (호그 사이클 로얄) — 개인용 비공개 취미 프로젝트

브라우저에서 바로 실행되는 실시간 1:1 타워 디펜스 카드 게임. `index.html` 하나로 실행됩니다
(이미지·스프라이트는 base64 로 내장, 음악만 `assets/audio/*.mp3` 를 따로 불러옵니다).

## 구성
- `index.html` — 전체 게임 (빌드 결과물, 직접 열어서 실행)
- `src/` — 2차 작업(메타 게임) 소스: `meta.css`, `meta_*.js`, `sfx.js`(효과음 엔진)
- `tools/build.py` — `src/` 를 `index.html` 의 `META_*` 마커 사이에 끼워 넣는다 (`python3 tools/build.py`)
- `assets/audio` — BGM 6곡(메뉴/전투/2배속/연장전/승리/패배), `assets/sprites` — 원본 시트·아틀라스, `assets/cards`·`assets/map` — 분리한 이미지
- `prompts/` — 스프라이트·BGM 생성 프롬프트

## 게임 흐름
로딩(실제 이미지 디코딩·음원 프리로드 연출) → 타이틀 → (첫 실행) 튜토리얼 → 홈(상점/카드/전투/클랜/이벤트) → 매칭 → 전투 → 결과 → 홈

## 조절 포인트 (`index.html` 상단 CONFIG / `src/meta_00_core.js`)
`GAME_TITLE`, `LOADING_SPEED`, `CHEST_TIME_SCALE`(상자 시간 배속), `CHESTS`, `CHEST_ODDS`, `UPGRADE`, `ARENAS`, `QUEST_POOL`, `ACH`, `TIPS`, `CARD_POOL`
설정 화면의 개발자 옵션으로도 상자 시간 ×60/×3600 배속, FPS 표시를 켤 수 있습니다.

## 저장
`localStorage` 키 `clashArenaSave_v1`. 설정 → 데이터 초기화(2단계 확인)로 삭제.

## 주의
개인/가족용입니다. 사용된 이미지·카드 아트는 원 저작권자의 것이므로 재배포하지 마세요.
