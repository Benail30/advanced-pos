import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * STYLE HELPER FUNCTION
 * 
 * This function helps us combine CSS classes smartly.
 * It's especially useful for conditional styling in React components.
 * 
 * For example: cn("bg-blue-500", isActive && "bg-green-500")
 * - If isActive is true, it will use green background
 * - If isActive is false, it will use blue background
 * 
 * The function also automatically resolves conflicts between
 * similar Tailwind classes (like two different background colors).
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * PASSWORD GENERATOR FUNCTION
 * 
 * This function creates secure, random passwords for new users.
 * The generated password includes:
 * - At least 1 lowercase letter (a-z)
 * - At least 1 uppercase letter (A-Z)  
 * - At least 1 number (0-9)
 * - At least 1 special character (!@#$%^&*)
 * 
 * By default, it creates 12-character passwords, but you can specify
 * a different length if needed.
 * 
 * Example: generatePassword(8) creates an 8-character password
 */
export function generatePassword(length: number = 12): string {
  // Character sets to choose from
  const lowercase = "abcdefghijklmnopqrstuvwxyz";
  const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const numbers = "0123456789";
  const special = "!@#$%^&*";
  const charset = lowercase + uppercase + numbers + special;
  
  let password = "";
  
  // Ensure password has at least one character from each category
  // This makes the password more secure
  password += lowercase[Math.floor(Math.random() * lowercase.length)];
  password += uppercase[Math.floor(Math.random() * uppercase.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];
  password += special[Math.floor(Math.random() * special.length)];
  
  // Fill the rest of the password with random characters
  for (let i = password.length; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * charset.length);
    password += charset[randomIndex];
  }
  
  // Shuffle the password so the required characters aren't always at the start
  return password.split('').sort(() => Math.random() - 0.5).join('');
}
