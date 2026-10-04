import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import NannyCard from "../components/NannyCard";
import { getNannies } from "../api/nannies";
import { useAuth } from "../contexts/AuthContext";
import "../styles/NanniesPage.scss";
import type { Nanny } from "../types";

export default function NanniesPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isLoading: isAuthLoading } = useAuth();
  const [nannies, setNannies] = useState<Nanny[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isGuestModalDismissed, setIsGuestModalDismissed] = useState(false);

  useEffect(() => {
    setIsGuestModalDismissed(false);
  }, [location.key]);

  useEffect(() => {
    getNannies()
      .then(setNannies)
      .catch((err: Error) => setError(err.message))
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <>
      <div className="nannies-page">
        {isLoading ? (
          <h2 className="page-title">Loading...</h2>
        ) : error ? (
          <h2 className="page-title">
            Error 401
          </h2>
        ) : (
          <>
            <h2 className="page-title">Find your perfect nanny</h2>
            <div className="nannies-list">
              {nannies.length > 0 ? (
                nannies.map((nanny) => (
                  <NannyCard key={nanny.id} nanny={nanny} />
                ))
              ) : (
                <p>No nannies found.</p>
              )}
            </div>
          </>
        )}
      </div>

      {!isAuthLoading && !user && !isGuestModalDismissed && (
        <div
          className="nannies-modal-overlay"
          onClick={() => setIsGuestModalDismissed(true)}
        >
          <div
            className="nannies-modal-box"
            onClick={(event) => event.stopPropagation()}
          >
            <h3>Log in to continue</h3>
            <p>
              Please log in to view nanny profiles and find the right care for
              your family.
            </p>
            <div className="modal-actions">
              <button
                type="button"
                className="nannies-modal-login"
                onClick={() => navigate("/login")}
              >
                Log in
              </button>
              <button
                type="button"
                className="modal-dismiss"
                onClick={() => setIsGuestModalDismissed(true)}
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
