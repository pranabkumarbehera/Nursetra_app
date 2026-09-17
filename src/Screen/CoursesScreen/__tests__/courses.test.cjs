// Run: node --test src/Screen/CoursesScreen/__tests__/courses.test.cjs
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');
const React = require('react');
const { act, create } = require('react-test-renderer');
global.IS_REACT_ACT_ENVIRONMENT = true;

function load(relative, mocks = {}) {
    const filename = path.join(__dirname, '..', relative);
    const code = ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
        compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
    }).outputText;
    const module = { exports: {} };
    new Function('require', 'module', 'exports', code)(
        (name) => mocks[name] || require(name),
        module,
        module.exports,
    );
    return module.exports;
}
const { useCoursePagination } = load('hooks/useCoursePagination.ts');
const { useCourseRequests } = load('hooks/useCourseRequests.ts');
const { useDebouncedValue } = load('hooks/useDebouncedValue.ts');
const helpers = load('utils/courseHelpers.ts', {
    '../../../Utils/Constants/Subjects': {
        FREE_MOCK_BUNDLE_NAME: 'Free Mock Bundle',
        getNursingSubjectName: (value) => value,
        getNursingSubjectOrder: () => 0,
    },
});

function harness(hook, props) {
    let current, renderer;
    function Host(p) {
        current = hook(p);
        return null;
    }
    act(() => {
        renderer = create(React.createElement(Host, props));
    });
    return {
        get value() {
            return current;
        },
        update(p) {
            act(() => renderer.update(React.createElement(Host, p)));
        },
        close() {
            act(() => renderer.unmount());
        },
    };
}
const records = Array.from({ length: 1000 }, (_, id) => ({ id, title: `Course ${id}` }));

test('1000 records expose ten initially; duplicate end events advance only once per gesture', () => {
    const h = harness((p) => useCoursePagination(p.data), { data: records });
    assert.equal(h.value.visibleData.length, 10);
    act(() => h.value.loadMore()); // mount/layout callbacks do not load pages
    assert.equal(h.value.visibleData.length, 10);
    act(() => {
        h.value.onScrollBeginDrag();
        h.value.loadMore();
        h.value.loadMore();
        h.value.loadMore();
    });
    assert.equal(h.value.visibleData.length, 20);
    assert.equal(new Set(h.value.visibleData.map((x) => x.id)).size, 20);
    act(() => {
        h.value.onScrollBeginDrag();
        h.value.loadMore();
    });
    assert.equal(h.value.visibleData.length, 30);
    h.close();
});

test('search filters all data before resetting pagination, including matches beyond first page', () => {
    const h = harness((p) => useCoursePagination(p.data), { data: records });
    const filtered = records.filter((x) => x.title.includes('999'));
    h.update({ data: filtered });
    assert.deepEqual(h.value.visibleData, [records[999]]);
    assert.equal(h.value.hasMore, false);
    h.update({ data: [] });
    assert.equal(h.value.visibleData.length, 0);
    h.close();
});

test('last partial page is bounded; all records become reachable without duplicates', () => {
    const data = records.slice(0, 27);
    const h = harness((p) => useCoursePagination(p.data), { data });
    for (let i = 0; i < 5; i++)
        act(() => {
            h.value.onScrollBeginDrag();
            h.value.loadMore();
        });
    assert.deepEqual(h.value.visibleData, data);
    assert.equal(h.value.hasMore, false);
    h.close();
});

test('catalog expansion keeps loaded window and remount restores it; changing search resets', () => {
    const memory = { current: null };
    const hook = (p) => useCoursePagination(p.data, 10, p.scopeKey, memory);
    let h = harness(hook, { data: records, scopeKey: 'subject:' });
    act(() => {
        h.value.onScrollBeginDrag();
        h.value.loadMore();
    });
    h.update({ data: [...records], scopeKey: 'subject:' });
    assert.equal(h.value.visibleData.length, 20);
    h.close();
    h = harness(hook, { data: [...records], scopeKey: 'subject:' });
    assert.equal(h.value.visibleData.length, 20);
    h.update({ data: records, scopeKey: 'exam:query' });
    assert.equal(h.value.visibleData.length, 10);
    h.close();
});

test('request guard coalesces taps and invalidates closed/unmounted requests', () => {
    const h = harness(() => useCourseRequests(), {});
    const first = h.value.begin('notes');
    assert.equal(h.value.begin('notes'), null);
    assert.equal(first.isCurrent(), true);
    h.value.cancel('notes');
    assert.equal(first.isCurrent(), false);
    const second = h.value.begin('notes');
    first.finish();
    assert.equal(second.isCurrent(), true);
    second.finish();
    const third = h.value.begin('notes');
    h.close();
    assert.equal(third.isCurrent(), false);
});

test('debounce waits for typing to settle and cancels on unmount', async () => {
    const h = harness((p) => useDebouncedValue(p.value, 20), { value: '' });
    h.update({ value: 'nurse' });
    assert.equal(h.value, '');
    await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 30));
    });
    assert.equal(h.value, 'nurse');
    h.update({ value: 'nursing' });
    h.close();
});

test('normalization retains section order, payload forms, IDs, pricing and malformed JSON behavior', () => {
    assert.deepEqual(helpers.getBundleItems({ data: { bundles: [{ bundle: { id: 'a' } }] } }), [{ id: 'a' }]);
    assert.equal(helpers.parseMaybeJson('{invalid'), '{invalid');
    const data = {
        questionBanks: [{ id: 'q' }],
        noteBanks: [{ id: 'n' }],
        videoBanks: [{ id: 'v' }],
        documentFolders: [{ id: 'd' }],
    };
    assert.deepEqual(
        helpers.normalizeCourseSections(data).map((x) => x.key),
        ['question', 'note', 'video', 'document'],
    );
    assert.equal(helpers.resolveBundlePricing({ price: 100, discountPercentage: 20 }).finalPrice, 80);
    assert.equal(helpers.resolveBundlePricing({ price: 100, discountPrice: 50 }).finalPrice, 50);
    assert.equal(helpers.uniqueBundlesById([{ id: 'a' }, { id: 'a' }, { id: 'b' }]).length, 2);
});

test('category grouping preserves free/elite rules and deduplicates bundle IDs', () => {
    const subjects = [
        { id: 'n', title: 'Nursing', subject: 'Nursing' },
        { id: 'n', title: 'Nursing', subject: 'Nursing' },
    ];
    const elite = { id: 'e', title: 'Elite Mock Bundle' };
    const exam = { id: 'x', title: 'NORCET course' };
    const free = { id: 'f', title: 'Free Mock Bundle', subject: 'Nursing' };
    const data = [...subjects, elite, exam, free];
    const subjectGroups = helpers.buildCategoryGroups(data, ['Nursing'], 'subject', []);
    assert.deepEqual(
        subjectGroups[0].bundles.map((x) => x.id),
        ['n', 'f'],
    );
    const examGroups = helpers.buildCategoryGroups(data, ['Elite Mock Bundle', 'NORCET'], 'exam', []);
    assert.deepEqual(
        examGroups.map((x) => x.bundles.map((b) => b.id)),
        [['e', 'f'], ['x']],
    );
});

test('normalization reuses metadata for the same immutable response without mixing responses', () => {
    const first = { noteBanks: [{ id: 'a' }], quizzes: [{ id: 'q' }] };
    const second = { noteBanks: [{ id: 'b' }] };
    assert.equal(helpers.getDetailCollections(first), helpers.getDetailCollections(first));
    assert.equal(helpers.getBundleQuizzes(first), helpers.getBundleQuizzes(first));
    assert.notEqual(helpers.getDetailCollections(first), helpers.getDetailCollections(second));
});

test('visible quiz metadata uses three workers, shares requests, and stops scheduling after unmount', async () => {
    const calls = [];
    const { useMockMarkings } = load('hooks/useMockMarkings.ts', {
        '../../../Utils/Helpers/ApiRequest': {
            getApi: (url) => new Promise((resolve) => calls.push({ url, resolve })),
        },
        '../utils/courseHelpers': helpers,
    });
    const data = records.slice(1, 11);
    const h = harness((p) => useMockMarkings(p.data, 'test-session'), { data });
    assert.equal(calls.length, 3);
    await act(async () => {
        for (const call of calls.slice(0, 3)) call.resolve({ status: 200, data: { id: call.url } });
        await Promise.resolve();
    });
    assert.equal(calls.length, 6);
    h.update({ data: [...data] });
    await act(async () => {
        await Promise.resolve();
    });
    assert.equal(new Set(calls.map((x) => x.url)).size, calls.length);
    h.close();
    const countAtUnmount = calls.length;
    await act(async () => {
        calls.forEach((call) => call.resolve({ status: 200, data: {} }));
        await Promise.resolve();
    });
    assert.equal(calls.length, countAtUnmount);
});
