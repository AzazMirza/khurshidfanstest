// // app/users/page.tsx
// import { Suspense } from 'react';
// import { fetchFilteredUsers, fetchUsersPages } from '@/app/lib/data'; // You'll need to create these server functions
// import { UsersSkeleton } from '@/components/skeletons'; // You'll need to create this
// import Search from '@/components/search'; // Your existing Search component
// import Pagination from '@/components/pagination'; // Your existing Pagination component
// import { lusitana } from '@/app/ui/fonts'; // Adjust import path if needed
// // import { UsersTable } from '@/app/user/table'; // Your new Table component
// import CuratedSidebar from "@/components/curatedsidebar";
// import { UsersTable } from '@/app/ui/users/table'; // ← new table

// interface PageProps {
//   searchParams?: Promise<{
//     query?: string;
//     page?: string;
//   }>;
// }

// export default async function Page(props: PageProps) {
//   const searchParams = await props.searchParams;
//   const query = searchParams?.query || '';
//   const currentPage = Number(searchParams?.page) || 1;

//   // Fetch data on the server using the query and page from the URL
//   const totalPages = await fetchUsersPages(query); // Fetch total pages based on search

//   return (
//     <CuratedSidebar
//       main={
//         <main className="flex-1 p-6 bg-gray-50">
//           <div className="w-full">
//             <div className="flex w-full items-center justify-between">
//               <h1 className={`${lusitana.className} text-2xl`}>Users</h1>
//             </div>
//             <div className="mt-4 flex items-center justify-between gap-2 md:mt-8">
//               <Search placeholder="Search users (e.g. name, email...)" />
//               {/* <CreateUser /> Add a button for creating users if needed */}
//             </div>
//             <Suspense key={query + currentPage} fallback={<UsersSkeleton />}>
//               <UsersTable query={query} currentPage={currentPage} />
//             </Suspense>
//             <div className="mt-5 flex w-full justify-center">
//               <Pagination totalPages={totalPages} />
//             </div>
//           </div>
//         </main>
//       }
//     />
//   );
// }

// app/users/page.tsx
import { Suspense } from 'react';
import { UsersSkeleton } from '@/components/skeletons';
import { UsersTable } from '@/app/ui/users/table';
import { fetchFilteredUsers } from '@/app/lib/data';

export default async function UsersPage({
  searchParams,
}: {
  searchParams?: {
    query?: string;
    page?: string;
  };
}) {
  const query = searchParams?.query || '';
  const currentPage = Number(searchParams?.page) || 1;

  // Fetch data on the server
  const { users, totalPages } = await fetchFilteredUsers(query, currentPage);

  return (
    <div className="space-y-6">

        <Suspense key={query + currentPage} fallback={<UsersSkeleton />}>
        <UsersTable users={users} totalPages={totalPages} />
      </Suspense>
    </div>
  );
}