'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

function buildHref(pathname: string, params: URLSearchParams, page: number) {
  const next = new URLSearchParams(params);
  next.set('page', String(page));
  return `${pathname}?${next.toString()}`;
}

function pageNumbers(current: number, total: number): (number | '…')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

  const pages: (number | '…')[] = [1];

  if (current > 3) pages.push('…');

  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);
  for (let i = start; i <= end; i++) pages.push(i);

  if (current < total - 2) pages.push('…');

  pages.push(total);
  return pages;
}

type Props = {
  page: number;
  totalPages: number;
};

export default function Pagination({ page, totalPages }: Props) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  if (totalPages <= 1) return null;

  const pages = pageNumbers(page, totalPages);

  return (
    <nav className="flex items-center justify-center gap-1 py-4" aria-label="Pagination">
      <Link
        href={buildHref(pathname, searchParams, page - 1)}
        aria-disabled={page <= 1}
        className={cn(
          'flex h-8 w-8 items-center justify-center rounded border border-border text-sm transition-colors',
          page <= 1
            ? 'pointer-events-none text-muted-foreground opacity-40'
            : 'hover:bg-accent hover:text-accent-foreground'
        )}
      >
        <ChevronLeft size={14} />
      </Link>

      {pages.map((p, i) =>
        p === '…' ? (
          <span key={`ellipsis-${i}`} className="flex h-8 w-8 items-center justify-center text-sm text-muted-foreground">
            …
          </span>
        ) : (
          <Link
            key={p}
            href={buildHref(pathname, searchParams, p)}
            className={cn(
              'flex h-8 w-8 items-center justify-center rounded border text-sm transition-colors',
              p === page
                ? 'border-primary bg-primary text-primary-foreground'
                : 'border-border hover:bg-accent hover:text-accent-foreground'
            )}
            aria-current={p === page ? 'page' : undefined}
          >
            {p}
          </Link>
        )
      )}

      <Link
        href={buildHref(pathname, searchParams, page + 1)}
        aria-disabled={page >= totalPages}
        className={cn(
          'flex h-8 w-8 items-center justify-center rounded border border-border text-sm transition-colors',
          page >= totalPages
            ? 'pointer-events-none text-muted-foreground opacity-40'
            : 'hover:bg-accent hover:text-accent-foreground'
        )}
      >
        <ChevronRight size={14} />
      </Link>
    </nav>
  );
}
