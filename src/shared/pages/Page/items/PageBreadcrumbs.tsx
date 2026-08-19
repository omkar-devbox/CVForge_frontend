import { type FC, useMemo } from "react";
import { ChevronRight, Home } from "lucide-react";
import { Link } from "react-router-dom";
import type { Breadcrumb } from "../types/page.types";
import { pageStyles } from "../styles/page.styles";

interface PageBreadcrumbsProps {
  breadcrumbs: Breadcrumb[];
}

export const PageBreadcrumbs: FC<PageBreadcrumbsProps> = ({ breadcrumbs }) => {
  const renderedBreadcrumbs = useMemo(
    () =>
      breadcrumbs.map((bc, index) => {
        const isLast = index === breadcrumbs.length - 1;
        return (
          <div key={`${bc.label}-${index}`} className={pageStyles.breadcrumbItem}>
            <ChevronRight className={pageStyles.separator} />
            {bc.path ? (
              <Link
                to={bc.path}
                className={isLast ? pageStyles.breadcrumbActive : pageStyles.breadcrumbLink}
              >
                {bc.label}
              </Link>
            ) : bc.onClick ? (
              <button
                onClick={bc.onClick}
                className={`${isLast ? pageStyles.breadcrumbActive : pageStyles.breadcrumbLink} focus:outline-hidden`}
              >
                {bc.label}
              </button>
            ) : (
              <span className={isLast ? pageStyles.breadcrumbActive : pageStyles.breadcrumbLink}>
                {bc.label}
              </span>
            )}
          </div>
        );
      }),
    [breadcrumbs],
  );

  if (breadcrumbs.length === 0) return null;

  return (
    <nav className={pageStyles.nav} aria-label="Breadcrumb navigation">
      <Link to="/" className={pageStyles.homeIcon} title="Home">
        <Home className="w-3.5 h-3.5" />
      </Link>
      {renderedBreadcrumbs}
    </nav>
  );
};

