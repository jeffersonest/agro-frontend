export interface ProducerCrop {
  id: string;
  producer: {
    id: string;
    name: string;
  };
  crop: {
    id: string;
  };
  area: number;
  createdAt: string;
  updatedAt?: string;
  producerName?: string;
  cropName?: string;
}
