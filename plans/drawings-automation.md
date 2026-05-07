# Implementation Plan - Drawings Image Automation and Layout Improvement

`assets/images/drawings/` 폴더의 이미지들을 `drawings` 페이지에 자동으로 노출하고, 정사각 썸네일 형태의 그리드 레이아웃을 적용합니다.

## Proposed Changes

### 1. Data Generation (`_drawings/`)
- `assets/images/drawings/`에 있는 18개의 이미지 파일명을 분석하여 각각의 MD 파일을 `_drawings/` 폴더에 생성합니다.
- 파일명 형식(`YYMMDD.jpg`)에서 날짜를 추출하여 Front Matter에 저장합니다.
- 예시: `210217.jpg` -> `_drawings/210217.md`
  ```yaml
  ---
  title: "2021.02.17"
  date: 2021-02-17
  image: "/assets/images/drawings/210217.jpg"
  ---
  ```

### 2. Layout Update (`drawings.html`)
- 현재의 루프 구조를 `main.scss`에 정의된 `.thumbnail-img` 클래스 구조에 맞게 수정합니다.
- 이미지를 정사각 박스로 감싸서 일관된 비율을 유지하도록 합니다.
- 리스트에서는 텍스트 정보를 숨기거나 이미지만 강조하고, 상세 정보는 라이트박스에서만 보이도록 조정합니다.

### 3. CSS Refinement (`assets/css/main.scss`)
- `info-overlay` 스타일이 누락되어 있다면 추가하여, 마우스 호버 시에만 날짜 정보가 살짝 보이도록 개선합니다.

## Verification Plan

### Automated Tests
- Jekyll 빌드 테스트: `bundle exec jekyll build` 명령을 통해 모든 MD 파일이 정상적으로 처리되는지 확인합니다.

### Manual Verification
- `drawings` 페이지 접속:
  - 18개의 이미지가 모두 그리드 형태로 노출되는지 확인.
  - 모든 썸네일이 정사각 비율을 유지하는지 확인.
  - 클릭 시 라이트박스가 정상적으로 뜨고 해당 이미지의 날짜가 맞게 표시되는지 확인.
