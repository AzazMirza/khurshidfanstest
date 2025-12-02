// app/ui/products/table.tsx
"use client";

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Product, columns } from "./columns";
import { useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import Image from "next/image";
import CuratedSidebar from "@/components/curatedsidebar";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Plus } from "lucide-react";

interface ProductTableProps {
  products: Product[];
  totalPages: number;
  searchQuery: string;
}

export default function ProductTable({
  products,
  totalPages,
  searchQuery,
}: ProductTableProps) {
  const [globalFilter, setGlobalFilter] = useState(searchQuery);

  const table = useReactTable({
    data: products,
    columns,
    state: {
      globalFilter,
    },
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  });

  interface NewProductFormData {
    name: string;
    price: number;
    stock: number;
    description: string;
    sku: string;
    image: File | null; // New file object
    images: File[]; // Array of new file objects
    color: string;
    size: number;
    category: string; // We'll join/split the array for the input field
    // Nested product details
    productDetails: {
      motor: string;
      blades: string;
      speedLevels: string;
      remote: string;
      timer: string;
      oscillation: string;
      noiseLevel: string;
      dimensions: string;
      warranty: string;
      motorType: string;
      height: string;
      bladeDiameter: string;
      baseDiameter: string;
      weight: string;
      powerConsumption: string;
      airFlow: string;
    };
  }

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newProduct, setNewProduct] = useState<NewProductFormData>({
    name: "",
    price: 0,
    stock: 0,
    description: "",
    sku: "",
    image: null, // Initialize as null
    images: [], // Initialize as empty array
    color: "",
    size: 0,
    category: "",
    productDetails: {
      motor: "",
      blades: "",
      speedLevels: "",
      remote: "",
      timer: "",
      oscillation: "",
      noiseLevel: "",
      dimensions: "",
      warranty: "",
      motorType: "",
      height: "",
      bladeDiameter: "",
      baseDiameter: "",
      weight: "",
      powerConsumption: "",
      airFlow: "",
    },
  });

  interface ProductDetails {
    id: number;
    productId: number;
    motor: string;
    blades: string;
    speedLevels: string;
    remote: string; // Consider boolean if API changes
    timer: string; // Consider boolean if API changes
    oscillation: string; // Consider boolean if API changes
    noiseLevel: string;
    dimensions: string;
    warranty: string;
    motorType: string;
    height: string;
    bladeDiameter: string;
    baseDiameter: string;
    weight: string;
    powerConsumption: string;
    airFlow: string;
    createdAt: string;
    updatedAt: string;
  }

  interface ProductDetail {
    id: number;
    name: string;
    price: number;
    stock: number;
    rating: number;
    description: string;
    sku: string;
    image: string; // Primary image path
    images: string[]; // Array of image paths
    color: string;
    size: number; // Assuming 'size' refers to blade size in inches
    category: string[]; // Array of category strings
    createdAt: string;
    updatedAt: string;
    productDetails?: ProductDetails; // Optional nested details
  }

  // State for managing the main displayed image index (for the main view, not edit preview)
  const [mainImageIndex, setMainImageIndex] = useState(0);

  // State for previews in the edit dialog
  const [mainImagePreview, setMainImagePreview] = useState<string | null>(null);
  const [additionalImagePreviews, setAdditionalImagePreviews] = useState<
    string[]
  >([]);

  // State for previews in the add dialog
  const [newMainImagePreview, setNewMainImagePreview] = useState<string | null>(
    null
  );
  const [newAdditionalImagePreviews, setNewAdditionalImagePreviews] = useState<
    string[]
  >([]);

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Prepare the payload
      const payload: any = {
        ...newProduct,
        category: newProduct.category
          .split(",")
          .map((cat) => cat.trim())
          .filter((cat) => cat !== ""), // Convert string back to array
      };

      // Create FormData for file uploads
      const formData = new FormData();

      // Append non-file fields
      for (const key in payload) {
        if (key === "image" || key === "images") {
          // Handle files separately below
          continue;
        }
        if (key === "productDetails") {
          // Append nested product details as JSON string
          formData.append("productDetails", JSON.stringify(payload[key]));
        } else {
          formData.append(key, payload[key]);
        }
      }

      // Append main image file if it's a new file (File object)
      if (newProduct.image instanceof File) {
        formData.append("image", newProduct.image);
      }
      // If newProduct.image is null, it's omitted from the form data

      // Append additional image files
      for (const img of newProduct.images) {
        if (img instanceof File) {
          formData.append(`images`, img); // Use 'images' as the key for multiple files
        }
        // If it's a string path (shouldn't happen in create), ignore or handle separately if needed
      }

      const res = await fetch(`${process.env.NEXT_PUBLIC_API}/products`, {
        // Use base endpoint for creating
        method: "POST",
        // Note: Do NOT set 'Content-Type' header when using FormData
        // The browser sets it automatically with the correct boundary
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(
          errorData.message || `Failed to create product: ${res.status}`
        );
      }

      const createdProduct: ProductDetail = await res.json();

      toast.success("Product created successfully!"); // Optionally redirect or show success differently
      setIsAddDialogOpen(false);

      // Clean up any remaining object URLs for previews that are no longer needed
      if (newMainImagePreview) URL.revokeObjectURL(newMainImagePreview);
      newAdditionalImagePreviews.forEach((previewUrl) =>
        URL.revokeObjectURL(previewUrl)
      );
      setNewMainImagePreview(null);
      setNewAdditionalImagePreviews([]);

      // Optionally, you could redirect to the newly created product's page
      // router.push(`/products/${createdProduct.id}`); // Uncomment if desired
    } catch (error) {
      console.error("Create product failed:", error);
      toast.error(`Failed to create product: ${(error as Error).message}`);
    }
  };
  const handleNewInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    isNested: boolean = false,
    nestedField?: keyof NewProductFormData["productDetails"]
  ) => {
    const { name, value, type } = e.target;
    const val = type === "number" ? parseFloat(value) || 0 : value;

    if (isNested && nestedField) {
      setNewProduct((prev) => ({
        ...prev,
        productDetails: {
          ...prev.productDetails,
          [nestedField]: val,
        },
      }));
    } else {
      setNewProduct((prev) => ({
        ...prev,
        [name]: name === "category" ? value : val, // category is handled as a string input, will be split later
      }));
    }
  };

  const handleNewMainImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      setNewProduct((prev) => ({ ...prev, image: file }));
      const previewUrl = URL.createObjectURL(file);
      setNewMainImagePreview(previewUrl);
      // Revoke the object URL later when component unmounts or image changes again
      // For now, we'll just set it. Consider cleanup if needed.
    } else {
      // If user clears the input
      setNewProduct((prev) => ({ ...prev, image: null }));
      setNewMainImagePreview(null);
    }
  };

  const handleNewAdditionalImagesChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const newFilesArray = Array.from(files);
      setNewProduct((prev) => ({
        ...prev,
        images: [...prev.images, ...newFilesArray], // Append new files to existing ones (paths or files)
      }));

      // Create previews for the newly selected files
      const newPreviews = newFilesArray.map((file) =>
        URL.createObjectURL(file)
      );
      setNewAdditionalImagePreviews((prev) => [...prev, ...newPreviews]);
    }
  };

  const removeNewAdditionalImage = (index: number) => {
    setNewProduct((prev) => {
      const newImages = [...prev.images];
      const removedItem = newImages.splice(index, 1)[0];
      // If the removed item was a File, revoke its object URL
      if (removedItem instanceof File) {
        URL.revokeObjectURL(URL.createObjectURL(removedItem as any)); // Type assertion needed, but safe here
      }
      return { ...prev, images: newImages };
    });

    setNewAdditionalImagePreviews((prev) => {
      const newPreviews = [...prev];
      // Find the preview URL to revoke (this is tricky as previews are strings, not the files directly)
      // The index in previews should correspond to the index in the state array at the time of removal
      const previewToRemove = newPreviews[index];
      if (previewToRemove) {
        URL.revokeObjectURL(previewToRemove);
      }
      return newPreviews.filter((_, i) => i !== index);
    });
  };

  return (
    <div className="space-y-6">
      {/* Search and Create */}
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="flex-1 max-w-sm">
          <Input
            placeholder="Search products..."
            type="search"
            value={globalFilter ?? ""}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="w-full text-black"
          />
        </div>
        {/* Add Product Dialog Trigger - Positioned at the top */}
        <div className="mb-6">
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="w-full md:w-auto">
                <Plus className="mr-2 h-4 w-4" />
                Add Product
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add New Product</DialogTitle>
                <DialogDescription>
                  Enter the details for the new product. Click save when you're
                  done.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateProduct} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Basic Info Fields */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Basic Information</h3>
                    <div className="space-y-2">
                      <Label htmlFor="newName">Name</Label>
                      <Input
                        id="newName"
                        name="name"
                        value={newProduct.name}
                        onChange={handleNewInputChange}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="newPrice">Price (Rs.)</Label>
                      <Input
                        id="newPrice"
                        name="price"
                        type="number"
                        step="0.01"
                        value={newProduct.price}
                        onChange={handleNewInputChange}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="newStock">Stock</Label>
                      <Input
                        id="newStock"
                        name="stock"
                        type="number"
                        value={newProduct.stock}
                        onChange={handleNewInputChange}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="newSku">SKU</Label>
                      <Input
                        id="newSku"
                        name="sku"
                        value={newProduct.sku}
                        onChange={handleNewInputChange}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="newDescription">Description</Label>
                      <Textarea
                        id="newDescription"
                        name="description"
                        value={newProduct.description}
                        onChange={handleNewInputChange}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="newColor">Color</Label>
                      <Input
                        id="newColor"
                        name="color"
                        value={newProduct.color}
                        onChange={handleNewInputChange}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="newSize">Size (Blade Inches)</Label>
                      <Input
                        id="newSize"
                        name="size"
                        type="number"
                        value={newProduct.size}
                        onChange={handleNewInputChange}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="newCategory">
                        Category (comma-separated)
                      </Label>
                      <Input
                        id="newCategory"
                        name="category"
                        value={newProduct.category}
                        onChange={handleNewInputChange}
                      />
                      <p className="text-sm text-gray-500">
                        Enter categories separated by commas (e.g., "Fan,
                        Electronics, Home Appliances")
                      </p>
                    </div>

                    {/* Image Upload Fields */}
                    <div className="space-y-2">
                      <Label htmlFor="newMainImage">Main Image</Label>
                      <Input
                        id="newMainImage"
                        name="newMainImage"
                        type="file"
                        accept="image/*"
                        onChange={handleNewMainImageChange}
                      />
                      {newMainImagePreview && (
                        <div className="mt-2">
                          <p className="text-sm text-gray-500">Preview:</p>
                          <img
                            src={newMainImagePreview}
                            alt="Main image preview"
                            width={100}
                            height={100}
                            className="object-cover border rounded-md"
                          />
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="newAdditionalImages">
                        Additional Images
                      </Label>
                      <Input
                        id="newAdditionalImages"
                        name="newAdditionalImages"
                        type="file"
                        accept="image/*"
                        multiple // Allow multiple selection
                        onChange={handleNewAdditionalImagesChange}
                      />
                      <p className="text-sm text-gray-500">
                        Select multiple images to add.
                      </p>
                      {newAdditionalImagePreviews.length > 0 && (
                        <div className="mt-2">
                          <p className="text-sm text-gray-500">Previews:</p>
                          <div className="flex flex-wrap gap-2">
                            {newAdditionalImagePreviews.map(
                              (preview, index) => (
                                <div key={index} className="relative">
                                  <img
                                    src={preview}
                                    alt={`Additional image ${
                                      index + 1
                                    } preview`}
                                    width={100}
                                    height={100}
                                    className="object-cover border rounded-md"
                                  />
                                  <button
                                    type="button"
                                    onClick={() =>
                                      removeNewAdditionalImage(index)
                                    }
                                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                                    &times;
                                  </button>
                                </div>
                              )
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Technical Specs Fields */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">
                      Technical Specifications
                    </h3>
                    {/* ... (Keep existing technical spec fields as they were, adapted for 'newProduct') ... */}
                    <div className="space-y-2">
                      <Label htmlFor="newMotor">Motor</Label>
                      <Input
                        id="newMotor"
                        name="motor"
                        value={newProduct.productDetails.motor}
                        onChange={(e) => handleNewInputChange(e, true, "motor")}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="newBlades">Blades</Label>
                      <Input
                        id="newBlades"
                        name="blades"
                        value={newProduct.productDetails.blades}
                        onChange={(e) =>
                          handleNewInputChange(e, true, "blades")
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="newSpeedLevels">Speed Levels</Label>
                      <Input
                        id="newSpeedLevels"
                        name="speedLevels"
                        value={newProduct.productDetails.speedLevels}
                        onChange={(e) =>
                          handleNewInputChange(e, true, "speedLevels")
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="newRemote">Remote (Yes/No)</Label>
                      <Input
                        id="newRemote"
                        name="remote"
                        value={newProduct.productDetails.remote}
                        onChange={(e) =>
                          handleNewInputChange(e, true, "remote")
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="newTimer">
                        Timer (e.g., 24 Hour Timer)
                      </Label>
                      <Input
                        id="newTimer"
                        name="timer"
                        value={newProduct.productDetails.timer}
                        onChange={(e) => handleNewInputChange(e, true, "timer")}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="newOscillation">
                        Oscillation (Yes/No)
                      </Label>
                      <Input
                        id="newOscillation"
                        name="oscillation"
                        value={newProduct.productDetails.oscillation}
                        onChange={(e) =>
                          handleNewInputChange(e, true, "oscillation")
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="newNoiseLevel">Noise Level</Label>
                      <Input
                        id="newNoiseLevel"
                        name="noiseLevel"
                        value={newProduct.productDetails.noiseLevel}
                        onChange={(e) =>
                          handleNewInputChange(e, true, "noiseLevel")
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="newDimensions">Dimensions</Label>
                      <Input
                        id="newDimensions"
                        name="dimensions"
                        value={newProduct.productDetails.dimensions}
                        onChange={(e) =>
                          handleNewInputChange(e, true, "dimensions")
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="newWarranty">Warranty</Label>
                      <Input
                        id="newWarranty"
                        name="warranty"
                        value={newProduct.productDetails.warranty}
                        onChange={(e) =>
                          handleNewInputChange(e, true, "warranty")
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="newMotorType">
                        Motor Type (e.g., AC, DC)
                      </Label>
                      <Input
                        id="newMotorType"
                        name="motorType"
                        value={newProduct.productDetails.motorType}
                        onChange={(e) =>
                          handleNewInputChange(e, true, "motorType")
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="newHeight">Height</Label>
                      <Input
                        id="newHeight"
                        name="height"
                        value={newProduct.productDetails.height}
                        onChange={(e) =>
                          handleNewInputChange(e, true, "height")
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="newBladeDiameter">Blade Diameter</Label>
                      <Input
                        id="newBladeDiameter"
                        name="bladeDiameter"
                        value={newProduct.productDetails.bladeDiameter}
                        onChange={(e) =>
                          handleNewInputChange(e, true, "bladeDiameter")
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="newBaseDiameter">Base Diameter</Label>
                      <Input
                        id="newBaseDiameter"
                        name="baseDiameter"
                        value={newProduct.productDetails.baseDiameter}
                        onChange={(e) =>
                          handleNewInputChange(e, true, "baseDiameter")
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="newWeight">Weight</Label>
                      <Input
                        id="newWeight"
                        name="weight"
                        value={newProduct.productDetails.weight}
                        onChange={(e) =>
                          handleNewInputChange(e, true, "weight")
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="newPowerConsumption">
                        Power Consumption
                      </Label>
                      <Input
                        id="newPowerConsumption"
                        name="powerConsumption"
                        value={newProduct.productDetails.powerConsumption}
                        onChange={(e) =>
                          handleNewInputChange(e, true, "powerConsumption")
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="newAirFlow">Air Flow</Label>
                      <Input
                        id="newAirFlow"
                        name="airFlow"
                        value={newProduct.productDetails.airFlow}
                        onChange={(e) =>
                          handleNewInputChange(e, true, "airFlow")
                        }
                      />
                    </div>
                  </div>
                </div>

                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsAddDialogOpen(false);
                      // Clean up previews on cancel
                      if (newMainImagePreview)
                        URL.revokeObjectURL(newMainImagePreview);
                      newAdditionalImagePreviews.forEach((previewUrl) =>
                        URL.revokeObjectURL(previewUrl)
                      );
                      setNewMainImagePreview(null);
                      setNewAdditionalImagePreviews([]);
                    }}>
                    Cancel
                  </Button>
                  <Button type="submit">Create Product</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* DataTable */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className="hover:bg-muted/50">
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center">
                  No products found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between px-2">
        <div className="flex-1 text-sm text-muted-foreground">
          Showing{" "}
          {table.getState().pagination.pageIndex *
            table.getState().pagination.pageSize +
            1}{" "}
          to{" "}
          {Math.min(
            (table.getState().pagination.pageIndex + 1) *
              table.getState().pagination.pageSize,
            table.getFilteredRowModel().rows.length
          )}{" "}
          of {table.getFilteredRowModel().rows.length} products
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}>
            <ChevronsLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center space-x-1">
            <span className="text-sm">
              Page {table.getState().pagination.pageIndex + 1} of{" "}
              {table.getPageCount()}
            </span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}>
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
