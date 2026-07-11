import { connectToDB } from "@/lib/db";
import ShoppingItem from "@/lib/models/ShoppingItem";
import ItemClient from "./ItemClient";
import { notFound } from "next/navigation";
import mongoose from "mongoose";
import { getTranslations } from "next-intl/server";
import { Metadata } from "next";

export async function generateMetadata({ params }: { params: Promise<{ locale: string, id: string }> }): Promise<Metadata> {
  const { locale, id } = await params;
  
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return { title: "Item Not Found" };
  }

  await connectToDB();
  const item = await ShoppingItem.findById(id).lean();

  if (!item) {
    return { title: "Item Not Found" };
  }

  const title = item.name?.[locale] || item.name?.en || "Shop Item";
  const desc = item.description?.[locale] || item.description?.en || "";

  return {
    title: `${title} - VISA Shop`,
    description: desc,
  };
}

export default async function ShopItemPage({ params }: { params: Promise<{ locale: string, id: string }> }) {
  const { locale, id } = await params;
  
  if (!mongoose.Types.ObjectId.isValid(id)) {
    notFound();
  }

  await connectToDB();
  const itemResponse = await ShoppingItem.findById(id).lean();

  if (!itemResponse || !itemResponse.isActive) {
    notFound();
  }

  const item = {
    ...itemResponse,
    _id: itemResponse._id.toString(),
    createdAt: itemResponse.createdAt?.toISOString(),
    updatedAt: itemResponse.updatedAt?.toISOString(),
  };

  return <ItemClient item={item} locale={locale} />;
}
