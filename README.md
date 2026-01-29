# 뜨개질 단수링 (Streamlit 버전)

Flet 버전 대신 Streamlit으로 만든 웹 앱입니다.  
베이지/웜그레이/파스텔 톤의 감성을 유지하면서, **세트/단** 카운팅을 지원합니다.

## 주요 기능
- 여러 프로젝트 관리 (추가/열기/삭제)
- 세트/단 자동 계산
  - 세트당 단수 설정
  - 목표 세트 수 설정
- 증감 단위(1~10) 설정
- 메모 자동 저장
- 로컬 `data.json`에 자동 저장

## 실행 방법
```bash
python -m venv number
source number/bin/activate
pip install -r requirements.txt
streamlit run app.py
```

## 사용 방법
1. 메인 화면에서 프로젝트를 추가합니다.
2. 프로젝트를 열면 상세 화면으로 이동합니다.
3. 상세 화면에서 `+ / -` 버튼으로 단수를 조작합니다.
4. 세트/단은 자동으로 계산되어 표시됩니다.
5. 설정과 메모는 자동 저장됩니다.

## 데이터 저장
- 모든 프로젝트 데이터는 `data.json`에 저장됩니다.
- 앱을 다시 실행해도 데이터가 유지됩니다.

## 배포 (Streamlit)
- 가장 간단한 방법은 **Streamlit Community Cloud**에 배포하는 것입니다.
- GitHub에 올린 뒤 Streamlit Cloud에서 `app.py`를 선택하면 됩니다.

---

필요하면 다음도 바로 추가해 드릴 수 있어요:
- 모바일 UI 최적화
- 목표 세트 달성 시 알림/효과
- 프로젝트 정렬/검색
