import { Pool } from 'pg';
import { createObjectCsvWriter } from 'csv-writer';
import path from 'path';
import fs from 'fs';

// Database configuration
const pool = new Pool({
  host: process.env.POSTGRES_HOST || 'localhost',
  port: parseInt(process.env.POSTGRES_PORT || '5432'),
  database: process.env.POSTGRES_DB || 'my_database',
  user: process.env.POSTGRES_USER || 'my_user',
  password: process.env.POSTGRES_PASSWORD || 'my_password',
});

interface ExportOptions {
  outputDir?: string;
  filename?: string;
  query: string;
  headers: Array<{ id: string; title: string }>;
}

export async function exportToCSV({
  outputDir = 'exports',
  filename = `export-${Date.now()}.csv`,
  query,
  headers,
}: ExportOptions): Promise<string> {
  try {
    // Create output directory if it doesn't exist
    const exportDir = path.join(process.cwd(), outputDir);
    if (!fs.existsSync(exportDir)) {
      fs.mkdirSync(exportDir, { recursive: true });
    }

    const filePath = path.join(exportDir, filename);

    // Create CSV writer
    const csvWriter = createObjectCsvWriter({
      path: filePath,
      header: headers,
    });

    // Execute query
    const result = await pool.query(query);

    // Write data to CSV
    await csvWriter.writeRecords(result.rows);

    return filePath;
  } catch (error) {
    console.error('Error exporting data to CSV:', error);
    throw error;
  }
}

// Example usage for sales data export
export async function exportSalesData(): Promise<string> {
  const query = `
    SELECT 
      t.created_at as "Date",
      p.id as "Product ID",
      p.name as "Product Name",
      t.total_amount as "Sales Amount",
      ti.quantity as "Quantity",
      t.payment_method as "Payment Method",
      t.transaction_number as "Transaction Number"
    FROM transactions t
    JOIN transaction_items ti ON t.id = ti.transaction_id
    JOIN products p ON ti.product_id = p.id
    ORDER BY t.created_at DESC
  `;

  const headers = [
    { id: 'Date', title: 'Date' },
    { id: 'Product ID', title: 'Product ID' },
    { id: 'Product Name', title: 'Product Name' },
    { id: 'Sales Amount', title: 'Sales Amount' },
    { id: 'Quantity', title: 'Quantity' },
    { id: 'Payment Method', title: 'Payment Method' },
    { id: 'Transaction Number', title: 'Transaction Number' },
  ];

  return exportToCSV({
    filename: `sales-data-${new Date().toISOString().split('T')[0]}.csv`,
    query,
    headers,
  });
}

// Example usage for inventory data export
export async function exportInventoryData(): Promise<string> {
  const query = `
    SELECT 
      p.id as "Product ID",
      p.name as "Product Name",
      p.sku as "SKU",
      i.quantity as "Current Stock",
      i.reorder_level as "Reorder Level",
      i.last_restock_date as "Last Restock Date",
      p.price as "Unit Price"
    FROM products p
    JOIN inventory i ON p.id = i.product_id
    ORDER BY p.name
  `;

  const headers = [
    { id: 'Product ID', title: 'Product ID' },
    { id: 'Product Name', title: 'Product Name' },
    { id: 'SKU', title: 'SKU' },
    { id: 'Current Stock', title: 'Current Stock' },
    { id: 'Reorder Level', title: 'Reorder Level' },
    { id: 'Last Restock Date', title: 'Last Restock Date' },
    { id: 'Unit Price', title: 'Unit Price' },
  ];

  return exportToCSV({
    filename: `inventory-data-${new Date().toISOString().split('T')[0]}.csv`,
    query,
    headers,
  });
} 