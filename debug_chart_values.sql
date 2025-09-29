-- Debug script to verify the exact calculation used by getBillingTrendForOrganization
-- This replicates the query logic exactly

-- Show what the query actually fetches (last 30 days from now)
SELECT
    accepted_date,
    total,
    DATE(accepted_date) as date_only,
    organization_id
FROM quantity_surveys
WHERE organization_id = '53042f7e-a14c-4ba3-a43e-9dbcdd856ab9'
    AND accepted_date >= (NOW() - INTERVAL '30 days')
    AND accepted_date IS NOT NULL
ORDER BY accepted_date ASC;

-- Show the grouped calculation (this is what the chart gets)
SELECT
    DATE(accepted_date) as date,
    COUNT(*) as record_count,
    SUM(total) as total_billing
FROM quantity_surveys
WHERE organization_id = '53042f7e-a14c-4ba3-a43e-9dbcdd856ab9'
    AND accepted_date >= (NOW() - INTERVAL '30 days')
    AND accepted_date IS NOT NULL
GROUP BY DATE(accepted_date)
ORDER BY DATE(accepted_date);

-- Specifically show September 2nd calculation
SELECT
    'September 2nd calculation' as description,
    DATE(accepted_date) as date,
    COUNT(*) as record_count,
    SUM(total) as total_billing,
    ARRAY_AGG(qs_number) as qs_numbers
FROM quantity_surveys
WHERE organization_id = '53042f7e-a14c-4ba3-a43e-9dbcdd856ab9'
    AND DATE(accepted_date) = '2025-09-02'
GROUP BY DATE(accepted_date);