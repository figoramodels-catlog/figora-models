import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { TextField } from '../components/ui/TextField';
import { Button } from '../components/ui/Button';

export function Login() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
    form?: string;
  }>({});

  const onSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const next: typeof errors = {};
    if (!email.trim()) next.email = 'Email is required.';else
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()))
    next.email = 'Enter a valid email address.';
    if (!password) next.password = 'Password is required.';
    setErrors(next);
    if (Object.keys(next).length) return;

    const result = signIn(email, password);
    if (result.error) {
      setErrors({ form: result.error });
      return;
    }
    navigate('/');
  };

  return (
    <main className="flex min-h-[calc(100vh-56px)] w-full items-center justify-center px-5 py-10 sm:min-h-[calc(100vh-64px)]">
      <motion.div
        initial={{ opacity: 0, y: 12, scale: 0.99 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
        className="w-full max-w-sm rounded-3xl border border-border bg-card p-6 shadow-soft sm:p-7">
        
        <div className="mb-6 text-center">
          <p className="font-display text-[11px] font-semibold tracking-[0.22em] text-muted-foreground">
            FIGORA MODELS
          </p>
          <h1 className="mt-2 font-display text-[20px] font-semibold tracking-[-0.02em]">
            Sign in
          </h1>
        </div>

        <form onSubmit={onSubmit} className="space-y-4" noValidate>
          <TextField
            label="Email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            error={errors.email}
            placeholder="you@example.com" />
          
          <TextField
            label="Password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            error={errors.password}
            placeholder="••••••••" />
          

          {errors.form &&
          <p role="alert" className="text-[12px] text-destructive">
              {errors.form}
            </p>
          }

          <Button type="submit" size="lg" className="w-full">
            Sign In
          </Button>
        </form>

        <p className="mt-5 text-center text-[13px] text-muted-foreground">
          No account?{' '}
          <Link
            to="/register"
            className="font-medium text-foreground underline-offset-4 hover:underline">
            
            Register
          </Link>
        </p>

        <div className="mt-5 rounded-2xl border border-border bg-surface p-3 text-center">
          <p className="text-[11px] leading-relaxed text-muted-foreground">
            Demo admin: admin@figora.com / admin123
            <br />
            Demo customer: customer@figora.com / customer123
          </p>
        </div>
      </motion.div>
    </main>);

}