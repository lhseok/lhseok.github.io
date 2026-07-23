export interface CareerProject {
  title: string;
  details: string[];
}

export interface CareerItem {
  company: string;
  period: string;
  role: string;
  position: string;
  projects: CareerProject[];
}

export const career: CareerItem[] = [
  {
    company: '더블유컨셉코리아',
    period: '2024.05 - 2026.06',
    role: 'iOS 앱 개발 및 유지보수',
    position: '매니저',
    projects: [
      {
        title: '쇼핑 AI 에이전트 인터랙션 개발',
        details: [
          'SSE 기반 실시간 통신 연동: 백엔드 스트리밍 API를 UI에 바인딩하여 AI의 타이핑 효과 및 실시간 상품 추천 리스트 구현',
          '사용자 경험(UX) 최적화: 대량의 실시간 데이터 유입 시에도 UI 프리징이 없는 효율적인 렌더링 파이프라인 설계',
          '인터페이스 설계: AI 에이전트의 상태에 따른 유기적인 인터랙션 및 컴포넌트 개발',
        ],
      },
      {
        title: 'W컨셉 앱 리뉴얼 및 신규 도메인 서비스 개발',
        details: [
          'AI 기반 개발 프로세스 도입(Claude Code)으로 파트 내 업무 효율성 제고',
          "숏폼 커머스 경험 강화: '스타일클립' 등 숏폼 서비스 내 정밀 로깅 및 재생 제어 로직 구현",
          '대규모 트래픽 대응: Netfunnel 대기열 도입을 통한 가용성 확보',
        ],
      },
    ],
  },
  {
    company: '무신사 에스엘디티',
    period: '2021.09 - 2024.04',
    role: 'iOS 앱 개발 및 프론트 서비스 총괄',
    position: '팀장',
    projects: [
      {
        title: '무신사 Soldout 앱 개발 및 유지보수',
        details: [
          '중고 거래 확장 비즈니스 로직 설계 및 성공적 런칭으로 매출 다각화 기여',
          '그로스 해킹 기반 구축: Appsflyer OneLink 및 Deferred DeepLink 연동 최적화',
          '성과 지표 객관화: Jira 포인트 기반의 생산성 지표 수립',
        ],
      },
    ],
  },
  {
    company: '블룸에이아이',
    period: '2020.01 - 2021.09',
    role: '신규 커머스 iOS 앱 개발 및 서비스 총괄',
    position: '팀장',
    projects: [
      {
        title: '신규 커머스 앱 Showa 개발 및 런칭',
        details: [
          '초기 아키텍처 설계부터 런칭, 유지보수 전 과정 주도',
          '출시 3개월 만에 DAU 10k 달성',
          '모바일 플랫폼 가이드 수립 및 배포 프로세스 표준화',
        ],
      },
    ],
  },
  {
    company: '위메프',
    period: '2013.07 - 2019.12',
    role: 'iOS 앱 개발 및 유지보수',
    position: '팀장',
    projects: [
      {
        title: '위메프 앱 개발 및 유지보수',
        details: [
          'DAU 200k 달성 및 시장 점유율 확장에 기여',
          'UIWebView에서 WKWebView로의 전면 마이그레이션 주도',
          'Non-ARC 레거시 코드를 ARC로 컨버팅하여 메모리 최적화',
        ],
      },
    ],
  },
  {
    company: '플러스엠엑스',
    period: '2012.12 - 2013.07',
    role: '신규 iOS 게임 앱 개발',
    position: '선임',
    projects: [
      {
        title: '드림나인 게임 앱 신규 런칭',
        details: [
          'Native API만을 활용한 고도화된 애니메이션 구현',
          '초기 카카오 게임 플랫폼 입점 및 인앱 결제 모듈 구축',
        ],
      },
    ],
  },
  {
    company: '해커스',
    period: '2011.05 - 2012.11',
    role: 'iOS 앱 개발 및 앱 서비스 총괄',
    position: '팀장',
    projects: [
      {
        title: '해커스 주요 교육 앱 라인업 구축',
        details: [
          '기초영문법, 텝스보카 등 주요 교재 연계 학습 앱 시리즈 런칭',
          '토익 타이머, 점수 환산 등 학습 최적화 UX 설계',
        ],
      },
    ],
  },
];
