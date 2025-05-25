Testing Instructions:
1. Access http://localhost:3000/admin - should redirect to Auth0 login if not logged in
2. Login with admin@example.com - should access admin panel
3. Login with cashier@example.com - should redirect to POS
4. Access http://localhost:3000/pos/history - should show transaction history page
