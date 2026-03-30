import { useState, useMemo } from "react";

// ─── Korean Public Holidays ────────────────────────────────────────────────
const KOREAN_HOLIDAYS = {
  2025: new Set([
    "2025-01-01","2025-01-28","2025-01-29","2025-01-30",
    "2025-03-01","2025-05-05","2025-05-06","2025-06-06",
    "2025-08-15","2025-10-03","2025-10-05","2025-10-06","2025-10-07","2025-10-08","2025-10-09",
    "2025-12-25",
  ]),
  2026: new Set([
    "2026-01-01","2026-02-17","2026-02-18","2026-02-19",
    "2026-03-01","2026-05-05","2026-05-24","2026-05-25",
    "2026-06-06","2026-08-15","2026-09-24","2026-09-25","2026-09-26",
    "2026-10-03","2026-10-09",
    "2026-12-25",
  ]),
  2027: new Set([
    "2027-01-01","2027-02-06","2027-02-07","2027-02-08",
    "2027-03-01","2027-05-05","2027-05-13",
    "2027-06-06","2027-08-15","2027-10-03","2027-10-14","2027-10-15","2027-10-16","2027-10-09",
    "2027-12-25",
  ]),
};

function getBusinessDays(year, month) {
  const holidays = KOREAN_HOLIDAYS[year] || new Set();
  let count = 0;
  const days = new Date(year, month, 0).getDate();
  for (let d = 1; d <= days; d++) {
    const date = new Date(year, month - 1, d);
    const dow = date.getDay();
    const key = `${year}-${String(month).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    if (dow !== 0 && dow !== 6 && !holidays.has(key)) count++;
  }
  return count;
}

// ─── Constants ────────────────────────────────────────────────────────────
const SUBSIDIARY_PROJECTS = ["AMCR", "스테이폴리오", "뉴믹스", "82Bowl", "Bowls Up"];
const GCK_PROJECTS = ["글로우비스트", "매거진C", "소셜 콘텐츠", "봉앤설", "인터널"];
const ALL_PROJECTS = [...SUBSIDIARY_PROJECTS, ...GCK_PROJECTS];

const ROLES = ["개발", "디자인", "마케팅", "기획", "운영", "콘텐츠", "기타"];

const STEPS = ["① 기준 월·인원", "② 연차 입력", "③ 프로젝트 투입일", "④ 검산", "⑤ 최종 결과"];

// ─── Styles ───────────────────────────────────────────────────────────────
const css = `
  @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@300;400;500;600;700&family=DM+Mono:wght@400;500&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  body { font-family: 'Noto Sans KR', sans-serif; }

  .app {
    min-height: 100vh;
    background: #f0f2f5;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 0 0 60px;
  }

  .header {
    width: 100%;
    background: #0f1923;
    color: white;
    padding: 20px 40px;
    display: flex;
    align-items: center;
    gap: 16px;
    border-bottom: 3px solid #2563eb;
  }
  .header-logo { font-family: 'DM Mono', monospace; font-size: 12px; color: #2563eb; letter-spacing: 2px; text-transform: uppercase; }
  .header-title { font-size: 18px; font-weight: 600; }
  .header-sub { font-size: 12px; color: #64748b; margin-left: auto; font-family: 'DM Mono', monospace; }

  .stepper {
    width: 100%;
    max-width: 900px;
    display: flex;
    align-items: center;
    padding: 24px 0 8px;
    gap: 0;
  }
  .step {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 13px;
    font-weight: 500;
    color: #94a3b8;
    cursor: default;
    flex: 1;
  }
  .step.active { color: #2563eb; }
  .step.done { color: #22c55e; }
  .step-dot {
    width: 28px; height: 28px;
    border-radius: 50%;
    background: #e2e8f0;
    display: flex; align-items: center; justify-content: center;
    font-size: 11px;
    font-weight: 700;
    flex-shrink: 0;
  }
  .step.active .step-dot { background: #2563eb; color: white; }
  .step.done .step-dot { background: #22c55e; color: white; }
  .step-line { flex: 1; height: 2px; background: #e2e8f0; margin: 0 4px; }
  .step-line.done { background: #22c55e; }

  .card {
    width: 100%;
    max-width: 900px;
    background: white;
    border-radius: 12px;
    box-shadow: 0 1px 3px rgba(0,0,0,.08), 0 4px 16px rgba(0,0,0,.04);
    padding: 32px 36px;
    margin-top: 16px;
  }

  .card-title { font-size: 20px; font-weight: 700; color: #0f1923; margin-bottom: 4px; }
  .card-sub { font-size: 13px; color: #64748b; margin-bottom: 28px; line-height: 1.6; }

  .notice {
    background: #eff6ff;
    border-left: 4px solid #2563eb;
    padding: 12px 16px;
    border-radius: 0 8px 8px 0;
    margin-bottom: 24px;
    font-size: 12.5px;
    color: #1e40af;
    line-height: 1.8;
  }
  .notice strong { font-weight: 600; }

  .row { display: flex; gap: 16px; align-items: flex-end; margin-bottom: 16px; }
  .col { display: flex; flex-direction: column; gap: 6px; }
  .col.grow { flex: 1; }

  label { font-size: 12px; font-weight: 600; color: #475569; text-transform: uppercase; letter-spacing: 0.5px; }
  select, input[type="text"], input[type="number"] {
    border: 1.5px solid #e2e8f0;
    border-radius: 8px;
    padding: 10px 12px;
    font-size: 14px;
    font-family: 'Noto Sans KR', sans-serif;
    color: #0f1923;
    background: white;
    outline: none;
    transition: border-color .15s;
    width: 100%;
  }
  select:focus, input:focus { border-color: #2563eb; }

  .biz-badge {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    background: #0f1923;
    color: white;
    padding: 8px 16px;
    border-radius: 8px;
    font-family: 'DM Mono', monospace;
    font-size: 13px;
  }
  .biz-num { font-size: 22px; font-weight: 700; color: #2563eb; }

  .person-list { display: flex; flex-direction: column; gap: 10px; margin-bottom: 20px; }
  .person-row {
    display: flex;
    gap: 10px;
    align-items: center;
    background: #f8fafc;
    border: 1.5px solid #e2e8f0;
    border-radius: 8px;
    padding: 10px 14px;
  }
  .person-idx {
    font-family: 'DM Mono', monospace;
    font-size: 11px;
    color: #94a3b8;
    width: 20px;
    flex-shrink: 0;
  }
  .person-row input, .person-row select { border: none; background: transparent; padding: 4px 6px; font-size: 14px; }
  .person-row input:focus, .person-row select:focus { background: white; border: 1.5px solid #2563eb; border-radius: 6px; }

  .btn {
    padding: 10px 20px;
    border-radius: 8px;
    font-size: 13px;
    font-weight: 600;
    font-family: 'Noto Sans KR', sans-serif;
    cursor: pointer;
    border: none;
    transition: all .15s;
    display: inline-flex;
    align-items: center;
    gap: 6px;
  }
  .btn-primary { background: #2563eb; color: white; }
  .btn-primary:hover { background: #1d4ed8; }
  .btn-secondary { background: #f1f5f9; color: #475569; border: 1.5px solid #e2e8f0; }
  .btn-secondary:hover { background: #e2e8f0; }
  .btn-danger { background: #fee2e2; color: #dc2626; }
  .btn-danger:hover { background: #fecaca; }
  .btn-sm { padding: 6px 12px; font-size: 12px; }
  .btn-ghost { background: transparent; color: #64748b; border: 1.5px dashed #e2e8f0; }
  .btn-ghost:hover { border-color: #2563eb; color: #2563eb; }

  .nav-row { display: flex; gap: 12px; margin-top: 32px; justify-content: flex-end; }

  /* Step 2 - 연차 */
  .leave-table { width: 100%; border-collapse: collapse; }
  .leave-table th {
    background: #f8fafc;
    font-size: 11px;
    font-weight: 700;
    color: #64748b;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    padding: 10px 14px;
    text-align: left;
    border-bottom: 2px solid #e2e8f0;
  }
  .leave-table td { padding: 10px 14px; border-bottom: 1px solid #f1f5f9; font-size: 14px; }
  .leave-table tr:last-child td { border-bottom: none; }
  .leave-table input[type="number"] { width: 80px; text-align: center; padding: 6px 8px; }

  .mm-chip {
    background: #eff6ff;
    color: #2563eb;
    font-family: 'DM Mono', monospace;
    font-size: 12px;
    font-weight: 600;
    padding: 4px 10px;
    border-radius: 20px;
    display: inline-block;
  }

  /* Step 3 - project days */
  .proj-section { margin-bottom: 32px; }
  .proj-section-title {
    font-size: 13px;
    font-weight: 700;
    color: #0f1923;
    text-transform: uppercase;
    letter-spacing: 1px;
    margin-bottom: 12px;
    padding-bottom: 8px;
    border-bottom: 2px solid #0f1923;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .proj-badge { font-size: 10px; font-weight: 600; padding: 2px 8px; border-radius: 10px; }
  .proj-badge.sub { background: #dbeafe; color: #1e40af; }
  .proj-badge.gck { background: #f0fdf4; color: #166534; }

  .proj-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
    gap: 10px;
  }
  .proj-input-wrap { display: flex; flex-direction: column; gap: 6px; }
  .proj-input-wrap label { font-size: 11.5px; color: #475569; text-transform: none; letter-spacing: 0; }
  .proj-input-wrap input { font-family: 'DM Mono', monospace; text-align: center; }

  .person-tab-bar {
    display: flex;
    gap: 6px;
    flex-wrap: wrap;
    margin-bottom: 20px;
  }
  .person-tab {
    padding: 7px 14px;
    border-radius: 20px;
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    border: 1.5px solid #e2e8f0;
    background: white;
    color: #64748b;
    transition: all .15s;
  }
  .person-tab.active { background: #0f1923; color: white; border-color: #0f1923; }

  /* Step 4 - 검산 */
  .verify-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 20px; }
  .verify-card {
    background: #f8fafc;
    border: 1.5px solid #e2e8f0;
    border-radius: 10px;
    padding: 16px 20px;
  }
  .verify-card-name { font-size: 15px; font-weight: 700; margin-bottom: 12px; color: #0f1923; }
  .verify-row { display: flex; justify-content: space-between; font-size: 13px; margin-bottom: 6px; }
  .verify-row .label { color: #64748b; }
  .verify-row .val { font-family: 'DM Mono', monospace; font-weight: 600; color: #0f1923; }
  .verify-divider { border: none; border-top: 1px dashed #e2e8f0; margin: 10px 0; }
  .verify-proj { display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 4px; }
  .verify-proj .pname { color: #475569; }
  .verify-proj .pval { font-family: 'DM Mono', monospace; color: #2563eb; }

  /* Step 5 - Final Table */
  .final-wrap { overflow-x: auto; }
  .final-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 13px;
    min-width: 860px;
    border: 1.5px solid #cbd5e1;
  }
  /* ── 헤더: 단일 다크 색조, 그룹은 하단 컬러 테두리로 구분 ── */
  .final-table th {
    background: #1e293b;
    color: #e2e8f0;
    padding: 10px 12px;
    font-size: 11px;
    font-weight: 700;
    text-align: center;
    letter-spacing: 0.4px;
    white-space: nowrap;
    border: 1px solid #334155;
  }
  /* 그룹 레이블 행 (1행) */
  .final-table th.sub-group   { border-bottom: 3px solid #3b82f6; }
  .final-table th.gck-group   { border-bottom: 3px solid #94a3b8; }
  .final-table th.meta-group  { border-bottom: 3px solid #64748b; }
  /* 컬럼명 행 (2행) — 흰 배경에 어두운 텍스트 */
  .final-table th.sub-header  { background: #eff6ff; color: #1e40af; border: 1px solid #bfdbfe; border-top: 3px solid #3b82f6; }
  .final-table th.gck-header  { background: #f8fafc; color: #334155; border: 1px solid #cbd5e1; border-top: 3px solid #94a3b8; }
  .final-table th.meta-header { background: #f1f5f9; color: #475569; border: 1px solid #cbd5e1; border-top: 3px solid #64748b; }

  /* ── 데이터 셀 ── */
  .final-table td {
    padding: 9px 12px;
    border: 1px solid #e2e8f0;
    text-align: center;
    font-family: 'DM Mono', monospace;
    font-size: 12.5px;
    color: #334155;
    background: #fff;
  }
  /* 직군 열 */
  .final-table td.role-cell {
    font-family: 'Noto Sans KR', sans-serif;
    font-size: 12px;
    font-weight: 700;
    color: #475569;
    background: #f1f5f9;
    border-right: 2px solid #cbd5e1;
    white-space: nowrap;
    vertical-align: middle;
    text-align: center;
    letter-spacing: 0.3px;
  }
  /* 이름 열 */
  .final-table td.name-cell {
    font-family: 'Noto Sans KR', sans-serif;
    font-weight: 600;
    font-size: 13px;
    color: #0f172a;
    text-align: left;
    background: #f8fafc;
    border-right: 2px solid #e2e8f0;
    white-space: nowrap;
  }
  /* 자회사 총합 */
  .final-table td.total-cell {
    font-weight: 700;
    color: #1d4ed8;
    background: #dbeafe;
    border-right: 2px solid #93c5fd;
  }
  /* 자회사 세부: 값 있을 때 연파랑, 없을 때 흰 배경 */
  .final-table td.sub-cell       { background: #eff6ff; color: #1e40af; }
  .final-table td.sub-cell.zero  { background: #fff; color: #d1d5db; }
  /* GCK: 값 있을 때 연회색, 없을 때 흰 배경 */
  .final-table td.gck-cell       { background: #f8fafc; color: #374151; }
  .final-table td.gck-cell.zero  { background: #fff; color: #d1d5db; }
  /* 월 리소스 */
  .final-table td.meta-cell { background: #f8fafc; color: #374151; }
  .final-table td.meta-mm   { background: #f1f5f9; color: #0f172a; font-weight: 700; }

  .final-table tbody tr:hover td { filter: brightness(0.96); }

  /* 직군 그룹 첫 행: 위쪽 구분선 */
  .final-table tr.role-group-start td { border-top: 2px solid #94a3b8; }

  /* 합계 행 */
  .final-table .sum-row td {
    background: #1e293b;
    color: #e2e8f0;
    font-weight: 700;
    font-family: 'DM Mono', monospace;
    border-color: #334155;
  }
  .final-table .sum-row td.role-cell,
  .final-table .sum-row td.name-cell {
    background: #0f172a;
    color: #cbd5e1;
    font-family: 'Noto Sans KR', sans-serif;
    border-right: 2px solid #334155;
    text-align: left;
  }
  .final-table .sum-row td.total-cell { background: #1e3a5f; color: #93c5fd; border-right: 2px solid #1d4ed8; }
  .final-table .sum-row td.sub-cell   { background: #1e293b; color: #93c5fd; }
  .final-table .sum-row td.gck-cell   { background: #1e293b; color: #94a3b8; }
  .final-table .sum-row td.meta-cell,
  .final-table .sum-row td.meta-mm    { background: #1e293b; color: #e2e8f0; }

  .final-meta {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 14px;
    margin-bottom: 24px;
  }
  .meta-box {
    background: white;
    border: 1.5px solid #e2e8f0;
    border-radius: 10px;
    padding: 16px 20px;
    border-left: 5px solid #3b82f6;
  }
  .meta-box.slate { border-left-color: #64748b; }
  .meta-box.gray  { border-left-color: #94a3b8; }
  .meta-box .mlabel { font-size: 11px; color: #94a3b8; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 6px; font-weight: 600; }
  .meta-box .mval   { font-family: 'DM Mono', monospace; font-size: 26px; font-weight: 700; color: #0f172a; }
  .meta-box .msub   { font-size: 12px; color: #94a3b8; margin-top: 4px; }

  .export-row { display: flex; gap: 10px; margin-top: 24px; }

  .chip-row { display: flex; gap: 8px; flex-wrap: wrap; margin-top: 12px; }
  .chip { font-size: 12px; padding: 4px 10px; border-radius: 12px; background: #f1f5f9; color: #475569; }

  /* ── Sub-item (2 depth) UI ── */
  .proj-list { display: flex; flex-direction: column; gap: 8px; }

  .proj-row {
    border: 1.5px solid #e2e8f0;
    border-radius: 10px;
    background: white;
    overflow: hidden;
    transition: border-color .15s;
  }
  .proj-row:focus-within { border-color: #93c5fd; }
  .proj-row.expanded { border-color: #3b82f6; }

  .proj-row-main {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 14px;
  }
  .proj-row-name {
    flex: 1;
    font-size: 13.5px;
    font-weight: 600;
    color: #1e293b;
    min-width: 80px;
  }
  .proj-row-input {
    width: 90px;
    text-align: center;
    font-family: 'DM Mono', monospace;
    font-size: 14px;
    padding: 6px 10px;
    border: 1.5px solid #e2e8f0;
    border-radius: 7px;
    color: #0f172a;
    background: white;
    outline: none;
    transition: border-color .15s;
  }
  .proj-row-input:focus { border-color: #3b82f6; }
  .proj-row-input.computed {
    background: #eff6ff;
    color: #1d4ed8;
    font-weight: 700;
    border-color: #bfdbfe;
    cursor: not-allowed;
  }
  .proj-toggle-btn {
    display: flex;
    align-items: center;
    gap: 5px;
    padding: 5px 10px;
    border-radius: 6px;
    font-size: 11.5px;
    font-weight: 600;
    font-family: 'Noto Sans KR', sans-serif;
    cursor: pointer;
    border: 1.5px solid #e2e8f0;
    background: #f8fafc;
    color: #64748b;
    white-space: nowrap;
    transition: all .15s;
  }
  .proj-toggle-btn:hover { border-color: #3b82f6; color: #2563eb; background: #eff6ff; }
  .proj-toggle-btn.active { border-color: #3b82f6; color: #2563eb; background: #eff6ff; }
  .proj-toggle-arrow { display: inline-block; transition: transform .2s; }
  .proj-toggle-btn.active .proj-toggle-arrow { transform: rotate(180deg); }

  .proj-sub-area {
    border-top: 1.5px solid #e2e8f0;
    background: #f8fbff;
    padding: 12px 14px 10px 14px;
  }
  .proj-sub-hint {
    font-size: 11.5px;
    color: #94a3b8;
    margin-bottom: 10px;
    line-height: 1.6;
  }
  .proj-sub-hint strong { color: #3b82f6; }
  .proj-sub-list { display: flex; flex-direction: column; gap: 7px; margin-bottom: 10px; }

  .proj-sub-item {
    display: flex;
    align-items: center;
    gap: 8px;
    background: white;
    border: 1px solid #dbeafe;
    border-radius: 7px;
    padding: 7px 10px;
  }
  .proj-sub-item-num {
    font-family: 'DM Mono', monospace;
    font-size: 10px;
    color: #93c5fd;
    width: 16px;
    flex-shrink: 0;
    text-align: center;
  }
  .proj-sub-item input[type="text"] {
    flex: 1;
    border: none;
    background: transparent;
    font-size: 13px;
    color: #1e293b;
    padding: 2px 4px;
    outline: none;
    font-family: 'Noto Sans KR', sans-serif;
  }
  .proj-sub-item input[type="text"]::placeholder { color: #cbd5e1; }
  .proj-sub-item input[type="number"] {
    width: 72px;
    text-align: center;
    font-family: 'DM Mono', monospace;
    font-size: 13px;
    padding: 4px 8px;
    border: 1.5px solid #dbeafe;
    border-radius: 6px;
    color: #1d4ed8;
    background: #eff6ff;
    outline: none;
  }
  .proj-sub-item input[type="number"]:focus { border-color: #3b82f6; }
  .proj-sub-item-unit { font-size: 12px; color: #94a3b8; }
  .proj-sub-remove {
    background: none;
    border: none;
    color: #cbd5e1;
    cursor: pointer;
    font-size: 14px;
    padding: 2px 4px;
    border-radius: 4px;
    transition: color .15s;
    line-height: 1;
  }
  .proj-sub-remove:hover { color: #f87171; }

  .proj-sub-add {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 12px;
    font-weight: 600;
    color: #3b82f6;
    background: none;
    border: 1.5px dashed #bfdbfe;
    border-radius: 7px;
    padding: 6px 12px;
    cursor: pointer;
    width: 100%;
    font-family: 'Noto Sans KR', sans-serif;
    transition: all .15s;
  }
  .proj-sub-add:hover { background: #eff6ff; border-color: #3b82f6; }

  .proj-sub-sum-row {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    gap: 6px;
    margin-top: 8px;
    font-size: 12px;
    color: #64748b;
    padding-top: 8px;
    border-top: 1px dashed #dbeafe;
  }
  .proj-sub-sum-val {
    font-family: 'DM Mono', monospace;
    font-weight: 700;
    color: #1d4ed8;
    font-size: 13px;
  }

  /* ── 세부 업무 상세 패널 (최종 결과 페이지) ── */
  .detail-section {
    margin-top: 28px;
  }
  .detail-section-title {
    font-size: 13px;
    font-weight: 700;
    color: #475569;
    text-transform: uppercase;
    letter-spacing: 1px;
    margin-bottom: 12px;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .detail-section-badge {
    font-size: 10px;
    font-weight: 600;
    background: #eff6ff;
    color: #2563eb;
    padding: 2px 8px;
    border-radius: 10px;
    text-transform: none;
    letter-spacing: 0;
  }
  .detail-person-list { display: flex; flex-direction: column; gap: 8px; }

  .detail-person-panel {
    border: 1.5px solid #e2e8f0;
    border-radius: 10px;
    overflow: hidden;
  }
  .detail-person-header {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 11px 16px;
    background: #f8fafc;
    cursor: pointer;
    user-select: none;
    transition: background .15s;
  }
  .detail-person-header:hover { background: #f1f5f9; }
  .detail-person-name { font-size: 14px; font-weight: 700; color: #0f172a; }
  .detail-person-role { font-size: 11px; color: #94a3b8; font-weight: 500; }
  .detail-person-count {
    margin-left: auto;
    font-size: 11.5px;
    color: #3b82f6;
    font-weight: 600;
  }
  .detail-chevron {
    font-size: 11px;
    color: #94a3b8;
    transition: transform .2s;
  }
  .detail-chevron.open { transform: rotate(180deg); }

  .detail-person-body {
    padding: 14px 16px;
    border-top: 1.5px solid #e2e8f0;
    background: white;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  .detail-proj-block {}
  .detail-proj-label {
    font-size: 11.5px;
    font-weight: 700;
    color: #475569;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-bottom: 6px;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .detail-proj-mm {
    font-family: 'DM Mono', monospace;
    font-size: 11px;
    font-weight: 600;
    color: #1d4ed8;
    background: #eff6ff;
    padding: 2px 8px;
    border-radius: 10px;
    text-transform: none;
    letter-spacing: 0;
  }
  .detail-sub-table { width: 100%; border-collapse: collapse; }
  .detail-sub-table tr { border-bottom: 1px solid #f1f5f9; }
  .detail-sub-table tr:last-child { border-bottom: none; }
  .detail-sub-table td {
    padding: 6px 10px;
    font-size: 13px;
    color: #334155;
  }
  .detail-sub-table td:first-child {
    color: #64748b;
    padding-left: 14px;
  }
  .detail-sub-table td:last-child {
    text-align: right;
    font-family: 'DM Mono', monospace;
    font-weight: 600;
    color: #1e293b;
    white-space: nowrap;
  }
  .detail-sub-idx {
    display: inline-block;
    width: 18px;
    height: 18px;
    background: #f1f5f9;
    border-radius: 4px;
    font-size: 10px;
    font-weight: 700;
    color: #94a3b8;
    text-align: center;
    line-height: 18px;
    margin-right: 8px;
    font-family: 'DM Mono', monospace;
  }

  @media (max-width: 640px) {
    .card { padding: 20px; }
    .verify-grid { grid-template-columns: 1fr; }
    .final-meta { grid-template-columns: 1fr; }
  }
`;

// ─── Main Component ───────────────────────────────────────────────────────
export default function MMCalculator() {
  const [step, setStep] = useState(0);
  const [year, setYear] = useState(2026);
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [persons, setPersons] = useState([
    { name: "", role: "기획" },
    { name: "", role: "기획" },
  ]);
  const [leaves, setLeaves] = useState({});
  const [projDays, setProjDays] = useState({});
  const [projSubItems, setProjSubItems] = useState({}); // { personName: { projName: [{id,label,days}] } }
  const [expandedProj, setExpandedProj] = useState({});  // { "personName::projName": bool }
  const [activePersonIdx, setActivePersonIdx] = useState(0);

  const bizDays = useMemo(() => getBusinessDays(year, month), [year, month]);

  // ── Derived calculations ─────────────────────────────────────────────
  const personStats = useMemo(() => {
    return persons.map((p) => {
      const leave = Number(leaves[p.name] || 0);
      const workDays = bizDays - leave;
      const mm = workDays / bizDays;

      const days = projDays[p.name] || {};
      const totalInputDays = ALL_PROJECTS.reduce((s, pr) => s + Number(days[pr] || 0), 0);

      const projMM = {};
      ALL_PROJECTS.forEach((pr) => {
        const d = Number(days[pr] || 0);
        const ratio = totalInputDays > 0 ? d / totalInputDays : 0;
        projMM[pr] = mm * ratio;
      });

      const subTotal = SUBSIDIARY_PROJECTS.reduce((s, pr) => s + projMM[pr], 0);
      const gckTotal = GCK_PROJECTS.reduce((s, pr) => s + projMM[pr], 0);

      return { ...p, leave, workDays, mm, totalInputDays, projMM, subTotal, gckTotal };
    });
  }, [persons, leaves, projDays, bizDays]);

  // ── Person management ────────────────────────────────────────────────
  const addPerson = () => {
    setPersons((p) => [...p, { name: "", role: "기획" }]);
    setActivePersonIdx(persons.length);
  };
  const removePerson = (i) => {
    const name = persons[i].name;
    setPersons((p) => p.filter((_, idx) => idx !== i));
    setLeaves((l) => { const n = { ...l }; delete n[name]; return n; });
    setProjDays((d) => { const n = { ...d }; delete n[name]; return n; });
    if (activePersonIdx >= persons.length - 1) setActivePersonIdx(Math.max(0, persons.length - 2));
  };
  const updatePerson = (i, field, val) => {
    setPersons((p) => p.map((x, idx) => idx === i ? { ...x, [field]: val } : x));
  };

  const setLeave = (name, val) => setLeaves((l) => ({ ...l, [name]: val }));
  const setProjDay = (name, proj, val) => setProjDays((d) => ({ ...d, [name]: { ...d[name], [proj]: val } }));

  // ── Sub-item helpers ─────────────────────────────────────────────────
  const subKey = (name, proj) => `${name}::${proj}`;

  const getSubItems = (name, proj) => projSubItems[name]?.[proj] || [];

  const recomputeParent = (name, proj, items) => {
    const total = items.reduce((s, it) => s + Number(it.days || 0), 0);
    setProjDays((d) => ({ ...d, [name]: { ...d[name], [proj]: total > 0 ? total : "" } }));
  };

  const toggleExpand = (name, proj) => {
    const key = subKey(name, proj);
    setExpandedProj((e) => ({ ...e, [key]: !e[key] }));
  };

  const isExpanded = (name, proj) => !!expandedProj[subKey(name, proj)];

  const hasSubItems = (name, proj) => (projSubItems[name]?.[proj]?.length || 0) > 0;

  const addSubItem = (name, proj) => {
    const key = subKey(name, proj);
    if (!expandedProj[key]) setExpandedProj((e) => ({ ...e, [key]: true }));
    setProjSubItems((s) => {
      const cur = s[name]?.[proj] || [];
      const newItem = { id: Date.now(), label: "", days: "" };
      const updated = [...cur, newItem];
      return { ...s, [name]: { ...s[name], [proj]: updated } };
    });
  };

  const removeSubItem = (name, proj, id) => {
    setProjSubItems((s) => {
      const updated = (s[name]?.[proj] || []).filter((it) => it.id !== id);
      const next = { ...s, [name]: { ...s[name], [proj]: updated } };
      recomputeParent(name, proj, updated);
      return next;
    });
  };

  const updateSubItem = (name, proj, id, field, val) => {
    setProjSubItems((s) => {
      const updated = (s[name]?.[proj] || []).map((it) =>
        it.id === id ? { ...it, [field]: val } : it
      );
      const next = { ...s, [name]: { ...s[name], [proj]: updated } };
      if (field === "days") recomputeParent(name, proj, updated);
      return next;
    });
  };

  const canAdvance = () => {
    if (step === 0) return persons.every((p) => p.name.trim() !== "");
    return true;
  };

  const fmt = (n) => (typeof n === "number" ? n.toFixed(2) : "—");

  // ── CSV Export ────────────────────────────────────────────────────────
  const exportCSV = () => {
    // ── 시트 1: mm 요약 ────────────────────────────────────────────────
    const headers = ["이름", "직군", "월간mm", "실근무일수", "연차", "자회사총합", ...SUBSIDIARY_PROJECTS, "GCK총합", ...GCK_PROJECTS];
    const rows = personStats.map((p) => [
      p.name, p.role, fmt(p.mm), p.workDays, p.leave, fmt(p.subTotal),
      ...SUBSIDIARY_PROJECTS.map((pr) => fmt(p.projMM[pr])),
      fmt(p.gckTotal),
      ...GCK_PROJECTS.map((pr) => fmt(p.projMM[pr])),
    ]);
    const totalRow = ["합계", "", "", "", "",
      fmt(personStats.reduce((s, p) => s + p.subTotal, 0)),
      ...SUBSIDIARY_PROJECTS.map((pr) => fmt(personStats.reduce((s, p) => s + p.projMM[pr], 0))),
      fmt(personStats.reduce((s, p) => s + p.gckTotal, 0)),
      ...GCK_PROJECTS.map((pr) => fmt(personStats.reduce((s, p) => s + p.projMM[pr], 0))),
    ];

    // ── 시트 2: 세부 업무 내역 ─────────────────────────────────────────
    const detailRows = [];
    const hasAnyDetail = personStats.some((p) =>
      ALL_PROJECTS.some((pr) => (projSubItems[p.name]?.[pr]?.length || 0) > 0)
    );

    if (hasAnyDetail) {
      detailRows.push([]); // 빈 줄 구분
      detailRows.push(["=== 세부 업무 내역 ===", "", "", ""]);
      detailRows.push(["이름", "직군", "프로젝트", "구분", "세부 업무명", "투입일수(일)"]);

      personStats.forEach((p) => {
        const sub = projSubItems[p.name] || {};
        ALL_PROJECTS.forEach((pr) => {
          const items = sub[pr] || [];
          if (items.length === 0) return;
          const category = SUBSIDIARY_PROJECTS.includes(pr) ? "자회사/관계사" : "GCK 내부";
          items.forEach((it) => {
            detailRows.push([
              p.name,
              p.role,
              pr,
              category,
              it.label || "(업무명 미입력)",
              Number(it.days || 0),
            ]);
          });
          // 프로젝트별 소계
          const subtotal = items.reduce((s, it) => s + Number(it.days || 0), 0);
          detailRows.push(["", "", pr + " 소계", "", "", subtotal]);
        });
      });
    }

    const allLines = [headers, ...rows, totalRow, ...detailRows];
    const csv = allLines.map((r) => r.map((cell) => {
      const s = String(cell);
      // 쉼표·줄바꿈·따옴표가 포함된 셀은 큰따옴표로 감쌈
      return s.includes(",") || s.includes("\n") || s.includes('"')
        ? `"${s.replace(/"/g, '""')}"` : s;
    }).join(",")).join("\n");

    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `mm_리소스_${year}${String(month).padStart(2,"0")}.csv`;
    a.click();
  };

  // ── Render Steps ──────────────────────────────────────────────────────
  const renderStep0 = () => (
    <>
      <div className="card-title">기준 월 · 팀원 설정</div>
      <div className="card-sub">산정 기준이 되는 연도와 월을 선택하고, 이번 달 리소스를 산정할 팀원을 입력하세요.</div>
      <div className="notice">
        <strong>📌 유의사항</strong><br />
        • 영업일은 대한민국 공휴일 기준으로 자동 산정됩니다 (토·일 포함 제외)<br />
        • 공휴일 데이터는 2025~2027년을 지원합니다<br />
        • 팀원 추가/삭제는 이 단계에서만 가능합니다
      </div>
      <div className="row">
        <div className="col">
          <label>연도</label>
          <select value={year} onChange={(e) => setYear(Number(e.target.value))} style={{ width: 110 }}>
            {[2025, 2026, 2027].map((y) => <option key={y}>{y}</option>)}
          </select>
        </div>
        <div className="col">
          <label>월</label>
          <select value={month} onChange={(e) => setMonth(Number(e.target.value))} style={{ width: 90 }}>
            {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
              <option key={m} value={m}>{m}월</option>
            ))}
          </select>
        </div>
        <div className="col" style={{ justifyContent: "flex-end" }}>
          <div className="biz-badge">
            <span>{year}년 {month}월 영업일</span>
            <span className="biz-num">{bizDays}일</span>
          </div>
        </div>
      </div>

      <div style={{ margin: "28px 0 12px", fontWeight: 700, fontSize: 14 }}>팀원 목록</div>
      <div className="person-list">
        {persons.map((p, i) => (
          <div className="person-row" key={i}>
            <span className="person-idx">{String(i + 1).padStart(2, "0")}</span>
            <input
              type="text"
              placeholder="이름"
              value={p.name}
              onChange={(e) => updatePerson(i, "name", e.target.value)}
              style={{ flex: 1 }}
            />
            <select value={p.role} onChange={(e) => updatePerson(i, "role", e.target.value)} style={{ width: 100 }}>
              {ROLES.map((r) => <option key={r}>{r}</option>)}
            </select>
            <button className="btn btn-danger btn-sm" onClick={() => removePerson(i)}>✕</button>
          </div>
        ))}
      </div>
      <button className="btn btn-ghost" onClick={addPerson}>+ 팀원 추가</button>
    </>
  );

  const renderStep1 = () => (
    <>
      <div className="card-title">개인 연차 입력</div>
      <div className="card-sub">이번 달 개인별로 실제 소진한 연차(반차 0.5, 하루 1) 일수를 입력하세요.</div>
      <div className="notice">
        <strong>📌 유의사항</strong><br />
        • 반차는 0.5, 하루 연차는 1로 입력합니다<br />
        • 연차 미사용 시 0을 입력하거나 비워두세요<br />
        • 월간 mm = (영업일 - 연차) / 영업일<br />
        • 연차가 많을수록 월간 mm이 1 미만이 됩니다
      </div>
      <table className="leave-table">
        <thead>
          <tr>
            <th>이름</th>
            <th>직군</th>
            <th>영업일</th>
            <th>연차 (일)</th>
            <th>실 근무 일수</th>
            <th>월간 mm</th>
          </tr>
        </thead>
        <tbody>
          {persons.map((p) => {
            const leave = Number(leaves[p.name] || 0);
            const work = bizDays - leave;
            const mm = work / bizDays;
            return (
              <tr key={p.name}>
                <td style={{ fontWeight: 600, textAlign: "left" }}>{p.name}</td>
                <td style={{ color: "#64748b", textAlign: "left" }}>{p.role}</td>
                <td>{bizDays}</td>
                <td>
                  <input
                    type="number"
                    min={0}
                    max={bizDays}
                    step={0.5}
                    value={leaves[p.name] ?? ""}
                    placeholder="0"
                    onChange={(e) => setLeave(p.name, e.target.value)}
                  />
                </td>
                <td style={{ fontFamily: "DM Mono, monospace" }}>{work}</td>
                <td><span className="mm-chip">{mm.toFixed(2)}</span></td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </>
  );

  const activePerson = persons[activePersonIdx] || persons[0];

  const renderProjRow = (pr, badgeClass) => {
    const pName = activePerson.name;
    const subItems = getSubItems(pName, pr);
    const expanded = isExpanded(pName, pr);
    const hasSub = hasSubItems(pName, pr);
    const subSum = subItems.reduce((s, it) => s + Number(it.days || 0), 0);

    return (
      <div key={pr} className={`proj-row${expanded ? " expanded" : ""}`}>
        {/* 1 depth 메인 행 */}
        <div className="proj-row-main">
          <span className="proj-row-name">{pr}</span>
          <input
            type="number"
            min={0}
            step={0.5}
            placeholder="0"
            className={`proj-row-input${hasSub ? " computed" : ""}`}
            value={projDays[pName]?.[pr] ?? ""}
            readOnly={hasSub}
            onChange={hasSub ? undefined : (e) => setProjDay(pName, pr, e.target.value)}
            title={hasSub ? "세부 업무 합계로 자동 계산됩니다" : ""}
          />
          <span style={{ fontSize: 12, color: "#94a3b8" }}>일</span>
          <button
            className={`proj-toggle-btn${expanded ? " active" : ""}`}
            onClick={() => toggleExpand(pName, pr)}
            title="세부 업무 입력 펼치기/접기"
          >
            <span className="proj-toggle-arrow">▼</span>
            세부 입력
          </button>
        </div>

        {/* 2 depth 세부 영역 */}
        {expanded && (
          <div className="proj-sub-area">
            <div className="proj-sub-hint">
              세부 업무별 일수를 기록하면 합계가 위의 <strong>{pr}</strong> 투입 일수로 자동 반영됩니다.
              세부 입력 없이 위 숫자만 입력해도 됩니다.
            </div>
            {subItems.length > 0 && (
              <div className="proj-sub-list">
                {subItems.map((it, idx) => (
                  <div key={it.id} className="proj-sub-item">
                    <span className="proj-sub-item-num">{idx + 1}</span>
                    <input
                      type="text"
                      placeholder="업무명 (예: 랜딩페이지 개발)"
                      value={it.label}
                      onChange={(e) => updateSubItem(pName, pr, it.id, "label", e.target.value)}
                    />
                    <input
                      type="number"
                      min={0}
                      step={0.5}
                      placeholder="0"
                      value={it.days}
                      onChange={(e) => updateSubItem(pName, pr, it.id, "days", e.target.value)}
                    />
                    <span className="proj-sub-item-unit">일</span>
                    <button className="proj-sub-remove" onClick={() => removeSubItem(pName, pr, it.id)} title="삭제">✕</button>
                  </div>
                ))}
              </div>
            )}
            <button className="proj-sub-add" onClick={() => addSubItem(pName, pr)}>
              + 세부 업무 추가
            </button>
            {subItems.length > 0 && (
              <div className="proj-sub-sum-row">
                <span>세부 합계</span>
                <span className="proj-sub-sum-val">{subSum} 일</span>
                <span style={{ color: "#94a3b8", fontSize: 11 }}>→ {pr} 투입 일수에 반영</span>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  const renderStep2 = () => (
    <>
      <div className="card-title">프로젝트 투입 일수 입력</div>
      <div className="card-sub">팀원별로 각 프로젝트에 투입한 일수를 입력하세요. 인원 탭을 눌러 전환합니다.</div>
      <div className="notice">
        <strong>📌 유의사항</strong><br />
        • 최소 입력 단위는 <strong>1일</strong>이며, 0.5일 단위 입력도 가능합니다<br />
        • 동일 날에 여러 프로젝트를 한 경우 <strong>중복 입력 가능</strong>합니다 (총합 &gt; 영업일도 허용)<br />
        • [세부 입력 ▼] 버튼을 눌러 프로젝트 하위의 세부 업무를 기록할 수 있습니다 (선택 사항)<br />
        • 세부 업무를 입력하면 합계가 해당 프로젝트 일수로 자동 반영됩니다
      </div>
      <div className="person-tab-bar">
        {persons.map((p, i) => (
          <button
            key={i}
            className={`person-tab${activePersonIdx === i ? " active" : ""}`}
            onClick={() => setActivePersonIdx(i)}
          >
            {p.name || `팀원 ${i + 1}`}
          </button>
        ))}
      </div>

      {activePerson && (
        <>
          <div className="proj-section">
            <div className="proj-section-title">
              자회사 / 관계사
              <span className="proj-badge sub">SUBSIDIARY</span>
            </div>
            <div className="proj-list">
              {SUBSIDIARY_PROJECTS.map((pr) => renderProjRow(pr, "sub"))}
            </div>
          </div>
          <div className="proj-section">
            <div className="proj-section-title">
              GCK 내부 업무
              <span className="proj-badge gck">INTERNAL</span>
            </div>
            <div className="proj-list">
              {GCK_PROJECTS.map((pr) => renderProjRow(pr, "gck"))}
            </div>
          </div>
          <div style={{ background: "#f8fafc", borderRadius: 8, padding: "12px 16px", fontSize: 13, color: "#475569" }}>
            총 투입 일수 합계: <strong style={{ fontFamily: "DM Mono, monospace", color: "#0f1923" }}>
              {ALL_PROJECTS.reduce((s, pr) => s + Number(projDays[activePerson.name]?.[pr] || 0), 0)} 일
            </strong>
          </div>
        </>
      )}
    </>
  );

  const renderStep3 = () => (
    <>
      <div className="card-title">중간 검산 확인</div>
      <div className="card-sub">최종 산정 전, 각 팀원의 계산 중간값을 검토하세요. 수정이 필요하면 이전 단계로 돌아가세요.</div>
      <div className="verify-grid">
        {personStats.map((p) => (
          <div className="verify-card" key={p.name}>
            <div className="verify-card-name">{p.name} <span style={{ fontSize: 11, color: "#94a3b8", fontWeight: 400 }}>{p.role}</span></div>
            <div className="verify-row"><span className="label">영업일</span><span className="val">{bizDays}일</span></div>
            <div className="verify-row"><span className="label">연차 소진</span><span className="val">{p.leave}일</span></div>
            <div className="verify-row"><span className="label">실 근무일</span><span className="val">{p.workDays}일</span></div>
            <div className="verify-row"><span className="label">월간 mm</span><span className="val" style={{ color: "#2563eb" }}>{fmt(p.mm)}</span></div>
            <hr className="verify-divider" />
            <div style={{ fontSize: 11, color: "#94a3b8", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.5px" }}>프로젝트 별 투입 mm</div>
            {ALL_PROJECTS.filter((pr) => p.projMM[pr] > 0).map((pr) => (
              <div className="verify-proj" key={pr}>
                <span className="pname">{pr}</span>
                <span className="pval">{fmt(p.projMM[pr])}</span>
              </div>
            ))}
            {ALL_PROJECTS.every((pr) => !p.projMM[pr]) && (
              <div style={{ fontSize: 12, color: "#94a3b8" }}>투입 프로젝트 없음</div>
            )}
            <hr className="verify-divider" />
            <div className="verify-row">
              <span className="label">자회사 소계</span>
              <span className="val" style={{ color: "#2563eb" }}>{fmt(p.subTotal)}</span>
            </div>
            <div className="verify-row">
              <span className="label">GCK 소계</span>
              <span className="val" style={{ color: "#059669" }}>{fmt(p.gckTotal)}</span>
            </div>
            <div className="verify-row">
              <span className="label">총합 mm</span>
              <span className="val">{fmt(p.subTotal + p.gckTotal)}</span>
            </div>
          </div>
        ))}
      </div>
    </>
  );

  const renderStep4 = () => {
    const totalMM = personStats.reduce((s, p) => s + p.mm, 0);
    const totalSubMM = personStats.reduce((s, p) => s + p.subTotal, 0);
    const subByProj = SUBSIDIARY_PROJECTS.reduce((acc, pr) => {
      acc[pr] = personStats.reduce((s, p) => s + p.projMM[pr], 0);
      return acc;
    }, {});

    // Sort by role for grouping
    const sorted = [...personStats].sort((a, b) => a.role.localeCompare(b.role, "ko"));

    // Compute rowSpan per person (keyed by name): first of group gets span, rest get 0
    const roleSpanMap = {};
    let ri = 0;
    while (ri < sorted.length) {
      const role = sorted[ri].role;
      let rj = ri;
      while (rj < sorted.length && sorted[rj].role === role) rj++;
      const span = rj - ri;
      roleSpanMap[sorted[ri].name] = span;
      for (let k = ri + 1; k < rj; k++) roleSpanMap[sorted[k].name] = 0;
      ri = rj;
    }

    // 세부 입력이 하나라도 있는 인원만 필터
    const personsWithDetail = personStats.filter((p) => {
      const sub = projSubItems[p.name] || {};
      return ALL_PROJECTS.some((pr) => (sub[pr]?.length || 0) > 0);
    });

    return (
      <>
        <div className="card-title">최종 리소스 산정 결과</div>
        <div className="card-sub">{year}년 {month}월 · 영업일 {bizDays}일 · 총 {persons.length}명</div>

        <div className="final-meta">
          <div className="meta-box">
            <div className="mlabel">총 팀 리소스</div>
            <div className="mval">{fmt(totalMM)}</div>
            <div className="msub">전체 인원 월간 mm 합계</div>
          </div>
          <div className="meta-box slate">
            <div className="mlabel">자회사 투입 리소스</div>
            <div className="mval">{fmt(totalSubMM)}</div>
            <div className="msub">자회사/관계사 총 mm</div>
          </div>
          <div className="meta-box gray">
            <div className="mlabel">자회사 리소스 비중</div>
            <div className="mval">{totalMM > 0 ? ((totalSubMM / totalMM) * 100).toFixed(1) : "0.0"}%</div>
            <div className="msub">전체 대비 자회사 비중</div>
          </div>
        </div>

        <div className="final-wrap">
          <table className="final-table">
            <thead>
              <tr>
                <th rowSpan={2} style={{ width: 64 }}>직군</th>
                <th rowSpan={2} style={{ textAlign: "left", width: 100 }}>이름</th>
                <th rowSpan={2}>자회사<br/>총 투입 mm</th>
                <th colSpan={SUBSIDIARY_PROJECTS.length} className="sub-group">자회사 / 관계사</th>
                <th colSpan={GCK_PROJECTS.length} className="gck-group">GCK 내부</th>
                <th colSpan={3} className="meta-group">월 리소스</th>
              </tr>
              <tr>
                {SUBSIDIARY_PROJECTS.map((pr) => <th key={pr} className="sub-header">{pr}</th>)}
                {GCK_PROJECTS.map((pr) => <th key={pr} className="gck-header">{pr}</th>)}
                <th className="meta-header">월간 mm</th>
                <th className="meta-header">실근무일</th>
                <th className="meta-header">연차</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((p, i) => {
                const span = roleSpanMap[p.name];
                const isGroupStart = i > 0 && sorted[i - 1].role !== p.role;
                return (
                  <tr key={p.name} className={isGroupStart ? "role-group-start" : ""}>
                    {span > 0 && (
                      <td className="role-cell" rowSpan={span}>{p.role}</td>
                    )}
                    <td className="name-cell">{p.name}</td>
                    <td className="total-cell">{fmt(p.subTotal)}</td>
                    {SUBSIDIARY_PROJECTS.map((pr) => (
                      <td key={pr} className={`sub-cell${p.projMM[pr] > 0 ? "" : " zero"}`}>
                        {p.projMM[pr] > 0 ? fmt(p.projMM[pr]) : "—"}
                      </td>
                    ))}
                    {GCK_PROJECTS.map((pr) => (
                      <td key={pr} className={`gck-cell${p.projMM[pr] > 0 ? "" : " zero"}`}>
                        {p.projMM[pr] > 0 ? fmt(p.projMM[pr]) : "—"}
                      </td>
                    ))}
                    <td className="meta-mm">{fmt(p.mm)}</td>
                    <td className="meta-cell">{p.workDays}</td>
                    <td className="meta-cell">{p.leave}</td>
                  </tr>
                );
              })}
              <tr className="sum-row">
                <td className="role-cell">—</td>
                <td className="name-cell">합계</td>
                <td className="total-cell">{fmt(personStats.reduce((s, p) => s + p.subTotal, 0))}</td>
                {SUBSIDIARY_PROJECTS.map((pr) => (
                  <td key={pr} className="sub-cell">{fmt(subByProj[pr])}</td>
                ))}
                {GCK_PROJECTS.map((pr) => (
                  <td key={pr} className="gck-cell">{fmt(personStats.reduce((s, p) => s + p.projMM[pr], 0))}</td>
                ))}
                <td className="meta-mm">{fmt(totalMM)}</td>
                <td className="meta-cell">—</td>
                <td className="meta-cell">—</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* ── 세부 업무 상세 패널 ── */}
        {personsWithDetail.length > 0 && (
          <DetailPanel
            personsWithDetail={personsWithDetail}
            projSubItems={projSubItems}
            fmt={fmt}
          />
        )}

        <div className="export-row">
          <button className="btn btn-primary" onClick={exportCSV}>↓ CSV 다운로드</button>
          <button className="btn btn-secondary" onClick={() => setStep(0)}>처음부터 다시</button>
        </div>
      </>
    );
  };

  const renderContent = () => {
    switch (step) {
      case 0: return renderStep0();
      case 1: return renderStep1();
      case 2: return renderStep2();
      case 3: return renderStep3();
      case 4: return renderStep4();
      default: return null;
    }
  };

  return (
    <>
      <style>{css}</style>
      <div className="app">
        <div className="header">
          <div>
            <div className="header-logo">GVC</div>
            <div className="header-title">월간 리소스 산정 도구</div>
          </div>
          <div className="header-sub">Man-Month Calculator · v1.0</div>
        </div>

        <div className="stepper">
          {STEPS.map((s, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", flex: 1 }}>
              <div className={`step${i === step ? " active" : i < step ? " done" : ""}`}>
                <div className="step-dot">{i < step ? "✓" : i + 1}</div>
                <span style={{ display: window.innerWidth < 600 ? "none" : "block" }}>{s}</span>
              </div>
              {i < STEPS.length - 1 && <div className={`step-line${i < step ? " done" : ""}`} />}
            </div>
          ))}
        </div>

        <div className="card">
          {renderContent()}
          {step < 4 && (
            <div className="nav-row">
              {step > 0 && (
                <button className="btn btn-secondary" onClick={() => setStep((s) => s - 1)}>← 이전</button>
              )}
              <button
                className="btn btn-primary"
                onClick={() => setStep((s) => s + 1)}
                disabled={!canAdvance()}
              >
                {step === 3 ? "최종 결과 보기 →" : "다음 →"}
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

// ─── Detail Panel (세부 업무 내역) ────────────────────────────────────────────
function DetailPanel({ personsWithDetail, projSubItems, fmt }) {
  const [openMap, setOpenMap] = useState({});

  const toggle = (name) => setOpenMap((m) => ({ ...m, [name]: !m[name] }));

  return (
    <div className="detail-section">
      <div className="detail-section-title">
        세부 업무 내역
        <span className="detail-section-badge">세부 입력이 있는 인원만 표시</span>
      </div>
      <div className="detail-person-list">
        {personsWithDetail.map((p) => {
          const sub = projSubItems[p.name] || {};
          const isOpen = !!openMap[p.name];
          const projsWithSub = ALL_PROJECTS.filter((pr) => (sub[pr]?.length || 0) > 0);
          const totalSubTasks = projsWithSub.reduce((s, pr) => s + sub[pr].length, 0);

          return (
            <div key={p.name} className="detail-person-panel">
              <div className="detail-person-header" onClick={() => toggle(p.name)}>
                <span className="detail-person-name">{p.name}</span>
                <span className="detail-person-role">{p.role}</span>
                <span className="detail-person-count">
                  {projsWithSub.length}개 프로젝트 · 세부 업무 {totalSubTasks}건
                </span>
                <span className={`detail-chevron${isOpen ? " open" : ""}`}>▼</span>
              </div>

              {isOpen && (
                <div className="detail-person-body">
                  {projsWithSub.map((pr) => {
                    const items = sub[pr] || [];
                    const isSub = SUBSIDIARY_PROJECTS.includes(pr);
                    return (
                      <div key={pr} className="detail-proj-block">
                        <div className="detail-proj-label">
                          {pr}
                          <span className="detail-proj-mm">{fmt(p.projMM[pr])} mm</span>
                          <span style={{ fontSize: 10, color: "#94a3b8", fontWeight: 400, textTransform: "none", letterSpacing: 0 }}>
                            {isSub ? "자회사/관계사" : "GCK 내부"}
                          </span>
                        </div>
                        <table className="detail-sub-table">
                          <tbody>
                            {items.map((it, idx) => (
                              <tr key={it.id}>
                                <td>
                                  <span className="detail-sub-idx">{idx + 1}</span>
                                  {it.label || <span style={{ color: "#cbd5e1" }}>업무명 미입력</span>}
                                </td>
                                <td>{Number(it.days || 0)}일</td>
                              </tr>
                            ))}
                            <tr style={{ background: "#f8fafc" }}>
                              <td style={{ color: "#475569", fontWeight: 600, paddingLeft: 14 }}>합계</td>
                              <td style={{ color: "#1d4ed8", fontWeight: 700 }}>
                                {items.reduce((s, it) => s + Number(it.days || 0), 0)}일
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
