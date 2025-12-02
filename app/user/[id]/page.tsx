// app/users/[id]/page.tsx
import { fetchUserById } from '@/app/lib/data'; // You'll need to create this server function
import { formatDateToLocal } from '@/lib/utils';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { ArrowLeft } from "lucide-react";
import CuratedSidebar from "@/components/curatedsidebar";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function UserDetailsPage({ params }: PageProps) {
  const id = (await params).id;
  let user;

  try {
    user = await fetchUserById(id);
  } catch (error) {
    console.error('Failed to fetch user:', error);
    return (
      <CuratedSidebar
        main={
          <main className="flex-1 p-6 bg-gray-50">
            <div className="text-red-500">Failed to load user details.</div>
            <Link href="/users" className="mt-4 inline-block">
              <Button variant="outline">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Users
              </Button>
            </Link>
          </main>
        }
      />
    );
  }

  if (!user) {
    return (
      <CuratedSidebar
        main={
          <main className="flex-1 p-6 bg-gray-50">
            <div className="text-red-500">User not found.</div>
            <Link href="/users" className="mt-4 inline-block">
              <Button variant="outline">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Users
              </Button>
            </Link>
          </main>
        }
      />
    );
  }

  return (
    <CuratedSidebar
      main={
        <main className="flex-1 p-6 bg-gray-50">
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <SidebarTrigger />
              <h1 className="text-3xl font-bold">User: {user.name}</h1>
            </div>
            <div className="flex gap-2">
              {/* Add Edit/Delete buttons if applicable */}
              <Button variant="outline">
                <Link href="/users">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Users
                </Link>
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold">User Details</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div>
                    <h3 className="text-sm font-medium text-gray-600">User ID</h3>
                    <p className="text-gray-900">{user.id}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-600">Name</h3>
                    <p className="text-gray-900">{user.name}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-600">Email</h3>
                    <p className="text-gray-900">{user.email}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-600">Phone</h3>
                    <p className="text-gray-900">{user.phone || 'N/A'}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-600">Joined Date</h3>
                    <p className="text-gray-900">{formatDateToLocal(user.createdAt)}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-600">Last Updated</h3>
                    <p className="text-gray-900">{formatDateToLocal(user.updatedAt)}</p>
                  </div>
                </div>

                <h3 className="text-lg font-medium mb-4">Statistics</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium mb-2">Orders</h4>
                    <p className="text-2xl font-bold">{user._count.orders}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium mb-2">Cart Items</h4>
                    <p className="text-2xl font-bold">{user._count.cartItems}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              {/* Add other related information sections if available */}
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h2 className="text-xl font-semibold mb-4">Actions</h2>
                <div className="space-y-2">
                  {/* Example action buttons */}
                  <Button variant="outline" className="w-full">
                    Edit User
                  </Button>
                  <Button variant="destructive" className="w-full">
                    Delete User
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </main>
      }
    />
  );
}