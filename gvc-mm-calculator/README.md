# GVC 월간 리소스 산정 도구

GVC (Grande Clip) 팀의 Man-Month 리소스 산정 워크플로우입니다.

## 기능

- **5단계 워크플로우**: 기준 월·인원 설정 → 연차 입력 → 프로젝트 투입일 → 검산 → 최종 결과
- 대한민국 공휴일 기준 영업일 자동 산정 (2025~2027)
- 팀원 추가/삭제, 직군 설정
- 자회사/관계사 + GCK 내부 프로젝트 mm 산출
- 직군별 그룹화 최종 결과 표
- CSV 다운로드

## 로컬 실행

```bash
npm install
npm run dev
```

브라우저에서 http://localhost:3000 접속

## Vercel 배포

1. GitHub에 이 폴더 전체를 push
2. vercel.com → Import GitHub repo
3. Deploy (환경변수 없이 바로 배포 가능)

> 이 앱은 순수 계산 앱으로 외부 API 키가 필요 없습니다.

## 프로젝트 구조

```
gvc-mm-calculator/
├── components/
│   └── MMCalculator.jsx   ← 메인 앱 컴포넌트
├── pages/
│   ├── _app.js
│   └── index.js           ← 진입점
├── styles/
│   └── globals.css
├── public/
├── package.json
├── next.config.js
└── .gitignore
```
