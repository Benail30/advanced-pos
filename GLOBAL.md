this is POS app
app must use : pgsql as a db , prisma as an orm
auth must be done using nextauth
auth0 must be replaced ,
super admin must be seeded (email and password)
admin can register
cashier account will be created using admin
admin register will have email and password and store name
when admin is created a store will be created and a relation will be created
admin can have many stores
each store will have many cashiers
each store has many products
each store have orders
each order have random id [0-9] length = 7
each order have many products
each product has buy price and sell price

install and configure prisma
create schema
create prisma scripts for db seed and migrate ( minimym commands possible)
install nextauth
configure nextauth
implement auth pages using nextauth
