// app/products/[id]/page.tsx
"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import Image from "next/image";
import CuratedSidebar from "@/components/curatedsidebar";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Plus } from "lucide-react"; // Import an icon for the add button

// Define types based on your API response structure
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

// Define the form data type, matching the API input structure
// Note: image and images fields will now hold either the existing path (string) or the new File object
interface ProductFormData {
  name: string;
  price: number;
  stock: number;
  description: string;
  sku: string;
  image: string | File | null; // Can be the existing path or the new file
  images: (string | File)[]; // Can be existing paths or new files
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

// Define the form data type for creating a new product
// Similar to ProductFormData but without id
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

export default function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: productId } = use(params);
  const router = useRouter();

  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductFormData>({
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

  // State for the Add Product Dialog
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

  useEffect(() => {
    const fetchProduct = async () => {
      if (!productId) return;

      try {
        setLoading(true);
        setError(null);
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API}/products/${productId}`
        );

        if (!res.ok) {
          throw new Error(
            `Failed to fetch product: ${res.status} ${res.statusText}`
          );
        }

        const data = await res.json();
        setProduct(data);

        // Initialize editing state with fetched data
        // Join category array for the single input field
        const categoryString = data.category ? data.category.join(", ") : "";
        setEditingProduct({
          name: data.name || "",
          price: data.price || 0,
          stock: data.stock || 0,
          description: data.description || "",
          sku: data.sku || "",
          image: data.image || null, // Keep as string path initially
          images: [...(data.images || [])], // Keep as array of string paths initially
          color: data.color || "",
          size: data.size || 0,
          category: categoryString, // Convert array to comma-separated string
          productDetails: {
            motor: data.productDetails?.motor || "",
            blades: data.productDetails?.blades || "",
            speedLevels: data.productDetails?.speedLevels || "",
            remote: data.productDetails?.remote || "",
            timer: data.productDetails?.timer || "",
            oscillation: data.productDetails?.oscillation || "",
            noiseLevel: data.productDetails?.noiseLevel || "",
            dimensions: data.productDetails?.dimensions || "",
            warranty: data.productDetails?.warranty || "",
            motorType: data.productDetails?.motorType || "",
            height: data.productDetails?.height || "",
            bladeDiameter: data.productDetails?.bladeDiameter || "",
            baseDiameter: data.productDetails?.baseDiameter || "",
            weight: data.productDetails?.weight || "",
            powerConsumption: data.productDetails?.powerConsumption || "",
            airFlow: data.productDetails?.airFlow || "",
          },
        });

        // Set initial previews based on existing image paths
        setMainImagePreview(data.image ? buildImageUrl(data.image) : null);
        setAdditionalImagePreviews(
          data.images ? data.images.map((img) => buildImageUrl(img)) : []
        );
      } catch (err) {
        console.error("Error fetching product:", err);
        setError(
          (err as Error).message ||
            "An error occurred while fetching the product."
        );
        toast.error("Failed to load product details.");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productId]);

  // Handle input changes for the main product fields and nested productDetails (for editing)
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    isNested: boolean = false,
    nestedField?: keyof ProductFormData["productDetails"]
  ) => {
    const { name, value, type } = e.target;
    const val = type === "number" ? parseFloat(value) || 0 : value;

    if (isNested && nestedField) {
      setEditingProduct((prev) => ({
        ...prev,
        productDetails: {
          ...prev.productDetails,
          [nestedField]: val,
        },
      }));
    } else {
      setEditingProduct((prev) => ({
        ...prev,
        [name]: name === "category" ? value : val, // category is handled as a string input, will be split later
      }));
    }
  };

  // Handle input changes for the new product fields and nested productDetails (for adding)

  // Handle main image file selection (for editing)
  const handleMainImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      setEditingProduct((prev) => ({ ...prev, image: file }));
      const previewUrl = URL.createObjectURL(file);
      setMainImagePreview(previewUrl);
      // Revoke the object URL later when component unmounts or image changes again
      // For now, we'll just set it. Consider cleanup if needed.
    } else {
      // If user clears the input
      setEditingProduct((prev) => ({ ...prev, image: null }));
      setMainImagePreview(null);
    }
  };

  // Handle additional images file selection (for editing)
  const handleAdditionalImagesChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const newFilesArray = Array.from(files);
      setEditingProduct((prev) => ({
        ...prev,
        images: [...prev.images, ...newFilesArray], // Append new files to existing ones (paths or files)
      }));

      // Create previews for the newly selected files
      const newPreviews = newFilesArray.map((file) =>
        URL.createObjectURL(file)
      );
      setAdditionalImagePreviews((prev) => [...prev, ...newPreviews]);
    }
  };

  // Handle main image file selection (for adding)

  // Remove an image from the additional images list and previews (for editing)
  const removeAdditionalImage = (index: number) => {
    setEditingProduct((prev) => {
      const newImages = [...prev.images];
      const removedItem = newImages.splice(index, 1)[0];
      // If the removed item was a File, revoke its object URL
      if (removedItem instanceof File) {
        URL.revokeObjectURL(URL.createObjectURL(removedItem as any)); // Type assertion needed, but safe here
      }
      return { ...prev, images: newImages };
    });

    setAdditionalImagePreviews((prev) => {
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

  // Remove an image from the additional images list and previews (for adding)

  // Handle form submission for updating the product
  const handleUpdateProduct = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Prepare the payload
      const payload: any = {
        ...editingProduct,
        image: editingProduct.image, // This could be a string (existing path) or a File object
        images: editingProduct.images, // This could be an array of strings (existing paths) or File objects or mixed
        category: editingProduct.category
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
      if (editingProduct.image instanceof File) {
        formData.append("image", editingProduct.image);
      } else if (typeof editingProduct.image === "string") {
        // If it's still a string path, send it as is (assuming backend handles it)
        formData.append("image", editingProduct.image);
      }
      // If editingProduct.image is null, it's omitted from the form data

      // Append additional image files if any are File objects
      let fileIndex = 0;
      for (const img of editingProduct.images) {
        if (img instanceof File) {
          formData.append(`images`, img); // Use 'images' as the key for multiple files
          fileIndex++;
        } else if (typeof img === "string") {
          // If it's a string path, send it as part of the 'existingImages' array or similar
          // Backend needs to handle this. For now, we'll assume paths are sent separately if needed.
          // Or, you might need a separate field like 'existingImages'.
          // Let's assume backend expects paths within the 'images' array as strings.
          formData.append(`images`, img);
        }
      }

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API}/products/${productId}`,
        {
          // Use the current productId for updating
          method: "PUT", // Or 'PATCH' depending on your API
          // Note: Do NOT set 'Content-Type' header when using FormData
          // The browser sets it automatically with the correct boundary
          body: formData,
        }
      );

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(
          errorData.message || `Failed to update product: ${res.status}`
        );
      }

      const updatedProduct: ProductDetail = await res.json();
      setProduct(updatedProduct);

      toast.success("Product updated successfully!");
      setIsEditDialogOpen(false);

      // Clean up any remaining object URLs for previews that are no longer needed
      if (mainImagePreview) URL.revokeObjectURL(mainImagePreview);
      additionalImagePreviews.forEach((previewUrl) =>
        URL.revokeObjectURL(previewUrl)
      );
      setMainImagePreview(null);
      setAdditionalImagePreviews([]);
    } catch (error) {
      console.error("Update product failed:", error);
      toast.error(`Failed to update product: ${(error as Error).message}`);
    }
  };

  // Handle form submission for creating a new product
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

  const handleDeleteProduct = async () => {
    if (
      !confirm(
        `Are you sure you want to delete the product "${product?.name}"?`
      )
    ) {
      return;
    }

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API}/products/${productId}`,
        {
          method: "DELETE",
        }
      );

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(
          errorData.message || `Failed to delete product: ${res.status}`
        );
      }

      toast.success("Product deleted successfully!");
      router.push("/products"); // Redirect after deletion
    } catch (error) {
      console.error("Delete product failed:", error);
      toast.error(`Failed to delete product: ${(error as Error).message}`);
    }
  };

  // Build image URL safely
  const buildImageUrl = (path: string) => {
    const baseUrl = process.env.NEXT_PUBLIC_IMG;
    if (!baseUrl) {
      console.error("NEXT_PUBLIC_IMG environment variable is not set.");
      return "/placeholder-image.jpg";
    }
    return new URL(path, baseUrl).href;
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <Skeleton className="h-8 w-1/3 mb-4" />
        <div className="flex flex-col md:flex-row gap-8">
          <div className="md:w-1/2">
            <Skeleton className="h-96 w-full mb-4" />
            <div className="flex space-x-2">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="w-20 h-20" />
              ))}
            </div>
          </div>
          <div className="md:w-1/2 space-y-4">
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-32 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="text-red-500">
          Error: {error || "Product not found."}
        </div>
        <Button onClick={() => router.back()}>Go Back</Button>
      </div>
    );
  }

  return (
    <CuratedSidebar
      main={
        <main className="flex-1 p-4">
          <div className="mb-4">
            <SidebarTrigger />
          </div>

          <div className="container mx-auto px-4 py-8 max-w-6xl">
            <div className="flex justify-between items-start mb-6">
              <h1 className="text-3xl font-bold">{product.name}</h1>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setIsEditDialogOpen(true)}>
                  Edit
                </Button>
                <Button variant="destructive" onClick={handleDeleteProduct}>
                  Delete
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Image Gallery Section */}
              <div>
                <div className="relative w-full h-96 bg-gray-100 rounded-xl overflow-hidden mb-4">
                  {product.images && product.images.length > 0 ? (
                    <img
                      src={buildImageUrl(product.images[mainImageIndex])}
                      alt={`${product.name} - View ${mainImageIndex + 1}`}
                      // fill
                      className="object-contain p-4" // Use object-contain and padding to ensure image fits nicely
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-gray-500">No Image Available</span>
                    </div>
                  )}
                </div>

                {/* Thumbnail Navigation */}
                {product.images && product.images.length > 1 && (
                  <div className="flex space-x-2 overflow-x-auto pb-2">
                    {product.images.map((img, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => setMainImageIndex(index)}
                        className={`flex-shrink-0 w-20 h-20 rounded-md overflow-hidden border-2 ${
                          mainImageIndex === index
                            ? "border-cyan-500"
                            : "border-gray-300"
                        }`}>
                        <img
                          src={buildImageUrl(img)}
                          alt={`${product.name} - Thumbnail ${index + 1}`}
                          width={80}
                          height={80}
                          className="object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Product Information Section */}
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Basic Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <p>
                      <span className="font-semibold">SKU:</span> {product.sku}
                    </p>
                    <p>
                      <span className="font-semibold">Price:</span> Rs.{" "}
                      {product.price}
                    </p>
                    <p>
                      <span className="font-semibold">Stock:</span>{" "}
                      {product.stock}
                    </p>
                    <p>
                      <span className="font-semibold">Rating:</span>{" "}
                      {product.rating} / 5
                    </p>
                    <p>
                      <span className="font-semibold">Color:</span>{" "}
                      {product.color}
                    </p>
                    <p>
                      <span className="font-semibold">Size (Blade):</span>{" "}
                      {product.size} inches
                    </p>
                    <p>
                      <span className="font-semibold">Category:</span>{" "}
                      {product.category || product.category}
                    </p>
                    <p>
                      <span className="font-semibold">Description:</span>{" "}
                      {product.description}
                    </p>
                  </CardContent>
                </Card>

                {product.productDetails && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Technical Specifications</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <p>
                        <span className="font-semibold">Motor:</span>{" "}
                        {product.productDetails.motor}
                      </p>
                      <p>
                        <span className="font-semibold">Blades:</span>{" "}
                        {product.productDetails.blades}
                      </p>
                      <p>
                        <span className="font-semibold">Speed Levels:</span>{" "}
                        {product.productDetails.speedLevels}
                      </p>
                      <p>
                        <span className="font-semibold">Remote Control:</span>{" "}
                        {product.productDetails.remote}
                      </p>
                      <p>
                        <span className="font-semibold">Timer:</span>{" "}
                        {product.productDetails.timer}
                      </p>
                      <p>
                        <span className="font-semibold">Oscillation:</span>{" "}
                        {product.productDetails.oscillation}
                      </p>
                      <p>
                        <span className="font-semibold">Noise Level:</span>{" "}
                        {product.productDetails.noiseLevel}
                      </p>
                      <p>
                        <span className="font-semibold">Dimensions:</span>{" "}
                        {product.productDetails.dimensions}
                      </p>
                      <p>
                        <span className="font-semibold">Warranty:</span>{" "}
                        {product.productDetails.warranty}
                      </p>
                      <p>
                        <span className="font-semibold">Motor Type:</span>{" "}
                        {product.productDetails.motorType}
                      </p>
                      <p>
                        <span className="font-semibold">Height:</span>{" "}
                        {product.productDetails.height}
                      </p>
                      <p>
                        <span className="font-semibold">Blade Diameter:</span>{" "}
                        {product.productDetails.bladeDiameter}
                      </p>
                      <p>
                        <span className="font-semibold">Base Diameter:</span>{" "}
                        {product.productDetails.baseDiameter}
                      </p>
                      <p>
                        <span className="font-semibold">Weight:</span>{" "}
                        {product.productDetails.weight}
                      </p>
                      <p>
                        <span className="font-semibold">
                          Power Consumption:
                        </span>{" "}
                        {product.productDetails.powerConsumption}
                      </p>
                      <p>
                        <span className="font-semibold">Air Flow:</span>{" "}
                        {product.productDetails.airFlow}
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>

            {/* Edit Product Dialog */}
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Edit Product</DialogTitle>
                  <DialogDescription>
                    Make changes to the product details here. Click save when
                    you're done.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleUpdateProduct} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Basic Info Fields */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">
                        Basic Information
                      </h3>
                      <div className="space-y-2">
                        <Label htmlFor="name">Name</Label>
                        <Input
                          id="name"
                          name="name"
                          value={editingProduct.name}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="price">Price (Rs.)</Label>
                        <Input
                          id="price"
                          name="price"
                          type="number"
                          step="0.01"
                          value={editingProduct.price}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="stock">Stock</Label>
                        <Input
                          id="stock"
                          name="stock"
                          type="number"
                          value={editingProduct.stock}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="sku">SKU</Label>
                        <Input
                          id="sku"
                          name="sku"
                          value={editingProduct.sku}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                          id="description"
                          name="description"
                          value={editingProduct.description}
                          onChange={handleInputChange}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="color">Color</Label>
                        <Input
                          id="color"
                          name="color"
                          value={editingProduct.color}
                          onChange={handleInputChange}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="size">Size (Blade Inches)</Label>
                        <Input
                          id="size"
                          name="size"
                          type="number"
                          value={editingProduct.size}
                          onChange={handleInputChange}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="category">
                          Category (comma-separated)
                        </Label>
                        <Input
                          id="category"
                          name="category"
                          value={editingProduct.category}
                          onChange={handleInputChange}
                        />
                        <p className="text-sm text-gray-500">
                          Enter categories separated by commas (e.g., "Fan,
                          Electronics, Home Appliances")
                        </p>
                      </div>

                      {/* Image Upload Fields */}
                      <div className="space-y-2">
                        <Label htmlFor="mainImage">Main Image</Label>
                        <Input
                          id="mainImage"
                          name="mainImage"
                          type="file"
                          accept="image/*"
                          onChange={handleMainImageChange}
                        />
                        {mainImagePreview && (
                          <div className="mt-2">
                            <p className="text-sm text-gray-500">Preview:</p>
                            <img
                              src={mainImagePreview}
                              alt="Main image preview"
                              width={100}
                              height={100}
                              className="object-cover border rounded-md"
                            />
                          </div>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="additionalImages">
                          Additional Images
                        </Label>
                        <Input
                          id="additionalImages"
                          name="additionalImages"
                          type="file"
                          accept="image/*"
                          multiple // Allow multiple selection
                          onChange={handleAdditionalImagesChange}
                        />
                        <p className="text-sm text-gray-500">
                          Select multiple images to add.
                        </p>
                        {additionalImagePreviews.length > 0 && (
                          <div className="mt-2">
                            <p className="text-sm text-gray-500">Previews:</p>
                            <div className="flex flex-wrap gap-2">
                              {additionalImagePreviews.map((preview, index) => (
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
                                    onClick={() => removeAdditionalImage(index)}
                                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                                    &times;
                                  </button>
                                </div>
                              ))}
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
                      {/* ... (Keep existing technical spec fields as they were) ... */}
                      <div className="space-y-2">
                        <Label htmlFor="motor">Motor</Label>
                        <Input
                          id="motor"
                          name="motor"
                          value={editingProduct.productDetails.motor}
                          onChange={(e) => handleInputChange(e, true, "motor")}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="blades">Blades</Label>
                        <Input
                          id="blades"
                          name="blades"
                          value={editingProduct.productDetails.blades}
                          onChange={(e) => handleInputChange(e, true, "blades")}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="speedLevels">Speed Levels</Label>
                        <Input
                          id="speedLevels"
                          name="speedLevels"
                          value={editingProduct.productDetails.speedLevels}
                          onChange={(e) =>
                            handleInputChange(e, true, "speedLevels")
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="remote">Remote (Yes/No)</Label>
                        <Input
                          id="remote"
                          name="remote"
                          value={editingProduct.productDetails.remote}
                          onChange={(e) => handleInputChange(e, true, "remote")}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="timer">
                          Timer (e.g., 24 Hour Timer)
                        </Label>
                        <Input
                          id="timer"
                          name="timer"
                          value={editingProduct.productDetails.timer}
                          onChange={(e) => handleInputChange(e, true, "timer")}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="oscillation">
                          Oscillation (Yes/No)
                        </Label>
                        <Input
                          id="oscillation"
                          name="oscillation"
                          value={editingProduct.productDetails.oscillation}
                          onChange={(e) =>
                            handleInputChange(e, true, "oscillation")
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="noiseLevel">Noise Level</Label>
                        <Input
                          id="noiseLevel"
                          name="noiseLevel"
                          value={editingProduct.productDetails.noiseLevel}
                          onChange={(e) =>
                            handleInputChange(e, true, "noiseLevel")
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="dimensions">Dimensions</Label>
                        <Input
                          id="dimensions"
                          name="dimensions"
                          value={editingProduct.productDetails.dimensions}
                          onChange={(e) =>
                            handleInputChange(e, true, "dimensions")
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="warranty">Warranty</Label>
                        <Input
                          id="warranty"
                          name="warranty"
                          value={editingProduct.productDetails.warranty}
                          onChange={(e) =>
                            handleInputChange(e, true, "warranty")
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="motorType">
                          Motor Type (e.g., AC, DC)
                        </Label>
                        <Input
                          id="motorType"
                          name="motorType"
                          value={editingProduct.productDetails.motorType}
                          onChange={(e) =>
                            handleInputChange(e, true, "motorType")
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="height">Height</Label>
                        <Input
                          id="height"
                          name="height"
                          value={editingProduct.productDetails.height}
                          onChange={(e) => handleInputChange(e, true, "height")}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="bladeDiameter">Blade Diameter</Label>
                        <Input
                          id="bladeDiameter"
                          name="bladeDiameter"
                          value={editingProduct.productDetails.bladeDiameter}
                          onChange={(e) =>
                            handleInputChange(e, true, "bladeDiameter")
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="baseDiameter">Base Diameter</Label>
                        <Input
                          id="baseDiameter"
                          name="baseDiameter"
                          value={editingProduct.productDetails.baseDiameter}
                          onChange={(e) =>
                            handleInputChange(e, true, "baseDiameter")
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="weight">Weight</Label>
                        <Input
                          id="weight"
                          name="weight"
                          value={editingProduct.productDetails.weight}
                          onChange={(e) => handleInputChange(e, true, "weight")}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="powerConsumption">
                          Power Consumption
                        </Label>
                        <Input
                          id="powerConsumption"
                          name="powerConsumption"
                          value={editingProduct.productDetails.powerConsumption}
                          onChange={(e) =>
                            handleInputChange(e, true, "powerConsumption")
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="airFlow">Air Flow</Label>
                        <Input
                          id="airFlow"
                          name="airFlow"
                          value={editingProduct.productDetails.airFlow}
                          onChange={(e) =>
                            handleInputChange(e, true, "airFlow")
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
                        setIsEditDialogOpen(false);
                        // Clean up previews on cancel
                        if (mainImagePreview)
                          URL.revokeObjectURL(mainImagePreview);
                        additionalImagePreviews.forEach((previewUrl) =>
                          URL.revokeObjectURL(previewUrl)
                        );
                        setMainImagePreview(null);
                        setAdditionalImagePreviews([]);
                      }}>
                      Cancel
                    </Button>
                    <Button type="submit">Save Changes</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </main>
      }
    />
  );
}
