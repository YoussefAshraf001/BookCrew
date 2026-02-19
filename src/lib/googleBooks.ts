import { parseGoogleDateToTimestamp } from "@/lib/status";

export type BookSummary = {
  id: string;
  title: string;
  authors: string;
  publishedDate: string;
  publishedDateRaw: string | null;
  category: string;
  thumbnail: string | null;
};

export type BookDetail = BookSummary & {
  description: string;
  pageCount: number | null;
  publisher: string;
  previewLink: string | null;
};

export type ExploreRail = {
  id: string;
  title: string;
  description: string;
  books: BookSummary[];
};

export type ExploreRailDetail = ExploreRail & {
  totalAvailable: number;
};

type GoogleBooksResponse = {
  items?: GoogleBookItem[];
};

type GoogleBookItem = {
  id: string;
  volumeInfo?: {
    title?: string;
    authors?: string[];
    publishedDate?: string;
    categories?: string[];
    imageLinks?: {
      thumbnail?: string;
      smallThumbnail?: string;
    };
    description?: string;
    pageCount?: number;
    publisher?: string;
    previewLink?: string;
  };
};

type VolumeQueryOptions = {
  orderBy?: "relevance" | "newest";
  filter?: "ebooks" | "free-ebooks" | "paid-ebooks" | "full" | "partial";
  langRestrict?: string;
  printType?: "all" | "books" | "magazines";
  startIndex?: number;
};

type ExploreRailConfig = {
  id: string;
  title: string;
  description: string;
  query: string;
  maxResults?: number;
  options?: VolumeQueryOptions;
};

const BASE_URL = "https://www.googleapis.com/books/v1/volumes";

const exploreRailConfigs: ExploreRailConfig[] = [
  {
    id: "popular-fiction",
    title: "Popular Fiction",
    description: "Mainstream fiction picks across genres.",
    query: "subject:fiction",
    maxResults: 12,
    options: { orderBy: "relevance", langRestrict: "en" },
  },
  {
    id: "young-adult",
    title: "Young Adult",
    description: "YA books across romance, mystery, and fantasy.",
    query: "subject:young adult fiction",
    maxResults: 12,
    options: { orderBy: "relevance", langRestrict: "en" },
  },
  {
    id: "mystery-thriller",
    title: "Mystery & Thriller",
    description: "Fast-paced suspense and mystery reads.",
    query: "subject:mystery subject:thrillers",
    maxResults: 12,
    options: { orderBy: "relevance", langRestrict: "en" },
  },
  {
    id: "new-releases",
    title: "New Releases",
    description: "Recent books ordered by newest first.",
    query: "subject:fiction",
    maxResults: 12,
    options: { orderBy: "newest", langRestrict: "en" },
  },
  {
    id: "free-ebooks",
    title: "Free Ebooks",
    description: "Titles marked free by Google Books.",
    query: "subject:fiction",
    maxResults: 12,
    options: {
      orderBy: "relevance",
      filter: "free-ebooks",
      langRestrict: "en",
    },
  },
  {
    id: "romance",
    title: "Romance",
    description: "Heart-forward stories and relationship-driven fiction.",
    query: "subject:romance",
    maxResults: 12,
    options: { orderBy: "relevance", langRestrict: "en" },
  },
  {
    id: "fantasy",
    title: "Fantasy Worlds",
    description: "Magic systems, epic worlds, and dark fantasy series.",
    query: "subject:fantasy subject:fiction",
    maxResults: 12,
    options: { orderBy: "relevance", langRestrict: "en" },
  },
  {
    id: "science-fiction",
    title: "Science Fiction",
    description: "Space operas, cyber futures, and speculative fiction.",
    query: "subject:science fiction",
    maxResults: 12,
    options: { orderBy: "relevance", langRestrict: "en" },
  },
  {
    id: "horror",
    title: "Horror & Dark",
    description: "Creeping dread, supernatural suspense, and dark reads.",
    query: "subject:horror subject:fiction",
    maxResults: 12,
    options: { orderBy: "relevance", langRestrict: "en" },
  },
  {
    id: "historical-fiction",
    title: "Historical Fiction",
    description: "Story-driven fiction grounded in historical eras.",
    query: "subject:historical fiction",
    maxResults: 12,
    options: { orderBy: "relevance", langRestrict: "en" },
  },
  {
    id: "crime-detective",
    title: "Crime & Detective",
    description: "Investigations, procedural mysteries, and crime novels.",
    query: "subject:detective subject:crime",
    maxResults: 12,
    options: { orderBy: "relevance", langRestrict: "en" },
  },
  {
    id: "paid-ebooks",
    title: "Paid Ebooks",
    description: "Commercial ebook catalog for modern mainstream titles.",
    query: "subject:fiction",
    maxResults: 12,
    options: {
      orderBy: "relevance",
      filter: "paid-ebooks",
      langRestrict: "en",
    },
  },
];

function formatPublishedDate(value?: string): string {
  if (!value) return "Unknown";

  const parts = value.split("-").map(Number);

  if (parts.length === 3) {
    const [year, month, day] = parts;
    if (
      !Number.isFinite(year) ||
      !Number.isFinite(month) ||
      !Number.isFinite(day) ||
      month < 1 ||
      month > 12 ||
      day < 1 ||
      day > 31
    ) {
      return value;
    }
    const date = new Date(Date.UTC(year, month - 1, day));
    if (Number.isNaN(date.getTime())) {
      return value;
    }

    return date.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
      timeZone: "UTC",
    });
  }

  if (parts.length === 2) {
    const [year, month] = parts;
    if (!Number.isFinite(year) || !Number.isFinite(month) || month < 1 || month > 12) {
      return value;
    }
    const date = new Date(Date.UTC(year, month - 1, 1));
    if (Number.isNaN(date.getTime())) {
      return value;
    }

    return date.toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
      timeZone: "UTC",
    });
  }

  return value;
}

function normalizeThumbnail(
  thumbnail?: string,
  fallback?: string,
): string | null {
  const image = thumbnail ?? fallback;

  if (!image) {
    return null;
  }

  if (image.startsWith("http://")) {
    return image.replace("http://", "https://");
  }

  return image;
}

function mapBookSummary(item: GoogleBookItem): BookSummary | null {
  const info = item.volumeInfo;

  if (!info?.title) {
    return null;
  }

  return {
    id: item.id,
    title: info.title,
    authors: info.authors?.join(", ") ?? "Unknown author",
    publishedDate: formatPublishedDate(info.publishedDate),
    publishedDateRaw: info.publishedDate ?? null,
    category: info.categories?.[0] ?? "Book",
    thumbnail: normalizeThumbnail(
      info.imageLinks?.thumbnail,
      info.imageLinks?.smallThumbnail,
    ),
  };
}

function mapBookDetail(item: GoogleBookItem): BookDetail | null {
  const summary = mapBookSummary(item);

  if (!summary) {
    return null;
  }

  const info = item.volumeInfo;

  return {
    ...summary,
    description: info?.description ?? "No description available.",
    pageCount: info?.pageCount ?? null,
    publisher: info?.publisher ?? "Unknown publisher",
    previewLink: info?.previewLink ?? null,
  };
}

function buildSearchUrl(
  query: string,
  maxResults: number,
  options: VolumeQueryOptions = {},
): string {
  const params = new URLSearchParams({
    q: query,
    maxResults: String(maxResults),
    printType: options.printType ?? "books",
    orderBy: options.orderBy ?? "relevance",
  });

  if (options.filter) {
    params.set("filter", options.filter);
  }

  if (options.langRestrict) {
    params.set("langRestrict", options.langRestrict);
  }

  if (typeof options.startIndex === "number" && options.startIndex > 0) {
    params.set("startIndex", String(Math.max(0, Math.trunc(options.startIndex))));
  }

  if (process.env.GOOGLE_BOOKS_API_KEY) {
    params.set("key", process.env.GOOGLE_BOOKS_API_KEY);
  }

  return `${BASE_URL}?${params.toString()}`;
}

async function fetchVolumes(
  query: string,
  maxResults: number,
  options: VolumeQueryOptions = {},
): Promise<GoogleBookItem[]> {
  const clampedMaxResults = Math.min(40, Math.max(1, Math.trunc(maxResults)));

  try {
    const response = await fetch(buildSearchUrl(query, clampedMaxResults, options), {
      next: { revalidate: 1800 },
    });

    if (!response.ok) {
      return [];
    }

    const data = (await response.json()) as GoogleBooksResponse;
    return data.items ?? [];
  } catch {
    return [];
  }
}

function normalizeText(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

const nonOfficialSignals = [
  "fan fiction",
  "fanfict",
  "guide",
  "study guide",
  "summary",
  "analysis",
  "review",
  "companion",
  "workbook",
  "quiz",
  "coloring book",
  "leading man",
  "book notes",
];

function looksLikeOfficialEdition(book: BookSummary, rawQuery: string): boolean {
  const query = normalizeText(rawQuery);
  const title = normalizeText(book.title);
  const category = normalizeText(book.category);
  const haystack = `${title} ${category}`;

  if (nonOfficialSignals.some((signal) => haystack.includes(signal))) {
    return false;
  }

  const queryWords = query.split(" ").filter(Boolean);
  if (queryWords.length === 0) {
    return true;
  }

  const matchedWords = queryWords.filter((word) => title.includes(word)).length;
  return matchedWords >= Math.max(1, Math.ceil(queryWords.length / 2));
}

function scoreBookMatch(book: BookSummary, rawQuery: string): number {
  const query = normalizeText(rawQuery);
  const title = normalizeText(book.title);
  const authors = normalizeText(book.authors);
  const category = normalizeText(book.category);

  if (!query) {
    return 0;
  }

  const queryWords = query.split(" ").filter(Boolean);
  const titleWords = title.split(" ").filter(Boolean);

  let score = 0;

  if (title === query) {
    score += 220;
  }

  if (title.startsWith(`${query} `) || title.endsWith(` ${query}`)) {
    score += 150;
  }

  if (title.includes(query)) {
    score += 100;
  }

  const matchedWords = queryWords.filter((word) => title.includes(word)).length;
  score += matchedWords * 22;

  if (matchedWords !== queryWords.length) {
    score -= 60;
  }

  if (authors.includes(query)) {
    score += 25;
  }

  if (category.includes("fiction")) {
    score += 10;
  }

  if (queryWords.length <= 2 && titleWords.length > 7) {
    score -= 20;
  }

  return score;
}

function isDisplayableBook(book: BookSummary): boolean {
  return (
    Boolean(book.thumbnail) &&
    book.authors.trim().toLowerCase() !== "unknown author" &&
    Boolean(book.publishedDateRaw) &&
    book.publishedDate.trim().toLowerCase() !== "unknown"
  );
}

function isExploreEligibleBook(book: BookSummary): boolean {
  return (
    Boolean(book.thumbnail) &&
    book.authors.trim().toLowerCase() !== "unknown author" &&
    parseGoogleDateToTimestamp(book.publishedDateRaw ?? undefined) !== null &&
    book.publishedDate.trim().toLowerCase() !== "unknown"
  );
}

function pickNewReleaseBooks(books: BookSummary[], limit: number): BookSummary[] {
  const now = new Date();
  const recentCutoff = Date.UTC(now.getUTCFullYear() - 4, 0, 1);

  const withDates = books
    .map((book) => ({
      book,
      releaseAt: parseGoogleDateToTimestamp(book.publishedDateRaw ?? undefined),
    }))
    .filter((entry) => entry.releaseAt !== null) as Array<{
    book: BookSummary;
    releaseAt: number;
  }>;

  const sortedNewest = withDates.sort((a, b) => b.releaseAt - a.releaseAt);

  const recentOnly = sortedNewest
    .filter((entry) => entry.releaseAt >= recentCutoff)
    .map((entry) => entry.book);

  if (recentOnly.length >= Math.min(8, limit)) {
    return recentOnly.slice(0, limit);
  }

  return sortedNewest.map((entry) => entry.book).slice(0, limit);
}

export async function searchBooks(
  query: string,
  maxResults = 16,
  options: {
    lang?: string;
    sort?: "relevance" | "newest";
    format?: "all" | "books" | "ebooks";
    availability?: "all" | "free" | "preview" | "paid";
  } = {},
): Promise<BookSummary[]> {
  const trimmed = query.trim();

  if (!trimmed) {
    return [];
  }

  const safeQuery = trimmed.replace(/"/g, "");
  const langRestrict =
    options.lang && options.lang !== "all" ? options.lang : undefined;
  const filter =
    options.availability === "free"
      ? "free-ebooks"
      : options.availability === "preview"
        ? "partial"
        : options.availability === "paid"
          ? "paid-ebooks"
          : options.format === "ebooks"
            ? "ebooks"
            : undefined;

  const queryOptions: VolumeQueryOptions = {
    langRestrict,
    orderBy: options.sort ?? "relevance",
    filter,
    printType: options.format === "all" ? "all" : "books",
  };

  const [titleVolumes, broadVolumes] = await Promise.all([
    fetchVolumes(
      `intitle:"${safeQuery}"`,
      Math.max(maxResults * 2, 20),
      queryOptions,
    ),
    fetchVolumes(trimmed, Math.max(maxResults * 2, 20), queryOptions),
  ]);

  const unique = new Map<string, BookSummary>();

  [...titleVolumes, ...broadVolumes].forEach((item) => {
    const mapped = mapBookSummary(item);

    if (mapped) {
      unique.set(mapped.id, mapped);
    }
  });

  return [...unique.values()]
    .filter((book) => looksLikeOfficialEdition(book, trimmed))
    .sort((a, b) => scoreBookMatch(b, trimmed) - scoreBookMatch(a, trimmed))
    .slice(0, maxResults);
}

export async function getFeaturedBooks(): Promise<BookSummary[]> {
  const volumeSets = await Promise.all([
    fetchVolumes("subject:fiction", 24, {
      orderBy: "relevance",
      langRestrict: "en",
      printType: "books",
    }),
    fetchVolumes("subject:young+adult+fiction", 20, {
      orderBy: "relevance",
      langRestrict: "en",
      printType: "books",
    }),
    fetchVolumes("subject:fantasy+subject:fiction", 20, {
      orderBy: "relevance",
      langRestrict: "en",
      printType: "books",
    }),
  ]);

  const dedupe = new Map<string, BookSummary>();

  volumeSets.flat().forEach((item) => {
    const mapped = mapBookSummary(item);
    if (mapped && isDisplayableBook(mapped)) {
      dedupe.set(mapped.id, mapped);
    }
  });

  return [...dedupe.values()]
    .sort((a, b) => {
      const aDate = parseGoogleDateToTimestamp(a.publishedDateRaw ?? undefined) ?? 0;
      const bDate = parseGoogleDateToTimestamp(b.publishedDateRaw ?? undefined) ?? 0;
      return bDate - aDate;
    })
    .slice(0, 8);
}

export async function getExploreRails(): Promise<ExploreRail[]> {
  const rails = await Promise.all(
    exploreRailConfigs.map(async (rail) => {
      const primaryVolumes = await fetchVolumes(
        rail.query,
        rail.maxResults ?? 12,
        rail.options,
      );
      const fallbackVolumes =
        primaryVolumes.length === 0
          ? await fetchVolumes("subject:fiction", rail.maxResults ?? 12, {
              orderBy: rail.options?.orderBy ?? "relevance",
              langRestrict: rail.options?.langRestrict ?? "en",
              printType: "books",
            })
          : [];

      const books = [...primaryVolumes, ...fallbackVolumes]
        .map(mapBookSummary)
        .filter((book): book is BookSummary => book !== null)
        .filter(isExploreEligibleBook);

      const dedupe = new Map<string, BookSummary>();
      books.forEach((book) => {
        if (!dedupe.has(book.id)) {
          dedupe.set(book.id, book);
        }
      });

      const sorted = [...dedupe.values()].sort((a, b) => {
        const aDate = parseGoogleDateToTimestamp(a.publishedDateRaw ?? undefined) ?? 0;
        const bDate = parseGoogleDateToTimestamp(b.publishedDateRaw ?? undefined) ?? 0;
        if (rail.id === "new-releases") {
          return bDate - aDate;
        }
        return 0;
      });

      const booksForRail =
        rail.id === "new-releases"
          ? pickNewReleaseBooks(sorted, rail.maxResults ?? 12)
          : sorted.slice(0, rail.maxResults ?? 12);

      return {
        id: rail.id,
        title: rail.title,
        description: rail.description,
        books: booksForRail,
      } satisfies ExploreRail;
    }),
  );

  return rails;
}

export async function getExploreRailById(
  railId: string,
  limit = 28,
): Promise<ExploreRailDetail | null> {
  const rail = exploreRailConfigs.find((item) => item.id === railId);

  if (!rail) {
    return null;
  }

  const [pageA, pageB] = await Promise.all([
    fetchVolumes(rail.query, 40, rail.options),
    fetchVolumes(rail.query, 40, {
      ...rail.options,
      startIndex: 40,
    }),
  ]);

  const fallback =
    pageA.length === 0 && pageB.length === 0
      ? await fetchVolumes("subject:fiction", 40, {
          orderBy: rail.options?.orderBy ?? "relevance",
          langRestrict: rail.options?.langRestrict ?? "en",
          printType: "books",
        })
      : [];

  const books = [...pageA, ...pageB, ...fallback]
    .map(mapBookSummary)
    .filter((book): book is BookSummary => book !== null)
    .filter(isExploreEligibleBook);

  const dedupe = new Map<string, BookSummary>();
  books.forEach((book) => {
    if (!dedupe.has(book.id)) {
      dedupe.set(book.id, book);
    }
  });

  const sorted = [...dedupe.values()].sort((a, b) => {
    const aDate = parseGoogleDateToTimestamp(a.publishedDateRaw ?? undefined) ?? 0;
    const bDate = parseGoogleDateToTimestamp(b.publishedDateRaw ?? undefined) ?? 0;
    if (rail.id === "new-releases") {
      return bDate - aDate;
    }
    return 0;
  });

  return {
    id: rail.id,
    title: rail.title,
    description: rail.description,
    books:
      rail.id === "new-releases"
        ? pickNewReleaseBooks(sorted, Math.max(1, limit))
        : sorted.slice(0, Math.max(1, limit)),
    totalAvailable: sorted.length,
  };
}

export async function getBookById(id: string): Promise<BookDetail | null> {
  const trimmed = id.trim();

  if (!trimmed) {
    return null;
  }

  try {
    const params = new URLSearchParams();

    if (process.env.GOOGLE_BOOKS_API_KEY) {
      params.set("key", process.env.GOOGLE_BOOKS_API_KEY);
    }

    const suffix = params.toString();
    const url = `${BASE_URL}/${encodeURIComponent(trimmed)}${suffix ? `?${suffix}` : ""}`;
    const response = await fetch(url, { next: { revalidate: 1800 } });

    if (!response.ok) {
      return null;
    }

    const data = (await response.json()) as GoogleBookItem;
    return mapBookDetail(data);
  } catch {
    return null;
  }
}

export async function getUpcomingReleases(limit = 8): Promise<BookSummary[]> {
  const volumeSets = await Promise.all([
    fetchVolumes("subject:fiction", 40, {
      orderBy: "newest",
      langRestrict: "en",
      printType: "books",
    }),
    fetchVolumes("subject:young+adult+fiction", 40, {
      orderBy: "newest",
      langRestrict: "en",
      printType: "books",
    }),
  ]);

  const now = Date.now();
  const dedupe = new Map<string, BookSummary>();

  volumeSets
    .flat()
    .map(mapBookSummary)
    .filter((book): book is BookSummary => book !== null)
    .filter(isDisplayableBook)
    .forEach((book) => {
      dedupe.set(book.id, book);
    });

  const all = [...dedupe.values()].map((book) => ({
    book,
    releaseAt: parseGoogleDateToTimestamp(book.publishedDateRaw ?? undefined),
  }));

  const future = all
    .filter((entry) => entry.releaseAt !== null && entry.releaseAt > now)
    .sort((a, b) => (a.releaseAt as number) - (b.releaseAt as number))
    .map((entry) => entry.book)
    .slice(0, limit);

  return future;
}
