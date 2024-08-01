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

const handleValidationError = async (error: any) => {
  if (error.message === 'Validation Error') {
    if (error.errors && error.errors.length > 0) {
      error.errors.forEach((err: any) => {
        //@ts-ignore
        Object.values(err.constraints).forEach((constraint: string) => {
          toast({
            title: 'Validation Error',
            description: `${err.property}: ${constraint}`,
          });
        });
      });
    }
  } else {
    toast({
      title: 'Error',
      description: error.message || 'An error occurred while processing your request',
    });
  }
};

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
    onError: handleValidationError,
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
    onError: handleValidationError,
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
      identification: (formData.get('identification') as string).replace(/\D/g, '').slice(0, 14),
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.name === 'identification') {
      e.target.value = e.target.value.replace(/\D/g, '').slice(0, 14);
    }
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <>
      <div className="flex items-center justify-end h-[60px]">
        <Button onClick={() => { setIsDrawerOpen(true); setSelectedProducer(null); }}>Create Producer</Button>
      </div>
      <div className="overflow-x-auto">
        <section className="py-1">
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
        </section>
      </div>

      <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
        <DrawerContent>
          <div className="p-10">
            <form className="grid grid-cols-1 gap-5 sm:grid-cols-2" onSubmit={handleSubmit}>
              <Input name="identification" defaultValue={selectedProducer?.identification || ''} placeholder="Identification" onChange={handleInputChange} />
              <Input name="producerName" defaultValue={selectedProducer?.producerName || ''} placeholder="Producer Name" />
              <Input name="farmName" defaultValue={selectedProducer?.farmName || ''} placeholder="Farm Name" />
              <Input name="city" defaultValue={selectedProducer?.city || ''} placeholder="City" />
              <Input name="state" defaultValue={selectedProducer?.state || ''} placeholder="State" />
              <Input name="farmSize" type="number" defaultValue={selectedProducer?.farmSize || ''} placeholder="Farm Size" />
              <Input name="usableArea" type="number" defaultValue={selectedProducer?.usableArea || ''} placeholder="Usable Area" />
              <Input name="vegetationArea" type="number" defaultValue={selectedProducer?.vegetationArea || ''} placeholder="Vegetation Area" />
              <Button type="submit" className="col-span-1 sm:col-span-2">{selectedProducer ? 'Update' : 'Create'}</Button>
            </form>
          </div>
        </DrawerContent>
      </Drawer>
    </>
  );
};

export default ProducersPage;
