import * as React from "react";

export type DatePickerView = "day" | "month" | "year";
export type DatePickerMode = "single" | "multiple" | "range";

export interface DateRange {
  start?: Date;
  end?: Date;
}

export type DatePickerValue =
  | Date
  | Date[]
  | DateRange
  | undefined;

export interface DatePickerProps {
  id?: string;
  name?: string;
  label?: string;
  mode?: DatePickerMode;
  view?: DatePickerView;
  allowedViews?: DatePickerView[];
  placeholder?: string;
  clearable?: boolean;
  minDate?: Date;
  maxDate?: Date;
  minYear?: number;
  maxYear?: number;
  disabledDates?: Date[];
  isDateDisabled?: (date: Date) => boolean;
  disablePast?: boolean;
  disableFuture?: boolean;
  locale?: string;
  weekStart?: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  displayFormat?: string;
  showTodayButton?: boolean;
  showClearButton?: boolean;
  value?: DatePickerValue;
  onChange?: (value: DatePickerValue) => void;
  fullWidth?: boolean;
  className?: string;
  inputClassName?: string;
  labelClassName?: string;
  error?: string;
  required?: boolean;
  hint?: string;
  helperText?: string;
}

const parseDateValue = (val: any): DatePickerValue => {
  if (!val) return undefined;
  if (val instanceof Date) return val;
  if (typeof val === "string") {
    const parsed = new Date(val);
    return isNaN(parsed.getTime()) ? undefined : parsed;
  }
  if (Array.isArray(val)) {
    return val
      .map((item) => (item instanceof Date ? item : new Date(item)))
      .filter((d) => !isNaN(d.getTime()));
  }
  if (typeof val === "object") {
    const start = val.start
      ? val.start instanceof Date
        ? val.start
        : new Date(val.start)
      : undefined;
    const end = val.end
      ? val.end instanceof Date
        ? val.end
        : new Date(val.end)
      : undefined;
    return {
      start: start && !isNaN(start.getTime()) ? start : undefined,
      end: end && !isNaN(end.getTime()) ? end : undefined,
    };
  }
  return undefined;
};

export const DatePicker = React.forwardRef<HTMLDivElement, DatePickerProps>(
  (props, ref) => {
    const {
      id,
      name,
      label,
      mode = "single",
      view: propView = "day",
      allowedViews = ["day", "month", "year"],
      placeholder = "Select date...",
      clearable = true,
      minDate,
      maxDate,
      minYear = 1900,
      maxYear = 2100,
      disabledDates = [],
      isDateDisabled,
      disablePast = false,
      disableFuture = false,
      locale = "en-US",
      weekStart = 0, // 0 = Sunday
      displayFormat,
      showTodayButton = true,
      showClearButton = true,
      value: propValue,
      onChange,
      fullWidth = false,
      className,
      inputClassName,
      labelClassName,
      error,
      required,
      hint,
      helperText,
    } = props;

    const value = React.useMemo(() => parseDateValue(propValue), [propValue]);

    // Navigation and view states
    const [isOpen, setIsOpen] = React.useState(false);
    const [currentView, setCurrentView] = React.useState<DatePickerView>(propView);
    const [navDate, setNavDate] = React.useState(() => {
      if (value instanceof Date) return new Date(value);
      if (
        value &&
        typeof value === "object" &&
        "start" in value &&
        value.start instanceof Date
      ) {
        return new Date(value.start);
      }
      return new Date();
    });

    const [rangeHoverDate, setRangeHoverDate] = React.useState<Date | undefined>(
      undefined
    );
    const containerRef = React.useRef<HTMLDivElement>(null);

    // Sync currentView when prop changes
    React.useEffect(() => {
      setCurrentView(propView);
    }, [propView]);

    // Close on click outside
    React.useEffect(() => {
      const handleClickOutside = (e: MouseEvent) => {
        if (
          containerRef.current &&
          !containerRef.current.contains(e.target as Node)
        ) {
          setIsOpen(false);
        }
      };
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Format display string based on selection
    const displayValueStr = React.useMemo(() => {
      if (!value) return "";

      const formatDate = (d: Date) => {
        if (displayFormat) {
          let str = displayFormat;
          const pad = (n: number) => String(n).padStart(2, "0");
          str = str.replace("YYYY", String(d.getFullYear()));
          str = str.replace("MM", pad(d.getMonth() + 1));
          str = str.replace("DD", pad(d.getDate()));
          return str;
        }
        return d.toLocaleDateString(locale);
      };

      if (value instanceof Date) {
        return formatDate(value);
      }

      if (Array.isArray(value)) {
        if (value.length === 0) return "";
        return value.map((d) => formatDate(d)).join(", ");
      }

      if (typeof value === "object" && ("start" in value || "end" in value)) {
        const range = value as DateRange;
        const startStr = range.start ? formatDate(range.start) : "...";
        const endStr = range.end ? formatDate(range.end) : "...";
        return `${startStr} to ${endStr}`;
      }

      return "";
    }, [value, displayFormat, locale]);

    // Check if a date is disabled
    const checkIsDisabled = React.useCallback(
      (date: Date) => {
        const time = date.getTime();
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (disablePast && time < today.getTime()) return true;
        if (disableFuture && time > today.getTime()) return true;
        if (minDate && time < minDate.getTime()) return true;
        if (maxDate && time > maxDate.getTime()) return true;

        if (
          disabledDates.some((d) => d.toDateString() === date.toDateString())
        ) {
          return true;
        }
        if (isDateDisabled && isDateDisabled(date)) return true;

        return false;
      },
      [disablePast, disableFuture, minDate, maxDate, disabledDates, isDateDisabled]
    );

    // Grid builders
    const dayCells = React.useMemo(() => {
      const year = navDate.getFullYear();
      const month = navDate.getMonth();

      // Find start of grid
      const firstDayOfMonth = new Date(year, month, 1);
      let startOffset = firstDayOfMonth.getDay() - weekStart;
      if (startOffset < 0) startOffset += 7;

      const gridStart = new Date(year, month, 1 - startOffset);
      const cells = [];

      // 6 weeks grid = 42 cells
      for (let i = 0; i < 42; i++) {
        const date = new Date(gridStart);
        date.setDate(gridStart.getDate() + i);

        const isToday = date.toDateString() === new Date().toDateString();
        const isOutsideMonth = date.getMonth() !== month;
        const isDisabled = checkIsDisabled(date);

        // Selection calculation
        let isSelected = false;
        let isRangeStart = false;
        let isRangeEnd = false;
        let isInRange = false;

        if (value instanceof Date) {
          isSelected = date.toDateString() === value.toDateString();
        } else if (Array.isArray(value)) {
          isSelected = value.some((v) => v.toDateString() === date.toDateString());
        } else if (value && typeof value === "object" && "start" in value) {
          const range = value as DateRange;
          if (range.start) {
            isRangeStart = date.toDateString() === range.start.toDateString();
          }
          if (range.end) {
            isRangeEnd = date.toDateString() === range.end.toDateString();
          }
          if (range.start && range.end) {
            isInRange = date > range.start && date < range.end;
          } else if (range.start && rangeHoverDate) {
            isInRange =
              (date > range.start && date < rangeHoverDate) ||
              (date < range.start && date > rangeHoverDate);
          }
        }

        cells.push({
          date,
          isToday,
          isOutsideMonth,
          isDisabled,
          isSelected,
          isRangeStart,
          isRangeEnd,
          isInRange,
        });
      }

      return cells;
    }, [navDate, weekStart, value, rangeHoverDate, checkIsDisabled]);

    const monthsList = React.useMemo(() => {
      const list = [];
      const formatter = new Intl.DateTimeFormat(locale, { month: "short" });
      for (let i = 0; i < 12; i++) {
        const tempDate = new Date(2026, i, 1);
        list.push({
          value: i,
          label: formatter.format(tempDate),
        });
      }
      return list;
    }, [locale]);

    const yearsList = React.useMemo(() => {
      const pivot = navDate.getFullYear();
      const start = pivot - 4;
      const list = [];
      for (let i = 0; i < 12; i++) {
        list.push(start + i);
      }
      return list;
    }, [navDate]);

    // Handlers
    const handleCellClick = (date: Date) => {
      if (mode === "single") {
        onChange?.(date);
        setIsOpen(false);
      } else if (mode === "multiple") {
        const currentArr = Array.isArray(value) ? [...value] : [];
        const idx = currentArr.findIndex(
          (d) => d instanceof Date && d.toDateString() === date.toDateString()
        );
        if (idx > -1) {
          currentArr.splice(idx, 1);
        } else {
          currentArr.push(date);
        }
        onChange?.(currentArr);
      } else if (mode === "range") {
        const currentRange =
          value && typeof value === "object" && "start" in value
            ? ({ ...value } as DateRange)
            : {};
        if (!currentRange.start || (currentRange.start && currentRange.end)) {
          onChange?.({ start: date, end: undefined });
        } else {
          if (date < currentRange.start) {
            onChange?.({ start: date, end: currentRange.start });
          } else {
            onChange?.({ start: currentRange.start, end: date });
          }
          setIsOpen(false);
        }
      }
    };

    const handleMonthSelect = (m: number) => {
      const next = new Date(navDate);
      next.setMonth(m);
      setNavDate(next);
      if (allowedViews.includes("day")) {
        setCurrentView("day");
      } else {
        setIsOpen(false);
      }
    };

    const handleYearSelect = (y: number) => {
      const next = new Date(navDate);
      next.setFullYear(y);
      setNavDate(next);
      if (allowedViews.includes("month")) {
        setCurrentView("month");
      } else if (allowedViews.includes("day")) {
        setCurrentView("day");
      } else {
        setIsOpen(false);
      }
    };

    const handleNav = (dir: -1 | 1) => {
      const next = new Date(navDate);
      if (currentView === "day") {
        next.setMonth(navDate.getMonth() + dir);
      } else if (currentView === "month") {
        next.setFullYear(navDate.getFullYear() + dir);
      } else if (currentView === "year") {
        next.setFullYear(navDate.getFullYear() + dir * 12);
      }
      setNavDate(next);
    };

    const handleClear = (e: React.MouseEvent) => {
      e.stopPropagation();
      onChange?.(undefined);
    };

    const handleSelectToday = () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      onChange?.(today);
      setIsOpen(false);
    };

    const toggleOpen = () => {
      setIsOpen(!isOpen);
    };

    // Weekdays label row
    const weekDaysRow = React.useMemo(() => {
      const labels = [];
      const formatter = new Intl.DateTimeFormat(locale, { weekday: "narrow" });
      for (let i = 0; i < 7; i++) {
        const tempDate = new Date(2026, 5, 21 + weekStart + i); // 21 June 2026 is a Sunday
        labels.push(formatter.format(tempDate));
      }
      return labels;
    }, [weekStart, locale]);

    return (
      <div
        className={`flex flex-col relative ${fullWidth ? "w-full" : "w-64"} ${
          className || ""
        }`}
        ref={containerRef}
      >
        {label && (
          <label
            className={`text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-1.5 flex items-center select-none ${
              labelClassName || ""
            }`}
          >
            {label}
            {required && <span className="text-error ml-1">*</span>}
          </label>
        )}

        <div className="relative w-full">
          <div
            ref={ref}
            onClick={toggleOpen}
            className={`flex w-full items-center justify-between min-h-[40px] rounded-lg border bg-surface-primary px-3 py-2 text-sm transition-all duration-200 cursor-pointer select-none hover:bg-neutral-surface/50 ${
              error
                ? "border-error focus-within:border-error focus-within:ring-1 focus-within:ring-error"
                : "border-border focus-within:border-brand-primary"
            } ${inputClassName || ""}`}
          >
            <div className="flex-1 truncate">
              {displayValueStr === "" ? (
                <span className="text-text-muted select-none">{placeholder}</span>
              ) : (
                <span className="text-text font-medium">{displayValueStr}</span>
              )}
            </div>

            <div className="flex items-center gap-1.5 ml-2">
              {clearable && displayValueStr !== "" && (
                <span
                  onClick={handleClear}
                  className="text-text-muted hover:text-error cursor-pointer font-bold text-base px-1 leading-none select-none transition-colors"
                >
                  &times;
                </span>
              )}
              <span className="text-text-muted text-sm select-none opacity-60">
                📅
              </span>
            </div>
          </div>

          {/* Calendar Panel Overlay */}
          {isOpen && (
            <div
              className="absolute top-full left-0 mt-1.5 z-[9999] w-[288px] rounded-lg border border-border bg-surface-primary p-3.5 shadow-xl shadow-black/10 focus:outline-none overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Calendar Header Navigation */}
              <div className="flex items-center justify-between mb-3.5">
                <button
                  type="button"
                  onClick={() => handleNav(-1)}
                  className="p-1.5 rounded-lg hover:bg-neutral-surface text-text-muted hover:text-text transition-colors border-none bg-transparent cursor-pointer flex items-center justify-center"
                >
                  ◀
                </button>
                <div
                  onClick={() => {
                    if (currentView === "day") setCurrentView("month");
                    else if (currentView === "month") setCurrentView("year");
                  }}
                  className="px-2 py-0.5 rounded hover:bg-neutral-surface transition-colors font-semibold text-text text-sm cursor-pointer select-none"
                >
                  {currentView === "day" &&
                    navDate.toLocaleDateString(locale, {
                      month: "long",
                      year: "numeric",
                    })}
                  {currentView === "month" && navDate.getFullYear()}
                  {currentView === "year" &&
                    `${yearsList[0]} - ${yearsList[yearsList.length - 1]}`}
                </div>
                <button
                  type="button"
                  onClick={() => handleNav(1)}
                  className="p-1.5 rounded-lg hover:bg-neutral-surface text-text-muted hover:text-text transition-colors border-none bg-transparent cursor-pointer flex items-center justify-center"
                >
                  ▶
                </button>
              </div>

              {/* Day Grid view */}
              {currentView === "day" && (
                <div>
                  <div className="grid grid-cols-7 mb-1.5 text-center">
                    {weekDaysRow.map((day, idx) => (
                      <div
                        key={idx}
                        className="text-[11px] font-bold uppercase tracking-wider text-text-muted select-none"
                      >
                        {day}
                      </div>
                    ))}
                  </div>
                  <div className="grid grid-cols-7 gap-y-1 justify-items-center">
                    {dayCells.map((cell, idx) => {
                      let cellClass = "";
                      if (cell.isSelected || cell.isRangeStart || cell.isRangeEnd) {
                        cellClass = "bg-primary text-white";
                      } else if (cell.isInRange) {
                        cellClass = "bg-primary/10 text-primary";
                      } else if (cell.isToday) {
                        cellClass = "border border-primary text-primary hover:bg-primary/5";
                      } else if (cell.isOutsideMonth) {
                        cellClass = "text-text-muted/40 hover:bg-neutral-surface";
                      } else {
                        cellClass = "text-text hover:bg-neutral-surface";
                      }

                      return (
                        <button
                          key={idx}
                          type="button"
                          disabled={cell.isDisabled}
                          onClick={() => handleCellClick(cell.date)}
                          onMouseEnter={() =>
                            mode === "range" && setRangeHoverDate(cell.date)
                          }
                          onMouseLeave={() =>
                            mode === "range" && setRangeHoverDate(undefined)
                          }
                          className={`h-8 w-8 rounded-full text-xs font-semibold flex items-center justify-center transition-all cursor-pointer border-none bg-transparent select-none disabled:opacity-30 disabled:cursor-not-allowed ${cellClass}`}
                        >
                          {cell.date.getDate()}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Month Grid view */}
              {currentView === "month" && (
                <div className="grid grid-cols-3 gap-2 justify-items-center py-1">
                  {monthsList.map((m) => {
                    const isSelected = navDate.getMonth() === m.value;
                    return (
                      <button
                        key={m.value}
                        type="button"
                        onClick={() => handleMonthSelect(m.value)}
                        className={`w-full py-2.5 text-xs font-semibold rounded-lg text-center cursor-pointer border-none select-none transition-all ${
                          isSelected
                            ? "bg-primary text-white shadow-sm"
                            : "bg-transparent text-text hover:bg-neutral-surface"
                        }`}
                      >
                        {m.label}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Year Grid view */}
              {currentView === "year" && (
                <div className="grid grid-cols-3 gap-2 justify-items-center py-1">
                  {yearsList.map((y) => {
                    const isSelected = navDate.getFullYear() === y;
                    const isDisabled = y < minYear || y > maxYear;
                    return (
                      <button
                        key={y}
                        type="button"
                        disabled={isDisabled}
                        onClick={() => handleYearSelect(y)}
                        className={`w-full py-2.5 text-xs font-semibold rounded-lg text-center cursor-pointer border-none select-none transition-all disabled:opacity-30 disabled:cursor-not-allowed ${
                          isSelected
                            ? "bg-primary text-white shadow-sm"
                            : "bg-transparent text-text hover:bg-neutral-surface"
                        }`}
                      >
                        {y}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Calendar Footer Buttons */}
              {(showTodayButton || showClearButton) && (
                <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-border">
                  {showTodayButton ? (
                    <button
                      type="button"
                      onClick={handleSelectToday}
                      className="text-xs font-bold text-primary hover:opacity-85 transition-colors border-none bg-transparent cursor-pointer p-1"
                    >
                      Today
                    </button>
                  ) : (
                    <div />
                  )}
                  {showClearButton && (
                    <button
                      type="button"
                      onClick={handleClear}
                      className="text-xs font-bold text-text-muted hover:text-error transition-colors border-none bg-transparent cursor-pointer p-1"
                    >
                      Clear
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Helper/Hint/Error Message */}
        {error ? (
          <span className="text-[11px] text-error mt-1 select-none leading-tight">
            {error}
          </span>
        ) : (
          (hint || helperText) && (
            <span className="text-[11px] text-text-muted mt-1 select-none leading-tight">
              {hint || helperText}
            </span>
          )
        )}
      </div>
    );
  }
);

DatePicker.displayName = "DatePicker";
