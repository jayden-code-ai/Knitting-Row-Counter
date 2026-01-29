import json
import uuid
from pathlib import Path

import streamlit as st

DATA_FILE = Path("data.json")

BG = "#F7F0E8"
CARD_BG = "#FFF8F2"
WARM_GRAY = "#B8B0A8"
PASTEL_PINK = "#E7C0C0"
TEXT = "#4A3B3B"
SET_COLOR = "#5B4B4B"
ROW_COLOR = "#7CA38B"
TOP_TAP = "#F3D7C7"
BOTTOM_TAP = "#E6D6C7"


def clamp_int(value, default, min_value, max_value=None):
    try:
        num = int(value)
    except (TypeError, ValueError):
        return default
    if num < min_value:
        num = min_value
    if max_value is not None and num > max_value:
        num = max_value
    return num


def load_projects():
    if not DATA_FILE.exists():
        return []
    try:
        data = json.loads(DATA_FILE.read_text(encoding="utf-8"))
        return data if isinstance(data, list) else []
    except json.JSONDecodeError:
        return []


def save_projects(projects):
    DATA_FILE.write_text(
        json.dumps(projects, ensure_ascii=False, indent=2), encoding="utf-8"
    )


def compute_set_row(total_rows, rows_per_set):
    rows_value = max(1, rows_per_set)
    set_count = total_rows // rows_value
    row_in_set = total_rows % rows_value
    row_display = rows_value if total_rows > 0 and row_in_set == 0 else row_in_set
    return set_count, row_display


def get_project(projects, pid):
    for project in projects:
        if project.get("id") == pid:
            return project
    return None


def rerun():
    if hasattr(st, "rerun"):
        st.rerun()
    else:
        st.experimental_rerun()


st.set_page_config(page_title="뜨개질 단수링", layout="centered")

st.markdown(
    f"""
    <style>
        :root {{
            --bg: {BG};
            --card: {CARD_BG};
            --text: {TEXT};
            --muted: {WARM_GRAY};
            --pink: {PASTEL_PINK};
            --top: {TOP_TAP};
            --bottom: {BOTTOM_TAP};
            --set: {SET_COLOR};
            --row: {ROW_COLOR};
        }}
        @media (prefers-color-scheme: dark) {{
            :root {{
                --bg: #1E1A16;
                --card: #2A241E;
                --text: #F2E8DD;
                --muted: #B5A79B;
                --pink: #B99090;
                --top: #3C3129;
                --bottom: #2B231E;
                --set: #E6D2C0;
                --row: #A6C8B2;
            }}
        }}
        html, body, [data-testid="stApp"] {{
            background: var(--bg);
            color: var(--text);
            font-family: "Noto Sans KR", "Apple SD Gothic Neo", sans-serif;
        }}
        h1, h2, h3 {{
            color: var(--text);
        }}
        .project-card {{
            background: var(--card);
            padding: 16px;
            border-radius: 16px;
            box-shadow: 0 6px 18px rgba(0,0,0,0.06);
            margin-bottom: 12px;
        }}
        .counter-box {{
            background: var(--card);
            border-radius: 18px;
            padding: 24px;
            text-align: center;
        }}
        .counter-row {{
            display: flex;
            justify-content: center;
            align-items: flex-end;
            gap: 24px;
        }}
        .counter-value {{
            font-size: 48px;
            font-weight: 700;
            line-height: 1;
        }}
        .counter-label {{
            font-size: 14px;
        }}
        .set-color {{ color: var(--set); }}
        .row-color {{ color: var(--row); }}
        .goal-text {{ color: var(--muted); font-size: 13px; margin-top: 8px; }}
        .action-btn > button {{
            border-radius: 16px !important;
            font-weight: 700;
            height: 52px;
        }}
        .tap-inc button {{
            height: 120px !important;
            border-radius: 18px !important;
            background: var(--top) !important;
            color: var(--text) !important;
            font-size: 22px !important;
            font-weight: 700 !important;
            border: none !important;
        }}
        .tap-dec button {{
            height: 120px !important;
            border-radius: 18px !important;
            background: var(--bottom) !important;
            color: var(--text) !important;
            font-size: 22px !important;
            font-weight: 700 !important;
            border: none !important;
        }}
    </style>
    """,
    unsafe_allow_html=True,
)

if "projects" not in st.session_state:
    st.session_state.projects = load_projects()
if "view" not in st.session_state:
    st.session_state.view = "home"
if "active_id" not in st.session_state:
    st.session_state.active_id = None

projects = st.session_state.projects

if st.session_state.view == "home":
    st.markdown("## My Knitting Projects")

    if not projects:
        st.markdown("<p style='color:#9C948C;'>프로젝트가 없습니다. 아래에서 추가해주세요.</p>", unsafe_allow_html=True)

    for project in projects:
        pid = project.get("id")
        name = project.get("name", "Untitled")
        total_rows = clamp_int(project.get("count", 0), 0, 0)
        rows_per_set = clamp_int(project.get("rows_per_set", 1), 1, 1, 999)
        set_count, row_display = compute_set_row(total_rows, rows_per_set)

        with st.container():
            st.markdown("<div class='project-card'>", unsafe_allow_html=True)
            col1, col2, col3 = st.columns([4, 1.2, 1])
            with col1:
                st.markdown(f"**{name}**")
                st.markdown(
                    f"<span style='color:{WARM_GRAY}'>세트 {set_count} · 단 {row_display}/{rows_per_set}</span>",
                    unsafe_allow_html=True,
                )
            with col2:
                if st.button("열기", key=f"open_{pid}"):
                    st.session_state.view = "detail"
                    st.session_state.active_id = pid
                    rerun()
            with col3:
                if st.button("삭제", key=f"del_{pid}"):
                    st.session_state.projects = [p for p in projects if p.get("id") != pid]
                    save_projects(st.session_state.projects)
                    rerun()
            st.markdown("</div>", unsafe_allow_html=True)

    st.markdown("---")
    st.markdown("### 프로젝트 추가")
    with st.form("add_project"):
        name = st.text_input("프로젝트 이름")
        rows_per_set = st.number_input("세트당 단수", min_value=1, max_value=999, value=15, step=1)
        target_sets = st.number_input("목표 세트 수 (선택)", min_value=0, max_value=999, value=0, step=1)
        step = st.selectbox("증감 단위 (1~10)", list(range(1, 11)), index=0)
        submitted = st.form_submit_button("추가")

    if submitted:
        if not name.strip():
            st.warning("프로젝트 이름을 입력해주세요.")
        else:
            projects.append(
                {
                    "id": uuid.uuid4().hex,
                    "name": name.strip(),
                    "count": 0,
                    "memo": "",
                    "step": clamp_int(step, 1, 1, 10),
                    "rows_per_set": clamp_int(rows_per_set, 15, 1, 999),
                    "target_sets": clamp_int(target_sets, 0, 0, 999),
                }
            )
            save_projects(projects)
            rerun()

else:
    project = get_project(projects, st.session_state.active_id)
    if not project:
        st.info("프로젝트를 찾을 수 없습니다.")
        if st.button("뒤로 가기"):
            st.session_state.view = "home"
            st.session_state.active_id = None
            rerun()
    else:
        col_left, col_center, col_right = st.columns([1, 6, 1])
        with col_left:
            if st.button("←", key="back"):
                st.session_state.view = "home"
                st.session_state.active_id = None
                rerun()
        with col_center:
            st.markdown(f"### {project.get('name', 'Project')}")
        with col_right:
            if st.button("⟲", key="reset"):
                project["count"] = 0
                save_projects(projects)
                rerun()

        total_rows = clamp_int(project.get("count", 0), 0, 0)
        rows_per_set = clamp_int(project.get("rows_per_set", 1), 1, 1, 999)
        target_sets = clamp_int(project.get("target_sets", 0), 0, 0, 999)
        step = clamp_int(project.get("step", 1), 1, 1, 10)

        set_count, row_display = compute_set_row(total_rows, rows_per_set)

        st.markdown(
            f"""
            <div class="counter-box">
                <div class="counter-row">
                    <div>
                        <div class="counter-value set-color">{set_count}</div>
                        <div class="counter-label set-color">세트</div>
                    </div>
                    <div>
                        <div class="counter-value row-color">{row_display}</div>
                        <div class="counter-label row-color">단</div>
                    </div>
                </div>
                {f"<div class='goal-text'>목표 {target_sets}세트</div>" if target_sets > 0 else ""}
            </div>
            """,
            unsafe_allow_html=True,
        )

        st.markdown("### 조작")
        col_a, col_b, col_c = st.columns(3)
        with col_a:
            if st.button("-", key="dec", help="단수 감소", type="secondary"):
                project["count"] = max(0, total_rows - step)
                save_projects(projects)
                rerun()
        with col_b:
            st.markdown(f"<div style='text-align:center;padding-top:10px;'>증감 {step}</div>", unsafe_allow_html=True)
        with col_c:
            if st.button("+", key="inc", help="단수 증가", type="primary"):
                project["count"] = total_rows + step
                save_projects(projects)
                rerun()

        st.markdown("---")
        st.markdown("### 설정")

        rows_input = st.number_input(
            "세트당 단수",
            min_value=1,
            max_value=999,
            value=rows_per_set,
            step=1,
            key=f"rows_{project['id']}",
        )
        target_input = st.number_input(
            "목표 세트 수 (선택)",
            min_value=0,
            max_value=999,
            value=target_sets,
            step=1,
            key=f"target_{project['id']}",
        )
        step_input = st.selectbox(
            "증감 단위 (1~10)",
            list(range(1, 11)),
            index=step - 1,
            key=f"step_{project['id']}",
        )
        memo_input = st.text_area("메모", value=project.get("memo", ""), key=f"memo_{project['id']}")

        changed = False
        new_rows = clamp_int(rows_input, rows_per_set, 1, 999)
        new_target = clamp_int(target_input, target_sets, 0, 999)
        new_step = clamp_int(step_input, step, 1, 10)
        if new_rows != rows_per_set:
            project["rows_per_set"] = new_rows
            changed = True
        if new_target != target_sets:
            project["target_sets"] = new_target
            changed = True
        if new_step != step:
            project["step"] = new_step
            changed = True
        if memo_input != project.get("memo", ""):
            project["memo"] = memo_input
            changed = True

        if changed:
            save_projects(projects)
