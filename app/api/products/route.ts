import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import { Prisma } from "@prisma/client";
import path from "path";
import sharp from "sharp";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}
// GET — Fetch paginated or searched products
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const search = searchParams.get("search") || "";
    const currentPage = parseInt(searchParams.get("page") || "1", 10);
    const limit = 12;
    const skip = (currentPage - 1) * limit;

    const where: Prisma.ProductWhereInput | undefined = search
      ? {
          OR: [
            { name: { contains: search, mode: "insensitive" } },
            { category: { has: search } },
          ],
        }
      : undefined;

    const [products, totalProds] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy: { id: "desc" },
        skip,
        take: limit,
        select: {
          id: true,
          name: true,
          price: true,
          stock: true,
          category: true,
          sku: true,
          color: true,
          size: true,
          rating: true,
          description: true,
          image: true,
          images: true,
          productDetails: {
            select: {
              // id: true,
              productId: true,
              motor: true,
              blades: true,
              speedLevels: true,
              remote: true,
              timer: true,
              oscillation: true,
              noiseLevel: true,
              dimensions: true,
              warranty: true,
              motorType: true,
              height: true,
              bladeDiameter: true,
              baseDiameter: true,
              weight: true,
              powerConsumption: true,
              airFlow: true,
            },
          },
        },
      }),
      prisma.product.count({ where }),
    ]);

    const totalPages = Math.ceil(totalProds / limit);

    return NextResponse.json(
      { products, totalProds, currentPage, totalPages },
      { headers: corsHeaders }
    );
  } catch (error: any) {
    console.error("GET /products error:", error.message);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500, headers: corsHeaders }
    );
  }
}

export async function POST(req: Request) {
  try {
    const contentType = req.headers.get("content-type") || "";
    let body: any = {};

    let mainImagePath = "";
    let additionalImages: string[] = [];

    // Folder for storing images
    const uploadDir = path.join(process.cwd(), "public", "uploads");
    await fs.mkdir(uploadDir, { recursive: true });

    // Image compressor
    const processImage = async (file: File, folder: string) => {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const fileNameWithoutExt = path.parse(file.name).name;
      const timeStamp = Date.now();
      const compressedFileName = `${fileNameWithoutExt}-${timeStamp}.webp`;
      const outputPath = path.join(folder, compressedFileName);

      const optimizedBuffer = await sharp(buffer)
        .resize({ width: 2000 })
        .webp({ quality: 95 })
        .toBuffer();

      await fs.writeFile(outputPath, optimizedBuffer);
      return `/uploads/${compressedFileName}`;
    };

    // PARSE FORM-DATA REQUEST
    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      body = Object.fromEntries(formData.entries());

      // console.log("Form Data Body:", body);

      const mainFile = formData.get("image") as File | null;
      // console.log("Main File:", mainFile);

      mainImagePath = mainFile
        ? await processImage(mainFile, uploadDir)
        : "/uploads/default.png";

      const files = formData.getAll("images") as File[];
      // console.log("Additional Files:", files);

      if (files?.length) {
        for (const file of files) {
          const p = await processImage(file, uploadDir);
          additionalImages.push(p);
        }
      } else {
        additionalImages = ["/uploads/default.png"];
      }
    } else {
      body = await req.json();
      console.log("JSON Body:", body);

      mainImagePath = body.image || "/uploads/default.png";
      additionalImages = body.images || ["/uploads/default.png"];
    }

    // REQUIRED FIELDS
    const requiredFields = ["name", "price", "stock", "category"];
    const missingFields = requiredFields.filter((f) => !body[f]);
    if (missingFields.length > 0) {
      console.log("Missing required fields:", missingFields);
      return NextResponse.json(
        { error: `Missing required fields: ${missingFields.join(", ")}` },
        { status: 400, headers: corsHeaders }
      );
    }

    // Check duplicate product
    const existingProduct = await prisma.product.findFirst({
      where: { name: body.name },
    });
    if (existingProduct) {
      console.log("Duplicate product found:", existingProduct);
      return NextResponse.json(
        { error: "Product already exists" },
        { status: 400, headers: corsHeaders }
      );
    }

    // Fix category as array
    const categoryArray =
      typeof body.category === "string"
        ? body.category.split(",").map((c: string) => c.trim())
        : Array.isArray(body.category)
        ? body.category
        : [];
    console.log("Category Array:", categoryArray);

    const productDetails =
      typeof body.productDetails === "string"
        ? JSON.parse(body.productDetails)
        : body.productDetails || {};

    const product = await prisma.product.create({
      data: {
        name: body.name,
        price: Number(body.price),
        stock: Number(body.stock),
        color: body.color || null,
        size: body.size ? Number(body.size) : null,
        category: categoryArray,
        description: body.description || null,
        sku: "TEMP",
        image: mainImagePath,
        images: additionalImages,
        productDetails: {
          create: {
            motor: productDetails.motor || null,
            blades: productDetails.blades || null,
            speedLevels: productDetails.speedLevels || null,
            remote: productDetails.remote || null,
            timer: productDetails.timer || null,
            oscillation: productDetails.oscillation || null,
            noiseLevel: productDetails.noiseLevel || null,
            dimensions: productDetails.dimensions || null,
            warranty: productDetails.warranty || null,
            motorType: productDetails.motorType || null,
            height: productDetails.height || null,
            bladeDiameter: productDetails.bladeDiameter || null,
            baseDiameter: productDetails.baseDiameter || null,
            weight: productDetails.weight || null,
            powerConsumption: productDetails.powerConsumption || null,
            airFlow: productDetails.airFlow || null,
          },
        },
      },
      include: { productDetails: true },
    });

    // Generate SKU
    const formattedName = body.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "_")
      .replace(/^_|_$/g, "");

    const generatedSku = `${formattedName}_${product.id}`;
    const updatedProduct = await prisma.product.update({
      where: { id: product.id },
      data: { sku: generatedSku },
      include: { productDetails: true },
    });

    console.log("Product created successfully:", updatedProduct);

    return NextResponse.json(updatedProduct, {
      status: 201,
      headers: corsHeaders,
    });
  } catch (error: any) {
    console.error("POST /products error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create product" },
      { status: 500, headers: corsHeaders }
    );
  }
}
