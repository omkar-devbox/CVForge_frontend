import React, { createContext, useContext } from "react";

export interface PageContextValue {
  pageNumber: number;
  totalPages: number;
}

export const PageContext = createContext<PageContextValue>({
  pageNumber: 1,
  totalPages: 1,
});

export const usePage = () => useContext(PageContext);

export const PageProvider: React.FC<{
  pageNumber: number;
  totalPages: number;
  children: React.ReactNode;
}> = ({ pageNumber, totalPages, children }) => {
  return (
    <PageContext.Provider value={{ pageNumber, totalPages }}>
      {children}
    </PageContext.Provider>
  );
};
