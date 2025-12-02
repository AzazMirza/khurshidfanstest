// app/ui/users/table.tsx
import { fetchFilteredUsers } from '@/app/lib/data'; // You'll need to create this server function
import { formatDateToLocal } from '@/lib/utils'; // Adjust import path if needed
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from 'next/link';
import { Button } from '@/components/ui/button'; // Adjust import path if needed

// Define the User type based on your API response structure
interface User {
  id: number;
  name: string;
  email: string;
  phone: string | null; // Assuming phone can be null
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
  _count: {
    orders: number;
    cartItems: number;
  };
}

export async function UsersTable({
  query,
  currentPage,
}: {
  query: string;
  currentPage: number;
}) {
  // Fetch users based on the query and current page
  const { users, totalPages } = await fetchFilteredUsers(query, currentPage);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-6 mt-6">
      {users.map((user) => (
        <Card key={user.id} className="overflow-hidden hover:shadow-lg transition-shadow">
          <CardHeader className="bg-gray-50 ">
            <div className="flex items-center justify-between">
              {/* <span className="text-sm text-muted-foreground">ID: {user.id}</span> */}
            </div>
            <div className="text-sm text-muted-foreground">
              Joined on {formatDateToLocal(user.createdAt)}
            </div>
          </CardHeader>
          <CardContent className="p-4 flex justify-evenly">
              <CardTitle className="text-lg">
                {user.name}
              </CardTitle>
            <div className="mb-4">
              <h3 className="text-sm font-medium">Contact</h3>
              <p className="text-sm">{user.email}</p>
              {user.phone && <p className="text-sm text-muted-foreground">{user.phone}</p>}
            </div>
            <div className="mb-4">
              <h3 className="text-sm font-medium">Statistics</h3>
              <div className="flex space-x-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Orders</p>
                  <p className="font-medium">{user._count.orders}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Cart Items</p>
                  <p className="font-medium">{user._count.cartItems}</p>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-end">
              <Button asChild size="sm">
                <Link href={`/users/${user.id}`}>
                  View Details
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}