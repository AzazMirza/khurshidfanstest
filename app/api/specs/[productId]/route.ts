

// import { NextResponse } from "next/server";
// import { prisma } from "@/lib/prisma";

// const corsHeaders = {
//   "Access-Control-Allow-Origin": "*",
//   "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
//   "Access-Control-Allow-Headers": "Content-Type, Authorization",
// };

// // ✅ Handle CORS preflight
// export async function OPTIONS() {
//   return NextResponse.json({}, { headers: corsHeaders });
// }

// // ✅ GET → Fetch ProductDetails by productId
// export async function GET(req: Request, { params }: { params: { productId: string } }) {
//   try {
//     const productId = Number(params.productId);

//     const details = await prisma.productDetails.findUnique({
//       where: { productId },
//     });

//     if (!details) {
//       return NextResponse.json(
//         { error: "ProductDetails not found" },
//         { status: 404, headers: corsHeaders }
//       );
//     }

//     return NextResponse.json(details, { headers: corsHeaders });
//   } catch (error: any) {
//     console.error(error);
//     return NextResponse.json(
//       { error: error.message || "Something went wrong" },
//       { status: 500, headers: corsHeaders }
//     );
//   }
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

//     // Check product exists
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
//     const newDetails = await prisma.productDetails.create({
//       data: {
//         productId: Number(productId),
//         motor: motor || null,
//         blades: blades || null,
//         speedLevels: speedLevels || null,
//         remote: remote || null,
//         timer: timer || null,
//         oscillation: oscillation || null,
//         noiseLevel: noiseLevel || null,
//         dimensions: dimensions || null,
//         warranty: warranty || null,
//         motorType: motorType || null,
//         height: height || null,
//         bladeDiameter: bladeDiameter || null,
//         baseeDiameter: baseeDiameter || null,
//         weight: weight || null,
//         powerConsumption: powerConsumption || null,
//         airFlow: airFlow || null,
//       },
//     });

//     return NextResponse.json(newDetails, { headers: corsHeaders });
//   } catch (error: any) {
//     console.error(error);
//     return NextResponse.json(
//       { error: error.message || "Something went wrong" },
//       { status: 500, headers: corsHeaders }
//     );
//   }
// }

// // ✅ PUT → Update ProductDetails
// export async function PUT(req: Request, { params }: { params: { productId: string } }) {
//   try {
//     const productId = Number(params.productId);
//     const body = await req.json();

//     // Check if details exist
//     const existingDetails = await prisma.productDetails.findUnique({
//       where: { productId },
//     });

//     if (!existingDetails) {
//       return NextResponse.json(
//         { error: "ProductDetails not found" },
//         { status: 404, headers: corsHeaders }
//       );
//     }

//     const updatedDetails = await prisma.productDetails.update({
//       where: { productId },
//       data: {
//         motor: body.motor ?? existingDetails.motor,
//         blades: body.blades ?? existingDetails.blades,
//         speedLevels: body.speedLevels ?? existingDetails.speedLevels,
//         remote: body.remote ?? existingDetails.remote,
//         timer: body.timer ?? existingDetails.timer,
//         oscillation: body.oscillation ?? existingDetails.oscillation,
//         noiseLevel: body.noiseLevel ?? existingDetails.noiseLevel,
//         dimensions: body.dimensions ?? existingDetails.dimensions,
//         warranty: body.warranty ?? existingDetails.warranty,
//         motorType: body.motorType ?? existingDetails.motorType,
//         height: body.height ?? existingDetails.height,
//         bladeDiameter: body.bladeDiameter ?? existingDetails.bladeDiameter,
//         baseeDiameter: body.baseeDiameter ?? existingDetails.baseeDiameter,
//         weight: body.weight ?? existingDetails.weight,
//         powerConsumption: body.powerConsumption ?? existingDetails.powerConsumption,
//         airFlow: body.airFlow ?? existingDetails.airFlow,
//       },
//     });

//     return NextResponse.json(updatedDetails, { headers: corsHeaders });
//   } catch (error: any) {
//     console.error(error);
//     return NextResponse.json(
//       { error: error.message || "Something went wrong" },
//       { status: 500, headers: corsHeaders }
//     );
//   }
// }

// // ✅ DELETE → Remove ProductDetails
// export async function DELETE(req: Request, { params }: { params: { productId: string } }) {
//   try {
//     const productId = Number(params.productId);

//     const existingDetails = await prisma.productDetails.findUnique({
//       where: { productId },
//     });

//     if (!existingDetails) {
//       return NextResponse.json(
//         { error: "ProductDetails not found" },
//         { status: 404, headers: corsHeaders }
//       );
//     }

//     await prisma.productDetails.delete({
//       where: { productId },
//     });

//     return NextResponse.json({ message: "ProductDetails deleted successfully" }, { headers: corsHeaders });
//   } catch (error: any) {
//     console.error(error);
//     return NextResponse.json(
//       { error: error.message || "Something went wrong" },
//       { status: 500, headers: corsHeaders }
//     );
//   }
// }