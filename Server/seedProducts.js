import dotenv from "dotenv";
import mongoose from "mongoose";
import Product from "./Models/product.model.js";

dotenv.config();

const products = [
  {
    name: "Noise Cancelling Headphones",
    description: "Wireless over-ear headphones with active noise cancellation and a 30-hour battery.",
    price: 4999,
    category: "Electronics",
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1000&q=85",
    stock: 25,
  },
  {
    name: "Mechanical Keyboard",
    description: "RGB mechanical keyboard with tactile switches and a durable compact design.",
    price: 2999,
    category: "Electronics",
    image: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=1000&q=85",
    stock: 10,
  },
  {
    name: "Everyday Canvas Backpack",
    description: "A comfortable everyday backpack with a spacious main compartment and laptop sleeve.",
    price: 1899,
    category: "Fashion",
    image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=1000&q=85",
    stock: 18,
  },
  {
    name: "The Design of Everyday Things",
    description: "A practical and engaging guide to the principles behind thoughtful product design.",
    price: 799,
    category: "Books",
    image: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=1000&q=85",
    stock: 32,
  },
  {
    name: "Minimal Desk Lamp",
    description: "A modern adjustable desk lamp that brings warm, focused light to your workspace.",
    price: 1499,
    category: "Home",
    image: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=1000&q=85",
    stock: 14,
  },
  {
    name: "Wireless Earbuds",
    description: "Compact Bluetooth earbuds with a charging case and clear sound for everyday listening.",
    price: 2299,
    category: "Electronics",
    image: "https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?auto=format&fit=crop&w=1000&q=85",
    stock: 20,
  },
  {
    name: "Classic Wristwatch",
    description: "A clean, versatile wristwatch with a comfortable strap and an easy-to-read dial.",
    price: 3499,
    category: "Fashion",
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1000&q=85",
    stock: 12,
  },
  {
    name: "Portable Bluetooth Speaker",
    description: "A portable wireless speaker with rich sound for your desk, room, or weekend trips.",
    price: 2799,
    category: "Electronics",
    image: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?auto=format&fit=crop&w=1000&q=85",
    stock: 16,
  },
  {
    name: "Full HD Monitor",
    description: "A crisp Full HD monitor suited to study, office work, and everyday entertainment.",
    price: 11999,
    category: "Electronics",
    image: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=1000&q=85",
    stock: 8,
  },
  {
    name: "Ergonomic Wireless Mouse",
    description: "A comfortable wireless mouse with a precise sensor for work and browsing.",
    price: 999,
    category: "Electronics",
    image: "https://images.unsplash.com/photo-1527814050087-3793815479db?auto=format&fit=crop&w=1000&q=85",
    stock: 30,
  },
  {
    name: "Everyday Sunglasses",
    description: "Lightweight sunglasses with a timeless frame for sunny days and outdoor trips.",
    price: 1299,
    category: "Fashion",
    image: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=1000&q=85",
    stock: 22,
  },
  {
    name: "Running Sneakers",
    description: "Comfortable lightweight sneakers designed for daily walks and casual runs.",
    price: 3199,
    category: "Fashion",
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1000&q=85",
    stock: 15,
  },
  {
    name: "Insulated Water Bottle",
    description: "A reusable insulated bottle that keeps drinks handy at work, school, or the gym.",
    price: 699,
    category: "Home",
    image: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=1000&q=85",
    stock: 28,
  },
  {
    name: "Ceramic Coffee Mug",
    description: "A sturdy ceramic mug with a simple design for your morning coffee or tea.",
    price: 449,
    category: "Home",
    image: "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?auto=format&fit=crop&w=1000&q=85",
    stock: 35,
  },
  {
    name: "Modern Accent Chair",
    description: "A comfortable accent chair that adds a practical, modern touch to a living space.",
    price: 8499,
    category: "Home",
    image: "https://images.unsplash.com/photo-1505843490538-5133c6c7d0e?auto=format&fit=crop&w=1000&q=85",
    stock: 6,
  },
  {
    name: "Indoor Tabletop Plant",
    description: "A low-maintenance indoor plant to bring a natural accent to desks and shelves.",
    price: 599,
    category: "Home",
    image: "https://images.unsplash.com/photo-1485955900006-10f4d324d411?auto=format&fit=crop&w=1000&q=85",
    stock: 18,
  },
  {
    name: "Hardcover Journal",
    description: "A durable lined journal for notes, daily plans, sketches, and personal writing.",
    price: 399,
    category: "Books",
    image: "https://images.unsplash.com/photo-1531346878377-a5be20888e57?auto=format&fit=crop&w=1000&q=85",
    stock: 40,
  },
  {
    name: "Yoga Mat",
    description: "A supportive non-slip exercise mat for stretching, yoga, and home workouts.",
    price: 1199,
    category: "Fitness",
    image: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=1000&q=85",
    stock: 17,
  },
  {
    name: "Travel Organizer Pouch",
    description: "A compact organizer pouch to keep travel essentials and everyday accessories together.",
    price: 899,
    category: "Fashion",
    image: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=1000&q=85",
    stock: 21,
  },
  {
    name: "Classic Reading Book",
    description: "A thoughtfully selected paperback for a relaxing afternoon or your daily commute.",
    price: 599,
    category: "Books",
    image: "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=1000&q=85",
    stock: 24,
  },
];

const seedProducts = async () => {
  if (!process.env.dbURL) {
    throw new Error("dbURL is not configured");
  }

  await mongoose.connect(process.env.dbURL);

  try {
    let insertedCount = 0;

    for (const product of products) {
      const result = await Product.updateOne(
        { name: product.name },
        { $setOnInsert: product },
        { upsert: true, runValidators: true },
      );
      insertedCount += result.upsertedCount;
    }

    console.log(`Product seed complete. Added ${insertedCount} new products.`);
  } finally {
    await mongoose.disconnect();
  }
};

seedProducts().catch((error) => {
  console.error("PRODUCT SEED FAILED:", error);
  process.exitCode = 1;
});
