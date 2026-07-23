---
title: "맥 터미널로 Flutter 개발 환경 구축하기 (M1/M2/Intel 공통)"
pubDate: 2026-05-23
tags: [Flutter, macOS, 개발환경, 가이드]
author: 이호석
description: "맥(macOS) 환경에서 터미널을 이용해 Flutter SDK를 설치하고, Android 및 iOS 개발을 위한 필수 도구들을 완벽하게 세팅하는 상세 가이드를 제공한다."
---

새로운 모바일 프로젝트를 시작하거나 기존 네이티브/KMP 구조에서 생산성을 위해 Flutter로 전환을 결심했다면, 가장 먼저 마주치는 관문이 바로 **개발 환경 구축**이다.

Flutter는 안드로이드와 iOS를 동시에 지원하는 만큼 설정해야 할 네이티브 도구(Android toolchain, Xcode 등)가 많아 설치 과정에서 미세한 경로 문제나 라이선스 꼬임으로 헤매기 쉽다. 이번 글에서는 맥(macOS) 터미널을 기반으로 Flutter SDK를 깔끔하게 설치하고, 실무에서 100% 마주치는 필수 도구 세팅 및 아키텍처 환경 변수 설정까지 오차 없이 완벽하게 완료하는 가이드를 정리한다.

![Flutter and macOS logo](https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=1280&auto=format&fit=crop)

---

### 1. Flutter SDK 다운로드 및 압축 풀기

Flutter로 앱을 개발할 때 흔히 하는 오해 중 하나가 프로젝트 소스 코드가 있는 곳에 SDK를 설치해야 하는가이다. **Flutter SDK(개발 엔진)**와 **실제 앱 소스 코드(프로젝트 폴더)**는 철저히 분리되어 관리되어야 한다.

가장 표준적인 경로인 홈 디렉토리 하위의 `~/development` 폴더를 생성하고, 본인의 맥북 프로세서에 맞는 최신 안정 버전(Stable 채널)을 다운로드한다.

```bash
# 1. 홈 디렉토리에 개발용 폴더(development) 생성 및 이동
mkdir -p ~/development
cd ~/development

# 2. 내 맥북의 프로세서에 맞는 명령어 '하나만' 선택해서 실행하세요:

# [A] Apple Silicon (M1, M2, M3, M4 등) 맥북인 경우
curl -O https://storage.googleapis.com/flutter_infra_release/releases/stable/macos/flutter_macos_arm64_3.24.5-stable.zip
unzip flutter_macos_arm64_3.24.5-stable.zip

# [B] Intel 프로세서 맥북인 경우
curl -O https://storage.googleapis.com/flutter_infra_release/releases/stable/macos/flutter_macos_3.24.5-stable.zip
unzip flutter_macos_3.24.5-stable.zip

# 3. 다운로드한 압축파일 삭제 (용량 확보)
rm flutter_macos_*.zip
```

**Tip:** 터미널 `curl` 다운로드 대신 공식 깃 레포지토리를 통해 추후 버전 업데이트를 관리하고 싶다면 `git clone -b stable https://github.com/flutter/flutter.git` 명령어로 대체하여 설치해도 무방하다.

---

### 2. 환경 변수(PATH) 등록 및 전역 명령어 활성화

SDK 압축을 풀었다고 해서 터미널이 `flutter`라는 명령어를 바로 인식하지 못한다. 컴퓨터에게 "내가 `~/development/flutter/bin` 폴더 안에 실행 파일들을 넣어두었으니 앞으로 어디서든 이 명령어를 찾아내라"고 알려주는 환경 변수 등록 과정이 필요하다.

최신 macOS의 기본 쉘 환경인 `zsh`을 기준으로 설정을 진행한다.

```bash
# 1. 터미널에서 zsh 설정 편집기(nano)를 엽니다.
nano ~/.zshrc
```

편집기가 열리면 방향키를 이용해 가장 아래 줄로 이동한 뒤, 아래의 코드를 복사해서 붙여넣는다.

```bash
export PATH="$PATH:$HOME/development/flutter/bin"
```

부착이 완료되었다면 아래 단축키를 이용해 저장하고 빠져나온다.
1. `Ctrl + O` 누른 뒤 `Enter` (파일 저장)
2. `Ctrl + X` (편집기 종료)

편집기를 빠져나왔다면 변경된 설정을 시스템에 즉시 반영한다.

```bash
# 3. 변경된 zshrc 설정 파일 새로고침 적용
source ~/.zshrc

# 4. flutter 명령어가 정상 경로를 가리키고 있는지 최종 검사
which flutter
```

`which flutter`를 입력했을 때 `/Users/유저명/development/flutter/bin/flutter`가 출력된다면 성공이다.

---

### 3. 네이티브 컴포넌트 연동 및 시스템 자가진단

이제 구글이 제공하는 Flutter 자가진단 툴인 `flutter doctor`를 실행하여 부족한 도구가 무엇인지 점검할 차례다.

```bash
flutter doctor
```

최초 실행 시 안드로이드 툴체인이나 Xcode 부근에 경고([!])가 발생하는 것이 일반적이다. 하나씩 해결해 보자.

#### 3.1 Android SDK Command-line Tools 설치

안드로이드 스튜디오가 설치되어 있더라도 CLI 부품이 누락된 경우 에러가 발생한다.

1. **Android Studio** 실행
2. **Settings** (또는 Preferences) 진입
3. **Languages & Frameworks > Android SDK** 이동
4. **SDK Tools** 탭 클릭
5. **Android SDK Command-line Tools (latest)** 체크 후 설치(Apply)

설치 후 터미널에서 라이선스 동의를 진행한다.

```bash
flutter doctor --android-licenses
```

모든 질문에 `y`를 입력하여 동의를 마친다.

#### 3.2 Xcode 및 CocoaPods 설정

iOS 빌드를 위해 Xcode 경로를 지정하고 라이선스를 승인한다.

```bash
# Xcode 경로 지정
sudo xcode-select --switch /Applications/Xcode.app/Contents/Developer

# 필수 컴포넌트 빌드 및 동의
sudo xcodebuild -runFirstLaunch
```

추가로 iOS 패키지 매니저인 **CocoaPods**를 설치해야 한다. `brew`를 이용하는 것이 가장 안전하다.

```bash
# 기존 잘못된 설치가 있다면 삭제
sudo gem uninstall cocoapods

# Homebrew로 재설치
brew install cocoapods
```

---

### 4. 효율적인 Flutter 프로젝트 구조 및 운영 팁

Flutter 프로젝트를 관리할 때는 몇 가지 주의사항이 있다.

- **최상위 루트 오픈:** IDE(안드로이드 스튜디오, VS Code)로 프로젝트를 열 때, 반드시 `pubspec.yaml` 파일이 있는 최상위 폴더를 열어야 한다. `android/`나 `ios/` 폴더를 직접 열면 안 된다.
- **프로젝트 명명 규칙:** 폴더명은 반드시 소문자와 언더바(`[a-z0-9_]`)만 사용해야 한다. 대문자를 섞으면 에러가 발생할 수 있다.

#### 유용한 명령어

```bash
# 프로젝트 구조 리프레시 (네이티브 폴더 재생성 등)
flutter create .

# 패키지 가져오기
flutter pub get

# 앱 실행
flutter run
```

> "환경 구축은 개발의 시작일 뿐이다. 이제 Flutter라는 강력한 도구로 여러분의 상상을 현실로 만들어보자."
