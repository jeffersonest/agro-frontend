'use client';

import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ColumnDef,
  getCoreRowModel,
  flexRender,
  useReactTable,
  TableMeta,
} from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { Drawer, DrawerContent } from '@/components/ui/drawer';
import { Input } from '@/components/ui/input';
import { toast } from '@/components/ui/use-toast';
import fetcher from '../../../lib/api';
import { Crop } from '../../../types/crop.interface';

const fetchCrops = async (): Promise<Crop[]> => {
  return fetcher('/crops');
};

interface ColumnMeta {
  isHiddenMobile?: boolean;
}

const CropsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const { data: crops, isLoading } = useQuery({
    queryKey: ['crops'],
    queryFn: fetchCrops,
  });
  const [selectedCrop, setSelectedCrop] = useState<Crop | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const createMutation = useMutation({
    mutationFn: (newCrop: { name: string }) =>
      fetcher('/crops', {
        method: 'POST',
        body: JSON.stringify(newCrop),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crops'] });
      setIsDrawerOpen(false);
      toast({
        title: 'Success',
        description: 'Crop created successfully',
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: (updatedCrop: { id: string; name: string }) =>
      fetcher(`/crops/${updatedCrop.id}`, {
        method: 'PUT',
        body: JSON.stringify({ name: updatedCrop.name }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crops'] });
      setIsDrawerOpen(false);
      toast({
        title: 'Success',
        description: 'Crop updated successfully',
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) =>
      fetcher(`/crops/${id}`, {
        method: 'DELETE',
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crops'] });
      toast({
        title: 'Success',
        description: 'Crop deleted successfully',
      });
    },
  });

  const columns = useMemo<ColumnDef<Crop, ColumnMeta>[]>(
    () => [
      { accessorKey: 'id', header: 'ID', meta: { isHiddenMobile: true } },
      { accessorKey: 'name', header: 'Name' },
      { accessorKey: 'createdAt', header: 'Created At', meta: { isHiddenMobile: true } },
      {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => (
          <div className="flex gap-2 justify-end items-center">
            <Button onClick={() => handleEdit(row.original)}>Edit</Button>
            <Button onClick={() => handleDelete(row.original.id)}>Delete</Button>
          </div>
        ),
      },
    ],
    [],
  );

  const table = useReactTable({
    data: crops || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    meta: {
      isHiddenMobile: true,
    },
  });

  const handleEdit = (crop: Crop) => {
    setSelectedCrop(crop);
    setIsDrawerOpen(true);
  };

  const handleDelete = (id: string) => {
    deleteMutation.mutate(id);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const name = formData.get('name') as string;

    if (selectedCrop) {
      updateMutation.mutate({ id: selectedCrop.id, name });
    } else {
      createMutation.mutate({ name });
    }
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <section className='py-1'>
      <div className='flex items-center justify-end h-[60px]'>
        <Button onClick={() => setIsDrawerOpen(true)}>Create Crop</Button>
      </div>
      <table className="min-w-full bg-white px-3">
        <thead className='h-[80px] p-3'>
          {table.getHeaderGroups().map(headerGroup => (
            <tr className='p-3' key={headerGroup.id}>
              {headerGroup.headers.map(header => (
                <th className={`p-3 ${header.column.columnDef.meta?.isHiddenMobile ? 'hidden lg:table-cell' : ''}`} key={header.id}>
                  {flexRender(header.column.columnDef.header, header.getContext())}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody className='p-3'>
          {table.getRowModel().rows.map(row => (
            <tr className='p-3' key={row.id}>
              {row.getVisibleCells().map(cell => (
                <td className={`p-3 ${cell.column.columnDef.meta?.isHiddenMobile ? 'hidden lg:table-cell' : ''}`} key={cell.id}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
        <DrawerContent>
          <div className='p-10'>
            <form className='flex gap-5' onSubmit={handleSubmit}>
              <Input name="name" defaultValue={selectedCrop?.name || ''} placeholder="Crop Name" />
              <Button type="submit">{selectedCrop ? 'Update' : 'Create'}</Button>
            </form>
          </div>
        </DrawerContent>
      </Drawer>
    </section>
  );
};

export default CropsPage;
