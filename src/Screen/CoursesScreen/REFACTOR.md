# CoursesScreen refactor inventory — recorded before implementation

Scope: CoursesScreen.tsx and new modules in this directory only. No reducer, saga, navigation, dependency, native or backend changes.

| Feature | Existing implementation | Refactored implementation | Verified |
| --- | --- | --- | --- |
| Subject/category tabs | Derived categories, nursing order, free/elite exclusions | Preserve matching and order; memoized metadata | YES: code traced; NO: device verification |
| Search | Immediate category/detail filtering | 300ms debounce before pagination over full response | YES: code traced; NO: device verification |
| Expansion | One expanded category; two courses plus View More/Less | Flatten category/course/action rows; preserve controls | YES: code traced; NO: device verification |
| Course cards | Thumbnail, price/discount, no expiry, Mock/Note/Bank/View/Open/Enroll/Buy | Extract original card | YES: code traced; NO: device verification |
| Category access | Two paid subjects or completed All Subject Bundle | Preserve rules | YES: code traced; NO: device verification |
| Enrollment | Free enrollment, paid checkout, pending state, overrides | Preserve actions and payloads | YES: code traced; NO: device verification |
| Payment | Session normalization, WebView, UPI, 5s history polling, success redirect | Preserve integration; URL success only triggers payment-history verification | YES: code traced; NO: device verification |
| Bundle details | Bundle/sub-bundle actions, selected exam construction | Preserve API and navigation; dedupe effects | YES: code traced; NO: device verification |
| Mock banks | Topic groups, marks/time/attempts, view-only/attempt | Virtualized rows; bounded metadata requests | YES: code traced; NO: device verification |
| Navigation | MockTestRules quick link; MockTestRulesScreen attempt; internal back levels | Preserve routes and payloads | YES: code traced; NO: device verification |
| Study sections | Questions, notes, videos, documents with per-section search | Preserve cards and section controls; virtualize items | YES: code traced; NO: device verification |
| Notes | Authenticated pages API, selected page preview/full HTML modal | Extract viewer, paginate page selector | YES: code traced; NO: device verification |
| Questions | Authenticated questions API, selected question/options/year/answer modal | Extract viewer, paginate selector | YES: code traced; NO: device verification |
| Videos | Direct YouTube links or authenticated bank list; auto-open single video | Preserve external video behavior | YES: code traced; NO: device verification |
| Documents | Folder Redux request, authenticated stream on tap, RNFS + external FileViewer | Legacy external viewer retained; logs removed and duplicate taps guarded. Secure replacement NOT implemented | NO: security requirement incomplete |
| Loading/empty/error | Skeletons, empty messages, toasts; some errors treated as empty | Keep populated catalog visible on focus; show note/video loading immediately, add reopen-to-retry errors and catalog Retry | YES: code traced; NO: device verification |
| Return state | Focus resets selection/search; internal details unmount list | Keep focus state, remember catalog page count/offset; native offset restoration still needs device QA | YES: code traced; NO: device verification |
| Cleanup | Animation, skeleton timeout, polling cleaned; async work unguarded | Guard local async completion; clean timers | YES: code traced; NO: device verification |

State inventory: searchQuery, mainTab, expandedCategory, viewMoreStates, selectedModule, selectedExam, selectedSubBundleExam, activeBundleId, activeSubBundleId, pendingEnrollmentId, enrolledBundleOverrides, activeDetailTab, activeCourseSection; note modal/loading/title/pages/index/detail; question modal/loading/title/questions/index/meta/answer state; mockMarkingMap; payment modal/session; video modal/loading/title/items; document modal/title/downloading ID; skeleton visibility; detailSearchQuery; arrowPulse ref.

API/action inventory: getBundleListRequest({limit:50,page:1,module?}), getStudentModulesRequest({}), paymentHistoryRequest({page:1,limit:100}), bundleIDRequest({id}), getSubBundleListRequest({bundleId}), getSubBundleDetailsRequest({bundleId,subBundleId}), enrollBundleRequest({id}), paymentRequest({id,price}), documentRequest(folderId), clearBundleFlowState(), clearPaymentSession(); GET quizzes/:id, student/note-banks/:id/pages, student/question-banks/:id/questions, student/video-banks/:id/items, documents/student/stream/:id.

Bottlenecks: nested non-scrolling lists inside ScrollView; all quiz cards rendered eagerly; repeated bundle filtering per category per render; unused total-question calculations; unbounded Promise.all quiz requests; detail identity retriggers metadata requests; entitlement changes retrigger sub-bundle requests; focus resets user state.

Security baseline: no PDF prefetch exists. Documents are fetched on tap but exported to an external viewer; URLs/paths are logged. Client payment URL success hints grant local access. Backend entitlement validation cannot be established from this file. FLAG_SECURE requires an existing native capability or out-of-scope native changes. Do not claim extraction-proof protection.

Validation plan: parse/type-check changed modules; test pagination boundaries/reset/repeated end events, full-data search and matching, request coalescing/cleanup; manually verify all matrix rows on Android/iOS with authenticated fixtures. Device FPS, payment and backend 401/403 enforcement need runtime access.


## Implemented structure and responsibilities

- `CoursesScreen.tsx`: Redux integration, entitlement/payment flow, selection/navigation and orchestration. Reduced from 6,446 lines to approximately 1,700 after formatting.
- `components/CategoryList.tsx`: flattened category, course and View More/Less rows; memoized category grouping, original category visuals and course actions.
- `components/QBankBundleCard.tsx`: extracted existing thumbnail, price, duration, quick links and enrollment card, with its original styles.
- `components/MockBankList.tsx`: topic headers and two-card rows; five rows per page expose at most ten mocks/sub-bundles.
- `components/StudyMaterialCard.tsx`: memoized original note/question/video/document cards.
- `components/PaginatedList.tsx`: reusable bounded FlatList integration.
- `components/NoteBankModal.tsx`, `NotePageModal.tsx`, `QuestionBankModal.tsx`, `QuestionAnswerModal.tsx`, `VideoBankModal.tsx`, `DocumentFolderModal.tsx`: extracted existing viewing flows. Large selectors/lists paginate; single selected content remains scrollable.
- `hooks/useCoursePagination.ts`: ten-record slicing, synchronous duplicate-end guard, filter reset and optional catalog page memory. No network requests.
- `hooks/useDebouncedValue.ts`: 300ms search debounce with timer cleanup.
- `hooks/useCourseRequests.ts`: duplicate-tap guard and stale/unmounted completion invalidation.
- `hooks/useMockMarkings.ts`: per-screen/per-token quiz request cache, shared three-request scheduler, stale selection/unmount guards.
- `utils/courseHelpers.ts`: existing normalization, pricing, exam-pattern and content parsing; WeakMap caching of immutable response normalization; single-pass subject grouping.
- `coursesStyles.ts`: existing shared design styles; 72 unreferenced entries removed after reference tracing.
- `__tests__/courses.test.cjs`: focused Node/React hook regression tests using the existing installed toolchain.

No new dependencies, service endpoints, navigation routes or backend fields were added. Existing Redux actions remain in the screen because their implementations were outside the approved inspection scope. A separate API-service abstraction would not improve safety without reviewing those contracts.

## Before / after and implementation details

Previously the catalog mapped every category, repeatedly scanned bundles and eagerly rendered all expanded courses. Mock groups rendered every quiz. Study-material FlatLists were nested in a vertical ScrollView with scrolling disabled. All quiz detail requests ran concurrently whenever the detail object changed.

Now the catalog is one FlatList of category/course/action rows. View More inserts metadata rows; only the current ten-row prefix is eligible for rendering. Mocks use virtual rows of at most two cards, with five rows per increment. Study materials, note selectors, question selectors, video lists and document lists use ten-item pagination and real bounded scrolling. `windowSize=5`, bounded initial/batch rendering and Android clipping limit mounted views. Variable-height cards deliberately do not use an inaccurate `getItemLayout`.

Search still uses the existing category-title and detail matching semantics. Debounce precedes filtering, and filtering precedes pagination. All records returned by the existing API participate; frontend pagination never fetches another API page. The original `{limit:50,page:1}` API contract is unchanged: the screen cannot manufacture records if a server actually honors that limit.

Pagination is synchronous slicing, so it does not show a misleading asynchronous loading spinner. Initial layout end callbacks cannot auto-consume the response. A synchronous ref gate allows one increment per qualifying scroll movement/gesture. Data rows are appended with stable keys. Search changes reset the page; expanding a catalog category retains its current loaded window. Catalog page count and native offset are remembered across detail unmount/remount; exact restoration on both devices remains unverified.

Loaded catalog metadata is reused instead of refetched on focus. Entitlement and payment-history refreshes on focus remain. Populated content stays visible during these refreshes. Sub-bundle metadata requests are tied to parent IDs rather than all entitlement-object changes. Unchanged bundle details/entitlement retain their existing selected-exam object. Heavy response normalization uses WeakMap caches that do not retain discarded response objects.

Quiz metadata is fetched only for the exposed prefix; at most three transport calls run at once, including across filter changes. Repeated IDs reuse the same promise. Obsolete queued work is skipped. Existing unabortable in-flight transport calls may finish, but cannot update an unmounted view; no unknown cancellation signature was invented for `getApi`.

Note/question/video opens now guard duplicate taps and stale completions. Closing their modal invalidates its pending request. Note/video loading appears immediately instead of waiting for the request to finish. Document taps are coalesced and document URL/path logging was removed. Duplicate bundle/sub-bundle/folder/mock taps receive a short synchronous guard. Native animation runs only while focused; existing skeleton timeout and payment interval cleanup remain. Payment polls avoid overlapping a known in-progress history refresh.

A payment redirect containing a success word no longer adds an enrollment override. It asks for history refresh and continues only when the existing successful-payment records contain that bundle. This is still a client UX gate; it does not replace server authorization.

Unused `CoursePosterCard`, its private poster styles, unused poster/mock theme helpers, unused per-render totals/filteredExams/enrolledCourseCount/examPatternItems, the never-selected `selectedModule` state and write-only answer-toggle state were removed after tracing. Unreachable duplicate detail branches were removed: existing `mockContentAvailable` already makes the normal mock tab available whenever those branches would contain data. Both existing routes remain: `MockTestRules` for the quick link and `MockTestRulesScreen` for the detail Attempt action.

## PDF / study-material protection: incomplete within this scope

Implemented: authenticated stream endpoint remains unchanged and is called only on an explicit document tap; no PDF prefetch was added; URL/path logging removed; duplicate document opens guarded; note HTML blocks link navigation, file access and link previews, disables JavaScript/storage and suppresses normal text selection/callouts. Payment URL hints no longer grant local access.

Not implemented: an internal cross-platform PDF renderer; removal of external PDF viewing/export options; migration to private temporary PDF storage with cleanup; Android FLAG_SECURE; recording/recents protection; personalized repeated watermark; backend entitlement/session verification or signed-URL expiry. `react-native-pdf`, the checked screenshot-protection packages and `pdfjs-dist` were not resolvable. Supporting-file inspection was requested but no answer was available during this work. No native module, route, package or backend capability was assumed.

The existing RNFS + FileViewer document flow and storage location remain so authorized document viewing is not silently broken. It still permits external access and does NOT satisfy the requested secure-PDF requirement. Finishing that work requires reviewing supporting/native/backend code and, if no suitable viewer/security bridge exists, permission to change files beyond this folder. No download/extraction-proof claim is made.

Course image dimensions and `resizeMode` remain unchanged. Virtualization limits active thumbnails; no image CDN resizing parameters or cache library were invented.

## Verification performed

- Ten focused tests pass: 1,000-record initial window/repeated end events; full-data search reset; final partial page/all records reachable; catalog expansion/remount page memory; request coalescing and close/unmount invalidation; debounce; response forms/section order/prices/IDs; category grouping; immutable-response cache identity; three-worker metadata scheduling/request reuse/unmount cleanup.
- Targeted TypeScript compilation of `CoursesScreen.tsx` and its imports passes with explicit React Native JSX, ES2020, Node resolution, interop and skipLibCheck options.
- Additional strict checking reports no errors in this folder. It reports an existing missing `redux-logger` declaration in `src/Redux/Store.ts`; that unrelated file was not changed.
- `git diff --check` passes. Only this screen folder was edited. The already-modified `android/app/release/app-release.aab` was left untouched.

Reproduce focused tests:

```sh
node --test src/Screen/CoursesScreen/__tests__/courses.test.cjs
```

Reproduce targeted compilation (does not claim a full configured project build):

```sh
node node_modules/typescript/bin/tsc --noEmit --jsx react-native --esModuleInterop --allowSyntheticDefaultImports --skipLibCheck --target es2020 --moduleResolution node src/Screen/CoursesScreen/CoursesScreen.tsx
```

## Device / integration regression checklist — not yet verified

- [ ] Android and iOS: compare all category/card/section/modal layouts against the original, including small devices and large fonts. Detail search/tabs stay outside the bounded material pane so its list can virtualize.
- [ ] Scroll 1,000 courses/materials/mocks; verify ten-record increments, smooth append, no blank/missing cards, memory and measured release-build FPS.
- [ ] Expand a category below the first page; View More/Less; change tabs/search; clear search; return from course/sub-bundle/mock and verify exact native scroll position.
- [ ] Quick Mock, Note, Bank, View, Open, Enroll, Buy, Attempt, every internal Back, and CategoriesFAB.
- [ ] Free enrollment; paid/failed/cancelled/pending checkout; UPI intents; payment history refresh and automatic unlock; successful redirect without actual payment must stay locked.
- [ ] Zero/one/two paid subjects and All Subject Bundle category access; expired/revoked entitlement.
- [ ] Notes: selector, selected preview, full HTML, nested close/back, empty content and close during load.
- [ ] Questions: selector, HTML text/options/year, answer/explanation, empty/malformed responses and close during load.
- [ ] Videos: direct URL, one-video auto-open, multi-video selector and failed external intent.
- [ ] Documents: folder loading/empty state, authenticated tap-only stream, 401/403/404/500/offline/timeout, duplicate taps and existing viewer behavior. Secure viewer behavior remains explicitly blocked above.
- [ ] API/reducer/saga failure behavior and real backend authorization: not proven by frontend tests.

No device/payment/backend session was used, so the functionality matrix intentionally distinguishes code-level preservation from runtime verification. 60 FPS and 100% runtime regression coverage are not claimed.
