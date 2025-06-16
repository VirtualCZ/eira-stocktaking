import { useState } from 'react';

export function Pagination({ currentPage, totalPages, onPageChange }) {
  const [page, setPage] = useState(currentPage);

  const handlePageChange = (newPage) => {
    setPage(newPage);
    onPageChange(newPage);
  };

  const renderPageNumbers = () => {
    const pages = [];
    const visibleRange = 5; // how many center pages to try to show (excluding 1 and totalPages)

    // Always show first page
    pages.push(1);

    const start = Math.max(2, page - 1);
    const end = Math.min(totalPages - 1, page + 3);

    // Add ellipsis if gap between 1 and start
    if (start > 2) {
      pages.push('...');
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    // Add ellipsis if gap between end and last
    if (end < totalPages - 1) {
      pages.push('...');
    }

    // Always show last page if > 1
    if (totalPages > 1) {
      pages.push(totalPages);
    }

    return pages.map((pageNum, index) => {
      if (pageNum === '...') {
        return (
          <span key={index} style={{ fontSize: '16px', color: '#222', padding: '0 8px' }}>
            ...
          </span>
        );
      }

      return (
        <button
          key={index}
          onClick={() => handlePageChange(pageNum - 1)}
          style={{
            background: 'none',
            border: 'none',
            color: pageNum - 1 === page ? '#000' : '#222',
            fontWeight: pageNum - 1 === page ? '800' : '500',
            fontSize: '16px',
            cursor: 'pointer',
            padding: '0 8px',
            minWidth: '24px',
          }}
        >
          {pageNum}
        </button>
      );
    });
  };


  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      gap: '16px',
    }}>
      <button
        disabled={page === 0}
        onClick={() => handlePageChange(page - 1)}
        style={{
          padding: '8px',
          border: 'none',
          borderRadius: '16px',
          background: page === 0 ? '#535353' : '#000',
          color: '#fff',
          cursor: page === 0 ? 'not-allowed' : 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <span className="material-icons-round" style={{ fontSize: '14px' }}>arrow_back_ios_new</span>
      </button>

      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
      }}>
        {renderPageNumbers()}
      </div>

      <button
        disabled={page >= totalPages - 1}
        onClick={() => handlePageChange(page + 1)}
        style={{
          padding: '8px',
          border: 'none',
          borderRadius: '16px',
          background: page >= totalPages - 1 ? '#535353' : '#000',
          color: '#fff',
          cursor: page >= totalPages - 1 ? 'not-allowed' : 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <span className="material-icons-round" style={{ fontSize: '14px' }}>arrow_forward_ios</span>
      </button>
    </div>
  );
}