'use client';
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import Container from '../../components/base/container';
import { Pie } from 'react-chartjs-2';
import Chart from 'chart.js/auto';
import {
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
} from 'chart.js';
import fetcher from '../../lib/api';
import { FarmCountResponse, PieChartData, TotalHectaresResponse } from '../../types/statistics.inteface';


Chart.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
);

const fetchFarmCount = (): Promise<FarmCountResponse> => fetcher('/statistics/farm-count');
const fetchTotalHectares = (): Promise<TotalHectaresResponse> => fetcher('/statistics/total-hectares');
const fetchStateData = (): Promise<PieChartData> => fetcher('/statistics/pie-chart-by-state');
const fetchCropData = (): Promise<PieChartData> => fetcher('/statistics/pie-chart-by-crop');
const fetchLandUseData = (): Promise<PieChartData> => fetcher('/statistics/pie-chart-by-land-use');

const DashHomePage: React.FC = () => {
  const { data: farmCountData, isFetching: isFetchingFarmCount } = useQuery<FarmCountResponse>({
    queryKey: ['farmCount'],
    queryFn: fetchFarmCount,
  });
  const { data: totalHectaresData, isFetching: isFetchingTotalHectares } = useQuery<TotalHectaresResponse>({
    queryKey: ['totalHectares'],
    queryFn: fetchTotalHectares,
  });
  const { data: stateDataResponse, isFetching: isFetchingStateData } = useQuery<PieChartData>({
    queryKey: ['stateData'],
    queryFn: fetchStateData,
  });
  const { data: cropDataResponse, isFetching: isFetchingCropData } = useQuery<PieChartData>({
    queryKey: ['cropData'],
    queryFn: fetchCropData,
  });
  const { data: landUseDataResponse, isFetching: isFetchingLandUseData } = useQuery<PieChartData>({
    queryKey: ['landUseData'],
    queryFn: fetchLandUseData,
  });

  const stateData = stateDataResponse && {
    labels: Object.keys(stateDataResponse),
    datasets: [{
      data: Object.values(stateDataResponse),
      backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56'],
    }],
  };

  const cropData = cropDataResponse && {
    labels: Object.keys(cropDataResponse),
    datasets: [{
      data: Object.values(cropDataResponse),
      backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56'],
    }],
  };

  const landUseData = landUseDataResponse && {
    labels: ['Agricultural Land', 'Vegetation'],
    datasets: [{
      data: [
        landUseDataResponse['agricultable'] || 0,
        landUseDataResponse['vegetation'] || 0,
      ],
      backgroundColor: ['#FF6384', '#36A2EB'],
    }],
  };

  return (
    <Container>
      <div className="w-full mb-8">
        <div className="bg-white shadow rounded-lg p-4 mb-4">
          <h2 className="text-2xl font-bold mb-4">Total de Fazendas</h2>
          {isFetchingFarmCount ? <p>Loading...</p> : <p className="text-3xl">{farmCountData?.count}</p>}
        </div>
        <div className="bg-white shadow rounded-lg p-4 mb-4">
          <h2 className="text-2xl font-bold mb-4">Total de Hectares</h2>
          {isFetchingTotalHectares ? <p>Loading...</p> : <p className="text-3xl">{totalHectaresData?.total}</p>}
        </div>
        {stateData && !isFetchingStateData && (
          <div className="bg-white shadow rounded-lg p-4">
            <h2 className="text-2xl font-bold mb-4">Gráfico de Pizza por Estado</h2>
            <Pie data={stateData} />
          </div>
        )}
      </div>
      <div className="flex flex-wrap -mx-4">
        <div className="w-full lg:w-1/2 px-4 mb-8">
          {cropData && !isFetchingCropData && (
            <div className="bg-white shadow rounded-lg p-4">
              <h2 className="text-2xl font-bold mb-4">Gráfico de Pizza por Cultura</h2>
              <Pie data={cropData} />
            </div>
          )}
        </div>
        <div className="w-full lg:w-1/2 px-4 mb-8">
          {landUseData && !isFetchingLandUseData && (
            <div className="bg-white shadow rounded-lg p-4">
              <h2 className="text-2xl font-bold mb-4">Gráfico de Pizza por Uso de Solo</h2>
              <Pie data={landUseData} />
            </div>
          )}
        </div>
      </div>
    </Container>
  );
};

export default DashHomePage;
