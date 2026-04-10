'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import { Package, GitBranch } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

function ParamToasts() {
  const searchParams = useSearchParams();
  const fired = useRef(false);
  useEffect(() => {
    if (fired.current) return;
    fired.current = true;
    if (searchParams.get('registered') === '1') {
      toast.success('Account created! Check your email to verify your account.');
    } else if (searchParams.get('registered') === 'noverify') {
      toast.success('Account created! You can now sign in.');
    } else if (searchParams.get('verified') === '1') {
      toast.success('Email verified! You can now sign in.');
    } else if (searchParams.get('error') === 'expired-token') {
      toast.error('Verification link has expired. Please register again.');
    } else if (searchParams.get('error') === 'invalid-token') {
      toast.error('Invalid verification link.');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return null;
}

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Pre-flight rate limit check — gives proper error message before NextAuth swallows it
    const limitRes = await fetch('/api/auth/login-rate-check', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });

    if (!limitRes.ok) {
      const data = await limitRes.json().catch(() => ({}));
      setError(data.error ?? 'Too many login attempts. Please try again later.');
      setLoading(false);
      return;
    }

    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError('Invalid credentials or email not verified.');
    } else {
      router.push('/dashboard');
    }
  }

  async function handleGitHub() {
    await signIn('github', { redirectTo: '/dashboard' });
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Suspense><ParamToasts /></Suspense>
      <div className="w-full max-w-sm space-y-6">
        {/* Logo */}
        <div className="flex flex-col items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
            <Package className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold">DevStash</span>
        </div>

        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-xl">Sign in</CardTitle>
            <CardDescription>Choose your sign in method</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* GitHub */}
            <Button
              variant="outline"
              className="w-full"
              onClick={handleGitHub}
              type="button"
            >
              <GitBranch className="mr-2 h-4 w-4" />
              Sign in with GitHub
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">or</span>
              </div>
            </div>

            {/* Email/password form */}
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="space-y-1">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Signing in…' : 'Sign in'}
              </Button>
              <p className="text-center text-sm text-muted-foreground">
                <Link href="/forgot-password" className="text-foreground underline underline-offset-4 hover:text-primary">
                  Forgot password?
                </Link>
              </p>
            </form>

            <p className="text-center text-sm text-muted-foreground">
              Don&apos;t have an account?{' '}
              <Link href="/register" className="text-foreground underline underline-offset-4 hover:text-primary">
                Register
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
