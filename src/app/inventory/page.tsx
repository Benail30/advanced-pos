'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { Search, Plus, Tags, Package, Pencil, Trash2, X, ImagePlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { CURRENCY } from '@/lib/utils';

type Category = {
  id: string;
  name: string;
  description: string | null;
  _count: { products: number };
};

type Product = {
  id: string;
  name: string;
  imageUrl: string | null;
  sku: string | null;
  description: string | null;
  buyPrice: number;
  sellPrice: number;
  stock: number;
  categoryId: string | null;
  category: { id: string; name: string } | null;
};

const EMPTY_CAT = { name: '', description: '' };
const EMPTY_PROD = {
  name: '', imageUrl: '', sku: '', description: '',
  buyPrice: '', sellPrice: '', stock: '0', categoryId: '',
};
const LOW_STOCK = 10;

export default function InventoryPage() {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [busy, setBusy] = useState(false);

  // category dialog
  const [catOpen, setCatOpen] = useState(false);
  const [catEditing, setCatEditing] = useState<Category | null>(null);
  const [catForm, setCatForm] = useState(EMPTY_CAT);
  const [catErr, setCatErr] = useState('');

  // product dialog
  const [prodOpen, setProdOpen] = useState(false);
  const [prodEditing, setProdEditing] = useState<Product | null>(null);
  const [prodForm, setProdForm] = useState(EMPTY_PROD);
  const [prodErr, setProdErr] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // inline new-category form inside product dialog
  const [showNewCat, setShowNewCat] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatBusy, setNewCatBusy] = useState(false);
  const [newCatErr, setNewCatErr] = useState('');

  async function fetchCategories() {
    const res = await fetch('/api/categories');
    if (res.ok) setCategories((await res.json()).data);
  }

  async function fetchProducts() {
    const res = await fetch('/api/products');
    if (res.ok) setProducts((await res.json()).data);
  }

  useEffect(() => {
    Promise.all([fetchCategories(), fetchProducts()]).finally(() => setLoading(false));
  }, []);

  const filteredProducts = useMemo(
    () => products.filter(p => p.name.toLowerCase().includes(search.toLowerCase())),
    [products, search]
  );

  // ── Category handlers ────────────────────────────────────────────────────────

  function openCreateCategory() {
    setCatEditing(null); setCatForm(EMPTY_CAT); setCatErr(''); setCatOpen(true);
  }

  function openEditCategory(cat: Category) {
    setCatEditing(cat);
    setCatForm({ name: cat.name, description: cat.description ?? '' });
    setCatErr(''); setCatOpen(true);
  }

  async function handleCategorySubmit(e: React.FormEvent) {
    e.preventDefault(); setCatErr(''); setBusy(true);
    const url = catEditing ? `/api/categories/${catEditing.id}` : '/api/categories';
    const res = await fetch(url, {
      method: catEditing ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: catForm.name, description: catForm.description || null }),
    });
    const json = await res.json();
    setBusy(false);
    if (!res.ok) { setCatErr(json.error ?? 'Request failed'); return; }
    toast({ title: catEditing ? 'Category updated' : 'Category created' });
    setCatOpen(false);
    await fetchCategories();
  }

  async function handleDeleteCategory(cat: Category) {
    if (!confirm(`Delete category "${cat.name}"? This cannot be undone.`)) return;
    setBusy(true);
    const res = await fetch(`/api/categories/${cat.id}`, { method: 'DELETE' });
    const json = await res.json();
    setBusy(false);
    if (!res.ok) { toast({ title: 'Error', description: json.error, variant: 'destructive' }); return; }
    toast({ title: 'Category deleted' });
    await Promise.all([fetchCategories(), fetchProducts()]);
  }

  // ── Product handlers ─────────────────────────────────────────────────────────

  async function handleInlineCreateCategory() {
    if (!newCatName.trim()) return;
    setNewCatBusy(true); setNewCatErr('');
    const res = await fetch('/api/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newCatName.trim() }),
    });
    const json = await res.json();
    setNewCatBusy(false);
    if (!res.ok) { setNewCatErr(json.error ?? 'Failed to create category'); return; }
    await fetchCategories();
    setProdForm(f => ({ ...f, categoryId: json.data.id }));
    setNewCatName(''); setShowNewCat(false); setNewCatErr('');
  }

  function openCreateProduct() {
    setProdEditing(null); setProdForm(EMPTY_PROD);
    setImageFile(null); setImagePreview(null);
    setShowNewCat(false); setNewCatName(''); setNewCatErr('');
    setProdErr(''); setProdOpen(true);
  }

  function openEditProduct(prod: Product) {
    setProdEditing(prod);
    setProdForm({
      name: prod.name, imageUrl: prod.imageUrl ?? '', sku: prod.sku ?? '',
      description: prod.description ?? '', buyPrice: String(prod.buyPrice),
      sellPrice: String(prod.sellPrice), stock: String(prod.stock),
      categoryId: prod.categoryId ?? '',
    });
    setImageFile(null);
    setImagePreview(prod.imageUrl ?? null);
    setProdErr(''); setProdOpen(true);
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  }

  function removeImage() {
    setImageFile(null);
    setImagePreview(null);
    setProdForm(f => ({ ...f, imageUrl: '' }));
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  async function handleProductSubmit(e: React.FormEvent) {
    e.preventDefault(); setProdErr(''); setBusy(true);

    let imageUrl = prodForm.imageUrl;

    if (imageFile) {
      const fd = new FormData();
      fd.append('file', imageFile);
      const uploadRes = await fetch('/api/upload', { method: 'POST', body: fd });
      const uploadJson = await uploadRes.json();
      if (!uploadRes.ok) {
        setProdErr(uploadJson.error ?? 'Image upload failed');
        setBusy(false); return;
      }
      imageUrl = uploadJson.url;
    }

    const url = prodEditing ? `/api/products/${prodEditing.id}` : '/api/products';
    const res = await fetch(url, {
      method: prodEditing ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: prodForm.name,
        imageUrl: imageUrl || null,
        sku: prodForm.sku || null,
        description: prodForm.description || null,
        buyPrice: Number(prodForm.buyPrice),
        sellPrice: Number(prodForm.sellPrice),
        stock: Number(prodForm.stock),
        categoryId: prodForm.categoryId || null,
      }),
    });

    const json = await res.json();
    setBusy(false);
    if (!res.ok) { setProdErr(json.error ?? 'Request failed'); return; }
    toast({ title: prodEditing ? 'Product updated' : 'Product created' });
    setProdOpen(false);
    await fetchProducts();
    await fetchCategories();
  }

  async function handleDeleteProduct(prod: Product) {
    if (!confirm(`Delete product "${prod.name}"? This cannot be undone.`)) return;
    setBusy(true);
    const res = await fetch(`/api/products/${prod.id}`, { method: 'DELETE' });
    const json = await res.json();
    setBusy(false);
    if (!res.ok) { toast({ title: 'Error', description: json.error, variant: 'destructive' }); return; }
    toast({ title: 'Product deleted' });
    await fetchProducts();
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Inventory</h1>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={openCreateCategory}>
            <Tags className="h-4 w-4 mr-2" />Create Category
          </Button>
          <Button size="sm" onClick={openCreateProduct}>
            <Plus className="h-4 w-4 mr-2" />Add Product
          </Button>
        </div>
      </div>

      <Tabs defaultValue="products">
        <TabsList>
          <TabsTrigger value="products">Products ({products.length})</TabsTrigger>
          <TabsTrigger value="categories">Categories ({categories.length})</TabsTrigger>
        </TabsList>

        {/* Products tab */}
        <TabsContent value="products" className="space-y-4 mt-4">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            <Input className="pl-9" placeholder="Search products…" value={search} onChange={e => setSearch(e.target.value)} />
            {search && (
              <button className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600" onClick={() => setSearch('')}>
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <div className="bg-white rounded-lg border overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-gray-50 text-left">
                  {['Product', 'Category', 'SKU', 'Buy', 'Sell', 'Stock', 'Actions'].map(h => (
                    <th key={h} className="px-4 py-3 font-medium text-gray-500 uppercase tracking-wide text-xs">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-16">
                      <Package className="mx-auto h-10 w-10 text-gray-300 mb-3" />
                      <p className="text-sm font-medium text-gray-900">{search ? 'No products match your search' : 'No products yet'}</p>
                      {!search && <p className="text-xs text-gray-500 mt-1">Add your first product to get started.</p>}
                    </td>
                  </tr>
                ) : filteredProducts.map(prod => (
                  <tr key={prod.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {prod.imageUrl ? (
                          <img src={prod.imageUrl} alt={prod.name} className="h-8 w-8 rounded object-cover shrink-0" onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                        ) : (
                          <div className="h-8 w-8 rounded bg-gray-100 flex items-center justify-center shrink-0">
                            <Package className="h-4 w-4 text-gray-400" />
                          </div>
                        )}
                        <span className="font-medium text-gray-900">{prod.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{prod.category?.name ?? <span className="text-gray-400 italic">—</span>}</td>
                    <td className="px-4 py-3 text-gray-500 font-mono text-xs">{prod.sku ?? '—'}</td>
                    <td className="px-4 py-3 text-gray-600">{CURRENCY} {prod.buyPrice.toFixed(2)}</td>
                    <td className="px-4 py-3 text-gray-600">{CURRENCY} {prod.sellPrice.toFixed(2)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="text-gray-900 font-medium">{prod.stock}</span>
                        {prod.stock === 0 && <Badge variant="destructive" className="text-xs">Out of stock</Badge>}
                        {prod.stock > 0 && prod.stock < LOW_STOCK && <Badge variant="outline" className="text-xs border-orange-300 text-orange-600 bg-orange-50">Low stock</Badge>}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <Button variant="ghost" size="sm" onClick={() => openEditProduct(prod)} className="h-7 w-7 p-0 text-gray-500 hover:text-blue-600"><Pencil className="h-3.5 w-3.5" /></Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDeleteProduct(prod)} disabled={busy} className="h-7 w-7 p-0 text-gray-500 hover:text-red-600"><Trash2 className="h-3.5 w-3.5" /></Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>

        {/* Categories tab */}
        <TabsContent value="categories" className="mt-4">
          <div className="bg-white rounded-lg border overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-gray-50 text-left">
                  {['Name', 'Description', 'Products', 'Actions'].map(h => (
                    <th key={h} className="px-4 py-3 font-medium text-gray-500 uppercase tracking-wide text-xs">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {categories.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="text-center py-16">
                      <Tags className="mx-auto h-10 w-10 text-gray-300 mb-3" />
                      <p className="text-sm font-medium text-gray-900">No categories yet</p>
                      <p className="text-xs text-gray-500 mt-1">Categories are created automatically when you add a product, or manually here.</p>
                    </td>
                  </tr>
                ) : categories.map(cat => (
                  <tr key={cat.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">{cat.name}</td>
                    <td className="px-4 py-3 text-gray-500">{cat.description ?? <span className="italic">—</span>}</td>
                    <td className="px-4 py-3"><Badge variant="secondary">{cat._count.products}</Badge></td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <Button variant="ghost" size="sm" onClick={() => openEditCategory(cat)} className="h-7 w-7 p-0 text-gray-500 hover:text-blue-600"><Pencil className="h-3.5 w-3.5" /></Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDeleteCategory(cat)} disabled={busy} className="h-7 w-7 p-0 text-gray-500 hover:text-red-600"><Trash2 className="h-3.5 w-3.5" /></Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>
      </Tabs>

      {/* Category dialog */}
      <Dialog open={catOpen} onOpenChange={open => { if (!open) setCatOpen(false); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>{catEditing ? 'Edit Category' : 'Create Category'}</DialogTitle></DialogHeader>
          <form onSubmit={handleCategorySubmit}>
            <div className="space-y-4 py-2">
              <div className="space-y-1.5">
                <Label htmlFor="cat-name">Name <span className="text-red-500">*</span></Label>
                <Input id="cat-name" value={catForm.name} onChange={e => setCatForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Beverages" required />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="cat-desc">Description</Label>
                <Input id="cat-desc" value={catForm.description} onChange={e => setCatForm(f => ({ ...f, description: e.target.value }))} placeholder="Optional" />
              </div>
              {catErr && <p className="text-sm text-red-500">{catErr}</p>}
            </div>
            <DialogFooter className="mt-4">
              <Button type="button" variant="outline" onClick={() => setCatOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={busy}>{busy ? 'Saving…' : catEditing ? 'Save changes' : 'Create'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Product dialog */}
      <Dialog open={prodOpen} onOpenChange={open => { if (!open) setProdOpen(false); }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader><DialogTitle>{prodEditing ? 'Edit Product' : 'Add Product'}</DialogTitle></DialogHeader>
          <form onSubmit={handleProductSubmit}>
            <div className="space-y-4 py-2">

              {/* Image upload */}
              <div className="space-y-1.5">
                <Label>Photo</Label>
                <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="hidden" onChange={handleFileChange} />
                {imagePreview ? (
                  <div className="relative w-full h-36 rounded-lg overflow-hidden border bg-gray-50">
                    <img src={imagePreview} alt="preview" className="w-full h-full object-contain" />
                    <button type="button" onClick={removeImage} className="absolute top-2 right-2 bg-white rounded-full p-1 shadow hover:bg-gray-100">
                      <X className="h-4 w-4 text-gray-600" />
                    </button>
                  </div>
                ) : (
                  <button type="button" onClick={() => fileInputRef.current?.click()}
                    className="w-full h-24 rounded-lg border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-1 text-gray-400 hover:border-gray-300 hover:text-gray-500 transition-colors">
                    <ImagePlus className="h-6 w-6" />
                    <span className="text-xs">Click to upload (JPEG, PNG, WebP — max 5 MB)</span>
                  </button>
                )}
                {!imagePreview && (
                  <button type="button" onClick={() => fileInputRef.current?.click()} className="text-xs text-blue-600 hover:underline">
                    or choose a different photo
                  </button>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 space-y-1.5">
                  <Label htmlFor="prod-name">Name <span className="text-red-500">*</span></Label>
                  <Input id="prod-name" value={prodForm.name} onChange={e => setProdForm(f => ({ ...f, name: e.target.value }))} placeholder="Product name" required />
                </div>

                <div className="col-span-2 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="prod-cat">Category <span className="text-red-500">*</span></Label>
                    <button
                      type="button"
                      onClick={() => { setShowNewCat(v => !v); setNewCatName(''); setNewCatErr(''); }}
                      className="text-xs text-blue-600 hover:underline"
                    >
                      {showNewCat ? 'Cancel' : '+ New category'}
                    </button>
                  </div>

                  {showNewCat ? (
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <Input
                          autoFocus
                          placeholder="Category name (e.g. Others)"
                          value={newCatName}
                          onChange={e => setNewCatName(e.target.value)}
                          onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleInlineCreateCategory(); } }}
                        />
                        <Button type="button" size="sm" disabled={newCatBusy || !newCatName.trim()} onClick={handleInlineCreateCategory}>
                          {newCatBusy ? '…' : 'Create'}
                        </Button>
                      </div>
                      {newCatErr && <p className="text-xs text-red-500">{newCatErr}</p>}
                    </div>
                  ) : (
                    <Select value={prodForm.categoryId} onValueChange={v => setProdForm(f => ({ ...f, categoryId: v }))}>
                      <SelectTrigger id="prod-cat">
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map(cat => (
                          <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="prod-buy">Buy Price <span className="text-red-500">*</span></Label>
                  <Input id="prod-buy" type="number" min="0" step="0.01" value={prodForm.buyPrice} onChange={e => setProdForm(f => ({ ...f, buyPrice: e.target.value }))} placeholder="0.00" required />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="prod-sell">Sell Price <span className="text-red-500">*</span></Label>
                  <Input id="prod-sell" type="number" min="0" step="0.01" value={prodForm.sellPrice} onChange={e => setProdForm(f => ({ ...f, sellPrice: e.target.value }))} placeholder="0.00" required />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="prod-stock">Stock <span className="text-red-500">*</span></Label>
                  <Input id="prod-stock" type="number" min="0" step="1" value={prodForm.stock} onChange={e => setProdForm(f => ({ ...f, stock: e.target.value }))} required />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="prod-sku">SKU</Label>
                  <Input id="prod-sku" value={prodForm.sku} onChange={e => setProdForm(f => ({ ...f, sku: e.target.value }))} placeholder="Optional" />
                </div>

                <div className="col-span-2 space-y-1.5">
                  <Label htmlFor="prod-desc">Description</Label>
                  <Input id="prod-desc" value={prodForm.description} onChange={e => setProdForm(f => ({ ...f, description: e.target.value }))} placeholder="Optional" />
                </div>
              </div>

              {/* Profit margin warning */}
              {(() => {
                const buy = Number(prodForm.buyPrice);
                const sell = Number(prodForm.sellPrice);
                if (buy > 0 && sell > 0 && sell > buy) {
                  const margin = ((sell - buy) / sell) * 100;
                  if (margin < 15) return (
                    <p className="text-sm text-amber-600 bg-amber-50 border border-amber-200 rounded-md px-3 py-2">
                      ⚠️ Profit margin is only {margin.toFixed(1)}%. Consider increasing the sell price.
                    </p>
                  );
                }
                return null;
              })()}

              {prodErr && <p className="text-sm text-red-500">{prodErr}</p>}
            </div>
            <DialogFooter className="mt-4">
              <Button type="button" variant="outline" onClick={() => setProdOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={busy || !prodForm.categoryId}>{busy ? 'Saving…' : prodEditing ? 'Save changes' : 'Add Product'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
