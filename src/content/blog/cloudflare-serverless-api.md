---
title: "서버 구축 없이 만드는 앱 백엔드: Cloudflare Workers와 KV로 서버리스 API 구축하기"
pubDate: 2026-06-11 15:40
tags: [Cloudflare, Serverless, API, Workers, KV, Backend, 개발]
author: 이호석
description: "앱 개발의 필수 요소인 API 서버, 이제는 비싼 서버 비용과 복잡한 인프라 관리 없이 구축할 수 있다. Cloudflare Workers와 KV를 활용해 효율적인 서버리스 백엔드를 만드는 방법을 공유한다."
---

앱 하나를 만들어서 스토어에 올리는 것까진 즐거운 일이다. 하지만 실제 서비스를 운영하다 보면 금세 벽에 부딪힌다. 앱 내부에 고정해둔 공지사항 문구를 바꾸고 싶을 때, 갑자기 서버 점검을 해야 할 때, 혹은 유동적으로 데이터를 내려줘야 할 때마다 앱을 매번 업데이트해서 심사를 받을 순 없기 때문이다.

결국 우리에겐 **API 서버** 가 필요하다. 하지만 고작 설정값 몇 개 내려받자고 AWS EC2를 띄우고, 데이터베이스를 설정하고, 보안 그룹을 맞추고... 이런 일련의 과정들은 배보다 배꼽이 더 커지는 느낌을 준다. 관리 포인트가 늘어나는 것은 물론이고, 매달 나가는 고정 비용도 무시할 수 없다. 이 고민을 단번에 해결해줄 수 있는 도구가 바로 **Cloudflare Workers** 와 **KV** 조합이다. 

![Cloudflare Workers and Edge Computing Concept](https://images.unsplash.com/photo-1587440871875-191322ee64b0?q=80&w=1280&auto=format&fit=crop!!ar=2.5:1)

### 1. 왜 로컬 데이터만으로는 부족한가?

처음 앱을 만들 때는 모든 데이터를 `json` 이나 내부 상수로 관리해도 문제가 없어 보인다. 하지만 서비스가 살아 움직이기 시작하면 상황이 달라진다. 내가 직접 여러 앱을 런칭하며 겪었던 사례들을 공유한다.

*   **공지사항 및 긴급 팝업**: 서버 점검이나 치명적인 버그(aka 크래시) 알림 노출이 필요한데 팝업에서 하드코딩 텍스트를 바라보는 중이라면? 다음 심사가 끝날 때까지 유저는 영문도 모른 채 버그와 마주해야 한다. 심지어 애플의 심사 기간이 주말과 겹치기라도 하면 꼼짝없이 며칠을 날릴 수 밖에.
*   **앱 버전 관리**: 특정 버전 이하의 유저에게 업데이트를 강제하거나 안내해야 할 때, 서버의 응답 값은 필수적이다. "이 버전은 더 이상 지원하지 않으니 업데이트가 필요합니다"라는 메시지를 띄우는 것만으로도 구버전 대응에 들어가는 리소스의 절반이 줄어든다.
*   **유동적인 콘텐츠**: 이벤트 배너 이미지 주소, 오늘의 추천 문구, 혹은 간단한 기능 온/오프(Feature Flag) 등 매일 바뀌는 데이터들을 앱 업데이트 없이 교체하고 싶을 때 API는 빛을 발한다.

이런 가벼운(?) 목적을 위해 거대한 백엔드 아키텍처를 도입하는 건 명백한 리소스의 낭비다. 우리는 더 스마트하고 가성비 좋은 방법이 필요하다.

### 2. 전통적인 서버 구축이 꺼려지는 이유: 비용과 관리의 늪

백엔드 개발자가 아니라면 서버 구축은 공포 그 자체다. 리눅스 환경 설정부터 시작해 도커(Docker), Nginx, SSL 인증서 갱신까지 신경 쓸 게 한두 가지가 아니다. 특히 보안 설정 하나 잘못해서 DB가 털리거나 AWS 요금 폭탄을 맞지는 않을까 하는 불안감은 사이드 프로젝트의 의욕을 꺾기 충분하다.

무엇보다 **비용**이 문제다. 최소 사양의 인스턴스를 하나 띄우더라도 매달 커피 몇 잔 값은 고정적으로 나간다. 트래픽이 거의 없는 초기 단계에서는 이조차 아깝다. 

그렇다고 무료 티어를 제공하는 PaaS(Platform as a Service)를 쓰자니 **Cold Start**라는 복병이 기다린다. 한동안 요청이 없다가 들어오면 서버가 잠에서 깨어나는 데 수 초가 걸리는 현상이다. 유저는 앱을 켰는데 로딩 스피너만 한참 보고 있게 된다. Cloudflare Workers는 V8 엔진의 아이솔레이트(Isolate) 기술을 사용하여 사실상 콜드 스타트가 없다. 전 세계 전역에 퍼져 있는 클라우드플레어의 엣지 노드에서 즉시 실행되기에 사용자 경험 면에서 압도적이다.

### 3. Cloudflare KV: 초간단 서버리스 데이터베이스

Workers가 연산(로직)을 담당한다면, 데이터를 저장할 공간도 필요하다. 여기서 **KV(Key-Value Pairs)** 가 등장한다. 복잡한 SQL 쿼리나 조인(Join)은 필요 없다. 말 그대로 '키(Key)'를 던지면 '값(Value)'을 주는 단순한 저장소다.

#### 사용 사례: 고정된 응답값 세팅 (Static Config)
가장 쉬운 활용법은 앱의 초기 설정값(Remote Config)을 저장하는 것이다. 예를 들어 `app_config` 라는 키에 JSON 데이터를 넣어두고, 앱이 켜질 때마다 이 값을 읽어오게 만든다.

*   `app_config` : `{"notice": "서버 점검 중입니다", "version": "1.2.0", "theme": "dark"}`

이렇게 세팅해두면 클라우드플레어 대시보드에서 JSON 값만 수정하는 것으로 앱의 상태를 실시간으로 제어할 수 있다. 코드를 다시 작성하거나 배포할 필요도 없이 즉시 반영된다.

### 4. 고급 활용: API 브릿지 및 프록시 패턴

단순히 값을 저장하는 것을 넘어, 외부 API를 효율적으로 관리하는 **브릿지(Bridge)** 역할을 할 때 Cloudflare Workers의 진가가 드러난다. 

많은 앱이 날씨, 환율, 혹은 공공데이터 API를 가져다 쓴다. 그런데 이런 외부 API들은 호출 횟수 제한(Rate Limit)이 있거나, 응답 속도가 현저히 느린 경우가 많다. 심지어 호출 한 번에 비용이 발생하는 유료 API라면 문제는 더 심각해진다. 수만 명의 유저가 동시에 외부 API를 직접 바라보게 하면 비용 폭탄을 맞거나 서비스가 차단될 수 있다.

이때 Workers와 KV를 이용해 중간 계층을 만든다.
1.  유저는 내 Cloudflare Workers 엔드포인트를 호출한다.
2.  Workers는 먼저 KV에 저장된 **최근 응답값**이 있는지 확인한다.
3.  만약 값이 있고 유효하다면 외부 API를 부르지 않고 KV의 값을 즉시 반환한다. (**캐싱 효과**)
4.  값이 없거나 오래되었다면 Workers가 직접 외부 API를 호출해 결과를 가져오고, 이를 KV에 업데이트한 뒤 유저에게 전달한다.

이 방식을 쓰면 **트래픽 효율**이 극대화된다. 유저는 전 세계에 퍼져 있는 클라우드플레어 노드에서 데이터를 받으므로 매우 빠르고, 정작 원본 API 서버는 내 Workers가 주기적으로 한 번씩만 호출하므로 부하가 거의 없다. 일종의 '나만의 마이크로 CDN'을 만드는 셈이다.

### 5. 보안과 환경 변수 관리

API를 만들다 보면 외부 API Key나 데이터베이스 비밀번호 같은 민감한 정보를 다뤄야 할 때가 있다. 이걸 코드에 그대로 노출하는 건 보안상 매우 위험하다. Cloudflare Workers는 `Secrets` 라는 기능을 통해 이러한 민감한 정보를 안전하게 관리할 수 있게 해준다.

`wrangler secret put API_KEY` 와 같은 명령어로 등록해두면, 실제 코드 내에서는 `env.API_KEY` 로 접근할 수 있다. 대시보드에서도 해당 값은 마스킹되어 보이지 않으므로 안심할 수 있다. 또한 특정 IP 대역에서만 접근 가능하게 하거나, 요청 헤더에 커스텀 인증 토큰이 있는지 체크하는 로직을 몇 줄만 추가해도 훌륭한 보안 레이어를 갖추게 된다.

### 6. 실전 코드: 서버리스 API 만들기

자, 이제 실제로 어떻게 구현하는지 코드를 살펴보자. `Wrangler` 를 이용해 아주 간단하게 작성할 수 있다.

```typescript
// Cloudflare Workers 샘플 코드 (TypeScript)
export interface Env {
  // KV 네임스페이스 바인딩 (Dashboard에서 설정)
  MY_APP_KV: KVNamespace;
  // 환경 변수 (Secrets로 설정)
  EXTERNAL_API_KEY: string;
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    
    // CORS 대응 (모바일 및 웹 서비스 대응을 위해 필수)
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, HEAD, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    };

    // Preflight 요청 처리
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    // 1. 공지사항 및 설정값 가져오기 (KV 활용)
    if (url.pathname === "/api/config") {
      const config = await env.MY_APP_KV.get("APP_CONFIG");
      return new Response(config || "{}", {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 2. 외부 API 브릿지 예시 (1시간 단위 캐싱 로직)
    if (url.pathname === "/api/external-data") {
      const cacheKey = "data_cache";
      let cachedData = await env.MY_APP_KV.get(cacheKey);

      if (!cachedData) {
        // KV에 캐시가 없으면 원본 API 호출
        const response = await fetch(`https://api.third-party.com/v1/data?key=${env.EXTERNAL_API_KEY}`);
        const data = await response.text();
        
        // KV에 3600초(1시간) 동안 저장 (expirationTtl)
        await env.MY_APP_KV.put(cacheKey, data, { expirationTtl: 3600 });
        cachedData = data;
      }

      return new Response(cachedData, {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response("Not Found", { status: 404, headers: corsHeaders });
  },
};
```

배포는 `wrangler deploy` 명령어 한 줄이면 충분하다. GitHub Action 등과 연동 시 사전에 세팅된 브랜치에 푸시하는 것만으로도 전 세계 엣지 노드에 내 API가 즉시 반영된다.

### 7. 운영의 묘미: 대시보드와 모니터링

Cloudflare Workers의 또 다른 장점은 강력한 관리 도구다. 코드를 수정하지 않고도 KV 대시보드에 들어가서 직접 키-값 쌍을 추가하거나 수정할 수 있다. 만약 비개발자 동료와 협업 중이라면, 특정 공지사항 문구를 수정하는 업무는 대시보드 접근 권한만 주어 직접 처리하게 할 수도 있다. 

또한 실시간 로그 모니터링(`wrangler tail`)을 통해 어떤 API가 많이 호출되는지, 어디서 예외가 발생하는지 실시간으로 추적 가능하다. 대역폭 사용량이나 요청 횟수도 그래프로 깔끔하게 보여주니 서버 관리의 스트레스가 거의 없다. 이 모든 게 하루 10만 건이라는 넉넉한 무료 범위 내에서 가능하다는 점이 가장 큰 매력이다.

### 8. 마치며: 고민할 시간에 일단 띄워보자

앱 개발에서 백엔드는 분명 넘기 힘든 산처럼 느껴질 수 있다. 하지만 처음부터 완벽하고 거대한 마이크로서비스 아키텍처를 꿈꿀 필요는 없다. 오히려 초기 단계일수록 작고 유연하게 시작하는 게 현명하다.

Cloudflare Workers와 KV는 그 시작을 위한 가장 강력한 무기다. 인프라 관리라는 귀찮고 어려운 일은 클라우드플레어에게 맡기고, 우리는 서비스의 본질과 유저가 느낄 실제 가치에만 집중하면 된다. 지금 당장 간단한 설정값을 내려주는 API 엔드포인트부터 하나 만들어보자. 그 작은 시작이 당신의 앱 퀄리티를 한 단계 끌어올려 줄 것이다.

> "인프라 관리에 쏟을 에너지를 서비스의 본질과 사용자 경험에 집중하자. 도구는 이미 우리 손안에 준비되어 있다."
