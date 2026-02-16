# 🚀 배포 가이드 (Deployment Guide)

이 가이드는 개선된 코드를 실제 사이트에 적용하는 방법을 설명합니다.

## 📋 목차

1. [현재 상태](#현재-상태)
2. [배포 방법 - 옵션 A (권장)](#배포-방법---옵션-a-권장-github에서-pr-병합)
3. [배포 방법 - 옵션 B](#배포-방법---옵션-b-로컬에서-직접-병합)
4. [배포 확인](#배포-확인)
5. [문제 해결](#문제-해결)

---

## 현재 상태

✅ **완료된 작업:**
- 30개 파일 개선 완료 (성능, 보안, 접근성, UX)
- Pull Request가 `copilot/improve-user-experience` 브랜치에 생성됨
- 모든 테스트 및 보안 스캔 통과

🌐 **배포 환경:**
- Vercel (https://my-site-five-ecru.vercel.app/)
- 자동 배포 설정됨

---

## 배포 방법 - 옵션 A (권장): GitHub에서 PR 병합

이 방법이 가장 안전하고 추천됩니다.

### 1단계: GitHub Pull Request 확인

1. GitHub 저장소로 이동:
   ```
   https://github.com/ChoEro99/my-site
   ```

2. 상단 메뉴에서 **"Pull requests"** 클릭

3. **"사이트 개선: 성능, 접근성, 보안 및 UX 향상"** PR 찾기
   - 또는 브랜치 이름: `copilot/improve-user-experience`

### 2단계: 변경 사항 검토

PR 페이지에서 다음을 확인:

- **Files changed** 탭: 30개 파일의 변경 내용 확인
  - ✅ `utils.js` (신규)
  - ✅ `IMPROVEMENTS.md` (신규)
  - ✅ `index.html`, `style.css`, `quiz.js` (수정)
  - ✅ 22개 테스트 페이지 (수정)
  - ✅ 기타 페이지들 (수정)

- **Checks** 섹션: 모든 체크가 통과되었는지 확인
  - ✅ CodeQL 보안 스캔
  - ✅ 코드 리뷰

### 3단계: PR 병합

1. PR 하단에서 **"Merge pull request"** 버튼 클릭

2. 병합 방법 선택 (권장: "Squash and merge" 또는 "Create a merge commit")
   - **Squash and merge**: 모든 커밋을 하나로 합침 (깔끔한 히스토리)
   - **Create a merge commit**: 모든 커밋 유지 (상세한 히스토리)

3. 커밋 메시지 확인/수정

4. **"Confirm merge"** 클릭

### 4단계: 자동 배포 대기

병합 후 Vercel이 자동으로 배포를 시작합니다:

1. Vercel 대시보드 확인:
   ```
   https://vercel.com/dashboard
   ```

2. 배포 상태 확인:
   - ⏳ Building... (약 1-2분)
   - ✅ Ready (배포 완료)

3. 배포 완료 알림이 GitHub PR에 자동으로 추가됨

---

## 배포 방법 - 옵션 B: 로컬에서 직접 병합

GitHub PR을 사용하지 않고 직접 병합하는 방법입니다.

### 사전 준비

```bash
# 저장소 클론 (아직 안 했다면)
git clone https://github.com/ChoEro99/my-site.git
cd my-site
```

### 1단계: 최신 코드 가져오기

```bash
# 원격 저장소에서 최신 변경사항 가져오기
git fetch origin

# 개선 브랜치로 전환
git checkout copilot/improve-user-experience

# 최신 코드 pull
git pull origin copilot/improve-user-experience
```

### 2단계: 메인 브랜치와 병합

**주의:** 메인 브랜치 이름 확인 필요 (main 또는 master)

```bash
# 메인 브랜치로 전환
git checkout main  # 또는 git checkout master

# 최신 상태로 업데이트
git pull origin main  # 또는 git pull origin master

# 개선 브랜치 병합
git merge copilot/improve-user-experience

# 충돌이 없으면 바로 push
git push origin main  # 또는 git push origin master
```

### 3단계: 충돌 해결 (필요한 경우)

충돌이 발생하면:

```bash
# 충돌 파일 확인
git status

# 각 충돌 파일을 편집기로 열어 수정
# <<<<<<< HEAD 와 >>>>>>> 표시 제거

# 수정 완료 후
git add .
git commit -m "Merge copilot/improve-user-experience into main"
git push origin main
```

---

## 배포 확인

배포 후 다음을 확인하세요:

### 1. 사이트 접속 확인

```
https://my-site-five-ecru.vercel.app/
```

### 2. 개선 사항 확인 체크리스트

#### 메인 페이지 (/)
- [ ] 페이지가 정상적으로 로드됨
- [ ] 검색창에 텍스트 입력 시 부드럽게 필터링됨
- [ ] 검색어 없을 때 "검색 결과가 없습니다" 메시지 표시
- [ ] 완료한 테스트에 "✓ 완료" 배지 표시
- [ ] 정렬 방식 변경 시 카드 순서 변경됨

#### 브라우저 개발자 도구에서 확인
1. F12 키를 눌러 개발자 도구 열기
2. **Console** 탭:
   - [ ] 오류 메시지가 없어야 함
   - [ ] `utils.js` 파일이 로드되었는지 확인

3. **Network** 탭:
   - [ ] 페이지 새로고침
   - [ ] `utils.js` 파일이 로드되는지 확인
   - [ ] CSP 관련 오류가 없는지 확인

4. **Application** 탭:
   - [ ] Local Storage에 `quizStats:*` 항목 확인
   - [ ] Session Storage에 `sortPreference` 항목 확인

#### 테스트 페이지 (/tests/love.html)
- [ ] 페이지가 정상적으로 로드됨
- [ ] 테스트 시작 및 완료 가능
- [ ] 결과 링크 복사 버튼 작동
- [ ] 카카오톡 공유 버튼 작동 (Kakao SDK 로드 확인)

#### 접근성 테스트
1. Tab 키로 페이지 탐색:
   - [ ] 모든 버튼/링크에 포커스 표시가 보임
   - [ ] 파란색 아웃라인이 표시됨

2. 스크린 리더 테스트 (선택사항):
   - [ ] 토스트 메시지가 읽힘

### 3. 성능 확인

브라우저 개발자 도구 → **Console**:

```javascript
// 검색 입력 시 트래킹 호출 횟수 확인
// "연애" 입력 시 1번만 호출되어야 함 (이전: 2번)
```

---

## 문제 해결

### 문제 1: 페이지가 깨져 보임

**원인:** CSP 헤더가 일부 스크립트를 차단할 수 있음

**해결:**
1. 브라우저 개발자 도구 → Console 확인
2. CSP 관련 오류 메시지 확인
3. 해당 도메인을 CSP에 추가 필요:

```html
<!-- index.html 등의 <head>에서 CSP 메타 태그 수정 -->
<meta http-equiv="Content-Security-Policy" 
      content="... script-src 'self' 'unsafe-inline' https://새도메인.com ..." />
```

### 문제 2: utils.js 파일을 찾을 수 없음

**증상:** Console에 "404 Not Found: utils.js" 오류

**해결:**
1. 파일 경로 확인: `/utils.js` (루트에 있어야 함)
2. Vercel 빌드 로그 확인
3. 파일이 실제로 배포되었는지 확인:
   ```
   https://my-site-five-ecru.vercel.app/utils.js
   ```

### 문제 3: 자동 배포가 안 됨

**확인 사항:**
1. Vercel 대시보드에서 프로젝트 설정 확인
2. GitHub 연동 상태 확인
3. 브랜치 설정 확인 (Production branch가 main/master인지)

**해결:**
- Vercel 대시보드 → 프로젝트 → Settings → Git
- Production Branch가 올바른지 확인
- 수동 배포: Vercel 대시보드에서 "Deploy" 버튼 클릭

### 문제 4: 이전 버전으로 롤백하고 싶음

**즉시 롤백:**
1. Vercel 대시보드 → 프로젝트 → Deployments
2. 이전 배포 버전 찾기
3. 우측 메뉴 → "Promote to Production" 클릭

**Git으로 롤백:**
```bash
# 이전 커밋으로 되돌리기
git revert HEAD
git push origin main

# 또는 특정 커밋으로
git revert <commit-hash>
git push origin main
```

---

## 추가 참고 사항

### Vercel 환경 변수 (필요한 경우)

개선 사항에는 환경 변수가 필요하지 않지만, 향후 필요할 수 있습니다:

1. Vercel 대시보드 → 프로젝트 → Settings → Environment Variables
2. 변수 추가 후 재배포

### 캐시 초기화

배포 후에도 이전 버전이 보인다면:

1. **브라우저 캐시 삭제:**
   - Chrome: Ctrl+Shift+Delete → 캐시된 이미지 및 파일
   - 또는 시크릿 모드로 테스트

2. **Vercel CDN 캐시 제거:**
   - URL 뒤에 `?v=1` 추가
   - 예: `https://my-site-five-ecru.vercel.app/?v=1`

### 모니터링

배포 후 다음을 모니터링하세요:

1. **Vercel Analytics** (활성화된 경우)
   - 페이지 로드 속도
   - 오류율

2. **Google Analytics** (설정된 경우)
   - 페이지뷰
   - 사용자 행동

3. **Browser Console**
   - JavaScript 오류
   - CSP 경고

---

## 📞 지원

문제가 계속되면:

1. GitHub Issue 생성
2. Vercel 배포 로그 첨부
3. 브라우저 Console 스크린샷 첨부
4. 재현 단계 설명

---

**마지막 업데이트**: 2026-02-16  
**버전**: 1.0
