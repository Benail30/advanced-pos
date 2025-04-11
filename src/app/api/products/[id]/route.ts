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

// GET handler to retrieve a single product by ID
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const id = params.id;
  const product = products.find(product => product.id === id);
  
  if (!product) {
    return NextResponse.json(
      { error: 'Product not found' },
      { status: 404 }
    );
  }
  
  return NextResponse.json(product);
}

// PATCH handler to update a product
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const productIndex = products.findIndex(product => product.id === id);
    
    if (productIndex === -1) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }
    
    const body = await request.json();
    const updatedProduct = {
      ...products[productIndex],
      ...body,
      // Ensure price is a number
      price: body.price ? parseFloat(body.price) : products[productIndex].price,
      // Ensure stock is a number
      stock: body.stock ? parseInt(body.stock) : products[productIndex].stock,
    };
    
    // In a real app, this would update a database record
    products[productIndex] = updatedProduct;
    
    return NextResponse.json(updatedProduct);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update product' },
      { status: 500 }
    );
  }
}

// DELETE handler to remove a product
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const id = params.id;
  const productIndex = products.findIndex(product => product.id === id);
  
  if (productIndex === -1) {
    return NextResponse.json(
      { error: 'Product not found' },
      { status: 404 }
    );
  }
  
  // In a real app, this would delete from a database
  const deletedProduct = products.splice(productIndex, 1)[0];
  
  return NextResponse.json(deletedProduct);
} 