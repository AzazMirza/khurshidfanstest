// app/ui/products/columns.tsx
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, Star, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import Image from "next/image";

export interface Product {
  id: number;
  name: string;
  price: number;
  category: string;
  stock: number;
  rating: number;
  image: string;
  sku: string;
}

export const columns: ColumnDef<Product>[] = [
  {
    accessorKey: "image",
    header: "",
    cell: ({ row }) => (
      <div className="relative w-12 h-12 rounded-md overflow-hidden">
        <img
          src={`${process.env.NEXT_PUBLIC_IMG}/${ row.getValue("image")}`}
          alt={row.original.name}
          // fill
          className="object-cover"
        />
      </div>
    ),
  },
  {
    accessorKey: "name",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
        Product
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => (
      <div className="font-medium">{row.getValue("name")}</div>
    ),
  },
  {
    accessorKey: "category",
    header: "Category",
    cell: ({ row }) => (
      <Badge variant="secondary" className="text-xs">
        {row.getValue("category")}
      </Badge>
    ),
  },
  {
    accessorKey: "price",
    header: "Price",
    cell: ({ row }) => {
      const price = parseFloat(row.getValue("price"));
      return <div className="font-medium">${price.toFixed(2)}</div>;
    },
  },
  {
    accessorKey: "stock",
    header: "Stock",
    cell: ({ row }) => {
      const stock = parseInt(row.getValue("stock"));
      return (
        <Badge
          variant={stock < 5 ? "destructive" : "default"}
          className="text-xs">
          {stock} left
        </Badge>
      );
    },
  },
  {
    accessorKey: "rating",
    header: "Rating",
    cell: ({ row }) => {
      const rating = parseFloat(row.getValue("rating"));
      return (
        <div className="flex items-center">
          <Star className="w-4 h-4 text-yellow-400 fill-current mr-1" />
          <span>{rating.toFixed(1)}</span>
        </div>
      );
    },
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => (
      <div className="flex gap-2">
        {/* <Button 
          variant="outline" 
          size="sm"
          onClick={() => console.log("Add to cart", row.original.id)}
        >
          <ShoppingCart className="w-3 h-3 mr-1" />
          Add
        </Button> */}
        <Button asChild size="sm">
          <Link href={`/products/${row.original.id}`}>View</Link>
        </Button>
      </div>
    ),
  },
];
