import type { FC } from "react";
import { Link } from "react-router-dom";
import { ShieldAlert, Home, MoveLeft } from "lucide-react";
import { Button } from "@/shared/ui/button/Button";
import { unauthorizedStyles } from "../styles/unauthorized.styles";

export const UnauthorizedCard: FC = () => {
  return (
    <div className={unauthorizedStyles.contentWrapper}>
      <div className={unauthorizedStyles.typographyContainer}>
        <h1 className={unauthorizedStyles.bigNumber}>403</h1>

        <div className={unauthorizedStyles.cardPositioning}>
          <div className={unauthorizedStyles.card}>
            <div className={unauthorizedStyles.iconBadge}>
              <ShieldAlert size={40} strokeWidth={1.5} />
            </div>

            <h2 className={unauthorizedStyles.cardTitle}>Access Denied</h2>

            <p className={unauthorizedStyles.cardSubtitle}>
              Error 403: Forbidden
            </p>
          </div>
        </div>
      </div>

      <div className={unauthorizedStyles.descriptionContainer}>
        <p className={unauthorizedStyles.descriptionText}>
          You don't have the required permissions or roles to view this page. If
          you believe this is a mistake, please contact your administrator.
        </p>

        <div className={unauthorizedStyles.actionsContainer}>
          <Button
            variant="outline"
            onClick={() => window.history.back()}
            className={unauthorizedStyles.backButton}
          >
            <MoveLeft size={20} />
            Go Back
          </Button>

          <Link to="/">
            <Button
              variant="primary"
              className={unauthorizedStyles.dashboardButton}
            >
              <Home size={20} />
              Return to Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};
