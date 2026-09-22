import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Page } from "@/shared/pages/Page/Page";
import { Button } from "@/shared/ui/button";
import { RefreshCw, Search, Filter, Plus } from "lucide-react";
import { toast } from "@/shared/ui/toast";
import { WordOfferTable } from "./items/WordOfferTable";
import { WordOfferDetailModal } from "./items/WordOfferDetailModal";
import { wordOfferApi } from "./api/wordOfferApi";
import type { WordOfferRecord, WordOfferFilters } from "./types/wordOffer.types";

export const WordOfferPage: React.FC = () => {
  const [offers, setOffers] = useState<WordOfferRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Filters
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");

  // Modern Modal State
  const [selectedOffer, setSelectedOffer] = useState<WordOfferRecord | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  // Fetch offers
  const fetchOffers = useCallback(
    async (isManualRefresh = false) => {
      try {
        if (isManualRefresh) {
          setIsRefreshing(true);
        } else {
          setIsLoading(true);
        }

        const data = await wordOfferApi.getOffers();
        setOffers(data);
      } catch (err: any) {
        toast.error(`Failed to load Word Offers: ${err?.message || err}`);
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    []
  );

  useEffect(() => {
    fetchOffers();
  }, [fetchOffers]);

  // Handle export docx
  const handleExportDocx = async (offer: WordOfferRecord) => {
    try {
      setDownloadingId(offer.id);
      toast.info(`Generating Word document for ${offer.offerNumber}...`);
      await wordOfferApi.exportOfferDocx(offer);
      toast.success("Word offer document generated and downloaded!");
    } catch (err: any) {
      toast.error(`Export failed: ${err?.message || err}`);
    } finally {
      setDownloadingId(null);
    }
  };

  // Extract unique templates/categories for filter dropdown
  const templates = useMemo(() => {
    const set = new Set<string>();
    offers.forEach((o) => {
      if (o.templateName) set.add(o.templateName);
    });
    return Array.from(set);
  }, [offers]);

  // Filtered offers based on client-side controls
  const filteredOffers = useMemo(() => {
    return offers.filter((o) => {
      if (
        selectedStatus !== "ALL" &&
        o.status?.toLowerCase() !== selectedStatus.toLowerCase()
      ) {
        return false;
      }
      if (selectedCategory !== "ALL" && o.templateName !== selectedCategory) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = o.title?.toLowerCase().includes(q);
        const matchNum = o.offerNumber?.toLowerCase().includes(q);
        const matchClient = o.clientName?.toLowerCase().includes(q);
        const matchProj = o.project?.toLowerCase().includes(q);
        const matchTpl = o.templateName?.toLowerCase().includes(q);
        if (!matchTitle && !matchNum && !matchClient && !matchProj && !matchTpl) {
          return false;
        }
      }
      return true;
    });
  }, [offers, selectedStatus, selectedCategory, searchQuery]);


  return (
    <Page
      title="Word Offer"
      subtitle="View and manage commercial word quotations."
      breadcrumbs={[
        { label: "Home", path: "/master-word" },
        { label: "Word Offer", path: "/word-offer" },
      ]}
      actions={
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchOffers(true)}
            disabled={isRefreshing || isLoading}
            title="Refresh word offers"
            className="gap-1.5 text-xs h-9"
          >
            <RefreshCw
              size={14}
              className={isRefreshing ? "animate-spin text-blue-600" : ""}
            />
            <span className="hidden sm:inline">Refresh</span>
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={() => {
              if (offers.length > 0) {
                setSelectedOffer(offers[0]);
              }
            }}
            className="gap-2 text-xs h-9"
          >
            <Plus size={16} />
            Update Document
          </Button>
        </div>
      }
    >
      <div className="flex flex-col w-full h-full min-h-0 space-y-4">
        {/* Filter & Search Bar - styled identically to Master Word */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs">
          <div className="flex items-center gap-2 flex-1 min-w-[240px] max-w-md relative">
            <Search
              size={16}
              className="absolute left-3 text-slate-400 pointer-events-none"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search quotations by ref, title, client, or project..."
              className="w-full pl-9 pr-4 py-1.5 text-xs rounded-lg bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
            />
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Template/Category Filter */}
            <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
              <Filter size={13} />
              <span>Template:</span>
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-2.5 py-1.5 text-xs rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500/30"
            >
              <option value="ALL">All Templates</option>
              {templates.map((tpl) => (
                <option key={tpl} value={tpl}>
                  {tpl}
                </option>
              ))}
            </select>

            {/* Status Filter */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-2.5 py-1.5 text-xs rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500/30"
            >
              <option value="ALL">All Statuses</option>
              <option value="Draft">Draft</option>
              <option value="Under Review">Under Review</option>
              <option value="Sent">Sent</option>
              <option value="Accepted">Accepted</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>
        </div>

        {/* Main Content Area: WordOfferTable */}
        <div className="flex-1 w-full min-h-0 overflow-y-auto">
          <WordOfferTable
            data={filteredOffers}
            isLoading={isLoading}
            onViewOffer={(offer) => {
              setSelectedOffer(offer);
            }}
            onDownload={handleExportDocx}
            downloadingId={downloadingId}
          />
        </div>
      </div>

      {/* Modern WordOfferDetailModal */}
      {selectedOffer && (
        <WordOfferDetailModal
          offer={selectedOffer}
          onClose={() => setSelectedOffer(null)}
          onExportDocx={handleExportDocx}
        />
      )}
    </Page>
  );
};

export default WordOfferPage;
