'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Lock, Mail } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      router.push('/');
    }
  }, [user, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen">
      {/* Left side - Decorative gradient background */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-500 relative overflow-hidden">
        {/* Animated background shapes */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-72 h-72 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-white/5 rounded-full blur-3xl"></div>
        </div>
        
        {/* Content overlay */}
        <div className="relative z-10 flex flex-col justify-center items-center w-full text-white p-12 lg:p-20">
          <div className="max-w-lg w-full">
            <div className="mb-12 text-center lg:text-left flex flex-col items-center lg:items-start">
              <div className="flex items-center mb-8">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 shadow-xl">
                  <Lock className="h-8 w-8 text-white" />
                </div>
              </div>
              <h2 className="text-5xl font-extrabold mb-4 tracking-tight">Welcome Back</h2>
              <p className="text-xl text-white/90 font-medium max-w-sm">
                Sign in to access your admin portal and manage your operations.
              </p>
            </div>
            
            {/* Feature highlights */}
            <div className="grid gap-8 mt-16">
              <div className="flex items-start gap-5 group transition-transform hover:translate-x-2 duration-300">
                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-lg">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div>
                  <p className="font-bold text-lg leading-none mb-1">Track Agents</p>
                  <p className="text-white/80 leading-relaxed text-sm">Monitor field agents in real-time with precise location tracking.</p>
                </div>
              </div>

              <div className="flex items-start gap-5 group transition-transform hover:translate-x-2 duration-300">
                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-lg">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div>
                  <p className="font-bold text-lg leading-none mb-1">Manage Applications</p>
                  <p className="text-white/80 leading-relaxed text-sm">Efficiently track and move applications through our 10-stage workflow.</p>
                </div>
              </div>

              <div className="flex items-start gap-5 group transition-transform hover:translate-x-2 duration-300">
                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-lg">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
                <div>
                  <p className="font-bold text-lg leading-none mb-1">Customer Management</p>
                  <p className="text-white/80 leading-relaxed text-sm">A unified view of all customer interactions and history.</p>
                </div>
              </div>

              <div className="flex items-start gap-5 group transition-transform hover:translate-x-2 duration-300">
                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-lg">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                </div>
                <div>
                  <p className="font-bold text-lg leading-none mb-1">Orders & Quotations</p>
                  <p className="text-white/80 leading-relaxed text-sm">Process orders and generate professional quotes instantly.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom logo/tagline */}
          <div className="absolute bottom-12 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-black flex items-center justify-center text-white font-bold text-xs">N</div>
            <span className="text-white/60 text-sm font-medium tracking-wider uppercase">SunSpark Admin v1.0</span>
          </div>
        </div>
      </div>

      {/* Right side - Login form */}
      <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4">
        <Card className="w-full max-w-md shadow-xl border-0">
          <CardHeader className="space-y-1 pb-6">
            <div className="flex items-center justify-center mb-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 text-white shadow-lg">
                <Lock className="h-8 w-8" />
              </div>
            </div>
            <CardTitle className="text-3xl text-center font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Admin Portal
            </CardTitle>
            <CardDescription className="text-center text-base">
              Sign in to your account to continue
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <Alert variant="destructive" className="animate-in slide-in-from-top-2">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={loading}
                    className="pl-10 h-11"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={loading}
                    className="pl-10 h-11"
                  />
                </div>
              </div>
              
              <Button 
                type="submit" 
                className="w-full h-11 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200" 
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  'Sign In'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
