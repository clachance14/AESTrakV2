-- Debug SQL script for September 2, 2025 billing data
-- This replicates the exact query used by the billing trend chart

-- First, show individual records for September 2, 2025
SELECT
    qs_number,
    purchase_order_no,
    quantity_survey_short_text,
    total,
    accepted_date,
    created_date,
    transfer_date,
    invoice_date,
    organization_id
FROM quantity_surveys
WHERE DATE(accepted_date) = '2025-09-02'
    AND accepted_date IS NOT NULL
ORDER BY qs_number;

-- Show the summary that matches the chart calculation
SELECT
    DATE(accepted_date) as billing_date,
    COUNT(*) as record_count,
    SUM(total) as total_billing,
    MIN(total) as min_amount,
    MAX(total) as max_amount,
    AVG(total) as avg_amount
FROM quantity_surveys
WHERE DATE(accepted_date) = '2025-09-02'
    AND accepted_date IS NOT NULL
GROUP BY DATE(accepted_date);

-- Check for potential duplicates (same QS number, same date)
SELECT
    qs_number,
    COUNT(*) as duplicate_count,
    SUM(total) as total_for_qs
FROM quantity_surveys
WHERE DATE(accepted_date) = '2025-09-02'
    AND accepted_date IS NOT NULL
GROUP BY qs_number
HAVING COUNT(*) > 1;

-- Show organization breakdown (in case multiple orgs)
SELECT
    organization_id,
    COUNT(*) as record_count,
    SUM(total) as total_billing
FROM quantity_surveys
WHERE DATE(accepted_date) = '2025-09-02'
    AND accepted_date IS NOT NULL
GROUP BY organization_id;