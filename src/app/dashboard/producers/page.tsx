'use client';

import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ColumnDef,
  getCoreRowModel,
  flexRender,
  useReactTable,
} from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { Drawer, DrawerContent } from '@/components/ui/drawer';
import { Input } from '@/components/ui/input';
import { toast } from '@/components/ui/use-toast';
import fetcher from '../../../lib/api';
import { Producer } from '../../../types/producer.interface';

const fetchProducers = async (): Promise<Producer[]> => {
  return fetcher('/producer');
};

interface ColumnMeta {
  isHiddenMobile?: boolean;
}

const ProducersPage: React.FC = () => {
  const queryClient = useQueryClient();
  const { data: producers, isLoading } = useQuery({
    queryKey: ['producers'],
    queryFn: fetchProducers,
  });
  const [selectedProducer, setSelectedProducer] = useState<Producer | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const createMutation = useMutation({
    mutationFn: (newProducer: Partial<Producer>) =>
      fetcher('/producer', {
        method: 'POST',
        body: JSON.stringify(newProducer),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['producers'] });
      setIsDrawerOpen(false);
      toast({
        title: 'Success',
        description: 'Producer created successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'An error occurred while creating the producer',
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: (updatedProducer: Producer) =>
      fetcher(`/producer/${updatedProducer.id}`, {
        method: 'PUT',
        body: JSON.stringify(updatedProducer),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['producers'] });
      setIsDrawerOpen(false);
      toast({
        title: 'Success',
        description: 'Producer updated successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'An error occurred while updating the producer',
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) =>
      fetcher(`/producer/${id}`, {
        method: 'DELETE',
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['producers'] });
      toast({
        title: 'Success',
        description: 'Producer deleted successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'An error occurred while deleting the producer',
      });
    },
  });

  const columns = useMemo<ColumnDef<Producer, ColumnMeta>[]>(
    () => [
      { accessorKey: 'identification', header: 'Identification' },
      { accessorKey: 'producerName', header: 'Producer Name' },
      { accessorKey: 'farmName', header: 'Farm Name', meta: { isHiddenMobile: true } },
      { accessorKey: 'city', header: 'City', meta: { isHiddenMobile: true } },
      { accessorKey: 'state', header: 'State' },
      { accessorKey: 'farmSize', header: 'Farm Size', meta: { isHiddenMobile: true } },
      { accessorKey: 'usableArea', header: 'Usable Area', meta: { isHiddenMobile: true } },
      { accessorKey: 'vegetationArea', header: 'Vegetation Area', meta: { isHiddenMobile: true } },
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
    data: producers || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    meta: {
      isHiddenMobile: true,
    },
  });

  const handleEdit = (producer: Producer) => {
    setSelectedProducer(producer);
    setIsDrawerOpen(true);
  };

  const handleDelete = (id: string) => {
    deleteMutation.mutate(id);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const updatedProducer = {
      ...selectedProducer,
      identification: formData.get('identification') as string,
      producerName: formData.get('producerName') as string,
      farmName: formData.get('farmName') as string,
      city: formData.get('city') as string,
      state: formData.get('state') as string,
      farmSize: parseInt(formData.get('farmSize') as string),
      usableArea: parseInt(formData.get('usableArea') as string),
      vegetationArea: parseInt(formData.get('vegetationArea') as string),
    };

    if (selectedProducer) {
      updateMutation.mutate(updatedProducer as Producer);
    } else {
      createMutation.mutate(updatedProducer);
    }
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <>
      <div className='flex items-center justify-end h-[60px]'>
        <Button onClick={() => { setIsDrawerOpen(true); setSelectedProducer(null); }}>Create Producer</Button>
      </div>
      <section className='py-1 overflow-y-scroll'>
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
          <DrawerContent className='min-h-[600px] sm:min-h-[400px] overflow-y-hidden'>
            <div className='p-10'>
              <form className='grid grid-cols-1 gap-5 sm:grid-cols-2' onSubmit={handleSubmit}>
                <Input name="identification" defaultValue={selectedProducer?.identification || ''} placeholder="Identification" />
                <Input name="producerName" defaultValue={selectedProducer?.producerName || ''} placeholder="Producer Name" />
                <Input name="farmName" defaultValue={selectedProducer?.farmName || ''} placeholder="Farm Name" />
                <Input name="city" defaultValue={selectedProducer?.city || ''} placeholder="City" />
                <Input name="state" defaultValue={selectedProducer?.state || ''} placeholder="State" />
                <Input name="farmSize" type="number" defaultValue={selectedProducer?.farmSize || ''} placeholder="Farm Size" />
                <Input name="usableArea" type="number" defaultValue={selectedProducer?.usableArea || ''} placeholder="Usable Area" />
                <Input name="vegetationArea" type="number" defaultValue={selectedProducer?.vegetationArea || ''} placeholder="Vegetation Area" />
                <Button type="submit" className='col-span-1 sm:col-span-2'>{selectedProducer ? 'Update' : 'Create'}</Button>
              </form>
            </div>
          </DrawerContent>
        </Drawer>
      </section>
    </>
  );
};

export default ProducersPage;
