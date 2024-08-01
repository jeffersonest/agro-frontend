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
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from '@/components/ui/use-toast';
import fetcher from '../../../lib/api';
import { Crop } from '../../../types/crop.interface';
import { Producer } from '../../../types/producer.interface';
import { ProducerCrop } from '../../../types/producer-crop.interface';

const fetchProducerCrops = async (): Promise<ProducerCrop[]> => {
  return fetcher('/producer-crops');
};

const fetchCrops = async (): Promise<Crop[]> => {
  return fetcher('/crops');
};

const fetchProducers = async (): Promise<Producer[]> => {
  return fetcher('/producer');
};

interface ColumnMeta {
  isHiddenMobile?: boolean;
}

const ProducerCropsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const { data: producerCrops, isLoading: isLoadingProducerCrops } = useQuery({
    queryKey: ['producerCrops'],
    queryFn: fetchProducerCrops,
  });
  const { data: crops, isLoading: isLoadingCrops } = useQuery({
    queryKey: ['crops'],
    queryFn: fetchCrops,
  });
  const { data: producers, isLoading: isLoadingProducers } = useQuery({
    queryKey: ['producers'],
    queryFn: fetchProducers,
  });

  const [selectedProducerCrop, setSelectedProducerCrop] = useState<ProducerCrop | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const createMutation = useMutation({
    mutationFn: (newProducerCrop: Partial<ProducerCrop>) =>
      fetcher('/producer-crops', {
        method: 'POST',
        body: JSON.stringify(newProducerCrop),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['producerCrops'] });
      setIsDrawerOpen(false);
      toast({
        title: 'Success',
        description: 'ProducerCrop created successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'An error occurred while creating the ProducerCrop',
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: (updatedProducerCrop: Partial<ProducerCrop>) =>
      fetcher(`/producer-crops/${updatedProducerCrop.id}`, {
        method: 'PUT',
        body: JSON.stringify(updatedProducerCrop),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['producerCrops'] });
      setIsDrawerOpen(false);
      toast({
        title: 'Success',
        description: 'ProducerCrop updated successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'An error occurred while updating the ProducerCrop',
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) =>
      fetcher(`/producer-crops/${id}`, {
        method: 'DELETE',
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['producerCrops'] });
      toast({
        title: 'Success',
        description: 'ProducerCrop deleted successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'An error occurred while deleting the ProducerCrop',
      });
    },
  });

  const columns = useMemo<ColumnDef<ProducerCrop, ColumnMeta>[]>(
    () => [
      { accessorKey: 'id', header: 'ID', meta: { isHiddenMobile: true } },
      { accessorKey: 'producer.producerName', header: 'Producer Name' },
      { accessorKey: 'crop.name', header: 'Crop Name' },
      { accessorKey: 'area', header: 'Area' },
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
    [],
  );

  const table = useReactTable({
    data: producerCrops || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    meta: {
      isHiddenMobile: true,
    },
  });

  const handleEdit = (producerCrop: ProducerCrop) => {
    setSelectedProducerCrop(producerCrop);
    setIsDrawerOpen(true);
  };

  const handleDelete = (id: string) => {
    deleteMutation.mutate(id);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const updatedProducerCrop = {
      producerId: formData.get('producerId') as string,
      cropId: formData.get('cropId') as string,
      area: parseInt(formData.get('area') as string),
    };

    if (selectedProducerCrop) {
      updateMutation.mutate({ ...updatedProducerCrop, id: selectedProducerCrop.id });
    } else {
      createMutation.mutate(updatedProducerCrop);
    }
  };

  if (isLoadingProducerCrops || isLoadingCrops || isLoadingProducers) return <div>Loading...</div>;

  return (
    <>
      <div className="flex items-center justify-end h-[60px]">
        <Button onClick={() => { setIsDrawerOpen(true); setSelectedProducerCrop(null); }}>Create Farm</Button>
      </div>
      <div className="overflow-x-auto">
        <section className="py-1">
          <table className="min-w-full bg-white shadow-md rounded-lg overflow-hidden">
            <thead className="bg-gray-200">
              {table.getHeaderGroups().map(headerGroup => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map(header => (
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
              <div className="col-span-1 sm:col-span-2">
                <Select name="producerId" defaultValue={selectedProducerCrop?.producer.id || ''}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a Producer" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Producers</SelectLabel>
                      {producers?.map(producer => (
                        <SelectItem key={producer.id} value={producer.id}>{producer.producerName}</SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-1 sm:col-span-2">
                <Select name="cropId" defaultValue={selectedProducerCrop?.crop.id || ''}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a Crop" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Crops</SelectLabel>
                      {crops?.map(crop => (
                        <SelectItem key={crop.id} value={crop.id}>{crop.name}</SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
              <Input name="area" type="number" defaultValue={selectedProducerCrop?.area || ''} placeholder="Area" />
              <Button type="submit" className="col-span-1 sm:col-span-2">{selectedProducerCrop ? 'Update' : 'Create'}</Button>
            </form>
          </div>
        </DrawerContent>
      </Drawer>
    </>
  );
};

export default ProducerCropsPage;
