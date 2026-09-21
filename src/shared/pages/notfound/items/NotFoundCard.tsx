import type { FC } from "react";
import { Link } from "react-router-dom";
import { MoveLeft, Home } from "lucide-react";
import { Button } from "@/shared/ui/button/Button";
import { notFoundStyles } from "../styles/notfound.styles";

export const NotFoundCard: FC = () => {
  return (
    <div className={notFoundStyles.contentWrapper}>
      <div className={notFoundStyles.typographyContainer}>
        <h1 className={notFoundStyles.bigNumber}>404</h1>

        <div className={notFoundStyles.cardPositioning}>
          <div className={notFoundStyles.card}>
            <div className={notFoundStyles.iconBadge}>
              <Home size={40} strokeWidth={1.5} />
            </div>

            <h2 className={notFoundStyles.cardTitle}>Lost in Space?</h2>
            <p className={notFoundStyles.cardSubtitle}>
              Error 404: Page Not Found
            </p>
          </div>
        </div>
      </div>

      <div className={notFoundStyles.descriptionContainer}>
        <p className={notFoundStyles.descriptionText}>
          It seems you've ventured into uncharted territory. Don’t worry, even
          the best explorers get lost sometimes.
        </p>

        <div className={notFoundStyles.actionsContainer}>
          <Button
            variant="outline"
            onClick={() => window.history.back()}
            className={notFoundStyles.backButton}
          >
            <MoveLeft size={20} />
            Go Back
          </Button>

          <Link to="/">
            <Button
              variant="primary"
              className={notFoundStyles.dashboardButton}
            >
              <Home size={20} />
              Return to Home
            </Button>
          </Link>
        </div>
      </div>

      <p className={notFoundStyles.supportText}>
        If you believe this is an error,{" "}
        <a href="#" className={notFoundStyles.supportLink}>
          contact support
        </a>
        .
      </p>
    </div>
  );
};
