# Power BI Integration Guide

This guide will help you set up Power BI reports for your Advanced POS dashboard.

## Prerequisites

1. A Power BI account (you can sign up for free at [powerbi.microsoft.com](https://powerbi.microsoft.com))
2. Power BI Desktop installed on your computer (download from [powerbi.microsoft.com/desktop](https://powerbi.microsoft.com/desktop))

## Step 1: Create Power BI Reports

1. Open Power BI Desktop
2. Create four reports:
   - Sales Analytics
   - Customer Insights
   - Inventory Analytics
   - Business Trends
3. Design your reports with visualizations relevant to each category
4. Save each report

## Step 2: Publish Reports to Power BI Service

1. Sign in to [Power BI Service](https://app.powerbi.com)
2. Click "Get data" > "Files" > "Browse" to upload your reports
3. After uploading, click on each report
4. Note down the Report ID from the URL:
   - The URL will look like: `https://app.powerbi.com/groups/me/reports/12345678-1234-1234-1234-123456789012`
   - The Report ID is the last part: `12345678-1234-1234-1234-123456789012`

## Step 3: Generate an Embed Token

1. In Power BI Service, go to Settings > Admin portal
2. Navigate to "Developer settings"
3. Enable "Allow service principals to use Power BI APIs"
4. Go back to your report
5. Click "Share" > "Embed report" > "Website or portal"
6. Copy the embed token

## Step 4: Update Your Environment Variables

1. Open your `.env` file
2. Update the `NEXT_PUBLIC_POWERBI_ACCESS_TOKEN` with your embed token
3. Update the report IDs in `src/app/dashboard/reports/page.tsx` with your actual report IDs

## Step 5: Restart Your Application

1. Stop your Next.js development server
2. Run `npm run dev` to restart the server
3. Visit http://localhost:3000/dashboard/reports to see your Power BI reports

## Troubleshooting

If you encounter issues:

1. Check the browser console for errors
2. Verify that your embed token is valid and not expired
3. Ensure your report IDs are correct
4. Make sure your reports are published and accessible

## Additional Resources

- [Power BI Embedding Documentation](https://docs.microsoft.com/en-us/power-bi/developer/embedded/embedding)
- [Power BI JavaScript SDK](https://github.com/microsoft/PowerBI-JavaScript)
- [Power BI REST API](https://docs.microsoft.com/en-us/rest/api/power-bi/) 