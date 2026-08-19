import { type FC, useState, useEffect, useRef } from "react";
import { Search, X } from "lucide-react";
import type { PageSearchConfig } from "../types/page.types";
import { pageStyles } from "../styles/page.styles";

interface PageSearchInputProps {
  search: PageSearchConfig;
}

export const PageSearchInput: FC<PageSearchInputProps> = ({ search }) => {
  const [localSearch, setLocalSearch] = useState(search.value || "");
  const onSearchRef = useRef(search.onSearch);

  useEffect(() => {
    onSearchRef.current = search.onSearch;
  }, [search.onSearch]);

  useEffect(() => {
    if (search.value !== undefined) {
      setLocalSearch(search.value);
    }
  }, [search.value]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (onSearchRef.current) {
        onSearchRef.current(localSearch);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [localSearch]);

  const handleClear = () => {
    setLocalSearch("");
    if (search.onSearch) {
      search.onSearch("");
    }
  };

  return (
    <div className={pageStyles.searchInputWrapper}>
      <Search className={pageStyles.searchIcon} />
      <input
        type="text"
        value={localSearch}
        placeholder={search.placeholder || "Search..."}
        className={pageStyles.searchInput}
        onChange={(e) => setLocalSearch(e.target.value)}
      />
      {localSearch && (
        <button
          type="button"
          onClick={handleClear}
          className={pageStyles.searchClearBtn}
          title="Clear search"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
};

