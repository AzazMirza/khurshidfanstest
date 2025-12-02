// import { NextResponse } from "next/server";
// import { prisma } from "@/lib/prisma";

// const corsHeaders = {
//   "Access-Control-Allow-Origin": "*",
//   "Access-Control-Allow-Methods": "POST, OPTIONS",
//   "Access-Control-Allow-Headers": "Content-Type, Authorization",
// };

// // ✅ Handle CORS preflight
// export async function OPTIONS() {
//   return NextResponse.json({}, { headers: corsHeaders });
// }

// // ✅ POST → Add ProductDetails
// export async function POST(req: Request) {
//   try {
//     const body = await req.json();

//     const {
//       productId,
//       motor,
//       blades,
//       speedLevels,
//       remote,
//       timer,
//       oscillation,
//       noiseLevel,
//       dimensions,
//       warranty,
//       motorType,
//       height,
//       bladeDiameter,
//       baseeDiameter,
//       weight,
//       powerConsumption,
//       airFlow,
//     } = body;

//     // Check if product exists
//     const productExists = await prisma.product.findUnique({
//       where: { id: Number(productId) },
//     });

//     if (!productExists) {
//       return NextResponse.json(
//         { error: "Product not found" },
//         { status: 404, headers: corsHeaders }
//       );
//     }

//     // Check if details already exist
//     const existingDetails = await prisma.productDetails.findUnique({
//       where: { productId: Number(productId) },
//     });

//     if (existingDetails) {
//       return NextResponse.json(
//         { error: "Product details already exist" },
//         { status: 400, headers: corsHeaders }
//       );
//     }

//     // Create ProductDetails
//       const newDetails = await prisma.productDetails.create({
//   data: {
//     productId: Number(productId),
//     motor: motor || null,
//     blades: blades || null,
//     speedLevels: speedLevels || null,
//     remote: remote || null,
//     timer: timer || null,
//     oscillation: oscillation || null,
//     noiseLevel: noiseLevel || null,
//     dimensions: dimensions || null,
//     warranty: warranty || null,
//     motorType: motorType || null,
//     height: height || null,
//     bladeDiameter: bladeDiameter || null,
//     baseeDiameter: baseeDiameter || null,
//     weight: weight || null,
//     powerConsumption: powerConsumption || null,
//     airFlow: airFlow || null,
//   },
// });

//     return NextResponse.json(newDetails, { headers: corsHeaders });
//   } catch (error) {
//     console.error(error);
//     return NextResponse.json(
//       { error: "Something went wrong" },
//       { status: 500, headers: corsHeaders }
//     );
//   }
// }