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
import { COUNTRIES } from '@/lib/constants';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

export default function NewApplicationPage() {
  const router = useRouter();
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState('');

  const isSystemAdmin = user?.role === 'SYSTEM_ADMIN';

  // Reference Data
  const [vendors, setVendors] = useState<any[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [discoms, setDiscoms] = useState<Discom[]>([]);

  const [selectedVendorId, setSelectedVendorId] = useState<string>('');

  // Customer State
  const [isNewCustomer, setIsNewCustomer] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  
  const [newCustomerData, setNewCustomerData] = useState({
    name: '',
    email: '',
    mobile: '',
    password: '',
    confirmPassword: '',
    gender: 'MALE',
    type: 'RESIDENTIAL',
    country: 'India',
    state: '',
    city: '', // mapped to village/city
    zipcode: '', // mapped to pinCode
    address: '',
    googleMapLink: '',
    latitude: null as number | null,
    longitude: null as number | null,
  });

  // Application State
  const [formData, setFormData] = useState({
    projectType: '',
    solarPanelId: '',
    comments: '',
  });

  // Address State (for the site installation)
  const [sameAsCustomerAddress, setSameAsCustomerAddress] = useState(true);
  const [addressData, setAddressData] = useState({
    country: 'India',
    state: '',
    district: '',
    village: '',
    pinCode: '',
    address: '',
    googleMapLink: '',
    latitude: '',
    longitude: '',
  });

  // Fetch initial vendors if system admin
  useEffect(() => {
    async function loadVendors() {
      if (isSystemAdmin) {
        const token = localStorage.getItem('token');
        if (token) {
          try {
            const res = await fetch(`${API_BASE}/vendors`, { headers: { 'Authorization': `Bearer ${token}` } });
            const data = await res.json();
            if (Array.isArray(data)) setVendors(data);
          } catch (e) {
            console.error('Failed to load vendors', e);
          }
        }
      } else if (user?.vendorId) {
        setSelectedVendorId(user.vendorId);
      }
      setFetching(false);
    }
    if (user) loadVendors();
  }, [user]);

  // Fetch vendor-specific data when selectedVendorId changes
  useEffect(() => {
    async function loadVendorData() {
      if (!selectedVendorId) {
        setCustomers([]);
        setProducts([]);
        setDiscoms([]);
        return;
      }
      try {
        const [custRes, prodRes, discRes] = await Promise.all([
          fetchCustomers({ status: 'ACTIVE', vendorId: selectedVendorId } as any),
          fetchProducts({ status: 'ACTIVE', vendorId: selectedVendorId } as any),
          fetchDiscoms(selectedVendorId)
        ]);
        setCustomers(custRes);
        setProducts(prodRes);
        setDiscoms(discRes);
        
        // If no customers, force 'isNewCustomer' to true
        if (custRes.length === 0) {
          setIsNewCustomer(true);
        }
      } catch (err) {
        console.error('Failed to load vendor specific reference data', err);
      }
    }
    loadVendorData();
  }, [selectedVendorId]);

  const handleMapLocationChange = (lat: number, lng: number, type: 'customer' | 'site') => {
    if (type === 'customer') {
      setNewCustomerData(prev => ({ ...prev, latitude: lat, longitude: lng }));
    } else {
      setAddressData(prev => ({ ...prev, latitude: lat.toString(), longitude: lng.toString() }));
    }
  };

  const validateForm = () => {
    if (isSystemAdmin && !selectedVendorId) return "Please select a Vendor.";
    
    if (isNewCustomer) {
      if (!newCustomerData.name.trim()) return "Customer Name is required.";
      if (!newCustomerData.mobile.trim()) return "Customer Mobile Number is required.";
      if (newCustomerData.password && newCustomerData.password.length < 6) return "Password must be at least 6 characters long.";
      if (newCustomerData.password !== newCustomerData.confirmPassword) return "Passwords do not match.";
    } else if (!selectedCustomerId) {
      return "Please select an existing customer or create a new one.";
    }
    
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    setError('');

    try {
      let payload: any = {
        vendorId: selectedVendorId,
        projectType: formData.projectType || undefined,
        solarPanelId: formData.solarPanelId === 'none' ? undefined : (formData.solarPanelId || undefined),
        comments: formData.comments,
        // Provide dummy required fields for backend if they were removed from UI
        approvedCapacityKwp: '0', 
        discomId: discoms.length > 0 ? discoms[0].id : '',
      };

      if (isNewCustomer) {
        payload.customerData = {
          ...newCustomerData,
          // Map properties to backend expected fields
          city: newCustomerData.city,
          zipcode: newCustomerData.zipcode,
        };
      } else {
        payload.customerId = selectedCustomerId;
      }

      if (!sameAsCustomerAddress) {
        payload = {
          ...payload,
          address: addressData.address,
          state: addressData.state,
          district: addressData.district,
          village: addressData.village,
          pinCode: addressData.pinCode,
          googleMapLink: addressData.googleMapLink,
          latitude: addressData.latitude ? parseFloat(addressData.latitude) : null,
          longitude: addressData.longitude ? parseFloat(addressData.longitude) : null,
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

        {isSystemAdmin && (
          <Card>
            <CardHeader>
              <CardTitle>Assign Vendor</CardTitle>
              <CardDescription>Select the vendor this application belongs to.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-2 max-w-md">
                <Label className="after:content-['*'] after:ml-0.5 after:text-red-500">Vendor</Label>
                <Select value={selectedVendorId} onValueChange={setSelectedVendorId} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Vendor" />
                  </SelectTrigger>
                  <SelectContent>
                    {vendors.map(v => (
                      <SelectItem key={v.id} value={v.id}>{v.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        )}

        {(!isSystemAdmin || selectedVendorId) && (
          <>
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
                    disabled={customers.length === 0} // Force checked if no customers
                  />
                  <label
                    htmlFor="isNewCustomer"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Create a New Customer
                  </label>
                  {customers.length === 0 && (
                    <span className="text-xs text-amber-500 ml-2">(Required: No existing customers found)</span>
                  )}
                </div>

                {!isNewCustomer ? (
                  <div className="flex flex-col gap-2 max-w-md">
                    <Label>Select Existing Customer</Label>
                    <Select 
                      value={selectedCustomerId} 
                      onValueChange={setSelectedCustomerId}
                      disabled={customers.length === 0}
                    >
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
                  <div className="space-y-6 pt-4 border-t">
                    <div className="grid gap-x-8 gap-y-6 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="name" className="after:content-['*'] after:ml-0.5 after:text-red-500">Name</Label>
                        <Input
                          id="name"
                          value={newCustomerData.name}
                          onChange={(e) => setNewCustomerData({...newCustomerData, name: e.target.value})}
                          placeholder="Enter the Name"
                          required
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="mobile" className="after:content-['*'] after:ml-0.5 after:text-red-500">Mobile Number</Label>
                        <Input
                          id="mobile"
                          value={newCustomerData.mobile}
                          onChange={(e) => setNewCustomerData({...newCustomerData, mobile: e.target.value})}
                          placeholder="Enter the Mobile"
                          required
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          value={newCustomerData.email}
                          onChange={(e) => setNewCustomerData({...newCustomerData, email: e.target.value})}
                          placeholder="Enter the Email"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="type" className="after:content-['*'] after:ml-0.5 after:text-red-500">Customer Type</Label>
                        <Select
                          value={newCustomerData.type}
                          onValueChange={(val) => setNewCustomerData({...newCustomerData, type: val})}
                          required
                        >
                          <SelectTrigger id="type">
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="RESIDENTIAL">Residential</SelectItem>
                            <SelectItem value="COMMERCIAL">Commercial</SelectItem>
                            <SelectItem value="INDUSTRIAL">Industrial</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="gender" className="after:content-['*'] after:ml-0.5 after:text-red-500">Gender</Label>
                        <Select
                          value={newCustomerData.gender}
                          onValueChange={(val) => setNewCustomerData({...newCustomerData, gender: val})}
                          required
                        >
                          <SelectTrigger id="gender">
                            <SelectValue placeholder="Select gender" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="MALE">Male</SelectItem>
                            <SelectItem value="FEMALE">Female</SelectItem>
                            <SelectItem value="OTHER">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid gap-x-8 gap-y-6 md:grid-cols-2 pt-4 border-t">
                      <div className="space-y-2">
                        <Label htmlFor="password">Password</Label>
                        <Input
                          id="password"
                          type="password"
                          value={newCustomerData.password}
                          onChange={(e) => setNewCustomerData({...newCustomerData, password: e.target.value})}
                          placeholder="Enter the Password"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="confirmPassword">Confirm Password</Label>
                        <Input
                          id="confirmPassword"
                          type="password"
                          value={newCustomerData.confirmPassword}
                          onChange={(e) => setNewCustomerData({...newCustomerData, confirmPassword: e.target.value})}
                          placeholder="Enter the Confirm Password"
                        />
                      </div>
                    </div>

                    <div className="pt-4 border-t">
                      <h3 className="text-lg font-medium mb-4">Customer Address</h3>
                      <div className="grid gap-x-8 gap-y-6 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="country" className="after:content-['*'] after:ml-0.5 after:text-red-500">Country</Label>
                          <Select
                            value={newCustomerData.country}
                            onValueChange={(val) => setNewCustomerData({...newCustomerData, country: val})}
                            required
                          >
                            <SelectTrigger id="country">
                              <SelectValue placeholder="Select Country" />
                            </SelectTrigger>
                            <SelectContent>
                              {COUNTRIES.map((country) => (
                                <SelectItem key={country} value={country}>{country}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="state" className="after:content-['*'] after:ml-0.5 after:text-red-500">State</Label>
                          <Input
                            id="state"
                            value={newCustomerData.state}
                            onChange={(e) => setNewCustomerData({...newCustomerData, state: e.target.value})}
                            placeholder="Enter State"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="city" className="after:content-['*'] after:ml-0.5 after:text-red-500">City</Label>
                          <Input
                            id="city"
                            value={newCustomerData.city}
                            onChange={(e) => setNewCustomerData({...newCustomerData, city: e.target.value})}
                            placeholder="Enter City"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="zipcode" className="after:content-['*'] after:ml-0.5 after:text-red-500">Zipcode / Pin Code</Label>
                          <Input
                            id="zipcode"
                            value={newCustomerData.zipcode}
                            onChange={(e) => setNewCustomerData({...newCustomerData, zipcode: e.target.value})}
                            placeholder="Enter Zipcode"
                            required
                          />
                        </div>
                      </div>
                      <div className="space-y-2 mt-6">
                        <Label htmlFor="address" className="after:content-['*'] after:ml-0.5 after:text-red-500">Address Details</Label>
                        <Textarea
                          id="address"
                          value={newCustomerData.address}
                          onChange={(e) => setNewCustomerData({...newCustomerData, address: e.target.value})}
                          placeholder="Enter complete address..."
                          required
                          className="min-h-[100px]"
                        />
                      </div>
                      
                      <div className="grid gap-x-8 gap-y-6 md:grid-cols-2 mt-6">
                        <div className="space-y-2">
                          <Label htmlFor="googleMapLink">Google Map Link</Label>
                          <Input
                            id="googleMapLink"
                            value={newCustomerData.googleMapLink}
                            onChange={(e) => setNewCustomerData({...newCustomerData, googleMapLink: e.target.value})}
                            placeholder="Enter the Google Map Link"
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2 mt-6">
                        <Label>Pinpoint Location on Map</Label>
                        <div className="h-[300px] w-full rounded-md border overflow-hidden">
                          <DynamicMapPicker 
                            initialLat={newCustomerData.latitude}
                            initialLng={newCustomerData.longitude}
                            initialLink={newCustomerData.googleMapLink}
                            onChange={(data) => {
                              handleMapLocationChange(data.lat || 28.4595, data.lng || 77.0266, 'customer');
                              if (data.link) setNewCustomerData(prev => ({...prev, googleMapLink: data.link}));
                            }} 
                          />
                        </div>
                        <div className="flex gap-4 mt-2">
                          <div className="flex-1">
                            <Label className="text-xs text-muted-foreground mb-1 block">Latitude</Label>
                            <Input readOnly value={newCustomerData.latitude || ''} className="h-8 text-xs bg-muted" />
                          </div>
                          <div className="flex-1">
                            <Label className="text-xs text-muted-foreground mb-1 block">Longitude</Label>
                            <Input readOnly value={newCustomerData.longitude || ''} className="h-8 text-xs bg-muted" />
                          </div>
                        </div>
                      </div>
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
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex flex-col gap-2">
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
                    <div className="grid gap-x-8 gap-y-6 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="site_country" className="after:content-['*'] after:ml-0.5 after:text-red-500">Country</Label>
                        <Select
                          value={addressData.country}
                          onValueChange={(val) => setAddressData({...addressData, country: val})}
                          required={!sameAsCustomerAddress}
                        >
                          <SelectTrigger id="site_country">
                            <SelectValue placeholder="Select Country" />
                          </SelectTrigger>
                          <SelectContent>
                            {COUNTRIES.map((country) => (
                              <SelectItem key={country} value={country}>{country}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="site_state" className="after:content-['*'] after:ml-0.5 after:text-red-500">State</Label>
                        <Input
                          id="site_state"
                          value={addressData.state}
                          onChange={(e) => setAddressData({...addressData, state: e.target.value})}
                          placeholder="Enter State"
                          required={!sameAsCustomerAddress}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="site_district" className="after:content-['*'] after:ml-0.5 after:text-red-500">District / City</Label>
                        <Input
                          id="site_district"
                          value={addressData.district}
                          onChange={(e) => setAddressData({...addressData, district: e.target.value})}
                          placeholder="Enter District/City"
                          required={!sameAsCustomerAddress}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="site_village" className="after:content-['*'] after:ml-0.5 after:text-red-500">Village / City</Label>
                        <Input
                          id="site_village"
                          value={addressData.village}
                          onChange={(e) => setAddressData({...addressData, village: e.target.value})}
                          placeholder="Enter Village/City"
                          required={!sameAsCustomerAddress}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="site_pincode" className="after:content-['*'] after:ml-0.5 after:text-red-500">Zipcode / Pin Code</Label>
                        <Input
                          id="site_pincode"
                          value={addressData.pinCode}
                          onChange={(e) => setAddressData({...addressData, pinCode: e.target.value})}
                          placeholder="Enter Zipcode"
                          required={!sameAsCustomerAddress}
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2 mt-4">
                      <Label htmlFor="site_address" className="after:content-['*'] after:ml-0.5 after:text-red-500">Street Address</Label>
                      <Textarea 
                        id="site_address"
                        value={addressData.address}
                        onChange={(e) => setAddressData({...addressData, address: e.target.value})}
                        required={!sameAsCustomerAddress}
                        className="min-h-[100px]"
                      />
                    </div>
                    
                    <div className="space-y-2 mt-4">
                      <Label htmlFor="site_googleMapLink">Google Map Link (Optional)</Label>
                      <Input
                        id="site_googleMapLink"
                        value={addressData.googleMapLink}
                        onChange={(e) => setAddressData({...addressData, googleMapLink: e.target.value})}
                        placeholder="Enter the Google Map Link"
                      />
                    </div>
                    
                    <div className="space-y-2 mt-6">
                      <Label>Pinpoint Location on Map</Label>
                      <div className="h-[300px] w-full rounded-md border overflow-hidden">
                        <DynamicMapPicker 
                          initialLat={addressData.latitude ? parseFloat(addressData.latitude) : null}
                          initialLng={addressData.longitude ? parseFloat(addressData.longitude) : null}
                          initialLink={addressData.googleMapLink}
                          onChange={(data) => {
                            handleMapLocationChange(data.lat || 28.4595, data.lng || 77.0266, 'site');
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
          </>
        )}
      </form>
    </div>
  );
}
