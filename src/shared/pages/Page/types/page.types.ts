import type { ReactNode } from "react";

export interface Breadcrumb {
  label: string;
  path?: string;
  onClick?: () => void;
}

export interface PageSearchConfig {
  placeholder?: string;
  value?: string;
  onSearch: (value: string) => void;
}

export interface PageProps {
  title: string;
  subtitle?: string;
  breadcrumbs?: Breadcrumb[];
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
  containerClassName?: string;
  isLoading?: boolean;
  search?: PageSearchConfig;
}
