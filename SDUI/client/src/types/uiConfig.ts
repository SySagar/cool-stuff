export interface ComponentConfig {
  type: string;
  props: Record<string, any>;
  children?: ComponentConfig[];
}

export interface UIConfig {
  layout: ComponentConfig[];
  version: string;
  lastUpdated: string;
}