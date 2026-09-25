const Pagination = ({ page, setPage, pageSize, total }) => {
  if (!total) return null;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const btn =
    "w-7 h-7 border border-line rounded text-sm disabled:opacity-40 hover:bg-canvas";
  return (
    <div className="flex items-center justify-between flex-wrap gap-2 px-5 py-3 border-t border-line text-xs text-subtle">
      <span>
        Rows per page: <b className="text-ink">{pageSize}</b>
      </span>
      <span>
        Showing {(page - 1) * pageSize + 1} to{" "}
        {Math.min(page * pageSize, total)} of {total}
      </span>
      <div className="flex items-center gap-2">
        <button
          className={btn}
          disabled={page <= 1}
          onClick={() => setPage((p) => p - 1)}
        >
          ‹
        </button>
        <span className="text-ink font-semibold">{page}</span>
        <button
          className={btn}
          disabled={page >= totalPages}
          onClick={() => setPage((p) => p + 1)}
        >
          ›
        </button>
      </div>
    </div>
  );
};

export default Pagination;
