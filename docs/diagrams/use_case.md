```mermaid
flowchart TB
    %% Actors
    Admin((Admin))
    Cashier((Cashier))

    %% Use Cases
    subgraph POS_System[POS System]
        UC1[Product Management]
        UC2[Order Processing]
        UC3[Inventory Management]
        UC4[User Management]
        UC5[Reporting & Analytics]
        UC6[Payment Processing]
        UC7[Category Management]
        UC8[Generate Receipt]
        UC9[Login]
    end

    %% Relationships
    Admin --- UC1
    Admin --- UC3
    Admin --- UC4
    Admin --- UC5
    Admin --- UC7
    Admin --- UC9

    Cashier --- UC2
    Cashier --- UC6
    Cashier --- UC8
    Cashier --- UC9

    %% Include relationships
    UC1 -.-> UC9: includes
    UC2 -.-> UC9: includes
    UC3 -.-> UC9: includes
    UC4 -.-> UC9: includes
    UC5 -.-> UC9: includes
    UC6 -.-> UC9: includes
    UC7 -.-> UC9: includes
    UC8 -.-> UC9: includes

    %% Extend relationships
    UC2 -.-> UC3
```