import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// GET /api/settings - Get all settings or specific setting by key
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const key = searchParams.get('key');
    const category = searchParams.get('category');

    let query = 'SELECT * FROM settings WHERE 1=1';
    const params: any[] = [];

    if (key) {
      params.push(key);
      query += ` AND key = $${params.length}`;
    }

    if (category) {
      params.push(category);
      query += ` AND category = $${params.length}`;
    }

    query += ' ORDER BY category, key';

    const result = await pool.query(query, params);

    // If requesting a specific key, return just the value
    if (key && result.rows.length === 1) {
      const setting = result.rows[0];
      let value = setting.value;

      // Parse value based on type
      if (setting.type === 'number') {
        value = parseFloat(value);
      } else if (setting.type === 'boolean') {
        value = value === 'true';
      } else if (setting.type === 'json') {
        try {
          value = JSON.parse(value);
        } catch (e) {
          // Keep as string if JSON parsing fails
        }
      }

      return NextResponse.json({
        success: true,
        data: { key: setting.key, value, type: setting.type }
      });
    }

    return NextResponse.json({
      success: true,
      data: result.rows
    });

  } catch (error) {
    console.error('Error fetching settings:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch settings' },
      { status: 500 }
    );
  }
}

// POST /api/settings - Create or update setting
export async function POST(request: NextRequest) {
  try {
    const { key, value, description, category, type } = await request.json();

    if (!key || value === undefined) {
      return NextResponse.json(
        { success: false, error: 'Key and value are required' },
        { status: 400 }
      );
    }

    // Convert value to string for storage
    const stringValue = type === 'json' ? JSON.stringify(value) : String(value);

    const result = await pool.query(`
      INSERT INTO settings (key, value, description, category, type)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (key) 
      DO UPDATE SET 
        value = EXCLUDED.value,
        description = COALESCE(EXCLUDED.description, settings.description),
        category = COALESCE(EXCLUDED.category, settings.category),
        type = COALESCE(EXCLUDED.type, settings.type),
        updated_at = CURRENT_TIMESTAMP
      RETURNING *
    `, [key, stringValue, description, category || 'general', type || 'string']);

    return NextResponse.json({
      success: true,
      data: result.rows[0]
    });

  } catch (error) {
    console.error('Error saving setting:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to save setting' },
      { status: 500 }
    );
  }
}

// PUT /api/settings - Update multiple settings at once
export async function PUT(request: NextRequest) {
  try {
    const { settings } = await request.json();

    if (!settings || !Array.isArray(settings)) {
      return NextResponse.json(
        { success: false, error: 'Settings array is required' },
        { status: 400 }
      );
    }

    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      const updatedSettings = [];

      for (const setting of settings) {
        const { key, value, description, category, type } = setting;
        
        if (!key || value === undefined) {
          continue;
        }

        const stringValue = type === 'json' ? JSON.stringify(value) : String(value);

        const result = await client.query(`
          INSERT INTO settings (key, value, description, category, type)
          VALUES ($1, $2, $3, $4, $5)
          ON CONFLICT (key) 
          DO UPDATE SET 
            value = EXCLUDED.value,
            description = COALESCE(EXCLUDED.description, settings.description),
            category = COALESCE(EXCLUDED.category, settings.category),
            type = COALESCE(EXCLUDED.type, settings.type),
            updated_at = CURRENT_TIMESTAMP
          RETURNING *
        `, [key, stringValue, description, category || 'general', type || 'string']);

        updatedSettings.push(result.rows[0]);
      }

      await client.query('COMMIT');

      return NextResponse.json({
        success: true,
        data: updatedSettings
      });

    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }

  } catch (error) {
    console.error('Error updating settings:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update settings' },
      { status: 500 }
    );
  }
} 