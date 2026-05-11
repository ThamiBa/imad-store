import { Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { AppError } from "../middleware/error.middleware";

const productSchema = z.object({
    slug: z.string().min(1),
    nameFr: z.string().min(1),
    nameAr: z.string().min(1),
    nameEn: z.string().min(1),
    descriptionFr: z.string(),
    descriptionAr: z.string(),
    descriptionEn: z.string(),
    price: z.number().positive(),
    compareAtPrice: z.number().positive().optional(),
    images: z.array(z.string().url()),
    status: z.enum(["ACTIVE", "DRAFT", "ARCHIVED"]).optional(),
    categoryId: z.string(),
    variants: z.array(
        z.object({
            color: z.string(),
            colorNameFr: z.string(),
            colorNameAr: z.string(),
            colorNameEn: z.string(),
            size: z.string().optional(),
            stock: z.number().int().min(0),
            sku: z.string(),
        })
    ),
});

export async function getProducts(req: Request, res: Response) {
    const { category, status = "ACTIVE", page = "1", limit = "20", search } = req.query;

    const where: any = { status: status as string };
    if (category) where.category = { slug: category };
    if (search) {
        where.OR = [
            { nameFr: { contains: search as string, mode: "insensitive" } },
            { nameAr: { contains: search as string, mode: "insensitive" } },
        ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    const [products, total] = await Promise.all([
        prisma.product.findMany({
            where,
            include: { category: true, variants: true },
            skip,
            take: Number(limit),
            orderBy: { createdAt: "desc" },
        }),
        prisma.product.count({ where }),
    ]);

    res.json({
        success: true,
        data: products,
        total,
        page: Number(page),
        totalPages: Math.ceil(total / Number(limit)),
    });
}

export async function getProduct(req: Request, res: Response) {
    const { slug } = req.params;
    const product = await prisma.product.findUnique({
        where: { slug },
        include: { category: true, variants: true },
    });
    if (!product) throw new AppError("Product not found", 404);
    res.json({ success: true, data: product });
}

export async function createProduct(req: Request, res: Response) {
    const body = productSchema.parse(req.body);
    const { variants, ...productData } = body;

    const product = await prisma.product.create({
        data: {
            ...productData,
            variants: { create: variants },
        },
        include: { variants: true, category: true },
    });

    res.status(201).json({ success: true, data: product });
}

export async function updateProduct(req: Request, res: Response) {
    const { id } = req.params;
    const body = productSchema.partial().parse(req.body);
    const { variants, ...productData } = body;

    const product = await prisma.product.update({
        where: { id },
        data: productData,
        include: { variants: true, category: true },
    });

    res.json({ success: true, data: product });
}

export async function deleteProduct(req: Request, res: Response) {
    const { id } = req.params;
    await prisma.product.update({ where: { id }, data: { status: "ARCHIVED" } });
    res.json({ success: true, message: "Product archived" });
}
