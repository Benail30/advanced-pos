```mermaid
flowchart TB
    %% Actors for Sprint 4
    Admin((Administrator))
    Cashier((Cashier))

    %% Use Cases implemented in Sprint 4
    subgraph Business_Intelligence[Business Intelligence and Reporting]
        ViewAnalyticsDashboard[View Analytics Dashboard]
        ViewTransactionHistory[View Transaction History]
    end

    %% Relationships for Sprint 4
    Admin --> ViewAnalyticsDashboard
    Admin --> ViewTransactionHistory

    Cashier --> ViewTransactionHistory
    %% Limited view

    %% Note: This diagram focuses on the reporting and analytics features of Sprint 4.
``` 