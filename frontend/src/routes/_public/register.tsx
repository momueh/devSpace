import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { createFileRoute, useNavigate } from '@tanstack/react-router';

export const Route = createFileRoute('/_public/register')({
  component: RegisterPage,
});

function RegisterPage() {
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.get('email'),
          password: formData.get('password'),
          firstname: formData.get('firstname'),
          lastname: formData.get('lastname'),
        }),
        credentials: 'include',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Registration failed');
      }

      navigate({ to: '/dashboard' });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    }
  };

  return (
    <div className='flex min-h-screen items-center justify-center'>
      <form onSubmit={handleSubmit} className='space-y-4 w-full max-w-sm'>
        {error && <div className='text-red-500'>{error}</div>}
        <Input name='firstname' placeholder='First Name' required />
        <Input name='lastname' placeholder='Last Name' required />
        <Input name='email' type='email' placeholder='Email' required />
        <Input
          name='password'
          type='password'
          placeholder='Password'
          required
        />
        <Button type='submit' className='w-full'>
          Register
        </Button>
        <div className='text-center text-sm text-muted-foreground'>
          Already have an account?{' '}
          <Button variant='link' className='p-0' asChild>
            <a href='/login'>Login</a>
          </Button>
        </div>
      </form>
    </div>
  );
}
