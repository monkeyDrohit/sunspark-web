'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Plus, Trash2, Save, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { fetchProducts, type Product } from '@/lib/products';
import { createQuotation } from '@/lib/quotations';
import { formatCurrency } from '@/lib/utils';
import type { Application } from '@/lib/api';

interface QuotationItem {
  productId: string;
  name: string;
  quantity: number;
  unitPrice: number;
}

export function QuotationBuilder({ application }: { application: Application }) {
  const router = useRouter();
  const [items, setItems] = useState<QuotationItem[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Load products on mount
  useEffect(() => {
    async function loadProducts() {
      try {
        const data = await fetchProducts({ status: 'ACTIVE' });
        setProducts(data);
      } catch (err) {
        console.error('Failed to load products', err);
      }
    }
    loadProducts();
  }, []);

  const filteredProducts = searchQuery.trim() === '' 
    ? [] 
    : products.filter(p => 
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        p.sku.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 5);

  const addItem = (product: Product) => {
    const existing = items.find(item => item.productId === product.id);
    if (existing) {
      setItems(items.map(item => 
        item.productId === product.id 
          ? { ...item, quantity: item.quantity + 1 } 
          : item
      ));
    } else {
      setItems([...items, {
        productId: product.id,
        name: product.name,
        quantity: 1,
        unitPrice: parseFloat(product.amount),
      }]);
    }
    setSearchQuery('');
  };

  const removeItem = (productId: string) => {
    setItems(items.filter(item => item.productId !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity < 1) return;
    setItems(items.map(item => 
      item.productId === productId ? { ...item, quantity } : item
    ));
  };

  const updatePrice = (productId: string, unitPrice: number) => {
    setItems(items.map(item => 
      item.productId === productId ? { ...item, unitPrice } : item
    ));
  };

  const totalAmount = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);

  const handleSave = async () => {
    if (items.length === 0) {
      setError('Please add at least one product to the quotation.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      await createQuotation({
        applicationId: application.id,
        customerId: application.customerId || '',
        totalAmount,
        notes,
        items: items.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
        })),
      });
      router.push(`/applications/${application.id}`);
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Failed to create quotation');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="size-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-semibold">Quotation Builder</h1>
            <p className="text-sm text-muted-foreground">
              For Application: {application.serviceId} · {application.consumerName}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={() => router.back()}>Cancel</Button>
          <Button onClick={handleSave} disabled={loading || items.length === 0}>
            {loading ? 'Saving...' : (
              <>
                <Save className="mr-2 size-4" />
                Save & Finalize Stage
              </>
            )}
          </Button>
        </div>
      </div>

      {error && (
        <div className="bg-destructive/10 text-destructive p-4 rounded-md text-sm font-medium border border-destructive/20">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Products & Services</CardTitle>
              <CardDescription>Search and add solar panels, inverters, and BOS items.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  placeholder="Search products by name or SKU..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                {filteredProducts.length > 0 && (
                  <Card className="absolute top-full left-0 right-0 z-10 mt-1 shadow-lg border-muted">
                    <CardContent className="p-0">
                      {filteredProducts.map((p) => (
                        <button
                          key={p.id}
                          className="flex w-full items-center justify-between p-3 hover:bg-accent text-left transition-colors border-b last:border-0"
                          onClick={() => addItem(p)}
                        >
                          <div className="flex flex-col">
                            <span className="text-sm font-medium">{p.name}</span>
                            <span className="text-xs text-muted-foreground">{p.sku}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-sm font-semibold">{formatCurrency(p.amount)}</span>
                            <Plus className="size-4 text-primary" />
                          </div>
                        </button>
                      ))}
                    </CardContent>
                  </Card>
                )}
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead className="w-[100px]">Quantity</TableHead>
                    <TableHead className="w-[150px]">Unit Price</TableHead>
                    <TableHead className="w-[150px] text-right">Total</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                        No items added yet. Search for products above.
                      </TableCell>
                    </TableRow>
                  ) : (
                    items.map((item) => (
                      <TableRow key={item.productId}>
                        <TableCell>
                          <div className="font-medium">{item.name}</div>
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => updateQuantity(item.productId, parseInt(e.target.value) || 1)}
                            className="h-8"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            value={item.unitPrice}
                            onChange={(e) => updatePrice(item.productId, parseFloat(e.target.value) || 0)}
                            className="h-8"
                          />
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {formatCurrency(item.quantity * item.unitPrice)}
                        </TableCell>
                        <TableCell>
                          <Button 
                            variant="ghost" 
                            size="icon-xs" 
                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={() => removeItem(item.productId)}
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quotation Notes</CardTitle>
              <CardDescription>Visible to the customer on the PDF proposal.</CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea 
                placeholder="Enter any specific terms, conditions, or notes for this solar installation..."
                className="min-h-[120px]"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col gap-6">
          <Card className="bg-primary/5 border-primary/20">
            <CardHeader>
              <CardTitle className="text-lg">Summary</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatCurrency(totalAmount)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">GST (Inclusive)</span>
                <span>₹0</span>
              </div>
              <div className="border-t pt-4 flex justify-between items-baseline">
                <span className="font-semibold text-lg">Total Amount</span>
                <span className="font-bold text-2xl text-primary">{formatCurrency(totalAmount)}</span>
              </div>

              {application.subsidyAmountRs && (
                <div className="bg-green-500/10 border border-green-500/20 rounded-md p-3 mt-2">
                  <div className="flex justify-between text-xs text-green-700 font-medium uppercase tracking-wider mb-1">
                    <span>Govt Subsidy Benefit</span>
                    <span>₹{application.subsidyAmountRs}</span>
                  </div>
                  <div className="flex justify-between text-sm font-bold text-green-700 border-t border-green-500/20 pt-1 mt-1">
                    <span>Net Effective Cost</span>
                    <span>{formatCurrency(totalAmount - parseFloat(application.subsidyAmountRs))}</span>
                  </div>
                </div>
              )}

              <div className="mt-4 p-3 bg-muted rounded-md border text-xs text-muted-foreground flex flex-col gap-1">
                <p><strong>Capacity:</strong> {application.approvedCapacityKwp} kWp Approved</p>
                <p><strong>DisCom:</strong> {application.discom?.name}</p>
                <p><strong>Reference:</strong> {application.serviceId}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Customer Details</CardTitle>
            </CardHeader>
            <CardContent className="text-sm flex flex-col gap-2">
              <div>
                <p className="font-semibold">{application.consumerName}</p>
                <p className="text-muted-foreground">{application.consumerPhone}</p>
              </div>
              <div className="text-xs text-muted-foreground">
                {`${application.village || ''}, ${application.district || ''}, ${application.state || ''} - ${application.pinCode || ''}`}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
