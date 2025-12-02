// app/ui/users/columns.tsx
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, Mail, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { formatDateToLocal } from "@/lib/utils";

export interface User {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  createdAt: string;
  updatedAt: string;
  _count: {
    orders: number;
    cartItems: number;
  };
}

export const columns: ColumnDef<User>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => (
      <Button
        variant="ghost"
        size="sm"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="h-8"
      >
        Name
        <ArrowUpDown className="ml-2 h-3 w-3" />
      </Button>
    ),
    cell: ({ row }) => (
      <div className="font-medium">{row.getValue("name")}</div>
    ),
  },
  {
    accessorKey: "email",
    header: "Email",
    cell: ({ row }) => (
      <div className="flex items-center gap-2 text-sm">
        <Mail className="h-3.5 w-3.5 text-muted-foreground" />
        <span className="truncate max-w-[160px]">{row.getValue("email")}</span>
      </div>
    ),
  },
  {
    accessorKey: "phone",
    header: "Phone",
    cell: ({ row }) => {
      const phone = row.getValue("phone") as string | null;
      return phone ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Phone className="h-3.5 w-3.5" />
          {phone}
        </div>
      ) : (
        <span className="text-muted-foreground text-sm">—</span>
      );
    },
  },
  {
    accessorKey: "_count.orders",
    header: "Orders",
    cell: ({ row }) => (
      <Badge variant="secondary" className="text-xs px-2 py-0.5">
        {row.original._count.orders}
      </Badge>
    ),
  },
  {
    accessorKey: "_count.cartItems",
    header: "Cart",
    cell: ({ row }) => (
      <Badge variant="outline" className="text-xs px-2 py-0.5">
        {row.original._count.cartItems}
      </Badge>
    ),
  },
  {
    accessorKey: "createdAt",
    header: "Joined",
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground">
        {formatDateToLocal(row.getValue("createdAt"))}
      </span>
    ),
  },
  {
    id: "actions",
    header: "",
    cell: ({ row }) => (
      <Button asChild size="sm" variant="ghost" className="h-8 w-8 p-0">
        <Link href={`/users/${row.original.id}`}>
          <span className="sr-only">View</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
        </Link>
      </Button>
    ),
  },
];