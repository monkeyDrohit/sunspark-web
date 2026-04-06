'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { createApplication } from '@/lib/applications';
import { fetchCustomers, Customer } from '@/lib/customers';
import { fetchProducts, Product } from '@/lib/products';
import { fetchDiscoms, Discom } from '@/lib/discoms';
import DynamicMapPicker from '@/components/dynamic-map-picker';
import { useAuth } from '@/contexts/auth-context';

export default function NewApplicationPage() {
  const router = useRouter();
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState('');

  // Reference Data
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [discoms, setDiscoms] = useState<Discom[]>([]);

  // Customer State
  const [isNewCustomer, setIsNewCustomer] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  
  const [newCustomerData, setNewCustomerData] = useState({
    name: '',
    mobile: '',
    email: '',
    type: 'RESIDENTIAL',
  });

  // Application State
  const [formData, setFormData] = useState({
    serviceId: '',
    approvedCapacityKwp: '',
    projectType: '',
    discomId: '',
    solarPanelId: '',
    comments: '',
  });

  // Address State
  const [sameAsCustomerAddress, setSameAsCustomerAddress] = useState(true);
  const [addressData, setAddressData] = useState({
    address: '',
    state: '',
    district: '',
    village: '',
    pinCode: '',
    googleMapLink: '',
    latitude: '',
    longitude: '',
  });

  useEffect(() => {
    async function loadData() {
      try {
        const [custRes, prodRes, discRes] = await Promise.all([
          fetchCustomers({ status: 'ACTIVE' }),
          fetchProducts({ status: 'ACTIVE' }),
          fetchDiscoms()
        ]);
        setCustomers(custRes);
        setProducts(prodRes);
        setDiscoms(discRes);
      } catch (err) {
        console.error('Failed to load reference data', err);
        setError('Failed to load necessary options. Please try refreshing.');
      } finally {
        setFetching(false);
      }
    }
    loadData();
  }, []);

  const handleMapLocationChange = (lat: number, lng: number) => {
    setAddressData(prev => ({
      ...prev,
      latitude: lat.toString(),
      longitude: lng.toString()
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!isNewCustomer && !selectedCustomerId) {
      setError('Please select an existing customer or create a new one.');
      setLoading(false);
      return;
    }

    try {
      let payload: any = {
        serviceId: formData.serviceId,
        approvedCapacityKwp: formData.approvedCapacityKwp,
        projectType: formData.projectType || undefined,
        discomId: formData.discomId,
        solarPanelId: formData.solarPanelId === 'none' ? undefined : (formData.solarPanelId || undefined),
        comments: formData.comments,
      };

      if (isNewCustomer) {
        payload.customerData = newCustomerData;
      } else {
        payload.customerId = selectedCustomerId;
      }

      if (!sameAsCustomerAddress) {
        payload = {
          ...payload,
          ...addressData
        };
      }

      await createApplication(payload);
      
      router.push('/applications');
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Failed to create application');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return <div className="p-8 text-center text-muted-foreground">Loading form...</div>;
  }

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link
            href="/applications"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            ← Back to Applications
          </Link>
          <h1 className="mt-1 text-2xl font-semibold text-foreground">
            Create Application
          </h1>
          <p className="text-muted-foreground mt-1">
            Log a new solar installation application and link it to a customer.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="p-4 rounded-md bg-destructive/10 text-destructive border border-destructive/20 font-medium">
            {error}
          </div>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Customer Details</CardTitle>
            <CardDescription>Select an existing customer or register a new one.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2 pb-4">
              <Checkbox 
                id="isNewCustomer" 
                checked={isNewCustomer} 
                onCheckedChange={(checked) => setIsNewCustomer(!!checked)} 
              />
              <label
                htmlFor="isNewCustomer"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Create a New Customer
              </label>
            </div>

            {!isNewCustomer ? (
              <div className="flex flex-col gap-2">
                <Label>Select Existing Customer</Label>
                <Select value={selectedCustomerId} onValueChange={setSelectedCustomerId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Search or select customer..." />
                  </SelectTrigger>
                  <SelectContent>
                    {customers.map(c => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name} ({c.mobile})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 p-4 bg-muted/30 rounded-lg border">
                <div className="flex flex-col gap-2">
                  <Label>Name</Label>
                  <Input 
                    required 
                    value={newCustomerData.name}
                    onChange={(e) => setNewCustomerData({...newCustomerData, name: e.target.value})}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label>Mobile Number</Label>
                  <Input 
                    required 
                    value={newCustomerData.mobile}
                    onChange={(e) => setNewCustomerData({...newCustomerData, mobile: e.target.value})}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label>Email (Optional)</Label>
                  <Input 
                    type="email"
                    value={newCustomerData.email}
                    onChange={(e) => setNewCustomerData({...newCustomerData, email: e.target.value})}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label>Customer Type</Label>
                  <Select 
                    value={newCustomerData.type} 
                    onValueChange={(val) => setNewCustomerData({...newCustomerData, type: val})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="RESIDENTIAL">Residential</SelectItem>
                      <SelectItem value="COMMERCIAL">Commercial</SelectItem>
                      <SelectItem value="INDUSTRIAL">Industrial</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Application & Technical Details</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <Label>Application ID</Label>
              <Input 
                placeholder="e.g. SRV-1002"
                value={formData.serviceId}
                onChange={(e) => setFormData({...formData, serviceId: e.target.value})}
              />
            </div>
            
            <div className="flex flex-col gap-2">
              <Label>Approved Capacity (kWp)</Label>
              <Input 
                type="number" 
                step="0.1" 
                required 
                placeholder="e.g. 3.0"
                value={formData.approvedCapacityKwp}
                onChange={(e) => setFormData({...formData, approvedCapacityKwp: e.target.value})}
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label>DisCom</Label>
              <Select 
                required
                value={formData.discomId} 
                onValueChange={(val) => setFormData({...formData, discomId: val})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select DisCom" />
                </SelectTrigger>
                <SelectContent>
                  {discoms.map(d => (
                    <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-2">
              <Label>Project Type</Label>
              <Select 
                value={formData.projectType} 
                onValueChange={(val) => setFormData({...formData, projectType: val})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="NEW_INSTALLATION">New Installation</SelectItem>
                  <SelectItem value="UPGRADE">Upgrade</SelectItem>
                  <SelectItem value="AMC">AMC</SelectItem>
                  <SelectItem value="RESIDENTIAL">Residential</SelectItem>
                  <SelectItem value="COMMERCIAL">Commercial</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-2 sm:col-span-2">
              <Label>Type of Solar Panel (Product)</Label>
              <Select 
                value={formData.solarPanelId} 
                onValueChange={(val) => setFormData({...formData, solarPanelId: val})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select from catalog..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No Panel Assigned Yet</SelectItem>
                  {products.map(p => (
                    <SelectItem key={p.id} value={p.id}>{p.name} - {p.sku}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Site Address & Map Location</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2 pb-2">
              <Checkbox 
                id="sameAsAddress" 
                checked={sameAsCustomerAddress} 
                onCheckedChange={(checked) => setSameAsCustomerAddress(!!checked)} 
              />
              <label
                htmlFor="sameAsAddress"
                className="text-sm font-medium leading-none"
              >
                Use Customer's Registered Address & Location
              </label>
            </div>

            {!sameAsCustomerAddress && (
              <div className="grid gap-4 mt-4 pt-4 border-t border-border">
                <div className="flex flex-col gap-2">
                  <Label>Street Address</Label>
                  <Textarea 
                    value={addressData.address}
                    onChange={(e) => setAddressData({...addressData, address: e.target.value})}
                  />
                </div>
                
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="flex flex-col gap-2">
                    <Label>State</Label>
                    <Input 
                      value={addressData.state}
                      onChange={(e) => setAddressData({...addressData, state: e.target.value})}
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label>District</Label>
                    <Input 
                      value={addressData.district}
                      onChange={(e) => setAddressData({...addressData, district: e.target.value})}
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label>Village/City</Label>
                    <Input 
                      value={addressData.village}
                      onChange={(e) => setAddressData({...addressData, village: e.target.value})}
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label>Pin Code</Label>
                    <Input 
                      value={addressData.pinCode}
                      onChange={(e) => setAddressData({...addressData, pinCode: e.target.value})}
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-2 mt-4">
                  <Label>Pinpoint Location on Map</Label>
                  <div className="h-[300px] border rounded-md overflow-hidden">
                    <DynamicMapPicker 
                      initialLat={28.4595}
                      initialLng={77.0266}
                      onChange={(data) => {
                        handleMapLocationChange(data.lat || 28.4595, data.lng || 77.0266);
                        if (data.link) setAddressData(prev => ({...prev, googleMapLink: data.link}));
                      }}
                    />
                  </div>
                  <div className="flex gap-4 mt-2">
                    <div className="flex-1">
                      <Label className="text-xs text-muted-foreground mb-1 block">Latitude</Label>
                      <Input readOnly value={addressData.latitude} className="h-8 text-xs bg-muted" />
                    </div>
                    <div className="flex-1">
                      <Label className="text-xs text-muted-foreground mb-1 block">Longitude</Label>
                      <Input readOnly value={addressData.longitude} className="h-8 text-xs bg-muted" />
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col gap-2 mt-2">
                  <Label>Google Map Link (Optional)</Label>
                  <Input 
                    value={addressData.googleMapLink}
                    onChange={(e) => setAddressData({...addressData, googleMapLink: e.target.value})}
                    placeholder="https://maps.google.com/..."
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Comments / Additional Info</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea 
              placeholder="Add any additional notes about this application here..."
              className="min-h-[100px]"
              value={formData.comments}
              onChange={(e) => setFormData({...formData, comments: e.target.value})}
            />
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4 pb-12">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? 'Creating...' : 'Create Application'}
          </Button>
        </div>
      </form>
    </div>
  );
}
