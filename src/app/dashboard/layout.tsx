'use client';

import React, { useEffect } from 'react';
import { useAuth } from '../../contexts/auth.context';
import { useRouter, usePathname } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@radix-ui/react-avatar';
import { Skeleton } from '../../components/ui/skeleton';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { HamburgerMenuIcon, CircleIcon, CheckCircledIcon } from "@radix-ui/react-icons"

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

  const menuItems = [
    { label: 'Dashboard Home', href: '/dashboard' },
    { label: 'Crops', href: '/dashboard/crops' },
    { label: 'Producers', href: '/dashboard/producers' },
    { label: 'Farm', href: '/dashboard/farm' },
  ];

  return (
    <section className="min-h-screen min-w-screen flex flex-col bg-slate-200">
      <div className='flex h-[80px] items-center justify-between bg-slate-800 px-5'>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" className='w-[60px]'>
              <HamburgerMenuIcon className="h-5 w-5 text-gray-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-4">
            <div className="flex flex-col space-y-2">
              {menuItems.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  className={`hover:underline ${pathname === item.href ? 'font-bold' : ''}`}
                >
                  {pathname === item.href ?
                   <span className='flex items-center gap-2'><CheckCircledIcon className="h-5 w-5 text-slate-900"/>{item.label}</span> 
                   : 
                   <span className='flex items-center gap-2'><CircleIcon className="h-5 w-5 text-slate-900"/>{item.label}</span> 
                  }
                </a>
              ))}
            </div>
          </PopoverContent>
        </Popover>
        {/* User Avatar */}
        <div className='relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full cursor-pointer'>
          <Popover>
            <PopoverTrigger asChild>
              <div>
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
      </div>
      <main className="flex-1 p-4 bg-slate-200 container">
        {/* Breadcrumb */}
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
