export interface DashboardMetrics {
  totalFarms: number;
  totalHectares: number;
}

export interface FarmsByStateItem {
  state: string;
  farmsCount: number;
}

export interface CropsDistributionItem {
  cropId: string;
  cropName: string;
  plantingsCount: number;
}

export interface LandUseMetrics {
  totalArableAreaHectares: number;
  totalVegetationAreaHectares: number;
  totalOtherAreaHectares: number;
}

export interface DashboardReadPort {
  getMetrics(): Promise<DashboardMetrics>;
  getFarmsByState(): Promise<FarmsByStateItem[]>;
  getCropsDistribution(): Promise<CropsDistributionItem[]>;
  getLandUse(): Promise<LandUseMetrics>;
}
