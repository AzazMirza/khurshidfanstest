// app/users/page.tsx
import { fetchFilteredUsers } from '@/app/lib/data';
import { UsersTable } from '@/app/ui/users/table';

export const metadata = {
  title: 'Users | AIRION Admin',
};

export default async function UsersPage({
  searchParams,
}: {
  searchParams?: { query?: string; page?: string };
}) {
  const query = searchParams?.query || '';
  const currentPage = Number(searchParams?.page) || 1;

  // Fetch full dataset (up to 50–100 users for snappy client filtering)
  const { users } = await fetchFilteredUsers(query, currentPage, 50);

  return (
    <div className="container py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Users</h1>
        <p className="text-muted-foreground">
          Manage and review user accounts and activity.
        </p>
      </div>

      {/* ✅ Only pass users — all interactivity happens client-side */}
      <UsersTable users={users} />
    </div>
  );
}