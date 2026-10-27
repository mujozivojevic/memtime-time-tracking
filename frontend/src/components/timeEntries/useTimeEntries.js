import { useEffect, useState } from "react";
import { getTimeEntries } from "../../api.js";

const PAGE_SIZE = 10;

export function useTimeEntries(refreshKey) {
  const [page, setPage] = useState(0);
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let ignore = false;

    getTimeEntries({ limit: PAGE_SIZE, offset: page * PAGE_SIZE })
      .then((data) => {
        if (!ignore) {
          setEntries(data);
          setError(null);
        }
      })
      .catch((err) => {
        if (!ignore) setError(err.message);
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, [page, refreshKey]);

  function goToPage(nextPage) {
    setLoading(true);
    setPage(nextPage);
  }

  return {
    entries,
    page,
    loading,
    error,
    hasNextPage: entries.length === PAGE_SIZE,
    goToPage,
  };
}
