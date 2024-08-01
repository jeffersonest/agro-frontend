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
      { accessorKey: 'name', header: 'Name' },
      { accessorKey: 'createdAt', header: 'Created At', meta: { isHiddenMobile: true } },
      {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => (
          <div className="flex gap-2 justify-end items-center">
            <Button variant="outline" onClick={() => handleEdit(row.original)}>Edit</Button>
            <Button variant="destructive" color="red" onClick={() => handleDelete(row.original.id)}>Delete</Button>
          </div>
        ),
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    <section className="py-1">
      <div className="flex items-center justify-end h-[60px]">
        <Button onClick={() => { setIsDrawerOpen(true); setSelectedCrop(null); }}>Create Crop</Button>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white shadow-md rounded-lg overflow-hidden">
          <thead className="bg-gray-200">
            {table.getHeaderGroups().map(headerGroup => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  // @ts-ignore
                  <th className={`p-3 text-left ${header.column.columnDef.meta?.isHiddenMobile ? 'hidden lg:table-cell' : ''}`} key={header.id}>
                    {flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map(row => (
              <tr className="border-b last:border-none hover:bg-gray-100" key={row.id}>
                {row.getVisibleCells().map(cell => (
                  // @ts-ignore
                  <td className={`p-3 ${cell.column.columnDef.meta?.isHiddenMobile ? 'hidden lg:table-cell' : ''}`} key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
        <DrawerContent>
          <div className="p-10">
            <form className="space-y-5" onSubmit={handleSubmit}>
              <Input name="name" defaultValue={selectedCrop?.name || ''} placeholder="Crop Name" />
              <Button type="submit" className="w-full">{selectedCrop ? 'Update' : 'Create'}</Button>
            </form>
          </div>
        </DrawerContent>
      </Drawer>
    </section>
  );
};

export default CropsPage;
