import { useMemo, useState } from "react";
import { Link } from "@/lib/router-compat";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  ExternalLink,
  Eye,
  Loader2,
  Pencil,
  Search,
  Tag,
  Trash2,
  X,
} from "lucide-react";

export interface TagProductItem {
  id: string;
  title: string;
  slug: string;
  status: string | null;
  tags: string[] | null;
  seller?: { full_name: string | null; email: string } | null;
}

interface TagEntry {
  tag: string;
  count: number;
  activeCount: number;
  products: TagProductItem[];
}

interface AdminTagManagerProps {
  products: TagProductItem[];
  onTagsUpdated: () => Promise<void> | void;
}

type TagFilterType = "all" | "single" | "popular";
type TagSortType = "count_desc" | "count_asc" | "name_asc";

export function AdminTagManager({ products, onTagsUpdated }: AdminTagManagerProps) {
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<TagFilterType>("all");
  const [sortType, setSortType] = useState<TagSortType>("count_desc");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isUpdating, setIsUpdating] = useState(false);

  // Modals / confirmations
  const [tagsPendingDelete, setTagsPendingDelete] = useState<string[] | null>(null);
  const [inspectingTag, setInspectingTag] = useState<string | null>(null);
  const [renameState, setRenameState] = useState<{ oldTag: string; newTag: string } | null>(null);

  const tagEntries = useMemo<TagEntry[]>(() => {
    const map = new Map<string, TagProductItem[]>();

    for (const product of products) {
      const seenInProduct = new Set<string>();
      for (const raw of product.tags || []) {
        const clean = (raw || "").trim();
        if (!clean || seenInProduct.has(clean)) continue;
        seenInProduct.add(clean);
        const list = map.get(clean) || [];
        list.push(product);
        map.set(clean, list);
      }
    }

    return Array.from(map.entries()).map(([tag, list]) => ({
      tag,
      count: list.length,
      activeCount: list.filter((p) => p.status === "active").length,
      products: list,
    }));
  }, [products]);

  const filteredEntries = useMemo(() => {
    const q = search.trim().toLowerCase();

    const filtered = tagEntries.filter((entry) => {
      if (q && !entry.tag.toLowerCase().includes(q)) return false;
      if (filterType === "single" && entry.count !== 1) return false;
      if (filterType === "popular" && entry.count < 2) return false;
      return true;
    });

    return filtered.sort((a, b) => {
      if (sortType === "count_desc") {
        return b.count - a.count || a.tag.localeCompare(b.tag, "vi");
      }
      if (sortType === "count_asc") {
        return a.count - b.count || a.tag.localeCompare(b.tag, "vi");
      }
      return a.tag.localeCompare(b.tag, "vi");
    });
  }, [tagEntries, search, filterType, sortType]);

  const singleUseCount = useMemo(
    () => tagEntries.filter((e) => e.count === 1).length,
    [tagEntries],
  );
  const taggedProductCount = useMemo(
    () => products.filter((p) => Array.isArray(p.tags) && p.tags.some((t) => t.trim())).length,
    [products],
  );

  const visibleTagNames = useMemo(
    () => filteredEntries.map((e) => e.tag),
    [filteredEntries],
  );

  const allVisibleSelected =
    visibleTagNames.length > 0 && visibleTagNames.every((t) => selectedTags.includes(t));

  const inspectedEntry = useMemo(
    () => (inspectingTag ? tagEntries.find((e) => e.tag === inspectingTag) || null : null),
    [inspectingTag, tagEntries],
  );

  const toggleTagSelection = (tag: string, checked: boolean) => {
    setSelectedTags((prev) => {
      if (checked) {
        return prev.includes(tag) ? prev : [...prev, tag];
      }
      return prev.filter((t) => t !== tag);
    });
  };

  const toggleSelectAllVisible = (checked: boolean) => {
    if (checked) {
      setSelectedTags((prev) => Array.from(new Set([...prev, ...visibleTagNames])));
    } else {
      const visibleSet = new Set(visibleTagNames);
      setSelectedTags((prev) => prev.filter((t) => !visibleSet.has(t)));
    }
  };

  const applyProductTagUpdates = async (
    updates: Array<{ productId: string; nextTags: string[] | null }>,
  ) => {
    const CHUNK_SIZE = 10;
    const nowIso = new Date().toISOString();

    for (let i = 0; i < updates.length; i += CHUNK_SIZE) {
      const chunk = updates.slice(i, i + CHUNK_SIZE);
      const results = await Promise.all(
        chunk.map(({ productId, nextTags }) =>
          supabase
            .from("products")
            .update({ tags: nextTags, updated_at: nowIso })
            .eq("id", productId),
        ),
      );
      const firstError = results.find((r) => r.error)?.error;
      if (firstError) throw firstError;
    }
  };

  const handleDeleteTags = async (tagsToRemove: string[]) => {
    const removeSet = new Set(tagsToRemove.map((t) => t.trim()).filter(Boolean));
    if (removeSet.size === 0) return;

    const updates: Array<{ productId: string; nextTags: string[] | null }> = [];
    for (const product of products) {
      const current = product.tags || [];
      const hasMatch = current.some((t) => removeSet.has((t || "").trim()));
      if (!hasMatch) continue;

      const filtered = current
        .map((t) => (t || "").trim())
        .filter((t) => t.length > 0 && !removeSet.has(t));

      updates.push({
        productId: product.id,
        nextTags: filtered.length > 0 ? Array.from(new Set(filtered)) : null,
      });
    }

    if (updates.length === 0) {
      setTagsPendingDelete(null);
      return;
    }

    setIsUpdating(true);
    try {
      await applyProductTagUpdates(updates);
      setSelectedTags((prev) => prev.filter((t) => !removeSet.has(t)));
      if (inspectingTag && removeSet.has(inspectingTag)) {
        setInspectingTag(null);
      }
      setTagsPendingDelete(null);
      toast.success(
        removeSet.size === 1
          ? `Đã xóa tag #${Array.from(removeSet)[0]} khỏi ${updates.length} sản phẩm`
          : `Đã xóa ${removeSet.size} tag khỏi ${updates.length} sản phẩm`,
      );
      await onTagsUpdated();
    } catch (error) {
      console.error("Error deleting tags:", error);
      toast.error("Không thể xóa tag. Vui lòng thử lại.");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRemoveTagFromSingleProduct = async (product: TagProductItem, tagToRemove: string) => {
    const filtered = (product.tags || [])
      .map((t) => (t || "").trim())
      .filter((t) => t.length > 0 && t !== tagToRemove);

    setIsUpdating(true);
    try {
      await applyProductTagUpdates([
        {
          productId: product.id,
          nextTags: filtered.length > 0 ? Array.from(new Set(filtered)) : null,
        },
      ]);
      toast.success(`Đã gỡ tag #${tagToRemove} khỏi "${product.title}"`);
      await onTagsUpdated();
    } catch (error) {
      console.error("Error removing tag from product:", error);
      toast.error("Không thể gỡ tag khỏi sản phẩm");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRenameTag = async () => {
    if (!renameState) return;
    const oldTag = renameState.oldTag.trim();
    const newTag = renameState.newTag.trim();

    if (!newTag) {
      toast.error("Vui lòng nhập tên tag mới");
      return;
    }
    if (oldTag === newTag) {
      setRenameState(null);
      return;
    }

    const updates: Array<{ productId: string; nextTags: string[] | null }> = [];
    for (const product of products) {
      const current = product.tags || [];
      const hasOld = current.some((t) => (t || "").trim() === oldTag);
      if (!hasOld) continue;

      const nextList: string[] = [];
      const seen = new Set<string>();
      for (const raw of current) {
        const clean = (raw || "").trim();
        if (!clean) continue;
        const mapped = clean === oldTag ? newTag : clean;
        if (!seen.has(mapped)) {
          seen.add(mapped);
          nextList.push(mapped);
        }
      }
      updates.push({
        productId: product.id,
        nextTags: nextList.length > 0 ? nextList : null,
      });
    }

    if (updates.length === 0) {
      setRenameState(null);
      return;
    }

    setIsUpdating(true);
    try {
      await applyProductTagUpdates(updates);
      setSelectedTags((prev) => prev.filter((t) => t !== oldTag));
      if (inspectingTag === oldTag) {
        setInspectingTag(newTag);
      }
      setRenameState(null);
      toast.success(`Đã đổi/gộp #${oldTag} → #${newTag} trên ${updates.length} sản phẩm`);
      await onTagsUpdated();
    } catch (error) {
      console.error("Error renaming tag:", error);
      toast.error("Không thể đổi tên tag. Vui lòng thử lại.");
    } finally {
      setIsUpdating(false);
    }
  };

  const affectedProductsForPendingDelete = useMemo(() => {
    if (!tagsPendingDelete || tagsPendingDelete.length === 0) return 0;
    const set = new Set(tagsPendingDelete);
    return products.filter((p) => (p.tags || []).some((t) => set.has((t || "").trim()))).length;
  }, [tagsPendingDelete, products]);

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Tag className="h-5 w-5 text-primary" />
              Quản Lý Tag ({tagEntries.length})
            </CardTitle>
            <CardDescription className="mt-1">
              Xem tất cả tag đang sử dụng, đổi tên/gộp tag trùng lặp hoặc xóa bớt tag khỏi sản phẩm.
            </CardDescription>
            <div className="flex flex-wrap gap-2 mt-3">
              <Badge variant="secondary">Tổng tag: {tagEntries.length}</Badge>
              <Badge variant="outline">Chỉ 1 sản phẩm: {singleUseCount}</Badge>
              <Badge variant="outline">SP có tag: {taggedProductCount}</Badge>
            </div>
          </div>

          {selectedTags.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2">
              <span className="text-sm font-medium">
                Đã chọn {selectedTags.length} tag
              </span>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => setSelectedTags([])}
                disabled={isUpdating}
              >
                Bỏ chọn
              </Button>
              <Button
                type="button"
                size="sm"
                variant="destructive"
                onClick={() => setTagsPendingDelete(selectedTags)}
                disabled={isUpdating}
              >
                <Trash2 className="h-4 w-4 mr-1.5" />
                Xóa bớt ({selectedTags.length})
              </Button>
            </div>
          )}
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-2 pt-3">
          <div className="relative flex-1">
            <Search className="h-4 w-4 text-muted-foreground absolute left-2.5 top-3" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm tên tag..."
              className="pl-8"
            />
          </div>
          <Select value={filterType} onValueChange={(v) => setFilterType(v as TagFilterType)}>
            <SelectTrigger className="w-full sm:w-[210px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả ({tagEntries.length})</SelectItem>
              <SelectItem value="single">Chỉ 1 sản phẩm ({singleUseCount})</SelectItem>
              <SelectItem value="popular">Từ 2 sản phẩm trở lên</SelectItem>
            </SelectContent>
          </Select>
          <Select value={sortType} onValueChange={(v) => setSortType(v as TagSortType)}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="count_desc">Phổ biến nhất</SelectItem>
              <SelectItem value="count_asc">Ít dùng nhất</SelectItem>
              <SelectItem value="name_asc">Tên A → Z</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>

      <CardContent>
        <div className="max-h-[600px] w-full overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10">
                  <Checkbox
                    checked={allVisibleSelected}
                    onCheckedChange={(checked) => toggleSelectAllVisible(Boolean(checked))}
                    aria-label="Chọn tất cả tag đang hiển thị"
                  />
                </TableHead>
                <TableHead>Tên Tag</TableHead>
                <TableHead>Số Sản Phẩm</TableHead>
                <TableHead>Đang Hoạt Động</TableHead>
                <TableHead className="text-right">Hành Động</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEntries.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    {tagEntries.length === 0
                      ? "Chưa có tag nào được gắn trên sản phẩm."
                      : "Không tìm thấy tag phù hợp với bộ lọc."}
                  </TableCell>
                </TableRow>
              ) : (
                filteredEntries.map((entry) => {
                  const isChecked = selectedTags.includes(entry.tag);
                  return (
                    <TableRow key={entry.tag}>
                      <TableCell>
                        <Checkbox
                          checked={isChecked}
                          onCheckedChange={(checked) =>
                            toggleTagSelection(entry.tag, Boolean(checked))
                          }
                          aria-label={`Chọn tag ${entry.tag}`}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="font-medium">
                            #{entry.tag}
                          </Badge>
                          <Link
                            to={`/tag/${encodeURIComponent(entry.tag)}`}
                            target="_blank"
                            className="text-muted-foreground hover:text-primary"
                            title={`Mở trang /tag/${entry.tag}`}
                          >
                            <ExternalLink className="h-3.5 w-3.5" />
                          </Link>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button
                          type="button"
                          variant="link"
                          size="sm"
                          className="h-auto p-0 font-medium"
                          onClick={() => setInspectingTag(entry.tag)}
                        >
                          {entry.count} sản phẩm
                        </Button>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">
                          {entry.activeCount} đang bán
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            onClick={() => setInspectingTag(entry.tag)}
                            title="Xem các sản phẩm gắn tag này"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            onClick={() =>
                              setRenameState({ oldTag: entry.tag, newTag: entry.tag })
                            }
                            disabled={isUpdating}
                            title="Đổi tên hoặc gộp tag"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            className="text-destructive hover:text-destructive"
                            onClick={() => setTagsPendingDelete([entry.tag])}
                            disabled={isUpdating}
                            title="Xóa tag khỏi tất cả sản phẩm"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>

      {/* Confirm delete tag(s) dialog */}
      <AlertDialog
        open={Boolean(tagsPendingDelete && tagsPendingDelete.length > 0)}
        onOpenChange={(open) => {
          if (!open && !isUpdating) setTagsPendingDelete(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa tag</AlertDialogTitle>
            <AlertDialogDescription>
              {tagsPendingDelete && tagsPendingDelete.length === 1 ? (
                <>
                  Bạn có chắc muốn xóa tag{" "}
                  <strong>#{tagsPendingDelete[0]}</strong>? Tag này sẽ bị gỡ khỏi{" "}
                  <strong>{affectedProductsForPendingDelete}</strong> sản phẩm và ẩn khỏi danh
                  sách từ khóa trang chủ.
                </>
              ) : (
                <>
                  Bạn có chắc muốn xóa{" "}
                  <strong>{tagsPendingDelete?.length ?? 0} tag đã chọn</strong>? Thao tác này sẽ
                  cập nhật <strong>{affectedProductsForPendingDelete}</strong> sản phẩm liên quan.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isUpdating}>Hủy</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isUpdating}
              onClick={(e) => {
                e.preventDefault();
                if (tagsPendingDelete) {
                  void handleDeleteTags(tagsPendingDelete);
                }
              }}
            >
              {isUpdating && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Xác nhận xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Rename / merge tag dialog */}
      <Dialog
        open={Boolean(renameState)}
        onOpenChange={(open) => {
          if (!open && !isUpdating) setRenameState(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Đổi tên / Gộp tag</DialogTitle>
            <DialogDescription>
              Đổi tên tag <strong>#{renameState?.oldTag}</strong> trên toàn bộ sản phẩm. Nếu nhập
              tên tag đã tồn tại, hệ thống sẽ tự động gộp và loại bỏ trùng lặp.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 py-2">
            <Label htmlFor="rename-tag-input">Tên tag mới</Label>
            <Input
              id="rename-tag-input"
              value={renameState?.newTag ?? ""}
              onChange={(e) =>
                setRenameState((prev) => (prev ? { ...prev, newTag: e.target.value } : null))
              }
              placeholder="Ví dụ: ielts"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  void handleRenameTag();
                }
              }}
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setRenameState(null)}
              disabled={isUpdating}
            >
              Hủy
            </Button>
            <Button
              onClick={() => void handleRenameTag()}
              disabled={isUpdating || !renameState?.newTag.trim()}
            >
              {isUpdating && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Lưu thay đổi
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Inspect products using a specific tag */}
      <Dialog
        open={Boolean(inspectingTag)}
        onOpenChange={(open) => {
          if (!open && !isUpdating) setInspectingTag(null);
        }}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Tag className="h-4 w-4 text-primary" />
              Sản phẩm gắn tag #{inspectingTag}
            </DialogTitle>
            <DialogDescription>
              Có thể gỡ riêng tag này khỏi từng sản phẩm hoặc xóa toàn bộ tag.
            </DialogDescription>
          </DialogHeader>

          <div className="max-h-[360px] overflow-y-auto space-y-2 py-2">
            {inspectedEntry && inspectedEntry.products.length > 0 ? (
              inspectedEntry.products.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between gap-3 rounded-lg border border-border p-3"
                >
                  <div className="min-w-0">
                    <Link
                      to={`/san-pham/${p.slug}`}
                      target="_blank"
                      className="font-medium text-sm hover:text-primary hover:underline truncate block"
                    >
                      {p.title}
                    </Link>
                    <p className="text-xs text-muted-foreground truncate">
                      Shop: {p.seller?.full_name || p.seller?.email || "—"} · Trạng thái:{" "}
                      {p.status === "active"
                        ? "Hoạt động"
                        : p.status === "draft"
                          ? "Nháp"
                          : "Tạm ngừng"}
                    </p>
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="shrink-0 text-destructive hover:text-destructive"
                    disabled={isUpdating}
                    onClick={() => {
                      if (inspectingTag) {
                        void handleRemoveTagFromSingleProduct(p, inspectingTag);
                      }
                    }}
                  >
                    <X className="h-3.5 w-3.5 mr-1" />
                    Gỡ tag
                  </Button>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground text-center py-6">
                Không còn sản phẩm nào gắn tag này.
              </p>
            )}
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            {inspectingTag && inspectedEntry && inspectedEntry.products.length > 0 && (
              <Button
                type="button"
                variant="destructive"
                disabled={isUpdating}
                onClick={() => setTagsPendingDelete([inspectingTag])}
              >
                <Trash2 className="h-4 w-4 mr-1.5" />
                Xóa #{inspectingTag} khỏi tất cả
              </Button>
            )}
            <Button
              type="button"
              variant="outline"
              onClick={() => setInspectingTag(null)}
              disabled={isUpdating}
            >
              Đóng
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

