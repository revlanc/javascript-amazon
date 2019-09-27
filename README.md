# Amazon UI Clone - Carousel & Keyword suggestion

> 아마존의 캐러셀과 검색어 자동완성 ui를 바닐라 자바스크립트로 구현하기
> 사용 기술 : html, css, javascript, express, node.js

### Index

- [기능](https://github.com/revlanc/javascript-amazon#1-기능)
- [설계](https://github.com/revlanc/javascript-amazon#2-설계)
- [고민한 점](https://github.com/revlanc/javascript-amazon#3-고민한-점)
- [느낀 점](https://github.com/revlanc/javascript-amazon#4-느낀-점)

---

## 1. 기능

### 1-1. 캐러셀 UI

- 화살표 버튼을 클릭 시 1칸씩 컨텐츠를 이동할 수 있다
- 페이지네이션을 클릭 시 해당 컨텐츠로 이동할 수 있다
- infinite carousel 구현(옵션으로 on/off)

#### 캐러셀 동작 모습

![carousel-demo](https://user-images.githubusercontent.com/42905468/65383624-1ff9cf00-dd53-11e9-9360-0e2e7a1fd1de.gif)

### 1-2. 검색어 자동완성 UI

- **검색어 자동완성** (지원 키워드 : bicycle, javascript, iphone)
  - 검색어 입력 시 자동완성, 방향키 또는 마우스로 선택 가능
- **최근 검색어 저장**
  - 자동완성 검색어를 선택 후 엔터키 입력 or 마우스로 클릭 시 최근검색어로 저장
- 자동완성 지원 키워드 이외의 키워드도 검색 시 최근검색어로 저장
- 입력창 포커스 시 최근 검색어 표시
- 최근 검색어 목록에서도 방향키 및 마우스로 키워드 선택 및 검색 가능(최근 검색어 순서 업데이트)

#### 검색어 자동완성 동작 모습

![suggestion-demo](https://user-images.githubusercontent.com/42905468/65383478-17a09480-dd51-11e9-8aa4-abfde5fa4788.gif)

---

## 2. 설계

### 2-1. 컴포넌트 구성

![amazon-components](https://user-images.githubusercontent.com/42905468/65384607-21c98f80-dd5f-11e9-950a-b76e9b8b59af.jpeg)

- 크게 캐러셀과 자동완성 2개의 컴포넌트로 나누고 각각 하위 컴포넌트를 갖는 구조로 구성하였습니다.
  - 캐러셀 : StateManager, Carousel, Pagination
  - 자동완성 : StateManager, SearchBarUI, SuggestionUI, RecentKeywordsUI
- 요구사항(기능)의 변화에 따라 적은 수정으로 변화에 대응할 수 있도록 컴포넌트를 분리하는데에 초점을 맞추었습니다.
  - ex) pagination만 필요하다거나, suggestion은 없는 검색바가 필요하다거나 등

### 2-2. 캐러셀 컴포넌트간 메시지 흐름

![carousel-diagram](https://user-images.githubusercontent.com/42905468/65389330-0f1b7e80-dd90-11e9-8ec1-ae3722d37f4b.jpeg)

- pagination 및 carousel이 stateManager를 주입받아서 구독합니다.
- event trigger > setState > updateState > notify > render 의 흐름으로 구현했습니다.

### 2-3. 자동완성 컴포넌트간 메시지 흐름

![searchbar-diagram](https://user-images.githubusercontent.com/42905468/65389334-117dd880-dd90-11e9-801f-fa7421c0235b.jpeg)

- searchBarUI, suggestionUI, recentKeywordsUI가 stateManager를 주입받아서 구독합니다.
- event trigger > setState > process\_\_mode > updateState > notify > render의 흐름으로 구현했습니다.

---

## 3. 고민한 점

### 3-1. 재사용 가능한 pagination 컴포넌트 설계

![carousel-structure-history](https://user-images.githubusercontent.com/42905468/65406800-94984080-de1b-11e9-9288-daf69508d0b0.jpeg)

1. 처음에는 Carousel 클래스 1개로만 구현했으나, Pagination을 재사용 할 수 있게끔 분리하고자 함.
2. 단순히 2개의 클래스로 분리했더니 상호 호출되어서 재사용도 불가능하고 분리한 의미가 없음.
3. 방법이 없을까 고민하던 중 pagination과 carousel이 하는 일이 '몇번째 카드를 보여줄 지'를 정해서 보여주는 것임을 깨달음.
4. 그럼 이 **공통의 역할을 분리하면 독립적인 클래스가 되지 않을까?**라는 생각이 듬.
5. 상태를 관리하는 stateManager와 rendering을 담당하는 pagination과 carousel 클래스로 분리함.

> model과 view를 분리함으로써 변경이 있더라도 다른 부분에 영향이 없는 구조를 구현.

### 3-2. 이벤트 발생 > 상태 변경 > 렌더링으로 이어지는 메시지 흐름

1. stateManager로 상태를 분리하고나니 이벤트 발생 > 상태 변경 > 렌더링으로 이어지는 메시지 흐름을 구현해야했음.
   1. 이벤트가 발생할 때, 상태가 바뀌고, 렌더링이 되는 흐름은 리액트와 닮아있고,
   2. 상태의 변경을 다른 컴포넌트에 알리는 동작은 MVVM과 닮아있다는 생각이 들었음.  
      MVVM의 옵저버패턴(pubsub패턴)을 공부하고, 리액트의 메시지 전달방식을 비슷하게 따라해보기로 함.

![publisher](https://user-images.githubusercontent.com/42905468/65619273-d29f8b00-dffa-11e9-804e-c999dcd24e31.png)

2. publisher 클래스를 구현해서 상태변경이 발생하면 subscriber의 render메서드를 호출하게끔 구현.

![handleBtnClick](https://user-images.githubusercontent.com/42905468/65618073-aaaf2800-dff8-11e9-9715-2b9594932a59.png)

3. subscriber는 publisher를 구독하고, 이벤트 핸들러에서 publisher.setState를 호출하여 상태를 변경.

![render](https://user-images.githubusercontent.com/42905468/65618075-ab47be80-dff8-11e9-916f-acbff31bfd9d.png)

4. subscriber는 render메서드를 구현하고 render메서드 안에서 DOM조작.

> handleBtnClick > setState > notify > render의 흐름 구현

### 3-3. 많은 이벤트가 발생하는 경우의 메시지 핸들링

![setState-code](https://user-images.githubusercontent.com/42905468/65531540-192ab200-df35-11e9-9f81-6d18091ee2f2.png)

1. 자동완성의 경우 많은 이벤트와 많은 컴포넌트로 인해 분기가 많아질 것으로 예상됨.
2. 메시지의 흐름을 간결하게 할 방법을 고민함.
3. 생활코딩 리액트 강의에서 mode를 통해 기능을 구분했던 것에 착안해 기능별로 mode를 구분하기로 함.
4. 이벤트 발생 시 수행해야 할 동작(기능)을 recent, suggest, select, submit 4가지 mode로 구분함.

> mode로 구분하니 '분기'를 보다 명시적으로 인지할 수 있고 동작흐름을 파악하기 수월해짐.

---

## 느낀 점

### 배운 점

#### 역할에 따라 컴포넌트를 분리하고 의존성 낮은 구조를 설계하는 법

view를 기준으로 역할을 분리하고, 그 역할을 담당할 컴포넌트를 설계하고, 컴포넌트 사이의 의존성을 낮게 만드는 법을 고민하였습니다.  
model과 view를 분리하고, 옵저버패턴을 활용하면 의존성이 낮은 구조를 설계할 수 있다는 점을 배웠습니다.

#### 테스트 코드의 필요성

검색 자동완성의 경우 이벤트 종류가 많다보니 어느 한부분을 수정하면 테스트를 해야하는 시나리오도 많았습니다.

| ![test-scenario](https://user-images.githubusercontent.com/42905468/65701145-c596a080-e0bb-11e9-808f-9972827dd4ef.png) |
| :--------------------------------------------------------------------------------------------------------------------: |
|                                            <submit 기능의 테스트 시나리오>                                             |

이렇다보니 반복적으로 테스트하는게 번거로운 일이라는 생각이 들었고, ''이럴 때 테스트코드가 있다면 편하겠구나!''라는 생각이 절로 들었습니다.

### 아쉬운 점 & 개선할 점

#### 기능 추가 시 사이드 이펙트(버그)가 쉽게 발생함

자동완성 구현시, 리액트 느낌의 이벤트 흐름을 구현하고자 했으나, 당시에는 Flux 아키텍처라든지 uni-direction같은 개념을 잘 몰랐을 때라 변화에 강한 구조를 제대로 구현하지 못한 것 같습니다.  
mode를 좀 더 세부적으로 나눴으면 더 나았을 것 같다는 생각이 듭니다(지금은 submit mode하나에도 많은 경우의 수가 발생함). 그래도 버그가 발생하는 구간은 비교적 찾기 쉬우니 절반의 성공?  
추후에 개선할 때 dispatcher와 reducer를 구현해서 이벤트 흐름 제어를 시도해볼 생각입니다.  
그리고 같은 기능을 구현한 다른 사람의 코드를 포크하고 기능을 추가하면서 코드의 장단점을 느껴볼 생각입니다.

#### 각각의 컴포넌트를 재사용이 불가능한 구조로 설계한 점

자동완성 컴포넌트 중, recentKeywords와 suggestions을 나누다보니 이벤트핸들러를 등록하는 코드가 중복되어서 핸들러를 searchBar에 두었습니다. 그러다보니 모든 컴포넌트들이 재사용이 어려운 구조가 되었습니다. 지금보니 공통부분을 하나의 컴포넌트로 묶고 두 컴포넌트에서 사용되는 이벤트핸들러는 이 새로운 컴포넌트에 작성하는 형식으로 수정하면 될 것 같다는 생각이 들었습니다.

#### 몇몇 함수의 크기가 너무 커진 점

함수의 크기를 작게 나누려고 했으나 동작하도록 구현하는데에 신경쓰다보니 크기가 큰 함수가 몇개 생겨버렸습니다.  
확실히 함수의 크기가 커지면 가독성이 떨어지게 된다는 것을 느꼈습니다.  
크기가 큰 함수는 코드의 의도를 제대로 담지 못한다는 점을 알게 되었습니다.
