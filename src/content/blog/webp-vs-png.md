---
title: WebP vs PNG - 웹 성능의 한계를 돌파하는 이미지 최적화 전략
pubDate: 2026-04-26
tags: [웹, 최적화, 퍼포먼스]
author: 이호석
description: "WebP는 단순한 포맷이 아니라 웹 성능의 혁명이다. PNG 대비 30% 이상의 용량 절감 효과부터 실무 배포 자동화까지, 현대 웹 개발자가 알아야 할 모든 것을 담았다."
---

웹사이트의 로딩 속도는 이제 단순한 사용자 편의를 넘어, 구글 검색 순위(SEO)와 직결되는 생존의 문제가 되었다. 사용자는 3초 이상 로딩되는 사이트를 기다려주지 않는다. 그리고 웹사이트 무게의 대부분을 차지하는 것은 다름 아닌 '이미지'다. 오늘은 내가 수동으로 이미지를 관리하던 시절을 지나, **WebP** 라는 강력한 무기를 통해 웹 성능의 신세계를 경험했던 이야기를 해보려 한다.

![Web Performance Image Optimization](https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=1000&auto=format&fit=crop)

### 1. 실전 경험: 포트폴리오 사이트의 '다이어트' 대작전

몇 년 전, 제 개인 포트폴리오 사이트를 구축했을 때의 일이다. 고화질 프로젝트 캡처본을 잔뜩 올렸더니 페이지 용량이 15MB를 훌쩍 넘어가 버렸다. 기가비트 광랜에서는 문제없었지만, 모바일 환경에서는 이미지가 한 줄씩 뜨는 게 눈에 보일 정도였다. 구글 Lighthouse 점수는 처참한 빨간색이었고 말이다.

그때 처음으로 모든 PNG 이미지를 WebP로 변환해 보았다. 결과는 충격적이었다. 화질 차이는 눈을 씻고 봐도 찾기 힘든데, 전체 페이지 용량이 3MB로 줄어들었기 때문이다. **약 80%의 용량이 증발**한 것이다. Lighthouse 점수는 단숨에 초록색 90점대 위로 뛰어올랐고, 모바일에서의 체감 속도는 비교할 수 없을 만큼 빨라졌다. 그때 깨달았다. 웹 이미지의 표준은 이미 바뀌었다는 것을 말이다.

### 2. WebP가 강력한 이유: 손실과 무손실의 완벽한 조화

WebP는 구글이 개발한 포맷으로, 기존 JPEG의 손실 압축과 PNG의 무손실 압축(및 투명도 지원) 장점을 모두 흡수했다. 동일 화질 대비 **PNG보다 약 26%**, **JPEG보다는 최대 34%** 더 작다.

특히 WebP는 '예측 부호화(Predictive Coding)' 기술을 사용한다. 인접한 픽셀의 데이터를 바탕으로 다음 픽셀의 값을 예측하여 그 차이만 저장하는 방식이다. 이 덕분에 복잡한 색상이 섞인 이미지에서도 디테일을 잃지 않으면서 용량만 쏙 빼낼 수 있는 것이다.

### 3. 하위 호환성 고민? 이제는 옛말입니다

"아직도 IE를 쓰는 사용자가 있으면 어떡하죠?"라는 질문은 이제 은퇴할 때가 되었다. 현재 전 세계 브라우저의 95% 이상이 WebP를 지원한다. 만약 아주 드문 확률로 존재하는 구형 브라우저 사용자까지 챙겨야 한다면, HTML의 `<picture>` 태그가 완벽한 해결책을 제시한다.

```html
<!-- 지능적인 이미지 포맷 서빙 -->
<picture>
  <!-- 1순위: 지원한다면 가장 가벼운 WebP를 보여줌 -->
  <source srcset="/assets/images/hero.webp" type="image/webp">
  
  <!-- 2순위: 지원하지 않는 경우를 위한 PNG 폴백 -->
  <source srcset="/assets/images/hero.png" type="image/png">
  
  <!-- 기본 이미지 태그: 접근성과 레이지 로딩 설정 -->
  <img src="/assets/images/hero.png" 
       alt="고해상도 서비스 히어로 이미지" 
       loading="lazy" 
       width="800" 
       height="600">
</picture>
```

### 4. 배포 자동화: `sharp` 라이브러리로 끝내기

실무에서 수백 장의 이미지를 일일이 변환하는 것은 불가능하다. 나는 빌드 단계에서 Node.js의 `sharp` 라이브러리를 사용해 모든 이미지를 WebP로 자동 변환하는 파이프라인을 구축해 둔다.

```javascript
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const imgDir = './src/assets/raw-images';

// 디렉토리를 순회하며 PNG를 찾으면 즉시 WebP로 변환
fs.readdirSync(imgDir).forEach(file => {
  if (path.extname(file).toLowerCase() === '.png') {
    const inputPath = path.join(imgDir, file);
    const outputPath = path.join('./public/images', file.replace('.png', '.webp'));

    sharp(inputPath)
      .webp({ quality: 80 }) // 80% 품질이 용량 대비 만족도가 가장 높습니다
      .toFile(outputPath)
      .then(info => console.log(`${file} 변환 완료! (Size: ${info.size} bytes)`))
      .catch(err => console.error(`에러 발생: ${err}`));
  }
});
```

### 나가는 글: 성능이 곧 경험입니다

이미지 최적화는 단순히 용량을 줄이는 작업이 아니라, 사용자의 소중한 데이터와 시간을 아껴주는 '**배려의 기술**'이다. 

> "웹은 더 이상 기다리는 곳이 아니라 흐르는 곳이어야 한다. 지금 바로 WebP를 도입해 여러분의 웹사이트에 생동감을 불어넣어 보자."
