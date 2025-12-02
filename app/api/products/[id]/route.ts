/// app/api/products/[id]/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { promises as fs } from "fs";
import path from "path";
import sharp from "sharp"; 

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: Request, { params }: RouteParams) {
  const { id } = await params;
  if (!id || typeof id !== "string") {
    return NextResponse.json(
      { error: "Product ID is required" },
      { status: 400, headers: corsHeaders }
    );
  }

  const productId = Number(id);
  if (isNaN(productId) || productId <= 0 || !Number.isInteger(productId)) {
    return NextResponse.json(
      { error: "Invalid product ID. Must be a positive integer." },
      { status: 400, headers: corsHeaders }
    );
  }

  try {
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: { productDetails: true },
    });

    if (!product) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404, headers: corsHeaders }
      );
    }

    return NextResponse.json(product, { headers: corsHeaders });
  } catch (error) {
    console.error("Error fetching product:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500, headers: corsHeaders }
    );
  }
}

export async function PUT(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json(
        { error: "Product ID is required" },
        { status: 400, headers: corsHeaders }
      );
    }

    const productId = Number(id);
    if (isNaN(productId) || productId <= 0 || !Number.isInteger(productId)) {
      return NextResponse.json(
        { error: "Invalid product ID. Must be a positive integer." },
        { status: 400, headers: corsHeaders }
      );
    }

    // NEW: Handle FormData instead of JSON
    const formData = await request.formData(); // Get FormData from request

    // Extract text fields from FormData
    const name = formData.get("name") as string | null;
    const price = formData.get("price")
      ? Number(formData.get("price"))
      : undefined;
    const stock = formData.get("stock")
      ? Number(formData.get("stock"))
      : undefined;
    const rating = formData.get("rating")
      ? Number(formData.get("rating"))
      : undefined;
    const description = formData.get("description") as string | null;
    const sku = formData.get("sku") as string | null;
    const color = formData.get("color") as string | null;
    const size = formData.get("size")
      ? Number(formData.get("size"))
      : undefined;
    const categoryString = formData.get("category") as string | null;
    const category = categoryString
      ? categoryString
          .split(",")
          .map((cat) => cat.trim())
          .filter((cat) => cat !== "")
      : undefined;

    // Extract productDetails JSON string (if sent as JSON string)
    const productDetailsJson = formData.get("productDetails") as string | null;
    let productDetailsData: any = null;
    if (productDetailsJson) {
      try {
        productDetailsData = JSON.parse(productDetailsJson);
      } catch (e) {
        console.error("Error parsing productDetails JSON:", e);
        return NextResponse.json(
          { error: "Invalid productDetails JSON format." },
          { status: 400, headers: corsHeaders }
        );
      }
    }

    // Extract file objects from FormData
    const imageFile = formData.get("image") as File | string | null;
    const imagesFiles = formData.getAll("images") as (File | string)[];

    let finalImagePath: string | null = null;
    let finalImagePaths: string[] = [];

    // Helper: add timestamp to filename
    function addTimestampToFileName(fileName: string): string {
      const timestamp = Date.now();
      const baseName = fileName.replace(/\.[^/.]+$/, ""); // remove extension
      return `${timestamp}_${baseName}.webp`; // save as .webp
    }

    // Helper: save & compress File to disk
    async function saveFile(file: File, folder: string): Promise<string> {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // 🔥 Same compression logic as product API
      const processedBuffer = await sharp(buffer)
        .resize({ width: 2000 }) 
        .webp({ quality: 95}) 
        .toBuffer();

      const fileName = addTimestampToFileName(file.name);
      const filePath = path.join(process.cwd(), "public", folder, fileName);

      await fs.writeFile(filePath, processedBuffer);

      return `/${folder}/${fileName}`;
    }

    // Main image
    if (imageFile instanceof File) {
      finalImagePath = await saveFile(imageFile, "uploads");
      console.log("Saved main image:", finalImagePath);
    } else if (typeof imageFile === "string") {
      finalImagePath = imageFile;
    }

    // Additional images
    for (const imgFile of imagesFiles) {
      if (imgFile instanceof File) {
        const savedPath = await saveFile(imgFile, "uploads");
        finalImagePaths.push(savedPath);
        console.log("Saved additional image:", savedPath);
      } else if (typeof imgFile === "string") {
        finalImagePaths.push(imgFile);
      }
    }

    // Update Product main fields
    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: {
        name: name !== null ? name : undefined,
        price: price,
        stock: stock,
        rating: rating, 
        description: description !== null ? description : undefined,
        sku: sku !== null ? sku : undefined,
        image: finalImagePath,
        images: finalImagePaths,
        color: color !== null ? color : undefined,
        size: size,
        category: category,
      },
    });

    // Update ProductDetails if provided
    if (productDetailsData) {
      const existingDetails = await prisma.productDetails.findUnique({
        where: { productId },
      });

      if (existingDetails) {
        await prisma.productDetails.update({
          where: { productId },
          data: productDetailsData,
        });
      } else {
        await prisma.productDetails.create({
          data: { productId, ...productDetailsData },
        });
      }
    }

    return NextResponse.json(
      { message: "Product updated successfully", product: updatedProduct },
      { headers: corsHeaders }
    );
  } catch (error: any) {
    console.error("PUT /products error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update product" },
      { status: 500, headers: corsHeaders }
    );
  }
}

export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: "Product ID is required" },
        { status: 400, headers: corsHeaders }
      );
    }

    const productId = Number(id);

    // Delete related product details first (if any)
    await prisma.productDetails.deleteMany({
      where: { productId },
    });

    // Delete related order items
    await prisma.orderItem.deleteMany({
      where: { productId },
    });

    // Delete the product itself
    await prisma.product.delete({
      where: { id: productId },
    });

    return NextResponse.json(
      { message: "Product deleted successfully" },
      { headers: corsHeaders }
    );
  } catch (error: any) {
    console.error("DELETE /products error:", error.message);
    return NextResponse.json(
      { error: error.message || "Failed to delete product" },
      { status: 500, headers: corsHeaders }
    );
  }
}

