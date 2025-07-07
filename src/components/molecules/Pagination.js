export function Pagination({ currentPage, totalPages, onPageChange }) {
  const renderPageNumbers = () => {
    const pages = [];

    // Always show first page
    pages.push(1);

    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 3);

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
          onClick={() => onPageChange(pageNum - 1)}
          style={{
            background: 'none',
            border: 'none',
            color: pageNum - 1 === currentPage ? '#000' : '#222',
            fontWeight: pageNum - 1 === currentPage ? '800' : '500',
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
        disabled={currentPage === 0}
        onClick={() => onPageChange(currentPage - 1)}
        style={{
          padding: '8px',
          border: 'none',
          borderRadius: '16px',
          background: currentPage === 0 ? '#535353' : '#000',
          color: '#fff',
          cursor: currentPage === 0 ? 'not-allowed' : 'pointer',
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
        disabled={currentPage >= totalPages - 1}
        onClick={() => onPageChange(currentPage + 1)}
        style={{
          padding: '8px',
          border: 'none',
          borderRadius: '16px',
          background: currentPage >= totalPages - 1 ? '#535353' : '#000',
          color: '#fff',
          cursor: currentPage >= totalPages - 1 ? 'not-allowed' : 'pointer',
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