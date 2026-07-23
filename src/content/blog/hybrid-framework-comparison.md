---
title: "모바일 개발의 선택지 - KMP, Flutter, React Native 무엇을 쓸까?"
pubDate: 2026-05-22
tags: [KMP, Flutter, React-Native, 모바일, 개발]
author: 이호석
description: "KMP + Compose Multiplatform, Flutter, React Native 세 가지 모바일 프레임워크를 경험에 비추어 상세히 비교한다. 각 도구의 성격과 언제 무엇을 선택해야 할지 가이드를 제시한다."
---

예전에는 모바일 앱을 만든다고 하면 iOS는 Swift, 안드로이드는 Kotlin으로 각각 만드는 '네이티브 개발'이 정석이었다. 하지만 지금은 상황이 많이 다르다. 생산성, 유지보수 비용, 그리고 개발자 수급 등의 이유로 하이브리드(또는 크로스 플랫폼) 솔루션은 이제 선택이 아닌 필수가 되어가고 있다.

최근 몇 년간 Flutter와 React Native가 시장을 양분해 왔다면, 이제는 **KMP**(Kotlin Multiplatform)와 **CMP**(Compose Multiplatform)라는 강력한 도전자까지 등장했다. 이 세 가지를 모두 써보면서 느낀 점과 각각의 특징을 정리해 보려 한다.

![Modern workspace with multiple screens](https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=1280&auto=format&fit=crop)

### 1. React Native: 웹 개발자의 가장 강력한 무기

React Native(RN)는 "Learn once, write anywhere"라는 슬로건 아래 자바스크립트 생태계를 모바일로 끌어왔다.

#### 특징과 경험
RN의 가장 큰 장점은 역시 **생태계**다. 웹에서 쓰던 로직, 라이브러리(특히 TanStack Query나 Redux 등)를 거의 그대로 가져올 수 있다. 또한 **CodePush**를 통한 OTA(Over-the-Air) 업데이트는 버그 수정이나 간단한 기능 업데이트를 앱스토어 심사 없이 바로 적용할 수 있게 해주는 RN만의 필살기다.

하지만 네이티브 브릿지를 거쳐야 하는 구조적 한계 때문에 복잡한 애니메이션이나 고성능이 필요한 작업에서는 여전히 까다로운 최적화가 필요하다. 최근 New Architecture(Fabric, TurboModules)로 이 문제를 해결하려 하고 있지만, 설정 난이도가 만만치 않다.

```jsx
import React, {useState} from 'react';
import {View, Text, Button, StyleSheet} from 'react-native';

const Counter = () => {
  const [count, setCount] = useState(0);

  return (
    <View style={styles.container}>
      <Text>현재 카운트: {count}</Text>
      <Button title="증가" onPress={() => setCount(count + 1)} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' }
});
```
<p class="post-content-comment">코드 예시 - React Native의 선언적 UI 구조</p>

### 2. Flutter: UI의 일관성과 퍼포먼스의 조화

구글이 만든 Flutter는 네이티브 위젯을 빌려 쓰는 게 아니라, 캔버스 위에 직접 UI를 그리는 방식이다.

#### 특징과 경험
Flutter를 쓰면서 가장 감탄했던 부분은 **UI의 완벽한 통제권**이다. iOS든 안드로이드든, 심지어 웹이나 데스크탑에서도 픽셀 단위로 똑같은 UI를 보장한다. Skia(최근엔 Impeller) 엔진 덕분에 애니메이션이 매우 부드럽고, Dart 언어의 Hot Reload는 개발 경험을 극도로 끌어올려 준다.

다만, 네이티브 기능을 깊게 써야 할 때(예: 특정 하드웨어 제어)는 여전히 플랫폼 채널을 통해 Swift나 Kotlin 코드를 직접 짜야 하며, Dart라는 새로운 언어에 익숙해져야 한다는 진입장벽이 있다.

```dart
import 'package:flutter/material.dart';

class CounterApp extends StatefulWidget {
  @override
  _CounterAppState createState() => _CounterAppState();
}

class _CounterAppState extends State<CounterApp> {
  int _count = 0;

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Text('현재 카운트: $_count'),
          ElevatedButton(
            onPressed: () => setState(() => _count++),
            child: Text('증가'),
          ),
        ],
      ),
    );
  }
}
```
<p class="post-content-comment">코드 예시 - Flutter의 위젯 기반 상태 관리</p>

### 3. KMP + CMP: 네이티브의 성능에 효율을 더하다

최근 가장 핫한 조합이다. 로직은 Kotlin으로 공유(KMP)하고, UI까지 Jetpack Compose 방식(CMP)으로 공유한다.

#### 특징과 경험
KMP의 핵심은 "**전부가 아니어도 된다**"는 점이다. RN이나 Flutter처럼 프로젝트 전체를 프레임워크에 맡기는 게 아니라, 필요한 비즈니스 로직(네트워킹, DB, 모델)만 Kotlin으로 짜서 iOS와 안드로이드에서 공유하고 UI는 각자 네이티브로 짤 수도 있다. 

CMP까지 더해지면 UI 로직까지 공유되는데, 이는 안드로이드 개발자들에게 엄청난 축복이다. 안드로이드에서 쓰던 Compose 지식을 그대로 iOS 앱 개발에 쓸 수 있기 때문이다. 성능 또한 네이티브 수준에 가장 근접하며, 플랫폼별 최적화가 필요할 때 가장 유연하게 대처할 수 있다.

```kotlin
@Composable
fun App() {
    var count by remember { mutableStateOf(0) }
    
    MaterialTheme {
        Column(
            modifier = Modifier.fillMaxSize(),
            verticalArrangement = Arrangement.Center,
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Text("현재 카운트: $count")
            Button(onClick = { count++ }) {
                Text("증가")
            }
        }
    }
}
```
<p class="post-content-comment">코드 예시 - Compose Multiplatform을 이용한 UI 로직 공유</p>

### 그래서 무엇을 선택해야 할까?

실무에서 여러 프로젝트를 겪어보며 내린 나름의 기준은 다음과 같다.

1.  **이미 웹 개발 인력이 많고 빠른 업데이트가 중요하다면?** → **React Native**. CodePush의 매력은 생각보다 강력하다.
2.  **디자인의 일관성이 절대적이고, 화려한 애니메이션이 필요하다면?** → **Flutter**. 생산성 면에서는 여전히 독보적이다.
3.  **네이티브 성능을 포기할 수 없고, Kotlin에 익숙한 팀이라면?** → **KMP + CMP**. 특히 기존 안드로이드 앱을 iOS로 확장할 때 최고의 선택지다.

결국 도구는 도구일 뿐이다. 프로젝트의 성격과 팀의 구성에 맞는 기술을 선택하는 안목이 더 중요하다. 

> "상황에 맞는 최선의 도구를 선택하는 것, 그것이 바로 시니어 개발자로 가는 첫걸음이다."
