import type { ComponentType } from 'react';
import ReactPaginateImport from 'react-paginate';
import type { ReactPaginateProps } from 'react-paginate';
import css from './Pagination.module.css';

type ReactPaginateComponent = ComponentType<ReactPaginateProps>;

const ReactPaginateModule = ReactPaginateImport as ReactPaginateComponent & {
  default?: ReactPaginateComponent;
};

const ReactPaginate = ReactPaginateModule.default ?? ReactPaginateModule;

interface PaginationProps {
  totalPages: number;
  currentPage: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({
  totalPages,
  currentPage,
  onPageChange,
}: PaginationProps) {
  const handlePageClick = (event: { selected: number }) => {
    onPageChange(event.selected + 1);
  };

  return (
    <ReactPaginate
      pageCount={totalPages}
      forcePage={currentPage - 1}
      onPageChange={handlePageClick}
      containerClassName={css.pagination}
      activeClassName={css.active}
      pageRangeDisplayed={5}
      marginPagesDisplayed={1}
      breakLabel="..."
      previousLabel="‹"
      nextLabel="›"
      renderOnZeroPageCount={null}
    />
  );
}
