import { Pool } from 'pg';
import bcrypt from 'bcryptjs';

/**
 * CASHIER PASSWORD RESET SCRIPT
 * 
 * This script resets a cashier's password to a default value.
 * It's useful when a cashier forgets their password and needs access.
 * 
 * Usage: npm run reset-password
 */

// Create database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function resetCashierPassword() {
  try {
    // Hash the new password securely
    const hashedPassword = await bcrypt.hash('cashier123', 12);
    
    // Update the user's password in the database
    const result = await pool.query(
      'UPDATE users SET password = $1 WHERE email = $2 RETURNING email',
      [hashedPassword, 'habibchalouf@gmail.com']
    );
    
    if (result.rows.length > 0) {
      // Password reset successful
      console.log('✅ Password reset successfully for:', result.rows[0].email);
      console.log('🔑 New password: cashier123');
    } else {
      console.log('❌ User not found with that email address');
    }
    
  } catch (error) {
    console.error('❌ Error resetting password:', error);
  } finally {
    await pool.end();
  }
}

resetCashierPassword(); 