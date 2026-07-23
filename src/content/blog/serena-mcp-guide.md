---
title: Claude Code 토큰이 항상 녹아내린다면? - Serena MCP로 실현하는 효율적인 코딩
pubDate: 2026-06-01
tags: [Claude Code, MCP, Serena, 개발, 생산성]
author: 이호석
description: "Claude Code는 강력하지만 토큰 소모가 극심하다. 이 글에서는 심볼 기반의 코드 분석으로 토큰을 획기적으로 절약해주는 Serena MCP의 정체와 활용법을 실무 중심으로 다룬다."
---

요즘 **`Claude Code`** 가 정말 핫하다. 터미널에서 명령 한 줄이면 파일 십여 개를 넘나들며 코드를 짜주니, 이보다 편할 수가 없다. 하지만 이 끝내주는 편리함 뒤에는 아주 고약한 함정이 하나 있다. 바로 **'토큰 한도(Rate Limit)'** 라는 벽이다.

![Empty wallet metaphor](https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?q=80&w=1280&auto=format&fit=crop!!ar=2.5:1)

### 1. "limit reached..." 의 그 당혹감

열심히 코딩에 몰입해서 한창 작업 중인데, 갑자기 터미널에 **`Rate Limit reached`** 혹은 비슷한 메시지가 뜨면서 Claude가 멈춰버리는 순간이 있다. 그럴 때면 정말 맥이 탁 풀린다. 작업 흐름이 끊겨버리는 그 불쾌함은 겪어본 사람만 안다. Claude Code에 너무 익숙해져 버린 나머지 리밋 걸렸을 때 reset 시간만을 기다린 적 있다 없다?

**`Claude Code`** 를 포함한 대부분의 CLI 방식 AI들은 상황 파악을 위해 프로젝트의 파일을 무식하게 읽어댄다. 내가 고치고 싶은 건 고작 5줄짜리 로직인데, Claude는 맥락을 본다며 수백 줄짜리 서비스 파일과 컨트롤러 파일을 통째로 컨텍스트 창에 때려 넣는다. 이렇게 몇 번만 주거니 받거니 하면? 당연히 할당된 토큰은 순식간에 바닥나고, 우리는 자연어를 남발했던 뒤늦은 후회를 하게 된다.

### 2. 수동 다이어트의 한계

물론 나름대로 아껴보려고 노력은 한다. 정확한 파일명을 적어주고, 라인을 찝어주고, 어디까지만 파악하라고 구구절절 지시를 내리기도 한다. 그러다 보면 내가 이러려고 AI 쓰나 싶다. 알아서 잘 해달라고 쓰는 건데, 토큰 아껴보겠다고 일일이 파악할 코드 범위를 정해주는 건 배보다 배꼽이 더 큰 격이다. 이럴 바엔 그냥 내가 직접 개발하고 말지.

그렇게 토큰 리밋과의 전쟁에서 지쳐갈 때쯤 우연히 알게 된 구세주가 바로 **`Serena MCP`** 다.

### 3. Serena MCP: 파일 전체가 아닌 '알맹이'만 쏙쏙

**`Serena`** 의 핵심은 아주 심플하면서도 명쾌하다. **"파일 전체를 읽지 말고, 딱 필요한 함수나 클래스만 뽑아서 전달하자"** 는 거다.

우리가 흔히 쓰는 IDE에서 '정의로 이동' 기능을 쓸 때처럼, Serena는 내부적으로 **`LSP (Language Server Protocol)`** 를 사용해서 코드 구조를 꿰뚫어 본다. Claude가 "A 로직 좀 봐줘" 라고 하면, Serena는 파일 전체를 던져주는 대신 딱 A 로직의 본문과 그게 참조하는 타입 정의들만 싹 골라내서 넘겨준다. 불필요한 임포트 구문이나 관련 없는 헬퍼 함수들은 쳐다보지도 않는다.

### 4. 실무자가 말하는 Serena의 진짜 무서운 점

여기서 중요한 건, 우리가 Claude에게 "Serena를 사용해서 분석해줘" 라고 구구절절 말할 필요가 없다는 점이다. Serena가 MCP 서버로 등록되어 있으면, Claude Code는 자기가 판단해서 **'아, 이건 Serena를 쓰는 게 효율적이겠네'** 싶을 때 알아서 호출한다.

예를 들어, "이 인터페이스를 구현한 모든 클래스에서 특정 메서드가 어떻게 동작하는지 분석해줘" 라고 요청했다고 치자.

**[일반적인 Claude의 삽질]**
1. 인터페이스 파일을 읽는다.
2. 프로젝트 전체를 **`grep`** 으로 뒤져서 구현체 후보들을 찾는다.
3. 찾은 파일 수십 개를 하나하나 열어서 확인한다. (여기서 토큰 리밋 발생)

**[Serena가 연동된 Claude]**
1. **`Using tool: serena_mcp_server...`** 라는 메시지가 뜨면서 Serena를 호출한다.
2. Serena가 LSP 통해 단 한 번에 구현체 목록과 해당 메서드 코드 조각만 Claude에게 전달한다.
3. Claude는 받은 '요약본' 만 보고 즉시 답변을 내놓는다.

이 과정이 사용자 입장에서는 그냥 Claude와 대화하는 것 같지만, 백그라운드에서는 Serena가 미친 듯이 효율적인 필터링을 해주고 있는 것이다.

### 5. 실전 코드 예시: 거대한 레거시 속에서 살아남기

수천 줄짜리 소스 코드 속에서 특정 비즈니스 흐름을 파악해야 할 때 Serena의 진가가 드러난다.

```typescript
// OrderService.ts (약 1,500줄 짜리 파일)
class OrderService {
    // ... 수십 개의 메서드 ...
    
    async processPayment(orderId: string) {
        const order = await this.repo.findById(orderId);
        return this.paymentModule.pay(order.amount);
    }
    
    // ... 수십 개의 메서드 ...
}
```

내가 "processPayment의 예외 처리 흐름을 알려줘" 라고 하면, Serena가 연동된 Claude는 1,500줄을 다 읽지 않는다.

- **`OrderService.processPayment`** 메서드 본문 (5줄)
- **`this.paymentModule.pay`** 가 정의된 인터페이스나 클래스의 메서드 정의 (10줄)
- 관련 **`Order`** 타입 정의 (5줄)

딱 이 정도만 읽고 답변을 준다. 1,500줄을 읽어야 할 상황을 단 **`20줄`** 로 압축해버리는 셈이다.

### 6. 설치

설치는 여전히 쉽다. **`uv`** 만 있다면 터미널에 아래 한 줄이면 끝이다.

```bash
claude mcp add serena -- uvx --from git+https://github.com/oraios/serena serena-mcp-server --context claude-code --project $(pwd)
```

### 7. 깨알 팁

1. **시각화**: Serena 실행 중에 브라우저로 **`http://localhost:24282/dashboard/`** 대시보드에 들어가 보면, Claude가 Serena를 통해 어떤 심볼들을 조회해 갔는지, 어떤 그래프 구조로 내 코드를 파악했는지 실시간으로 볼 수 있다. 
2. **대시보드 자동 실행 끄기**: Claude Code 실행할 때마다 Serena 대시보드가 매번 뜨는 게 싫다면, 설치 시 명령어나 설정 파일에서 **`--no-dashboard`** 플래그를 추가하면 된다. 이미 설치했다면 `claude mcp list` 로 경로를 확인한 뒤 아래와 같이 실행 옵션을 수정해주자.

```bash
# MCP 설정에 대시보드 비활성화 옵션 추가
claude mcp add serena -- uvx --from git+https://github.com/oraios/serena serena-mcp-server --context claude-code --project $(pwd) --no-dashboard
```

### 7. 마치며: 도구는 머리를 써서 써야 제맛

결국 AI 에이전트를 잘 쓴다는 건, AI에게 얼마나 좋은 정보를 효율적으로 떠먹여 주느냐의 싸움이다. 무작정 파일을 다 퍼준다고 똑똑해지는 게 아니다. 오히려 정보의 소음 때문에 더 헷갈려 하기만 한다.

Claude Code가 내 토큰을 야금야금 갉아먹는 게 무서웠다면, 혹은 툭하면 리밋 걸려서 작업 흐름이 끊기는 게 짜증 났다면 당장 Serena를 써보길 권한다. 내가 굳이 "Serena 써라" 라고 말 안 해도, 묵묵히 백그라운드에서 토큰을 아껴주는 기특한 조력자를 만나게 될 것이다.

> "AI가 똑똑해지는 건 모델 탓이 아니라, 우리가 건네주는 데이터의 밀도 덕분이다. Serena는 그 밀도를 만드는 가장 영리한 방법이다."
