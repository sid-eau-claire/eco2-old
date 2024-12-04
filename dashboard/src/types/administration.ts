export type Setting = {
  id: number;
  description: string;
  value: number;
  level?: number;
  name: string;
}

export type CommissionDistribution = {
  id: number;
  isActive: boolean;
  generalSettings: Setting[];
  rankOverrides: { id: number; override: number }[];
  generationOverrides: Setting[];
  largeCaseSettings: Setting[];
}

export type FormValues = {
  isActive: boolean;
  generalSettings: Setting[];
  rankOverrides: { id: number; override: number }[];
  generationOverrides: Setting[];
  largeCaseSettings: Setting[];
}
