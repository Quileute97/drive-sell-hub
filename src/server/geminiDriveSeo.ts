export interface ParsedDriveLink {
  id: string;
  kind: "file" | "document" | "spreadsheets" | "presentation" | "folder";
  canonicalUrl: string;
}

export interface DriveMetadata {
  id: string;
  kind: ParsedDriveLink["kind"];
  canonicalUrl: string;
  fileName: string | null;
  ogDescription: string | null;
  textSnippet: string | null;
  inferredFormat: string | null;
  isPublicReadable: boolean;
}

export interface GeminiCategoryInput {
  id: string;
  name: string;
}

export interface GeminiSeoResult {
  title: string;
  meta_title: string;
  short_description: string;
  meta_description: string;
  focus_keyword: string;
  description_html: string;
  tags: string[];
  file_format: string;
  suggested_category_id: string | null;
  suggested_category_name: string | null;
  detected_file_name: string | null;
  drive_public_readable: boolean;
  model_used: string;
}

interface EnvLike {
  GEMINI_API_KEY?: string | undefined;
  GOOGLE_GEMINI_API_KEY?: string | undefined;
  SUPABASE_URL?: string | undefined;
  VITE_SUPABASE_URL?: string | undefined;
  SUPABASE_PUBLISHABLE_KEY?: string | undefined;
  VITE_SUPABASE_PUBLISHABLE_KEY?: string | undefined;
}

const DEFAULT_SUPABASE_URL = "https://dfalphamyvdfewixrnju.supabase.co";
const DEFAULT_SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRmYWxwaGFteXZkZmV3aXhybmp1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU1ODcyODIsImV4cCI6MjA3MTE2MzI4Mn0.T908t3vL1v1L0jY_4lJ_F5mR2o_gT-N-aW-sK-pI_qA";

const DRIVE_ID_RE = /^[a-zA-Z0-9_-]{10,120}$/;

function jsonResponse(
  payload: unknown,
  status = 200,
  extraHeaders?: Record<string, string>
): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
      ...(extraHeaders || {}),
    },
  });
}

export function parseGoogleDriveLink(rawUrl: string): ParsedDriveLink | null {
  let url: URL;
  try {
    url = new URL(rawUrl.trim());
  } catch {
    return null;
  }

  if (url.protocol !== "https:" && url.protocol !== "http:") {
    return null;
  }

  const host = url.hostname.toLowerCase();
  if (host !== "drive.google.com" && host !== "docs.google.com") {
    return null;
  }

  const pathname = url.pathname;

  // docs.google.com/(document|spreadsheets|presentation)/d/<ID>/...
  if (host === "docs.google.com") {
    const docMatch = pathname.match(
      /\/(document|spreadsheets|presentation)\/(?:u\/\d+\/)?d\/([a-zA-Z0-9_-]{10,120})/
    );
    if (docMatch && docMatch[1] && docMatch[2] && DRIVE_ID_RE.test(docMatch[2])) {
      const kind = docMatch[1] as "document" | "spreadsheets" | "presentation";
      return {
        id: docMatch[2],
        kind,
        canonicalUrl: `https://docs.google.com/${kind}/d/${docMatch[2]}/edit`,
      };
    }
  }

  // drive.google.com/drive/folders/<ID>
  const folderMatch = pathname.match(
    /\/drive\/(?:u\/\d+\/)?folders\/([a-zA-Z0-9_-]{10,120})/
  );
  if (folderMatch && folderMatch[1] && DRIVE_ID_RE.test(folderMatch[1])) {
    return {
      id: folderMatch[1],
      kind: "folder",
      canonicalUrl: `https://drive.google.com/drive/folders/${folderMatch[1]}`,
    };
  }

  // drive.google.com/file/d/<ID>/...
  const fileMatch = pathname.match(/\/file\/(?:u\/\d+\/)?d\/([a-zA-Z0-9_-]{10,120})/);
  if (fileMatch && fileMatch[1] && DRIVE_ID_RE.test(fileMatch[1])) {
    return {
      id: fileMatch[1],
      kind: "file",
      canonicalUrl: `https://drive.google.com/file/d/${fileMatch[1]}/view`,
    };
  }

  // drive.google.com/open?id=<ID> or uc?id=<ID>
  const qId = url.searchParams.get("id")?.trim() || "";
  if (DRIVE_ID_RE.test(qId)) {
    return {
      id: qId,
      kind: "file",
      canonicalUrl: `https://drive.google.com/file/d/${qId}/view`,
    };
  }

  return null;
}

function decodeHtmlEntities(input: string): string {
  return input
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, num) => {
      const code = Number(num);
      return Number.isFinite(code) ? String.fromCharCode(code) : "";
    })
    .replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => {
      const code = parseInt(hex, 16);
      return Number.isFinite(code) ? String.fromCharCode(code) : "";
    })
    .replace(/\s+/g, " ")
    .trim();
}

function cleanDriveTitle(rawTitle: string): string | null {
  const cleaned = decodeHtmlEntities(rawTitle)
    .replace(/\s*[-–|]\s*Google\s+(Drive|Docs|Sheets|Slides|Tài liệu|Trang tính|Trang trình bày)\s*$/i, "")
    .trim();

  if (!cleaned) return null;
  const lower = cleaned.toLowerCase();
  if (
    lower === "google drive" ||
    lower.includes("sign in") ||
    lower.includes("sign-in") ||
    lower.includes("đăng nhập") ||
    lower.includes("meet google drive") ||
    lower === "page not found" ||
    lower === "error 404" ||
    lower === "không tìm thấy trang"
  ) {
    return null;
  }
  return cleaned;
}

function extractMetaAttribute(html: string, attrName: string, attrValue: string): string | null {
  const escaped = attrValue.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const patterns = [
    new RegExp(
      `<meta[^>]+${attrName}=["']${escaped}["'][^>]+content=["']([^"']+)["']`,
      "i"
    ),
    new RegExp(
      `<meta[^>]+content=["']([^"']+)["'][^>]+${attrName}=["']${escaped}["']`,
      "i"
    ),
  ];
  for (const re of patterns) {
    const match = html.match(re);
    if (match && match[1]) {
      return decodeHtmlEntities(match[1]);
    }
  }
  return null;
}

function inferFileFormat(
  fileName: string | null,
  kind: ParsedDriveLink["kind"]
): string | null {
  if (fileName) {
    const extMatch = fileName.match(
      /\.(pdf|docx?|xlsx?|pptx?|zip|rar|7z|mp4|mkv|mp3|epub|mobi|psd|ai|fig|csv|txt|sql|apk|exe|iso)$/i
    );
    if (extMatch && extMatch[1]) {
      return extMatch[1].toUpperCase();
    }
  }
  if (kind === "document") return "Google Docs";
  if (kind === "spreadsheets") return "XLSX";
  if (kind === "presentation") return "PPTX";
  if (kind === "folder") return "Folder";
  return null;
}

async function readResponseTextCapped(res: Response, maxBytes: number): Promise<string> {
  if (!res.body) return "";
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let total = 0;
  let result = "";
  try {
    while (total < maxBytes) {
      const { value, done } = await reader.read();
      if (done) break;
      if (value) {
        total += value.byteLength;
        result += decoder.decode(value, { stream: true });
      }
    }
    result += decoder.decode();
  } catch {
    // Ignore stream cancellation error once capped
  } finally {
    reader.cancel().catch(() => {});
  }
  return result;
}

export async function fetchDriveMetadata(
  parsed: ParsedDriveLink
): Promise<DriveMetadata> {
  let fileName: string | null = null;
  let ogDescription: string | null = null;
  let textSnippet: string | null = null;
  let isPublicReadable = false;

  try {
    const res = await fetch(parsed.canonicalUrl, {
      method: "GET",
      redirect: "follow",
      signal: AbortSignal.timeout(6000),
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; SalemylinkMetadataBot/1.0; +https://salemylink.com)",
        "Accept-Language": "vi-VN,vi;q=0.9,en-US;q=0.8,en;q=0.7",
      },
    });

    const contentType = (res.headers.get("content-type") || "").toLowerCase();
    if (res.ok && contentType.includes("text/html")) {
      const html = await readResponseTextCapped(res, 160 * 1024);
      const ogTitle = extractMetaAttribute(html, "property", "og:title");
      const itemName = extractMetaAttribute(html, "itemprop", "name");
      const titleTagMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
      const rawTitle = ogTitle || itemName || (titleTagMatch?.[1] ?? "");
      fileName = cleanDriveTitle(rawTitle);

      const rawDesc =
        extractMetaAttribute(html, "property", "og:description") ||
        extractMetaAttribute(html, "name", "description");
      if (
        rawDesc &&
        !rawDesc.toLowerCase().includes("google drive is a free way") &&
        !rawDesc.toLowerCase().includes("safely store your files")
      ) {
        ogDescription = rawDesc;
      }
      if (fileName) {
        isPublicReadable = true;
      }
    }
  } catch {
    // Drive metadata fetch failed or timed out; continue gracefully with hint/fallback
  }

  // Extract plain text snippet from Google Docs / Sheets / Slides when shared publicly
  if (
    parsed.kind === "document" ||
    parsed.kind === "spreadsheets" ||
    parsed.kind === "presentation"
  ) {
    const exportFormat = parsed.kind === "spreadsheets" ? "csv" : "txt";
    const exportUrl = `https://docs.google.com/${parsed.kind}/d/${parsed.id}/export?format=${exportFormat}`;
    try {
      const textRes = await fetch(exportUrl, {
        method: "GET",
        redirect: "follow",
        signal: AbortSignal.timeout(5000),
      });
      const ct = (textRes.headers.get("content-type") || "").toLowerCase();
      if (textRes.ok && (ct.includes("text/plain") || ct.includes("text/csv"))) {
        const snippet = (await readResponseTextCapped(textRes, 12 * 1024)).trim();
        if (snippet.length > 20) {
          textSnippet = snippet.slice(0, 6000);
          isPublicReadable = true;
        }
      }
    } catch {
      // Optional text export failed; ignore
    }
  }

  return {
    id: parsed.id,
    kind: parsed.kind,
    canonicalUrl: parsed.canonicalUrl,
    fileName,
    ogDescription,
    textSnippet,
    inferredFormat: inferFileFormat(fileName, parsed.kind),
    isPublicReadable,
  };
}

async function readDotEnvKeyLocally(keyNames: string[]): Promise<string | null> {
  if (typeof process === "undefined" || typeof process.cwd !== "function") {
    return null;
  }
  try {
    const fs = await import("node:fs");
    const path = await import("node:path");
    for (const fileName of [".env.local", ".env"]) {
      const fullPath = path.join(process.cwd(), fileName);
      if (!fs.existsSync(fullPath)) continue;
      const content = fs.readFileSync(fullPath, "utf8");
      for (const line of content.split(/\r?\n/)) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith("#")) continue;
        const eqIdx = trimmed.indexOf("=");
        if (eqIdx <= 0) continue;
        const k = trimmed.slice(0, eqIdx).trim();
        if (!keyNames.includes(k)) continue;
        let v = trimmed.slice(eqIdx + 1).trim();
        if (
          (v.startsWith('"') && v.endsWith('"')) ||
          (v.startsWith("'") && v.endsWith("'"))
        ) {
          v = v.slice(1, -1);
        }
        if (v) return v;
      }
    }
  } catch {
    // Ignore in edge runtimes without filesystem access
  }
  return null;
}

async function resolveEnvVar(
  env: EnvLike,
  keys: Array<keyof EnvLike>
): Promise<string | null> {
  for (const k of keys) {
    const val = env[k]?.trim();
    if (val) return val;
  }
  if (typeof process !== "undefined" && process.env) {
    for (const k of keys) {
      const val = process.env[k]?.trim();
      if (val) return val;
    }
  }
  return readDotEnvKeyLocally(keys as string[]);
}

async function verifyAuthenticatedUser(
  request: Request,
  env: EnvLike
): Promise<{ ok: true; userId: string } | { ok: false; response: Response }> {
  const authHeader = request.headers.get("authorization") || "";
  const token = authHeader.replace(/^Bearer\s+/i, "").trim();
  if (!token) {
    return {
      ok: false,
      response: jsonResponse(
        { error: "Vui lòng đăng nhập để sử dụng AI Gemini." },
        401
      ),
    };
  }

  const supabaseUrl =
    (await resolveEnvVar(env, ["SUPABASE_URL", "VITE_SUPABASE_URL"])) ||
    DEFAULT_SUPABASE_URL;
  const supabaseKey =
    (await resolveEnvVar(env, [
      "SUPABASE_PUBLISHABLE_KEY",
      "VITE_SUPABASE_PUBLISHABLE_KEY",
    ])) || DEFAULT_SUPABASE_ANON_KEY;

  try {
    const res = await fetch(`${supabaseUrl.replace(/\/+$/, "")}/auth/v1/user`, {
      method: "GET",
      headers: {
        authorization: `Bearer ${token}`,
        apikey: supabaseKey,
      },
      signal: AbortSignal.timeout(5000),
    });

    if (!res.ok) {
      return {
        ok: false,
        response: jsonResponse(
          { error: "Phiên đăng nhập không hợp lệ hoặc đã hết hạn." },
          401
        ),
      };
    }

    const data = (await res.json()) as { id?: string };
    if (!data?.id) {
      return {
        ok: false,
        response: jsonResponse({ error: "Không xác thực được tài khoản." }, 401),
      };
    }
    return { ok: true, userId: data.id };
  } catch {
    return {
      ok: false,
      response: jsonResponse(
        { error: "Không thể kết nối máy chủ xác thực lúc này." },
        503
      ),
    };
  }
}

function sanitizeGeneratedHtml(rawHtml: string): string {
  return rawHtml
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "")
    .replace(/\son\w+="[^"]*"/gi, "")
    .replace(/\son\w+='[^']*'/gi, "")
    .replace(/javascript:/gi, "")
    .trim();
}

function clampString(val: string, maxLen: number): string {
  const trimmed = val.trim();
  if (trimmed.length <= maxLen) return trimmed;
  return `${trimmed.slice(0, maxLen - 3).trimEnd()}...`;
}

async function callGeminiModel(
  model: string,
  apiKey: string,
  prompt: string
): Promise<{
  ok: boolean;
  status: number;
  data?: Record<string, unknown>;
  errorText?: string;
}> {
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(
    model
  )}:generateContent`;

  const response = await fetch(endpoint, {
    method: "POST",
    signal: AbortSignal.timeout(25000),
    headers: {
      "content-type": "application/json",
      "x-goog-api-key": apiKey,
    },
    body: JSON.stringify({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.65,
        maxOutputTokens: 4096,
        responseMimeType: "application/json",
        responseSchema: {
          type: "OBJECT",
          properties: {
            title: { type: "STRING" },
            meta_title: { type: "STRING" },
            short_description: { type: "STRING" },
            meta_description: { type: "STRING" },
            focus_keyword: { type: "STRING" },
            description_html: { type: "STRING" },
            tags: {
              type: "ARRAY",
              items: { type: "STRING" },
            },
            file_format: { type: "STRING" },
            suggested_category_name: { type: "STRING" },
          },
          required: [
            "title",
            "meta_title",
            "short_description",
            "meta_description",
            "focus_keyword",
            "description_html",
            "tags",
            "file_format",
            "suggested_category_name",
          ],
        },
      },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => "");
    return { ok: false, status: response.status, errorText };
  }

  const payload = (await response.json()) as {
    candidates?: Array<{
      content?: { parts?: Array<{ text?: string }> };
    }>;
  };
  const rawText = payload?.candidates?.[0]?.content?.parts?.[0]?.text || "";
  if (!rawText) {
    return { ok: false, status: 502, errorText: "Empty Gemini response" };
  }

  try {
    const cleanJson = rawText
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/```$/i, "")
      .trim();
    const parsed = JSON.parse(cleanJson) as Record<string, unknown>;
    return { ok: true, status: 200, data: parsed };
  } catch {
    return { ok: false, status: 502, errorText: "Invalid JSON from Gemini" };
  }
}

export async function handleGeminiSeoRequest(
  request: Request,
  rawEnv: unknown
): Promise<Response> {
  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204 });
  }
  if (request.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  const env = (rawEnv && typeof rawEnv === "object" ? rawEnv : {}) as EnvLike;

  // Verify authenticated seller/admin session
  const authResult = await verifyAuthenticatedUser(request, env);
  if (!authResult.ok) {
    return authResult.response;
  }

  let body: {
    googleDriveLink?: string;
    userHint?: string;
    existingTitle?: string;
    price?: string | number;
    categoryName?: string;
    categories?: GeminiCategoryInput[];
  };

  try {
    body = (await request.json()) as typeof body;
  } catch {
    return jsonResponse({ error: "Dữ liệu yêu cầu không hợp lệ." }, 400);
  }

  const driveLink = (body.googleDriveLink || "").trim();
  const parsedDrive = parseGoogleDriveLink(driveLink);
  if (!parsedDrive) {
    return jsonResponse(
      {
        error:
          "Vui lòng dán link Google Drive / Docs / Sheets / Slides hợp lệ (bắt đầu bằng https://drive.google.com/... hoặc https://docs.google.com/...).",
        errorCode: "INVALID_DRIVE_LINK",
      },
      400
    );
  }

  // Resolve Gemini API key (server env first, optional header fallback)
  const serverApiKey = await resolveEnvVar(env, [
    "GEMINI_API_KEY",
    "GOOGLE_GEMINI_API_KEY",
  ]);
  const clientHeaderKey = request.headers.get("x-gemini-api-key")?.trim() || null;
  const apiKey = serverApiKey || clientHeaderKey;

  if (!apiKey) {
    return jsonResponse(
      {
        error:
          "Chưa cấu hình GEMINI_API_KEY trên máy chủ. Bạn có thể thêm GEMINI_API_KEY vào biến môi trường (.env / Cloudflare) hoặc nhập tạm Gemini API Key cá nhân ngay bên dưới.",
        errorCode: "MISSING_API_KEY",
      },
      400
    );
  }

  const driveMeta = await fetchDriveMetadata(parsedDrive);
  const userHint = (body.userHint || "").trim();
  const existingTitle = (body.existingTitle || "").trim();

  if (
    !driveMeta.fileName &&
    !driveMeta.textSnippet &&
    !userHint &&
    !existingTitle
  ) {
    return jsonResponse(
      {
        error:
          "Không đọc được tên hoặc nội dung từ link Google Drive này (có thể file đang để Riêng tư). Hãy bật chia sẻ 'Bất kỳ ai có đường liên kết' trên Google Drive hoặc nhập vài từ mô tả vào ô Gợi ý cho AI rồi thử lại.",
        errorCode: "DRIVE_PRIVATE_OR_EMPTY",
        drive_public_readable: false,
      },
      422
    );
  }

  const categories = Array.isArray(body.categories) ? body.categories : [];
  const categoryListText =
    categories.length > 0
      ? categories.map((c) => c.name).join(", ")
      : "Tài liệu học tập, Ebook, Khóa học, Source Code, Tài nguyên thiết kế";

  const prompt = `Bạn là chuyên gia Copywriting & SEO thương mại điện tử cho Salemylink.com (nền tảng bán tài liệu số, ebook, khóa học, template và phần mềm tại Việt Nam).

Hãy phân tích thông tin tài liệu từ Google Drive dưới đây và tạo bộ thông tin sản phẩm **tiếng Việt tự nhiên, chuyên nghiệp, thuyết phục người mua và đạt chuẩn SEO cao**:

THÔNG TIN TỪ GOOGLE DRIVE:
- Loại link: ${driveMeta.kind}
- Link chuẩn: ${driveMeta.canonicalUrl}
- Tên file / tiêu đề đọc được từ Drive: ${driveMeta.fileName || "(Không đọc được tên file — hãy dựa vào gợi ý bên dưới)"}
- Mô tả từ Drive: ${driveMeta.ogDescription || "(Không có)"}
- Định dạng nhận diện: ${driveMeta.inferredFormat || "(Chưa rõ)"}
- Trích đoạn nội dung tài liệu: ${driveMeta.textSnippet ? driveMeta.textSnippet.slice(0, 3500) : "(Không có)"}

THÔNG TIN BỔ SUNG TỪ NGƯỜI BÁN:
- Gợi ý chủ đề / ghi chú: ${userHint || "(Không có)"}
- Tiêu đề nháp hiện tại: ${existingTitle || "(Không có)"}
- Danh mục người bán đang chọn: ${body.categoryName || "(Chưa chọn)"}
- Danh sách danh mục hợp lệ trên hệ thống: ${categoryListText}

YÊU CẦU ĐẦU RA JSON NGHIÊM NGẶT:
1. "title": Tên sản phẩm rõ ràng, hấp dẫn, chứa từ khóa chính (40–65 ký tự, viết Hoa chữ cái đầu hợp lý, không nhồi nhét spam).
2. "meta_title": Tiêu đề SEO Google **bắt buộc từ 35 đến 60 ký tự**, chứa "focus_keyword".
3. "short_description": Mô tả ngắn súc tích 2 dòng hiển thị trên thẻ sản phẩm (**90 đến 145 ký tự**).
4. "meta_description": Mô tả Meta Google **bắt buộc từ 125 đến 155 ký tự**, có "focus_keyword" và lời kêu gọi hành động tự nhiên.
5. "focus_keyword": 1 cụm từ khóa tìm kiếm chính (2–5 từ tiếng Việt không ký tự đặc biệt).
6. "description_html": Bài giới thiệu sản phẩm chuẩn SEO dạng HTML sạch (<h2>, <h3>, <p>, <ul>, <li>, <strong>, <a href="...">), **tuyệt đối không dùng thẻ <h1> hay <script>/<style>**:
   - Độ dài tổng khoảng **380–550 từ** (chia đoạn ngắn mỗi <p> dưới 100 từ).
   - Có ít nhất 2 thẻ <h2> và 2 thẻ <h3>; đưa "focus_keyword" vào ít nhất 1 thẻ <h2> và lặp tự nhiên với mật độ ~1.5%–2.5% trong bài.
   - Cấu trúc nên gồm: Giới thiệu tổng quan giá trị tài liệu; Nội dung chi tiết / điểm nổi bật bạn nhận được; Đối tượng phù hợp; Hướng dẫn tải tức thì qua Google Drive trên Salemylink.
   - Chèn tự nhiên đúng 2 liên kết nội bộ: <a href="https://salemylink.com/how-it-works">Hướng dẫn nhận tài liệu nhanh</a> và <a href="https://salemylink.com/search">Kho tài liệu số Salemylink</a>.
   - Không bịa đặt thông số sai lệch (như số trang hoặc giá tiền) nếu không có trong dữ liệu đầu vào.
7. "tags": Mảng 4–6 từ khóa ngắn gọn liên quan (không kèm dấu #).
8. "file_format": Định dạng ngắn gọn (VD: "PDF", "DOCX", "PPTX", "XLSX", "ZIP", "Google Docs", hoặc "" nếu không rõ).
9. "suggested_category_name": Chọn 1 tên chính xác nhất trong danh sách danh mục hợp lệ ở trên (hoặc "" nếu không chắc).`;

  const models = ["gemini-2.5-flash", "gemini-2.0-flash"];
  let lastError: { status: number; text: string } = {
    status: 500,
    text: "Unknown Gemini error",
  };

  for (const model of models) {
    const res = await callGeminiModel(model, apiKey, prompt);
    if (res.ok && res.data) {
      const d = res.data as {
        title?: unknown;
        meta_title?: unknown;
        short_description?: unknown;
        meta_description?: unknown;
        focus_keyword?: unknown;
        description_html?: unknown;
        tags?: unknown;
        file_format?: unknown;
        suggested_category_name?: unknown;
      };
      const title = String(d.title || existingTitle || driveMeta.fileName || "Tài liệu số chọn lọc").trim();
      const focusKeyword = String(d.focus_keyword || "").trim();
      const metaTitle = clampString(String(d.meta_title || title), 60);
      const shortDescription = clampString(
        String(d.short_description || d.meta_description || ""),
        155
      );
      const metaDescription = clampString(
        String(d.meta_description || shortDescription),
        160
      );
      const descriptionHtml = sanitizeGeneratedHtml(
        String(d.description_html || "")
      );
      const rawTags = Array.isArray(d.tags) ? d.tags : [];
      const tags = rawTags
        .map((t) => String(t).replace(/^#/, "").trim())
        .filter(Boolean)
        .slice(0, 6);
      const fileFormat = String(
        d.file_format || driveMeta.inferredFormat || ""
      ).trim();

      const suggestedCatNameRaw = String(d.suggested_category_name || "").trim();
      const matchedCategory = categories.find(
        (c) =>
          c.name.trim().toLowerCase() === suggestedCatNameRaw.toLowerCase()
      );

      const out: GeminiSeoResult = {
        title,
        meta_title: metaTitle,
        short_description: shortDescription,
        meta_description: metaDescription,
        focus_keyword: focusKeyword,
        description_html: descriptionHtml,
        tags,
        file_format: fileFormat,
        suggested_category_id: matchedCategory?.id ?? null,
        suggested_category_name:
          matchedCategory?.name ?? (suggestedCatNameRaw || null),
        detected_file_name: driveMeta.fileName,
        drive_public_readable: driveMeta.isPublicReadable,
        model_used: model,
      };

      return jsonResponse(out, 200);
    }

    lastError = { status: res.status, text: res.errorText || "" };
    // Invalid API key or quota error: fail fast instead of retrying backup model
    if (res.status === 400 || res.status === 401 || res.status === 403) {
      break;
    }
  }

  if (
    lastError.status === 400 ||
    lastError.status === 401 ||
    lastError.status === 403
  ) {
    return jsonResponse(
      {
        error:
          "Gemini API Key không hợp lệ hoặc chưa được bật quyền Gemini API. Vui lòng kiểm tra lại key tại Google AI Studio.",
        errorCode: "INVALID_API_KEY",
      },
      400
    );
  }

  if (lastError.status === 429) {
    return jsonResponse(
      {
        error:
          "Gemini API đang chạm giới hạn lượt gọi (Rate Limit). Vui lòng thử lại sau vài giây.",
        errorCode: "RATE_LIMITED",
      },
      429
    );
  }

  return jsonResponse(
    {
      error: "Không thể sinh nội dung từ Gemini lúc này. Vui lòng thử lại.",
      errorCode: "GEMINI_UPSTREAM_ERROR",
    },
    502
  );
}
