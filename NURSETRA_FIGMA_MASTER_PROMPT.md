# Meritzo — Complete Figma UI Design Prompt

Brand update: use the supplied Meritzo logos for this design direction. The underlying product and source repository remain Nursetra; this document does not rename the application or change its code.

Copy this entire file into your Figma design assistant, or give it to the designer building the Meritzo Figma file.

This is a project-specific design brief, based on the existing React Native UI inspected on 18 September 2026. It is not a native .fig file or a claim that the screens have already been created. Existing behavior below is evidenced by source code, not a live API or device audit. Proposed visual refinements are explicitly identified.

---

## 1. Role, task, and design boundary

Act as a Senior Mobile Product Designer, Figma Design System Architect, and React Native Design Handoff Specialist.

Create ONE organized Figma file named **Meritzo — Mobile App UI & Design System**. Build polished, editable mobile screens, reusable components, semantic variables, screen states, prototype flows, and implementation notes according to this brief.

Apply the supplied Meritzo visual identity to Nursetra's existing product structure and terminology. Improve consistency, readability, spacing, and responsiveness without changing its established product structure. This is a nursing exam preparation app, not a clinical care application.

Deliver UI/UX design only. Do not generate React Native, JSX, TypeScript, backend, database, or API implementation. Do not replace the product with a generic EdTech concept. Do not add invented subscriptions, notifications, rewards, certificates, or unsupported controls.

If your tool cannot create native Figma pages, components, variables, or prototype connections, state the limitation and provide the supported design output. Never describe a flat image, SVG, website, or written specification as a complete native Figma design system.

## 2. Product UI analysis

**Design brand:** Meritzo, as shown in the supplied logo.

**Existing product/source:** Nursetra; retain its current nursing exam preparation scope and workflows.

**Category:** Nursing education and competitive exam preparation.

**Primary users:** Nursing students and exam candidates using mock tests, question banks, notes, documents, and learning videos. Current exam terminology includes NORCET, CHO, GNM, B.Sc Nursing, ESIC, RRB, and Elite Mock. Use only categories present in the relevant data.

**User roles:** Guest during authentication; authenticated learner; learner with access to particular free or purchased content. Do not create an admin or educator application.

**Core journey:** Sign in → explore Mock Bank or Subject Bank → select accessible content or purchase a bundle → study or attempt a timed test → review results → inspect quiz rankings.

**Product priorities:** Fast discovery, readable educational content, clear access status, an uninterrupted timed test, trustworthy submission/payment feedback, and useful result review.

**Current visual language:** Blue and teal brand colors, pale blue backgrounds, white rounded cards, Inter typography, subtle shadows, occasional amber highlights, gradient hero areas, and nursing/medical motifs. Keep decorative motifs restrained outside onboarding and authentication. Keep question and document areas calm.

## 3. Source of truth and evidence boundaries

The following project files establish the design baseline. These are reference paths, not instructions to edit application code:

- Brand tokens: `src/Themes/Colorpath.ts`, `src/Themes/index.ts`, `src/Themes/Fonts.ts`.
- Brand assets: `src/Assets/Images/Logo.png`, `nursetra_app_icon.png`, `Slide1.jpg`, `trophy.png`; asset mapping in `src/Themes/Imagepath.ts`.
- Navigation: `src/Navigation/BottomTabs.tsx`, `MainStack.tsx`, `AuthStack.tsx`.
- Authentication: `src/Screen/Auth/`; entry screens: `src/Screen/Splash/`, `src/Screen/Onboarding/`.
- Home: `src/Screen/Dashboard/Home.tsx`.
- Mock Bank: `src/Screen/SubjectTests/index.tsx`; tests: `src/Screen/MockTests/MockTestScreen.tsx`.
- Rules and attempt: `src/Screen/MockTestRules/MockTestRulesScreen.tsx`, `src/Screen/MockTestQuestion/MockTestQuestionScreen.tsx`.
- Subject Bank and its nested viewers: `src/Screen/CoursesScreen/CoursesScreen.tsx` and `components/`.
- Results: `src/Screen/Results/ResultScreen.tsx`, `MyResultsScreen.tsx`.
- Rankings: `src/Screen/Leaderboard/LeaderboardScreen.tsx`, `QuizLeaderboardScreen.tsx`.
- Orders: `src/Screen/CoursesPaymentHistoryScreen/CoursesPaymentHistoryScreen.tsx`.
- Legal: `src/Screen/Legal/`.

The file is self-contained for layout and behavior. If original brand assets are not accessible to the design tool, use a clearly labeled logo placeholder and note that the real logo must be supplied; do not invent a replacement logo.

Treat fields read by the source as conditional capabilities, not a guarantee that every API response supplies them. Never turn missing data into a fabricated zero, rank, date, percentage, price, or success state. Use “—” or a specific unavailable state where appropriate. Keep a real numeric zero distinct from missing data.

## 4. Current UI audit and recommended refinements

These are source-based observations and design risks; visual/device verification is still required.

| Area | Current evidence / issue | UX or UI consequence | Design refinement | Priority |
| --- | --- | --- | --- | --- |
| Foundations | Shared tokens coexist with many screen-specific colors, gradients, and sizes | Inconsistent hierarchy and component treatment | Centralize repeated values and preserve brand palette | P1 |
| Login | Google and Apple buttons have no action handlers in the inspected screen | A production prototype could promise unavailable sign-in | Exclude from core working flow; retain only on a clearly labeled future/reference board | P1 |
| Profile | My Courses currently displays Coming Soon | It is not a working destination | Preserve its status or omit from the core prototype; do not invent a course library | P2 |
| Payment | Subject Bank verifies payment history; a separate mock unlock sheet shows a different price presentation and directly navigates to rules | Apparent purchase completion could mislead | Show verified entitlement states; flag legacy mock unlock behavior for product review | P0 |
| Payment history | Six-column table with truncated cell text | Narrow screens make transactions difficult to scan | Use stacked order cards on mobile, retaining existing fields | P1 |
| Quiz palette | Review and answer states can overlap | Color-only or ambiguous counters make navigation harder | Add symbols and explicit overlapping-count rules | P1 |
| Content cards | Some titles use one-line truncation | Long exam and subject names lose meaning | Use two lines in lists and full wrapping on detail screens | P2 |
| Results | Multiple optional fields and fallback calculations | Unavailable values may look authoritative | Annotate source/availability and show unavailable variants | P1 |
| Icons | More than one icon family is used | Inconsistent weight and alignment | Use Ionicons as the proposed common design library | P3 |
| Protected documents | Existing protected reader | Generic download/share controls would change content policy | Keep protection behavior and omit unsupported export controls | P0 |

## 5. Information architecture and navigation

Preserve exactly these four primary tabs, in this order:

1. **Home** — dashboard, Explore shortcuts, activity, leaderboard entry.
2. **Mock Bank** — subject/test discovery and test entry.
3. **Subject Bank** — bundles, subject content, study resources, and embedded mock content.
4. **Profile** — account details, results, password, orders, and legal information.

The source route for Mock Bank is SubjectTests; the source route for Subject Bank is CourseScreen. Preserve user-facing labels rather than exposing internal route names.

Leaderboard is reached from Home. It is not a fifth tab. PYQ exists as a stack destination, but its bottom tab is commented out; do not reinstate it as a primary tab. Existing Explore entry points may expose it.

Use nested stack screens for rules, attempts, results, quiz rankings, and legal pages. Use the existing overlay pattern for Subject Bank viewers, detail selectors, and payment presentation. Hide primary tabs during focused test-taking and full-screen reading. Restore the previous tab, query, and scroll position when leaving a nested view where the current flow supports it.

Do not add a generic Explore tab, global Search tab, Settings tab, or Notifications tab.

## 6. Figma file pages

Create the following pages inside the ONE Figma file:

- `00 — Cover & Product Map`
- `01 — Foundations`
- `02 — Components & Variants`
- `03 — Splash & Onboarding`
- `04 — Authentication`
- `05 — Home`
- `06 — Mock Bank & Test Lists`
- `07 — Test Rules & Attempt`
- `08 — Results & Question Review`
- `09 — Leaderboards`
- `10 — Subject Bank & Study Materials`
- `11 — Purchase & Payment History`
- `12 — Profile & Account`
- `13 — Legal`
- `14 — Loading, Empty & Error States`
- `15 — Prototype Flows`
- `16 — Developer Handoff & Audit`
- `17 — Optional Concepts — Not Implemented` only if optional concepts are requested.

Cover: supplied Meritzo wordmark logo, Meritzo name, “Nursing exam preparation”, version/date, four-tab product map, and links to prototype starting points.

## 7. Design direction

Create a clean, professional evolution of the current UI. Use the supplied logo’s deep navy, royal blue, cyan, and white identity. Preserve white cards, light backgrounds, rounded geometry, and Inter typography. Replace the old teal brand treatments throughout the design; retain green only for semantic success feedback.

Use gradient heroes selectively on recovery, profile, and result screens where that pattern already exists. Avoid adding a large promotional hero above every content list. Home should prioritize actual learning activity and existing Explore shortcuts.

Use amber for premium cues and review/warning states with distinct labels and icons. Use content-specific visual cues sparingly. Do not add decorative graphs, fabricated achievement counts, distracting background artwork, or excessive shadows.

The main design is light mode. Dark mode is optional and must remain outside the baseline unless separately requested.

### Logo choice and placement

**Recommended app icon: the second supplied logo (symbol only).** Its three larger ascending bars have stronger small-size recognition and less visual clutter. The ascending shape suggests progress and achievement; it does not independently communicate nursing, so supporting app copy must retain that context.

**Recommended brand lockup: the first supplied logo (symbol + Meritzo).** Use it on the splash, onboarding brand introduction, Figma cover, and promotional material where the name is readable. Avoid shrinking the entire text-bearing square into a small navigation/avatar slot.

These are complementary versions of one identity. Do not redraw the wordmark in Inter; Inter is the interface font, while the supplied wordmark remains artwork. Preserve the two white bars and cyan-to-blue third bar. Do not recolor the mark to the old teal palette.

Use a simplified symbol treatment at small sizes without the first version’s long shadows. Treat simplification as a future asset-production task; the attached images themselves have not been edited. Keep the mark’s proportions and consistent optical padding. For production launcher exports, prepare platform-appropriate source artwork and verify safe areas; do not treat the screenshot’s white outer margin or rounded mask as required baked-in artwork.

Use the navy background for the supplied white logo. Do not place the white bars directly on a white card. A light-surface wordmark requires an approved dark variant; do not assume one exists. On ordinary content screens, use compact branding so learning content remains the focus.

### Applying the new colors throughout the UI

- Primary buttons, links, selected tabs, active filters, and selected question borders: `#0057D9`.
- Pressed primary controls: `#0044AA`; button text: white.
- Brand headers and heading text: `#061A4D`; body text remains `#0F172A`.
- Main app canvas: `#F5F8FF`; cards and inputs: white; separators: `#DCE5F2`.
- Cyan `#00C8EE` and bright blue `#0066FF`: brand artwork and limited highlights. Do not use cyan for small text on white or for white-text primary buttons.
- Amber remains premium/warning only; green remains success only; red remains error only. These are semantic colors, not additional dominant brand colors.
- Update every screen/component instance and gradient via variables/styles, including authentication, Home, tabs, quiz selections, result heroes, Subject Bank, purchase, and Profile.

## 8. Color variables

### New logo-aligned brand palette — proposed UI values

These are deliberate UI color choices visually matched to the supplied gradient logos, not exact sampled colors from a vector brand master. They supersede the older source theme for the Figma design. Source code still contains the previous palette.

| Figma variable | Value | Usage |
| --- | --- | --- |
| `color/action/primary` | `#0057D9` | Primary actions, links, active navigation |
| `color/brand/navy` | `#061A4D` | Brand anchor, splash background, dark hero areas |
| `color/brand/blue` | `#0066FF` | Logo-inspired blue accent and decorative gradient endpoint |
| `color/brand/accent` | `#00C8EE` | Cyan accent, sparingly |
| `color/brand/secondary` | `#F59E0B` | Amber highlights |
| `color/bg/primary` | `#F5F8FF` | App canvas |
| `color/bg/surface` | `#FFFFFF` | Cards, inputs, sheets |
| `color/text/primary` | `#0F172A` | Main content |
| `color/text/heading` | `#061A4D` | Existing dark heading color |
| `color/text/secondary` | `#64748B` | Secondary copy |
| `color/text/on-primary` | `#FFFFFF` | On primary blue |
| `color/border/default` | `#DCE5F2` | Subtle separators |
| `color/state/success` | `#22C55E` | Success indicator |
| `color/state/warning` | `#F59E0B` | Warning indicator |
| `color/state/error` | `#EF4444` | Error indicator |

### Proposed semantic extensions — label as refinements

| Variable | Value |
| --- | --- |
| `color/action/pressed` | `#0044AA` |
| `color/action/subtle` | `#EAF4FF` |
| `color/text/muted` | `#64748B` |
| `color/text/disabled` | `#94A3B8` |
| `color/bg/disabled` | `#E2E8F0` |
| `color/border/strong` | `#64748B` |
| `color/state/success-bg` | `#DCFCE7` |
| `color/state/success-text` | `#166534` |
| `color/state/warning-bg` | `#FEF3C7` |
| `color/state/warning-text` | `#92400E` |
| `color/state/error-bg` | `#FEE2E2` |
| `color/state/error-text` | `#B91C1C` |
| `color/state/info-bg` | `#EAF4FF` |
| `color/state/info-text` | `#0057D9` |
| `color/access/premium-bg` | `#FEF3C7` |
| `color/access/premium-text` | `#92400E` |
| `color/access/free-bg` | `#DCFCE7` |
| `color/access/free-text` | `#166534` |
| `color/overlay/scrim` | Black at 40% |

Proposed hero gradient: `#061A4D → #0057D9`. Proposed decorative accent gradient: `#00C8EE → #0066FF`. Use a named gradient paint style. Test foreground contrast across every gradient stop. Keep important small text on a solid surface when necessary.

Use darker semantic text colors on pale status fills. Do not assume white text on green, amber, cyan, or bright blue accent backgrounds is readable. Verify contrast in the finished Figma file.

## 9. Typography, geometry, and elevation

Use **Inter** exclusively, with Regular, Medium, SemiBold, and Bold. Existing sizes include 28, 24, 20, 16, 14, and 12. The following complete scale and line heights are proposed standardization:

| Style | Size / line height | Weight |
| --- | --- | --- |
| Display/Large | 36 / 44 | Bold |
| Display/Medium | 32 / 40 | Bold |
| Heading/H1 | 28 / 36 | Bold |
| Heading/H2 | 24 / 32 | Bold |
| Heading/H3 | 20 / 28 | SemiBold |
| Heading/H4 | 18 / 26 | SemiBold |
| Body/Large | 18 / 28 | Regular |
| Body/Medium | 16 / 24 | Regular |
| Body/Small | 14 / 22 | Regular |
| Label/Large | 16 / 22 | SemiBold |
| Label/Medium | 14 / 20 | Medium |
| Label/Small | 12 / 18 | Medium |
| Button/Large | 16 / 22 | SemiBold |
| Button/Medium | 14 / 20 | SemiBold |
| Caption | 12 / 18 | Regular |

Use default letter spacing; use up to 0.5 only for short uppercase eyebrow labels. Quiz text: 18/28. Option text and long study content: at least 16/24. Important instructions must not use caption size.

Spacing variables: 4, 8, 12, 16, 20, 24, 32, 40, 48. Existing shared scale: 4, 8, 16, 24, 32, 40; intermediate steps are proposed additions.

Radius: XS 8; SM 12 (proposed); MD 16 for inputs/buttons; LG 20 for cards; XL 24 for containers/sheets; Pill 9999.

Elevation styles: 0 none; 1 black 4%, Y2, blur8; 2 black 8%, Y4, blur10; 3 black 12%, Y8, blur24. These are proposed Figma specifications based on the existing soft shadow; handoff must map them to platform-appropriate rendering.

Icons: Ionicons, standard 20 or 24; 16 for metadata, 28–32 for feature tiles. Existing tab icons are 20. Use consistent outline/filled selected pairs. Icons must have descriptive accessible labels.

## 10. Mobile frame and Auto Layout specification

Primary frame: **390 × 844**. Verify **360, 375, 412, and 430** widths. Produce narrow and wide variants of Home, Subject Bank, Quiz Attempt, Result Summary, and Payment History; document responsive rules for the remaining screens.

Use vertical Auto Layout for screens; Fill Container for content; Hug Contents for text; 16 side padding, 16 card padding, 12 inner gaps, and 24 between major sections. Authentication may use 24 side padding where space allows.

At 390 width, the standard content width is 358; at 360, it is 328. Do not hard-code cards to the larger width. Two-column tiles become one column when text scaling or content makes the grid unusable. Preserve 12 spacing between grid cells.

Reserve system safe areas separately from content. The primary iPhone reference may illustrate 47 top and 34 bottom insets; these are reference values, not universal device constants. Use a 56 content header plus the top inset. Use approximately 64 bottom-tab content height plus the device inset. Preserve platform-specific tab behavior from the current app.

Buttons: 52 large, 48 medium; small visual buttons may be 36 high inside at least a 48 touch region. Inputs: minimum 52 plus external label, helper, and error text. Interactive rows: minimum 56; use 64–72 when there is supporting text.

Use a minimum 48 × 48 design touch region. Fixed action bars need matching scroll-bottom padding and safe-area space. Forms must scroll with the keyboard visible; labels and errors remain visible. Tab bars hide while the keyboard is open, matching current behavior.

Use absolute positioning only for intentional overlapping graphics, scrims, and floating controls. Keep nested content, question options, card metadata, and forms in Auto Layout.

## 11. Reusable component library

Create component sets with documented properties rather than detached screen-specific copies.

| Component | Required properties / variants |
| --- | --- |
| Button | Primary, secondary, outline, text, danger; large/medium/small; default/pressed/disabled/loading; none/left/right icon |
| IconButton | Default, pressed, disabled; accessible label; 48 touch area |
| Input | Email, text, phone, password, search; default/focused/filled/error/disabled; helper and error slots |
| OTP | Six digits; empty/focused/filled/error/submitting; keyboard-safe |
| Checkbox / selection | Default, selected, disabled, error; separate tappable legal links |
| Chip | Filter, access, status; selected/unselected/disabled; text plus icon where meaningful |
| Card/Exam | Accessible/free/locked/purchased/expired where data supports it; variable metadata |
| Card/Subject | Title, category icon, optional count, access status, action |
| Card/Bundle | Name, description, supported price/access metadata, content summary |
| Card/Activity | Title, date, score, accuracy, percentile when present |
| Card/Order | Order ID, date, item, type, price, payment status |
| Card/Rank | Quiz/user variants; current learner highlight; optional metadata |
| Navigation | Main header, back header, bottom tabs, section tabs, section selector |
| Quiz/Option | Default, selected, disabled; correct/incorrect only for completed review |
| Quiz/PaletteCell | Not visited, not answered, answered, review, answered + review; independent current marker |
| Quiz/Timer | Normal, warning, expired; explicit time label |
| Feedback | Toast, inline error, notice, confirmation dialog, bottom sheet |
| System | Skeleton, loading, empty, error, offline, pagination footer, refreshing |
| Reader | Protected document header, note page, question answer reveal, external video card |
| Purchase | Locked content notice, purchase summary, processing, verifying, verified, failed, cancelled |

Example names: `Button/Primary`, `Card/MockTest`, `Quiz/Option`, `Navigation/Bottom`, `State/Empty`. Use explicit component properties such as `State=Loading`, `Access=Locked`, and `Selected=True`.

Add reusable security notice and app update prompt patterns where the existing app invokes them. Do not invent a notification inbox to host these notices.

## 12. Screen inventory and screen-by-screen UI plan

Every listed screen or overlay must have an annotation containing: purpose, primary CTA, secondary actions, component instances, entry, exit, data fields, loading/empty/error variants, responsive behavior, and special interaction rules. For non-data screens, mark empty state “Not applicable”; do not make fake empty screens.

### Entry and authentication

| Frame | Layout and content | Actions / flow | States and rules |
| --- | --- | --- | --- |
| Entry / Splash | App icon or original logo, quiet brand background | Follow current session/onboarding routing | Startup loading; avoid invented fixed delay |
| Entry / Onboarding / Step N | Existing learning story, focused visual, heading, one supporting sentence, step indicator | Existing next/back/entry controls; final step goes to Register | Preserve current slide content/count; do not invent promises |
| Auth / Login | Logo; “Welcome Back”; “Sign in to continue your learning journey.”; Email, Password, Remember Me, Forgot Password | Sign In → Home on authentication success; Create Account → Register | Empty, filled, validation error, submitting, request error; password visibility |
| Auth / Register | First Name, Last Name, existing Male/Female selection, Email, Mobile Number, Password, Confirm Password, legal acceptance | Create Account; Sign In; legal links | Show actual required fields and current validation; mobile input currently limited to 10 digits; do not add OTP registration without evidence |
| Auth / Forgot Password | Navy-to-blue hero and white form card; registered email | Request email OTP; return to Sign In | Invalid email, sending, request failure, request success |
| Auth / OTP Verification | Email context, six-digit input, concise resend guidance | Verify & Continue → Reset Password; Resend OTP | Empty/partial/filled, invalid code, verifying, resend feedback; no fabricated resend countdown |
| Auth / Reset Password | New Password and Confirm New Password | Reset Password; follow existing success destination | Visibility, mismatch, invalid, submitting, success, request failure |

Google and Apple buttons are currently visual placeholders without handlers in Login. They must not be clickable paths to successful authentication in the core prototype. Do not present them as supported integrations.

### Home and discovery

| Frame | Layout and content | Actions / flow | States and rules |
| --- | --- | --- | --- |
| Home / Default | Learner greeting; available dashboard statistic cards; Leaderboard entry; Explore actions; Performance & Activity; exam chips; recent attempts | Existing Explore destinations, leaderboard, activity result, tabs | Section-level loading/error; no recent activity; no invented promotional, notification, or search feature |
| Mock Bank / Subjects | Back/header as appropriate, subject/exam discovery, existing selection controls | Open relevant test list | Loading, empty, error, long titles |
| Mock Bank / Test List | Cards with title, subject, full marks, duration, negative marking, validity and price only when supplied | Accessible test → Rules; locked content → access/purchase context | Accessible, locked, purchased or expired when supported; empty/filter-empty, loading, error |
| Mock Tests / List | Existing mock-test listing destination with reusable test cards | Select test → Rules | Same component and state vocabulary as Mock Bank |
| PYQ / Existing Destination | Existing previous-year-question content and available selectors | Existing entry points and back | Keep as secondary destination; no new bottom tab |

Keep Home's existing “My Attended Quizzes Leaderboard” meaning. A shorter card title is acceptable if supporting copy preserves that scope. Preserve “Performance & Activity”, “Mock Bank”, and “Subject Bank”.

Search belongs in the relevant existing list, especially Subject Bank. Design clear, typing, loading, results, no-match, and error states. Do not add global search history, voice search, advanced difficulty sorting, or universal filters without support.

### Rules, quiz, palette, and submission

**Test / Rules:** Combine the existing detail and instruction content in the current rules screen; do not insert a mandatory extra detail step. Header “Mock Test Rules”; test title; price or Free; duration; full marks; negative marking; numbered rules; Terms & Conditions; required acceptance checkbox; Start Test. The primary action stays disabled/loading appropriately. Preserve the actual rule wording and marking values; never create a universal scoring rule.

**Quiz / Attempt / Default:** Compact header with exit/back, test title, current question/total, synchronization status, visible timer, and palette access. Body includes reference passage when present, question text, available image/media, and vertical options. Keep body text readable and allow long passage scrolling. Footer includes previous, mark/unmark review, and Next or Submit according to current position. Match existing selection/save behavior; do not imply that Next is required to persist an answer unless that is true.

**Quiz / Attempt / Selected:** Selected option uses blue border and pale blue fill plus a selected indicator. Correctness is not revealed during the timed test. Preserve selections when navigating between questions.

**Quiz / Attempt / Palette:** Responsive grid of question numbers, close control, totals, legend, Clear, and Save & Next/Submit Exam as supported. Use these semantic states: not visited (neutral outline), visited unanswered (dash), answered (check), review (flag), answered + review (check and flag). Current question gets a separate strong outline. Labels accompany colors. Reviewed is an overlapping property, not a mutually exclusive category; do not subtract it twice from unanswered totals.

**Quiz / Submit / Confirmation:** Proposed standardized confirmation treatment for the existing submit action. Show total, answered, unanswered, and marked-for-review count, with a note that review can include answered questions. Actions: Continue Test and Submit Test. Disable duplicate submission while processing. Explain finality using actual rules.

**Quiz / Submit / Processing:** “Preparing Result…” with clear loading feedback. On failure, preserve the attempt where supported and provide the actual retry/recovery action. Do not show a completed result before submission is confirmed.

**Quiz / Exit / Confirmation:** Show the existing consequences of exiting. Do not promise resume or saved progress unless supported. Cancel returns to the attempt.

**Quiz / Attempt / Offline and Time Expired:** Preserve the existing timer, save, synchronization, and expiry behavior. Display a specific offline/sync warning; never promise server synchronization while disconnected. Show expiry as the current logic dictates, with no invented grace period or restart action.

Also create initial question-loading, no-questions-returned, and question-request-failure variants.

### Results and rankings

| Frame | Layout and content | Actions / flow | States and rules |
| --- | --- | --- | --- |
| Result / Summary | Existing branded result hero; test title; final score/max marks; rank when available; earned marks and penalty; attempted/correct/wrong/skipped; negative marking breakdown | Back to existing destination; scroll to Question Review | Loading, unavailable result, partial data, error; no fabricated percentile or rank |
| Result / Question Review | Question number and text, answer options, selected answer, answer key, correct/incorrect/skipped label, explanation when present | Read within result screen | Correct/incorrect/unattempted; missing explanation and missing answer key handled explicitly |
| Results / My Results | Existing summary metrics; exam filters; recent attempt cards with available score/accuracy/percentile/date | Open attempt result; change exam filter | No attempts, no matches, loading, error |
| Leaderboard / Attended Quizzes | Header and scope; cards with quiz title, learner rank, score, accuracy, participant count when supplied | View Leaderboard → quiz ranking | Loading, no attended quizzes, error with Retry |
| Leaderboard / Quiz | Quiz context; ordered candidate cards with rank, public display name, score and supported accuracy/time/counts | Back to attended quizzes | Highlight current learner if identifiable; empty, loading, error |

Result review is currently part of the Result screen. Separate Figma review frames may demonstrate scroll position and state; they must not imply a new mandatory route. Do not add topic analytics or time-distribution charts unless real supporting data exists.

Rankings must not expose email addresses or mobile numbers, even as fallback display names. Do not fake podium membership when fewer than three ranked participants are available.

### Subject Bank and study materials

| Frame | Layout and content | Actions / flow | States and rules |
| --- | --- | --- | --- |
| Subject Bank / Browse | Existing header, subject/exam search, bundle/category cards, access badges | Open selected category or bundle; existing all-subject selector | Loading, no bundles, no search matches, pagination failure |
| Subject Bank / All Subjects Selector | “All Subject Bank”; “Search subject exam name …”; selectable entries | Select entry or close | Search empty/result/no match |
| Subject Bank / Bundle Detail | Selected bundle title, access context, existing search, available content tabs, section selector, content list | Open mock content or study resource; purchase when required | Only show tabs/sections actually supplied; locked/access verified/empty/loading/error |
| Study / Question Bank | Question list/selector, question detail, options, year where available | Existing answer reveal/hide; close | Empty, loading, error; distinguish study answers from active test answers |
| Study / Question Answer | Readable question and answer/explanation content | Close/back or existing next selection | Missing answer/explanation; long content |
| Study / Note Bank | Note title, page list/selector, selected page preview | View → full note page | No pages, no selection/content, loading/error |
| Study / Note Page | Readable note content with close/back | Return to note bank | Long text and supported imagery; no invented annotations |
| Study / Document Folder | Folder title and available document rows | Open document | Empty, loading, request error |
| Study / Protected Document | “Protected Study Material”, document title, close/back, reading surface | Close to parent resource list | Loading document, unavailable data, render error; preserve security restrictions |
| Study / Video Bank | Video list, title, supporting text, explicit external destination | “Open in YouTube” | Empty, loading, invalid/unavailable-link feedback |

On narrow screens, a cramped left rail plus content pane may become a stacked selector and detail area; this is a proposed responsive layout refinement, preserving the same content hierarchy. Search clear/reset is sufficient for unsupported filter scenarios.

Do not invent offline downloads, PDF export, sharing, bookmarks, annotations, in-app video playback, or document text search. Only show viewer controls proven to exist. Page indicators are conditional on the reader's available state.

### Access, purchase, and order history

**Purchase / Locked Content:** Item title, concise access explanation, known price and currency, and the real available purchase action. Clearly distinguish Free, Locked, Purchased, and Expired only when supported by entitlement data. Premium is a content-access label, not proof of a recurring subscription.

**Purchase / Summary:** Use selected bundle/item information. Do not invent monthly/annual plans, discount percentages, renewal terms, trials, or benefit claims. Use supplied currency; the source has inconsistent dollar/rupee presentations, so the design must flag currency confirmation instead of choosing silently.

**Purchase / Checkout:** Preserve the embedded payment web view, “Complete your payment” context, loading, close/cancel, and return to the selected item. Treat payment-provider content as externally controlled; design the app-owned container only.

**Purchase / Verifying:** Keep a distinct “Verifying payment” state after returning from checkout. A redirect or success-looking page is not proof of successful payment.

**Purchase / Verified:** Show confirmed purchase/access only after the app receives verified payment/entitlement status. Action returns to the purchased content. Failed or cancelled checkout keeps content locked. A verification delay does not become a false failed payment; provide a pending state and actual recovery action.

**Orders / Payment History:** Header “Course Payment History”, section “My Orders”; mobile cards containing Order ID, date, item name, type, price, status, and Load More when available. Status has text and icon. Include fetching, no payments, request error with Retry, partially loaded page, and pagination-error variants. No invented receipt download or refund controls.

Legacy standalone mock unlock behavior must be marked as an implementation/product-review dependency. Do not silently make the UI imply that navigating to rules proves payment succeeded.

### Profile, account, and legal

| Frame | Layout and content | Actions / flow | States and rules |
| --- | --- | --- | --- |
| Profile / Default | Existing avatar, learner details, available summary, grouped Performance & Activity and Account Settings | View Result, Edit Profile, Change Password, Course Payment History, About Us, available legal links, Logout | Loading, missing optional detail, error; My Courses is Coming Soon |
| Profile / Edit | Existing in-profile edit presentation; name/email/mobile and supported avatar actions | Save; cancel/back | Initial/edited, validation, submitting, success, request error |
| Profile / Edit / Stack Variant | Existing standalone Edit Profile destination using the same field components | Save/back | Document as a secondary entry variant; do not force both steps into one flow |
| Account / Change Password | Current Password, New Password, Confirm New Password | Update Password; back | Validation, password visibility, submitting, success, failure |
| Profile / Avatar Actions | Existing available photo actions | Use supported selection/removal controls, close | Permission/error feedback where applicable; do not add unsupported providers |
| Profile / Logout Confirmation | Short confirmation and consequence | Cancel or Logout → authentication | Loading/failure only if applicable to current behavior |
| Legal / About Us | Title, readable existing content | Back | Content loading/error only when applicable |
| Legal / Privacy Policy | Title and current policy content | Back to originating auth/profile context | Preserve wording; no invented policy text |
| Legal / Terms & Conditions | Title and current terms | Back to originating context | Preserve wording and legal links |

Profile groups supply the existing settings experience. Do not add theme/language/notification settings or a subscription hub without support.

## 13. State system and microcopy

Create page 14 as a reusable state library, and instantiate the relevant states next to each feature's main frame.

| Situation | Proposed copy | Action and layout |
| --- | --- | --- |
| Home has no activity | “No recent activity” / “Your test attempts will appear here.” | Existing Mock Bank destination |
| Test list empty | “No tests available” | Back or refresh where supported |
| Search has no matches | “No matching results” / “Try another subject or test name.” | Clear search |
| Results empty | “No results yet” / “Complete a test to see your results.” | Browse tests |
| Rankings empty | “No attended quizzes found” | Existing test discovery destination |
| Study resources empty | “No study materials available” | Back to parent category |
| Orders empty | “No payments found” / “Your purchases will appear here.” | Return to Subject Bank |
| Request failed | “We couldn’t load this content.” | Retry; preserve context |
| Session expired | “Your session has expired. Sign in again.” | Sign In; preserve only safe return context supported by app |
| Content unavailable | “This content is unavailable.” | Return to list |
| Offline | “You’re offline.” + accurate save/sync explanation | Retry when appropriate; retain available local content |
| Payment pending | “We’re verifying your payment.” | Existing recheck/return action; keep access pending |

Skeletons must resemble their eventual layout: cards for lists, metrics for dashboard/results, rows for rankings/profile. Use inline indicators for refresh and pagination; do not replace loaded content with a full-screen spinner. Forms show errors below the relevant input and a concise request error near the action.

Avoid automatic success toasts before server confirmation. Do not display Retry if repeating an action could duplicate a purchase; use the existing verification/recovery path.

## 14. Prototype flows and interactions

Build named starting points and clickable flows using component instances. Do not imply real API requests in a Figma prototype; annotate simulated responses.

1. **Returning learner:** Splash → Login → Home → each of the four tabs.
2. **New learner:** Onboarding → Register → existing successful registration destination; link to Sign In and legal pages. Confirm the actual success destination before wiring it; do not invent automatic authentication.
3. **Password recovery:** Login → Forgot Password → OTP Verification → Reset Password → existing success destination.
4. **Mock attempt:** Home/Mock Bank → selected list → Rules → accept terms → Attempt → select option → Next/Previous → mark review → Palette → Submit Confirmation → Processing → Result Summary → Question Review.
5. **Attempt recovery:** Attempt → offline warning or exit confirmation → cancel/continue; illustrate expiry and submit failure without inventing persistence guarantees.
6. **Rankings:** Home → Attended Quizzes Leaderboard → Quiz Leaderboard → back.
7. **Study:** Subject Bank → category/bundle → available section → Question Bank / Note Bank / Document Folder / Video Bank → supported reader or external-link transition → parent.
8. **Purchase:** Locked bundle → purchase context → Checkout → Verifying → Verified → unlocked content. Include cancelled, failed, and verification-pending branches.
9. **Account:** Profile → Edit Profile → Save feedback; Profile → Change Password; Profile → My Results → Result; Profile → Payment History; Profile → legal; Profile → Logout confirmation → Login.
10. **List states:** Search → result/no matches → Clear; pagination loading/error; retry returns to existing list context.

Use tap interactions, back navigation, overlay close, tab selection, checkbox selection, answer selection, and dialog cancellation. Use subtle 150–250 ms transitions and approximately 250 ms sheet movement; treat these as proposed motion tokens. Reduced-motion variants use immediate or simple fade transitions. Do not animate a distracting timer or loop success decoration.

For unsupported destinations or uncertain behavior, show a handoff note and stop that branch at the verified boundary. A prototype must not disguise an unimplemented feature as working.

## 15. Accessibility and responsive acceptance criteria

- Verify intended contrast targets: 4.5:1 for normal text, 3:1 for large text and essential non-text controls. These are design targets pending actual contrast checks.
- Minimum 48 touch regions; visual icons can be smaller.
- Use labels, shapes, checks, flags, and text in addition to color.
- Preserve logical reading order and descriptive names for icon-only controls.
- Represent focus and selected states distinctly.
- Validate long exam titles, long learner names, unavailable avatars, long explanations, and multiline errors.
- Validate increased text size; avoid fixed-height cards and clipped buttons. Stack metadata where necessary.
- Keep the timer visible while the question scrolls; avoid frequent assistive announcements for each ticking second.
- Keep sheet content scrollable and actions reachable at 360 width with the keyboard visible.
- Prevent tab bars and sticky quiz actions from covering the final content row.
- Protected document content must respect the existing security behavior without unsupported platform guarantees.
- Test every modal's close/cancel route and every error state's actual recovery action.

## 16. Developer handoff requirements

For each major frame and component, provide an adjacent annotation with:

1. Figma frame/component name and corresponding existing screen or viewer.
2. Purpose, entry route, exit routes, and primary/secondary actions.
3. Token names for color, typography, spacing, radius, icon size, and elevation.
4. Header, card, footer, safe-area, scrolling, keyboard, and responsive rules.
5. Component variants and the condition selecting each state.
6. Conditional data fields, missing-data behavior, and display formatting.
7. Interaction trigger, feedback, cancellation, and error recovery.
8. Accessibility labels and reading order.
9. Existing behavior versus proposed visual refinement versus optional unsupported concept.
10. Any unresolved dependency, especially currency, mock purchase gating, auth success routing, and optional data availability.

Use this annotation template:

> Frame: [name]  
> Existing screen/viewer: [reference]  
> Purpose: [one sentence]  
> Entry / Exit: [paths]  
> Primary / Secondary actions: [actions]  
> Components: [instance names]  
> Layout: [padding, gaps, sizing, scrolling, safe areas]  
> Tokens: [named styles and variables]  
> Data: [required/conditional fields, missing values]  
> States: [loading, empty, error, interaction]  
> Responsive / Accessibility: [specific rules]  
> Status: [existing / visual refinement / optional]  
> Dependency: [none or explicit unresolved issue]

Do not export typography as outlines, flatten interface text, or detach all component instances. Provide usable assets only where appropriate and identify their source. Prefer original brand assets over traced approximations.

## 17. Available versus optional scope

**Source-supported baseline:** Four existing tabs; email/password authentication; registration fields; password recovery with email OTP; dashboard activity; mock lists/rules/timed attempt; question palette and review; results; attended-quiz rankings; Subject Bank nested resources; external YouTube links; protected document viewer; bundle payment presentation and verification; payment history; profile; password update; legal pages.

**Existing placeholders/uncertain areas:** Social sign-in buttons without handlers; My Courses marked Coming Soon; legacy mock unlock behavior; exact values/fields returned for each item; precise currency across purchase entry points. Keep these explicit.

**Optional only, not part of baseline:** Notification inbox, recurring subscription plans, dark mode, language settings, global search history, bookmarks, document downloads/sharing, certificates, streak rewards, topic analytics, in-app video player, unsupported filter/sort options, and resume promises not established by current behavior.

## 18. Required output and completion checklist

First place the product analysis, inventory, user flow, information architecture, navigation structure, design direction, design system, component list, screen plan, state plan, prototype plan, and handoff plan on the appropriate Figma documentation pages. This brief already establishes the baseline; do not ask the requester to re-enter known app details.

Then build the screens in this order: foundations/components → authentication → Home → Mock Bank/rules → attempt/palette/submit → results/rankings → Subject Bank/readers → purchase/orders → profile/legal → responsive/state variants → prototype/handoff.

Before claiming the Figma design complete, verify:

- [ ] One organized file with the page structure and supplied Meritzo identity.
- [ ] Four correctly named tabs in the existing order.
- [ ] Inter styles and named color, spacing, radius, and elevation tokens.
- [ ] Reusable Auto Layout components and documented variants.
- [ ] Every required screen, viewer, dialog, and payment branch covered.
- [ ] Form validation, keyboard-safe layouts, and password visibility states.
- [ ] Loading, empty, error, offline, refresh, and pagination states where relevant.
- [ ] Question text and long study content remain readable at narrow widths.
- [ ] Timer, review markers, palette legend, and submit confirmation are unambiguous.
- [ ] No answer correctness shown during an active test.
- [ ] Payment verification is separate from checkout return; no false unlocked state.
- [ ] No invented rank, score, price, subscription, or optional analytics.
- [ ] Original protected-reader behavior retained; no unsupported export buttons.
- [ ] Leaderboards use public display names, not email or phone identifiers.
- [ ] 360/375/390/412/430 responsive rules checked and key variants created.
- [ ] Safe areas, enlarged text, touch targets, and contrast verified.
- [ ] Prototype routes, back actions, close actions, and failure branches tested.
- [ ] Every screen has its handoff annotation and implementation-status label.
- [ ] Optional concepts and unresolved dependencies are clearly separated.
- [ ] Report only deliverables actually produced and checks actually completed.

Final design direction: **Make this unmistakably Meritzo—logo-aligned navy, blue, cyan, and white branding, clear nursing exam preparation workflows, readable learning content, trustworthy test and payment states, and a consistent mobile design system ready for implementation.**
