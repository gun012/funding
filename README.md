# 정책자금 가이드 PWA

AI가 분석하는 맞춤 정책자금 가이드 앱

## 파일 구조
```
funding/
├── index.html       ← PWA 래퍼 (앱 껍데기)
├── manifest.json    ← PWA 설정
├── sw.js            ← 서비스 워커
└── icons/           ← 앱 아이콘 (8개)
```

## GitHub Pages 배포

1. github.com → 새 레포지토리 → 이름: funding
2. 모든 파일 + icons 폴더 업로드
3. Settings → Pages → main 브랜치
4. 앱 주소: https://[아이디].github.io/funding

## 앱 설치 방법

### 안드로이드 (크롬)
브라우저로 접속 → 상단 "설치하기" 배너 클릭

### 아이폰 (사파리)
사파리로 접속 → 공유버튼(□↑) → "홈 화면에 추가"
