// lib/friendTestStorage.ts

export type StoredTest = {
    id: string;
    creatorName: string;
    createdAt: string; // ISO string
};

const TESTS_STORAGE_KEY = "flovi_friendtest_tests";

export function loadStoredTests(): StoredTest[] {
    if (typeof window === "undefined") return [];
    try {
        const raw = window.localStorage.getItem(TESTS_STORAGE_KEY);
        if (!raw) return [];
        const parsed = JSON.parse(raw);
        if (!Array.isArray(parsed)) return [];
        return parsed.filter(
            (t) =>
                t &&
                typeof t.id === "string" &&
                typeof t.creatorName === "string" &&
                typeof t.createdAt === "string"
        );
    } catch {
        return [];
    }
}

export function addStoredTest(test: StoredTest) {
    if (typeof window === "undefined") return;
    try {
        const current = loadStoredTests();
        // Aynı id zaten varsa tekrar ekleme
        if (!current.find((t) => t.id === test.id)) {
            const updated = [test, ...current]; // en yeni en başta
            window.localStorage.setItem(TESTS_STORAGE_KEY, JSON.stringify(updated));
        }
    } catch {
        // sessiz fail
    }
}
