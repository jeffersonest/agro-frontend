'use client';

import React from 'react';
import { useAuth } from '../../contexts/auth.context';
import { useRouter, usePathname } from 'next/navigation';
import Image from 'next/image';
import { Avatar, AvatarFallback, AvatarImage } from '@radix-ui/react-avatar';
import { Skeleton } from '../../components/ui/skeleton';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const formatBreadcrumb = (pathname: string) => {
    const segments = pathname.split('/').filter((segment) => segment);
    return segments.map((segment, index) => {
      const href = '/' + segments.slice(0, index + 1).join('/');
      const label = segment.charAt(0).toUpperCase() + segment.slice(1);
      return { href, label };
    });
  };

  const breadcrumbs = formatBreadcrumb(pathname);

  return (
    <section className="min-h-screen min-w-screen flex flex-col bg-gray-100">
      <div id="header" className='flex h-[80px] flex-col min-w-[100%] bg-slate-800 items-end justify-center px-5'>
        <Popover>
          <PopoverTrigger asChild>
            <div className='relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full cursor-pointer'>
              <Avatar>
                <AvatarImage src="https://i.pravatar.cc/300" alt="random-avatar" />
                <AvatarFallback>
                  <Skeleton className="relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full" />
                </AvatarFallback>
              </Avatar>
            </div>
          </PopoverTrigger>
          <PopoverContent className="w-56 p-4">
            <div className="flex flex-col space-y-2">
              <span className="font-medium">{user?.name}</span>
              <Button variant="outline" onClick={handleLogout}>Logout</Button>
            </div>
          </PopoverContent>
        </Popover>
      </div>
      <main className="flex-1 p-4 bg-slate-200">
        <div className="mb-4">
          <nav className="text-sm text-gray-500">
            {breadcrumbs.map((breadcrumb, index) => (
              <span key={breadcrumb.href}>
                <span className="mx-2">/</span>
                {index === breadcrumbs.length - 1 ? (
                  <span>{breadcrumb.label}</span>
                ) : (
                  <a href={breadcrumb.href} className="hover:underline">{breadcrumb.label}</a>
                )}
              </span>
            ))}
          </nav>
        </div>

        {children}
      </main>
    </section>
  );
}
