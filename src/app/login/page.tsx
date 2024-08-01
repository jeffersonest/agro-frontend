'use client';

import React, { useEffect, useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { ReloadIcon } from '@radix-ui/react-icons';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '../../contexts/auth.context';
import { useRouter } from 'next/navigation';
import { LoginFormInputs } from '../../types/login-input.interface';

const LoginPage: React.FC = () => {
  const { login, user } = useAuth();
  const { register, handleSubmit } = useForm<LoginFormInputs>();
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      router.push('/dashboard');
    }
  }, [user, router]);

  const onSubmit: SubmitHandler<LoginFormInputs> = async (data) => {
    try {
      setLoading(true);
      await login(data.email, data.password);
      router.push('/dashboard');
    } catch (error) {
      toast({
        title: "Uh oh! Something went wrong.",
        description: <>{error instanceof Error ? error.message : 'Please check your credentials and try again.'}</>,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-gray-100 p-4">
      <div className="absolute inset-0">
        <Image src="/background.jpg" alt="Background" layout="fill" objectFit="cover" />
        <div className="absolute inset-0 bg-black opacity-50"></div>
      </div>
      <Card className="relative w-full max-w-sm">
        <CardHeader>
          <CardTitle>Login</CardTitle>
          <CardDescription>Please enter your credentials</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="mb-4">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <Input
                type="email"
                id="email"
                {...register('email', { required: true })}
                className="mt-1 block w-full"
              />
            </div>
            <div className="mb-6">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <Input
                type="password"
                id="password"
                {...register('password', { required: true })}
                className="mt-1 block w-full"
              />
            </div>
            <Button type="submit" className="w-full" color="blue" disabled={loading}>
              {loading && <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />}
              Login
            </Button>
          </form>
        </CardContent>
        <CardFooter>
          <p className="text-sm text-muted-foreground">
            Dont have an account? <a href="/register" className="text-blue-500">Register</a>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default LoginPage;
