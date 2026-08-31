// Sửa chữ tiếng Việt bị lỗi font VNI/TCVN (ví dụ: "SUY THAÄN CAÁP" -> "SUY THẬN CẤP").
// Chỉ áp dụng khi chuỗi có dấu hiệu lỗi font, tránh làm hỏng chữ đã đúng.

const PAIRS: Record<string, string> = {
  // nguyên âm thường + dấu rời
  "aù": "á", "aø": "à", "aû": "ả", "aõ": "ã", "aï": "ạ",
  "eù": "é", "eø": "è", "eû": "ẻ", "eõ": "ẽ", "eï": "ẹ",
  "iù": "í", "iø": "ì", "iû": "ỉ", "iõ": "ĩ", "iï": "ị",
  "où": "ó", "oø": "ò", "oû": "ỏ", "oõ": "õ", "oï": "ọ",
  "uù": "ú", "uø": "ù", "uû": "ủ", "uõ": "ũ", "uï": "ụ",
  "yù": "ý", "yø": "ỳ", "yû": "ỷ", "yõ": "ỹ", "yï": "ỵ",
  // dấu mũ
  "aâ": "â", "eâ": "ê", "oâ": "ô",
  "aá": "ấ", "aà": "ầ", "aå": "ẩ", "aã": "ẫ", "aä": "ậ",
  "eá": "ế", "eà": "ề", "eå": "ể", "eã": "ễ", "eä": "ệ",
  "oá": "ố", "oà": "ồ", "oå": "ổ", "oã": "ỗ", "oä": "ộ",
  // dấu trăng
  "aê": "ă", "aé": "ắ", "aè": "ằ", "aú": "ẳ", "aü": "ẵ", "aë": "ặ",
  // ơ / ư có dấu
  "ôù": "ớ", "ôø": "ờ", "ôû": "ở", "ôõ": "ỡ", "ôï": "ợ",
  "öù": "ứ", "öø": "ừ", "öû": "ử", "öõ": "ữ", "öï": "ự",
};

const SINGLES: Record<string, string> = { "ñ": "đ", "ö": "ư", "ô": "ơ" };

const BROKEN = /[ñöøäå]|a[áàåãäéèëêúüùïû]|e[áàåãùïû]|o[áàåãùïû]|[iuy][ùøûõï]/i;

const matchCase = (out: string, sample: string) =>
  sample === sample.toUpperCase() && sample !== sample.toLowerCase()
    ? out.toUpperCase()
    : out;

// Specific common corrections for titles, medical titles, and misencoded terms
const WORD_REPLACEMENTS: Array<[RegExp, string]> = [
  [/\bBSCKII\b/gi, "BS.CKII"],
  [/\bBSCKI\b/gi, "BS.CKI"],
  [/\bBSCK1\b/gi, "BS.CKI"],
  [/\bBSCK2\b/gi, "BS.CKII"],
  [/\bBs\.CK/gi, "BS.CK"],
  [/\bBs\s+CK/gi, "BS. CK"],
  [/\bChâu Thò\b/g, "Châu Thị"],
  [/\bThò Kim\b/g, "Thị Kim"],
  [/\bThò ([A-ZÀ-Ỹ])/g, "Thị $1"],
];

export function fixVietnameseEncoding(input?: string | null): string {
  let text = input ?? "";
  if (!text) return text;

  // 1. Fix common specific patterns first
  for (const [pattern, replacement] of WORD_REPLACEMENTS) {
    text = text.replace(pattern, replacement);
  }

  // 2. Fix VNI/TCVN pair encodings if broken characters found
  if (BROKEN.test(text)) {
    let out = "";
    for (let i = 0; i < text.length; i++) {
      const two = text.slice(i, i + 2);
      const pair = PAIRS[two.toLowerCase()];
      if (pair) {
        out += matchCase(pair, two[0]!);
        i++;
        continue;
      }
      const one = text[i]!;
      const single = SINGLES[one.toLowerCase()];
      out += single ? matchCase(single, one) : one;
    }
    text = out;
  }

  return text;
}
