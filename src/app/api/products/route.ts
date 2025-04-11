import { NextResponse } from 'next/server';

// Example product data - in a real app would come from a database
const products = [
  { id: '1', name: 'T-Shirt', price: 19.99, category: 'Clothing', image: '/images/t-shirt.jpg', stock: 45 },
  { id: '2', name: 'Coffee Mug', price: 9.99, category: 'Accessories', image: '/images/mug.jpg', stock: 32 },
  { id: '3', name: 'Baseball Cap', price: 14.99, category: 'Accessories', image: '/images/cap.jpg', stock: 28 },
  { id: '4', name: 'Notebook', price: 4.99, category: 'Stationery', image: '/images/notebook.jpg', stock: 58 },
  { id: '5', name: 'Water Bottle', price: 12.99, category: 'Accessories', image: '/images/bottle.jpg', stock: 15 },
  { id: '6', name: 'Headphones', price: 89.99, category: 'Electronics', image: '/images/headphones.jpg', stock: 13 },
  { id: '7', name: 'Mouse', price: 24.99, category: 'Electronics', image: '/images/mouse.jpg', stock: 24 },
  { id: '8', name: 'Keyboard', price: 49.99, category: 'Electronics', image: '/images/keyboard.jpg', stock: 16 },
  { id: '9', name: 'Sunglasses', price: 29.99, category: 'Accessories', image: '/images/sunglasses.jpg', stock: 21 },
  { id: '10', name: 'Backpack', price: 39.99, category: 'Bags', image: '/images/backpack.jpg', stock: 19 },
  { id: '11', name: 'Pen', price: 1.99, category: 'Stationery', image: '/images/pen.jpg', stock: 100 },
  { id: '12', name: 'Desk Lamp', price: 19.99, category: 'Home', image: '/images/lamp.jpg', stock: 22 },
];

// GET handler to retrieve all products or filter by category
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category');
  const search = searchParams.get('search');
  
  let filteredProducts = [...products];
  
  // Filter by category if provided
  if (category && category !== 'All') {
    filteredProducts = filteredProducts.filter(
      product => product.category === category
    );
  }
  
  // Filter by search term if provided
  if (search) {
    filteredProducts = filteredProducts.filter(
      product => product.name.toLowerCase().includes(search.toLowerCase())
    );
  }
  
  return NextResponse.json(filteredProducts);
}

// POST handler to create a new product
export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.name || !body.price || !body.category) {
      return NextResponse.json(
        { error: 'Name, price, and category are required fields' },
        { status: 400 }
      );
    }
    
    // Create new product with generated ID
    const newProduct = {
      id: (products.length + 1).toString(),
      name: body.name,
      price: parseFloat(body.price),
      category: body.category,
      image: body.image || '/images/placeholder.jpg',
      stock: body.stock || 0,
    };
    
    // In a real app, this would save to a database
    products.push(newProduct);
    
    return NextResponse.json(newProduct, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create product' },
      { status: 500 }
    );
  }
} 