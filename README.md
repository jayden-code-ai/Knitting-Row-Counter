# 니트카운트 (정적 웹앱)

Streamlit 대신 **HTML/CSS/JS 단일 페이지 앱**으로 전환했습니다.  
디자인은 `main.html`, `count.html` 레퍼런스를 그대로 반영하며 **라이트/다크 모드와 무관하게 동일한 색상**을 유지합니다.

## 주요 기능
- 프로젝트 목록/추가/삭제
- 상태 선택: 진행중/보류중/완료함 (색상 구분)
- 세트/단 자동 계산
- 상단/하단 전체 터치 영역으로 증감
- 증감 단위 1~20
- 설정(세트당 단수, 목표 세트, 메모)
- 레퍼런스/완료 사진 저장
- 로컬 저장소(localStorage) 자동 저장

## 실행 방법 (처음 구동)
1) 이 폴더로 이동
```bash
cd /Users/jayden/Documents/00_Jayden_Code_Mac/03_Jayden_Project_mac/Numbering
```

2) 간단 서버 실행 (권장)
```bash
python3 -m http.server 8000
```

3) 브라우저 접속
```
http://localhost:8000
```

> 참고: 파일을 직접 열어도 동작은 하지만 브라우저 정책에 따라 localStorage가 제한될 수 있어
> 위처럼 로컬 서버로 실행하는 것을 권장합니다.

## 파일 구조
- `index.html` : 메인/카운트 화면 UI
- `styles.css` : 전역 스타일
- `app.js` : 로직 및 localStorage 저장
- `main.html`, `count.html` : 디자인 레퍼런스

## 배포 (GitHub Pages)
1) `index.html`, `styles.css`, `app.js`를 레포 루트에 둡니다.
2) GitHub Pages에서 `/ (root)`를 배포 대상으로 설정합니다.
3) 접속 URL 예시:
```
https://<username>.github.io/<repo>/
```

필요하면 `gh-pages` 브랜치 배포 스크립트도 추가해줄게요.
